import { dzienRoboczy } from '../../logika/daty'
import type { PodsumowanieMiesiaca } from '../../logika/firma'
import type { Grosze } from '../../logika/pieniadze'

export interface Platnosc {
  id: string
  tytul: string
  termin: string
  kwota?: Grosze
  szacunek?: boolean
  odbiorca: 'zus' | 'us'
}

export const ODBIORCA = { zus: 'Twój rachunek składkowy w ZUS', us: 'Twój mikrorachunek podatkowy' } as const

/** Płatności firmy od grudnia 2026 do lutego 2027. Tylko listopadowe mają już pewną kwotę. */
/** `ryczaltGrudnia` — to, co zostaje do zapłaty z szacunku PIT-28 (grudzień jak listopad). */
export function platnosci(p: PodsumowanieMiesiaca, ryczaltGrudnia: Grosze): Platnosc[] {
  return [
    { id: 'zus-2026-11', tytul: 'Składki ZUS za listopad', termin: dzienRoboczy('2026-12-20'), kwota: p.zus.razem, odbiorca: 'zus' },
    { id: 'ryczalt-2026-11', tytul: 'Podatek (ryczałt) za listopad', termin: dzienRoboczy('2026-12-20'), kwota: p.ryczalt.doZaplaty, odbiorca: 'us' },
    { id: 'vat-2026-11', tytul: 'Podatek VAT za listopad', termin: dzienRoboczy('2026-12-25'), kwota: p.vat.doZaplaty, odbiorca: 'us' },
    { id: 'zus-2026-12', tytul: 'Składki ZUS za grudzień', termin: dzienRoboczy('2027-01-20'), kwota: p.zus.razem, szacunek: true, odbiorca: 'zus' },
    { id: 'ryczalt-2026-12', tytul: 'Podatek (ryczałt) za grudzień', termin: dzienRoboczy('2027-01-20'), kwota: ryczaltGrudnia, szacunek: true, odbiorca: 'us' },
    { id: 'vat-2026-12', tytul: 'Podatek VAT za grudzień', termin: dzienRoboczy('2027-01-25'), kwota: p.grudzien.vat, szacunek: true, odbiorca: 'us' },
    { id: 'zus-2027-01', tytul: 'Składki ZUS za styczeń', termin: dzienRoboczy('2027-02-20'), odbiorca: 'zus' },
    { id: 'ryczalt-2027-01', tytul: 'Podatek (ryczałt) za styczeń', termin: dzienRoboczy('2027-02-20'), odbiorca: 'us' },
    { id: 'vat-2027-01', tytul: 'Podatek VAT za styczeń', termin: dzienRoboczy('2027-02-25'), odbiorca: 'us' },
  ]
}

/** Zapłacić w aplikacji można to, co ma już pewną kwotę. */
export const doZaplaty = (pl: Platnosc) => pl.kwota !== undefined && !pl.szacunek && pl.kwota > 0
