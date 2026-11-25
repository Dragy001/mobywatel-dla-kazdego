import { osoby, stanPoczatkowy } from '../dane'
import { odpowiedz, podpowiedzi } from './asystent'

const T = osoby.tomasz
const H = osoby.halina
const sT = stanPoczatkowy(T)
const sH = stanPoczatkowy(H)

test.each([
  ['Co mam zapłacić w tym miesiącu?', 'firma'],
  ['czy moge zawiesic firme na zime', 'ceidg/zawies/1'],
  ['Kiedy wygasa token KSeF?', 'dostep'],
])('Tomasz: %s → %s', (q, trasa) => {
  expect(odpowiedz(q, T, sT).karta?.akcja.trasa).toBe(trasa)
})

test.each([
  ['Kiedy kończy się mój dowód?', 'dowod/wniosek/1'],
  ['Dostałam dziwnego SMS-a', 'sms'],
])('Halina: %s → %s', (q, trasa) => {
  expect(odpowiedz(q, H, sH).karta?.akcja.trasa).toBe(trasa)
})

test('co zapłacić podaje sumę', () => {
  expect(odpowiedz('ile mam do zaplaty', T, sT).tekst).toContain('7 242,20 zł')
})

test('wystaw fakturę z kontrahentem i kwotą tworzy szkic', () => {
  const o = odpowiedz('wystaw fakture dla Kowalski na 2000 zl', T, sT)
  expect(o.karta?.akcja.trasa).toBe('faktura/nowa/3')
  expect(o.szkic?.klucz).toBe('nowa-faktura')
  expect(o.szkic?.wartosc).toMatchObject({ kwotaTekst: '2000', tryb: 'netto', kontrahent: { nazwa: 'Kowalski Meble Jan Kowalski' } })
})

test('wystaw fakturę dla znanego klienta', () => {
  const o = odpowiedz('Wystaw fakturę dla Kawiarni Ziarno na 800,50 zł', T, sT)
  expect(o.szkic?.wartosc).toMatchObject({ kwotaTekst: '800,50', kontrahent: { nip: '6663810358' } })
})

test('wystaw fakturę bez szczegółów prowadzi do kroku 1', () => {
  expect(odpowiedz('chcę wystawić fakturę', T, sT).karta?.akcja.trasa).toBe('faktura/nowa/1')
})

test('nieznane pytanie → lista podpowiedzi', () => {
  const o = odpowiedz('jaka jest pogoda', H, sH)
  expect(o.karta).toBeUndefined()
  expect(o.tekst).toContain('W tej wersji pokazowej umiem pomóc w')
  for (const p of podpowiedzi(H)) expect(o.tekst).toContain(p)
})

test('Halina nie dostaje scenariuszy firmy', () => {
  expect(odpowiedz('wystaw fakturę', H, sH).karta).toBeUndefined()
})
