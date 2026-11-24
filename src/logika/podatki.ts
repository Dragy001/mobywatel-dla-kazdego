import type { Grosze } from './pieniadze'

/** Publiczne parametry ZUS na 2026 r. (ryczałt). */
export const ZUS_2026 = {
  podstawaSpoleczna: 565200,
  zdrowotna: { do60k: 49835, od60do300k: 83058, pow300k: 149504 },
} as const

const STAWKI = { emerytalna: 19.52, rentowa: 8, chorobowa: 2.45, wypadkowa: 1.67, fp: 2.45 }

export interface Zus {
  emerytalna: Grosze
  rentowa: Grosze
  chorobowa: Grosze
  wypadkowa: Grosze
  fp: Grosze
  spoleczne: Grosze
  /** Składki społeczne bez Funduszu Pracy — tyle odlicza się od przychodu. */
  odliczalne: Grosze
  zdrowotna: Grosze
  razem: Grosze
}

const czesc = (proc: number) => Math.round((ZUS_2026.podstawaSpoleczna * proc) / 100)

/** Składki za miesiąc; próg zdrowotnej wg przychodu od początku roku pomniejszonego o składki społeczne. */
export function zusZaMiesiac(przychodNarastajacoMinusSpoleczne: Grosze): Zus {
  const emerytalna = czesc(STAWKI.emerytalna)
  const rentowa = czesc(STAWKI.rentowa)
  const chorobowa = czesc(STAWKI.chorobowa)
  const wypadkowa = czesc(STAWKI.wypadkowa)
  const fp = czesc(STAWKI.fp)
  const odliczalne = emerytalna + rentowa + chorobowa + wypadkowa
  const spoleczne = odliczalne + fp
  const p = przychodNarastajacoMinusSpoleczne
  const z = ZUS_2026.zdrowotna
  const zdrowotna = p <= 6_000_000 ? z.do60k : p <= 30_000_000 ? z.od60do300k : z.pow300k
  return { emerytalna, rentowa, chorobowa, wypadkowa, fp, spoleczne, odliczalne, zdrowotna, razem: spoleczne + zdrowotna }
}

/** Ile składek zapłaconych w miesiącu obniża przychód do ryczałtu. */
export function odliczenieOdPrzychodu(zusPoprzedni: Zus): Grosze {
  return zusPoprzedni.odliczalne + Math.round(zusPoprzedni.zdrowotna / 2)
}

export interface Ryczalt {
  przychodNarastajaco: Grosze
  odliczeniaNarastajaco: Grosze
  podatekNarastajaco: Grosze
  wplaconoWczesniej: Grosze
  doZaplaty: Grosze
  stawka: number
}

export function ryczaltZaMiesiac(a: {
  przychodNarastajaco: Grosze
  odliczeniaNarastajaco: Grosze
  wplaconoWczesniej: Grosze
  stawka: number
}): Ryczalt {
  const podstawa = Math.max(a.przychodNarastajaco - a.odliczeniaNarastajaco, 0)
  const podatekNarastajaco = Math.round((podstawa * a.stawka) / 100 / 100) * 100
  return {
    przychodNarastajaco: a.przychodNarastajaco,
    odliczeniaNarastajaco: a.odliczeniaNarastajaco,
    podatekNarastajaco,
    wplaconoWczesniej: a.wplaconoWczesniej,
    doZaplaty: Math.max(podatekNarastajaco - a.wplaconoWczesniej, 0),
    stawka: a.stawka,
  }
}

export interface Vat {
  nalezny: Grosze
  naliczony: Grosze
  doZaplaty: Grosze
}

export function vatZaMiesiac(sprzedazVat: Grosze[], zakupyVat: Grosze[]): Vat {
  const nalezny = sprzedazVat.reduce((s, v) => s + v, 0)
  const naliczony = zakupyVat.reduce((s, v) => s + v, 0)
  return { nalezny, naliczony, doZaplaty: Math.max(nalezny - naliczony, 0) }
}
