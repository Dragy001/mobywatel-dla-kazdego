/** Kwota w groszach (liczba całkowita). */
export type Grosze = number

const NBSP = ' '

function tysiace(n: number): string {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NBSP)
}

export function formatZl(g: Grosze, opcje: { bezGroszy?: boolean } = {}): string {
  const znak = g < 0 ? '−' : ''
  const a = Math.abs(Math.round(g))
  if (opcje.bezGroszy) return `${znak}${tysiace(Math.round(a / 100))}${NBSP}zł`
  const zl = Math.floor(a / 100)
  const gr = String(a % 100).padStart(2, '0')
  return `${znak}${tysiace(zl)},${gr}${NBSP}zł`
}

/** Kwota wpisana po polsku ("1 230,50", "1230.5", "12,3 zł") → grosze; null gdy pusta, ≤ 0 albo niepoprawna. */
export function parseKwota(tekst: string): Grosze | null {
  const t = tekst.replace(/zł/gi, '').replace(/[\s ]/g, '')
  const m = /^(\d+)(?:[.,](\d{1,2}))?$/.exec(t)
  if (!m) return null
  const g = Number(m[1]) * 100 + Number((m[2] ?? '0').padEnd(2, '0'))
  return g > 0 ? g : null
}

export interface KwotyVat {
  netto: Grosze
  vat: Grosze
  brutto: Grosze
}

export function bruttoZNetto(netto: Grosze, stawkaVat: number): KwotyVat {
  const vat = Math.round((netto * stawkaVat) / 100)
  return { netto, vat, brutto: netto + vat }
}

export function nettoZBrutto(brutto: Grosze, stawkaVat: number): KwotyVat {
  const netto = Math.round((brutto * 100) / (100 + stawkaVat))
  return { netto, vat: brutto - netto, brutto }
}
