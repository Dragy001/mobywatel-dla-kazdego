import type { Faktura, Firma, StanOsoby } from '../dane/typy'
import { bruttoZNetto, type Grosze, type KwotyVat } from './pieniadze'
import { odliczenieOdPrzychodu, ryczaltZaMiesiac, vatZaMiesiac, zusZaMiesiac, type Ryczalt, type Vat, type Zus } from './podatki'

export function wartoscFaktury(f: Faktura): KwotyVat {
  return f.pozycje.reduce<KwotyVat>(
    (s, p) => {
      const k = bruttoZNetto(p.netto, p.stawkaVat)
      return { netto: s.netto + k.netto, vat: s.vat + k.vat, brutto: s.brutto + k.brutto }
    },
    { netto: 0, vat: 0, brutto: 0 },
  )
}

export function wszystkieFaktury(firma: Firma, stan: StanOsoby): Faktura[] {
  return [...firma.faktury, ...stan.wystawione]
}

export function nastepnyMiesiac(m: string): string {
  const [r, mm] = m.split('-').map(Number)
  return mm === 12 ? `${r + 1}-01` : `${r}-${String(mm + 1).padStart(2, '0')}`
}

export interface PodsumowanieMiesiaca {
  miesiac: string
  przychodyMiesieczne: Record<string, Grosze>
  przychod: Grosze
  przychodRok: Grosze
  vat: Vat
  ryczalt: Ryczalt
  zus: Zus
  odliczenie: Grosze
  razem: Grosze
  terminy: { zus: string; ryczalt: string; vat: string }
  grudzien: { przychod: Grosze; vat: Grosze; ryczaltSzacunek: Grosze }
}

function vatMiesiaca(faktury: Faktura[], miesiac: string): Vat {
  const w = faktury.filter((f) => f.data.startsWith(miesiac))
  return vatZaMiesiac(
    w.filter((f) => f.rodzaj === 'wystawiona').map((f) => wartoscFaktury(f).vat),
    w.filter((f) => f.rodzaj === 'otrzymana').map((f) => wartoscFaktury(f).vat),
  )
}

/** Rozliczenie miesiąca: VAT z faktur, ryczałt narastająco od stycznia, ZUS za miesiąc. */
export function podsumowanie(firma: Firma, stan: StanOsoby, miesiac = '2026-11'): PodsumowanieMiesiaca {
  const faktury = wszystkieFaktury(firma, stan)
  const przychodyMiesieczne: Record<string, Grosze> = { ...firma.przychodyWczesniej }
  for (const f of faktury) {
    if (f.rodzaj !== 'wystawiona') continue
    const m = f.data.slice(0, 7)
    przychodyMiesieczne[m] = (przychodyMiesieczne[m] ?? 0) + wartoscFaktury(f).netto
  }

  const rok = miesiac.slice(0, 4)
  let przych = 0, odl = 0, wplacono = 0, spol = 0, odliczenie = 0
  let zusPoprz = zusZaMiesiac(0)
  let zus = zusPoprz
  let ryczalt = ryczaltZaMiesiac({ przychodNarastajaco: 0, odliczeniaNarastajaco: 0, wplaconoWczesniej: 0, stawka: firma.stawkaRyczaltu })
  for (let m = `${rok}-01`; m <= miesiac; m = nastepnyMiesiac(m)) {
    przych += przychodyMiesieczne[m] ?? 0
    odliczenie = odliczenieOdPrzychodu(zusPoprz)
    odl += odliczenie
    ryczalt = ryczaltZaMiesiac({ przychodNarastajaco: przych, odliczeniaNarastajaco: odl, wplaconoWczesniej: wplacono, stawka: firma.stawkaRyczaltu })
    wplacono += ryczalt.doZaplaty
    zus = zusZaMiesiac(przych - spol)
    spol += zus.odliczalne
    zusPoprz = zus
  }

  const vat = vatMiesiaca(faktury, miesiac)
  const nast = nastepnyMiesiac(miesiac)
  const przychodGrudnia = przychodyMiesieczne[nast] ?? 0
  const ryczaltGrudnia = ryczaltZaMiesiac({
    przychodNarastajaco: przych + przychodGrudnia,
    odliczeniaNarastajaco: odl + odliczenieOdPrzychodu(zus),
    wplaconoWczesniej: wplacono,
    stawka: firma.stawkaRyczaltu,
  })
  return {
    miesiac,
    przychodyMiesieczne,
    przychod: przychodyMiesieczne[miesiac] ?? 0,
    przychodRok: przych,
    vat,
    ryczalt,
    zus,
    odliczenie,
    razem: vat.doZaplaty + ryczalt.doZaplaty + zus.razem,
    terminy: { zus: `${nast}-20`, ryczalt: `${nast}-20`, vat: `${nast}-25` },
    grudzien: { przychod: przychodGrudnia, vat: vatMiesiaca(faktury, nast).doZaplaty, ryczaltSzacunek: ryczaltGrudnia.doZaplaty },
  }
}

export interface PitRoczny {
  przychod: Grosze
  odliczenia: Grosze
  podatek: Grosze
  wplacono: Grosze
  /** Dodatnia — do dopłaty, ujemna — zwrot. */
  roznica: Grosze
  stawka: number
}

/** Szacunek PIT-28 za rok 2026: grudzień przyjmujemy taki sam jak listopad. */
export function pitRoczny(firma: Firma, stan: StanOsoby): PitRoczny {
  const p = podsumowanie(firma, stan)
  const przychod = p.przychodRok + p.przychod
  const odliczenia = p.ryczalt.odliczeniaNarastajaco + odliczenieOdPrzychodu(p.zus)
  const podatek = ryczaltZaMiesiac({ przychodNarastajaco: przychod, odliczeniaNarastajaco: odliczenia, wplaconoWczesniej: 0, stawka: firma.stawkaRyczaltu }).podatekNarastajaco
  const wplacono = p.ryczalt.podatekNarastajaco
  return { przychod, odliczenia, podatek, wplacono, roznica: podatek - wplacono, stawka: firma.stawkaRyczaltu }
}
