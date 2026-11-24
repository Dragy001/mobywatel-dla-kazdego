import type { Faktura, Kontrahent } from '../dane/typy'
import { bruttoZNetto, nettoZBrutto, parseKwota, type KwotyVat } from './pieniadze'

export interface SzkicFaktury {
  kontrahent?: Kontrahent
  opis?: string
  stawkaVat: number
  kwotaTekst: string
  tryb: 'netto' | 'brutto'
}

export const SZKIC_POCZATKOWY: SzkicFaktury = { stawkaVat: 23, kwotaTekst: '', tryb: 'netto' }

export function nipPoprawny(nip: string): boolean {
  const n = nip.replace(/[\s-]/g, '')
  if (!/^\d{10}$/.test(n)) return false
  const w = [6, 5, 7, 2, 3, 4, 5, 6, 7]
  const s = w.reduce((a, v, i) => a + v * Number(n[i]), 0) % 11
  return s !== 10 && s === Number(n[9])
}

export function kwotySzkicu(s: Pick<SzkicFaktury, 'stawkaVat' | 'kwotaTekst' | 'tryb'>): KwotyVat | null {
  const g = parseKwota(s.kwotaTekst)
  if (g === null) return null
  return s.tryb === 'netto' ? bruttoZNetto(g, s.stawkaVat) : nettoZBrutto(g, s.stawkaVat)
}

function hex(n: number, dl: number) {
  return Math.abs(n).toString(16).toUpperCase().padStart(dl, '0').slice(-dl)
}

export function zbudujFakture(szkic: SzkicFaktury, kolejnyNumer: number, dzis: string, nipSprzedawcy: string): Faktura {
  const k = kwotySzkicu(szkic)
  if (!k || !szkic.kontrahent || !szkic.opis) throw new Error('Niepełny szkic faktury')
  const ziarno = [...`${szkic.kontrahent.nip}${k.brutto}${kolejnyNumer}`].reduce((a, c) => (a * 31 + c.charCodeAt(0)) % 2 ** 47, 7)
  const [r, m] = dzis.split('-')
  return {
    id: `n${kolejnyNumer}-${ziarno}`,
    numer: `FV/${kolejnyNumer}/${Number(m)}/${r}`,
    numerKsef: `${nipSprzedawcy}-${dzis.replaceAll('-', '')}-${hex(ziarno, 12)}-${hex(ziarno % 251, 2)}`,
    rodzaj: 'wystawiona',
    data: dzis,
    kontrahent: szkic.kontrahent,
    pozycje: [{ opis: szkic.opis, netto: k.netto, stawkaVat: szkic.stawkaVat }],
    zaplacona: false,
  }
}

/** Pokazowy „rejestr” firm — w prawdziwej aplikacji dane przyszłyby z CEIDG/KRS i białej listy VAT. */
const REJESTR: Kontrahent[] = [
  { nip: '7831220469', nazwa: 'Biuro Podróży Horyzont sp. z o.o.', adres: 'ul. Święty Marcin 29, 61-806 Poznań' },
  { nip: '5218320463', nazwa: 'Kowalski Meble Jan Kowalski', adres: 'ul. Dworcowa 3, 62-020 Swarzędz' },
  { nip: '6772220466', nazwa: 'Teatr Mały Scena Sp. z o.o.', adres: 'ul. Kramarska 4, 61-765 Poznań' },
]

export function szukajPoNip(nip: string): Kontrahent | null {
  const n = nip.replace(/[\s-]/g, '')
  return REJESTR.find((k) => k.nip === n) ?? null
}
