import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { dniDo, formatData, DZIS, dodajDni } from '../logika/daty'
import { osoby } from './index'

function nipPoprawny(nip: string) {
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  if (!/^\d{10}$/.test(nip)) return false
  const s = w.reduce((a, v, i) => a + v * Number(nip[i]), 0) % 11
  return s !== 10 && s === Number(nip[9])
}

const tomasz = osoby.tomasz
const firma = tomasz.firma!

test('daty pokazu', () => {
  expect(DZIS).toBe('2026-12-05')
  expect(formatData('2027-01-15')).toBe('15.01.2027')
  expect(dodajDni('2026-12-05', 90)).toBe('2027-03-05')
})

test('dowód Haliny traci ważność za 41 dni', () => {
  const dowod = osoby.halina.dokumenty.find((d) => d.id === 'dowod')!
  expect(dniDo(dowod.waznyDo!)).toBe(41)
})

test('token KSeF Tomasza wygasa za 12 dni, OC za 16', () => {
  expect(dniDo(firma.tokenKsefWaznyDo)).toBe(12)
  expect(dniDo(tomasz.dokumenty.find((d) => d.id === 'pojazd')!.waznyDo!)).toBe(16)
})

test('Tomasz: 4–6 kontrahentów, ~10 faktur wystawionych i 4 kosztowe w listopadzie', () => {
  expect(firma.kontrahenci.length).toBeGreaterThanOrEqual(4)
  expect(firma.kontrahenci.length).toBeLessThanOrEqual(6)
  const lis = firma.faktury.filter((f) => f.data.startsWith('2026-11'))
  expect(lis.filter((f) => f.rodzaj === 'wystawiona').length).toBeGreaterThanOrEqual(9)
  expect(lis.filter((f) => f.rodzaj === 'otrzymana').length).toBe(4)
  expect(firma.stawkaRyczaltu).toBe(12)
})

test('księgowa ma dostęp do przeglądania do 31.03.2027', () => {
  const k = firma.dostepy.find((d) => d.rodzaj === 'ksiegowa')!
  expect(k.kto).toBe('Biuro Rachunkowe Liczydło')
  expect(k.zakres).toBe('przegladanie')
  expect(k.doKiedy).toBe('2027-03-31')
})

test('wszystkie NIP-y mają poprawną sumę kontrolną', () => {
  const nipy = [firma.nip, ...firma.kontrahenci.map((k) => k.nip), ...firma.faktury.map((f) => f.kontrahent.nip)]
  for (const n of nipy) expect(nipPoprawny(n), n).toBe(true)
})

test('Halina: wnuczka Ola, 2 SMS-y, 3 sprawdzenia danych, bez firmy', () => {
  const h = osoby.halina
  expect(h.firma).toBeUndefined()
  expect(h.pomocnicy[0].imie).toBe('Ola')
  expect(h.sms).toHaveLength(2)
  expect(h.sms!.filter((s) => s.oszustwo)).toHaveLength(1)
  expect(h.historiaSprawdzen).toHaveLength(3)
  expect(h.widokDomyslny).toBe('prosty')
  expect(tomasz.widokDomyslny).toBe('zwykly')
})

test('żadne dane nie pochodzą z prawdziwej konfiguracji właściciela', () => {
  const plik = join(homedir(), 'Documents/Home/ksef-podatki/konfiguracja.toml')
  if (!existsSync(plik)) return
  const tekst = readFileSync(plik, 'utf8')
  const nipy = [firma.nip, ...firma.kontrahenci.map((k) => k.nip), ...firma.faktury.map((f) => f.kontrahent.nip)]
  for (const n of nipy) expect(tekst.includes(n), n).toBe(false)
  for (const k of firma.kontrahenci) expect(tekst.includes(k.nazwa), k.nazwa).toBe(false)
})
