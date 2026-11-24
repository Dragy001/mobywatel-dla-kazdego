import { osoby, stanPoczatkowy } from '../dane'
import { podsumowanie } from './firma'
import { odliczenieOdPrzychodu, ryczaltZaMiesiac, zusZaMiesiac } from './podatki'
import type { Faktura } from '../dane/typy'

const tomasz = osoby.tomasz
const firma = tomasz.firma!

test('podsumowanie listopada zgadza się arytmetycznie', () => {
  const p = podsumowanie(firma, stanPoczatkowy(tomasz))
  expect(p.razem).toBe(p.vat.doZaplaty + p.ryczalt.doZaplaty + p.zus.razem)
  expect(p.terminy).toEqual({ zus: '2026-12-20', ryczalt: '2026-12-20', vat: '2026-12-25' })
  expect(p.przychod).toBeGreaterThan(1_300_000)
  expect(p.przychod).toBeLessThan(1_700_000)
})

test('ryczałt listopada liczony z wpłat styczeń–październik', () => {
  const miesiace = ['2026-01', '2026-02', '2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11']
  const p = podsumowanie(firma, stanPoczatkowy(tomasz))
  let przych = 0, odl = 0, wplacono = 0, spol = 0
  let zusPoprz = zusZaMiesiac(0)
  let ost = ryczaltZaMiesiac({ przychodNarastajaco: 0, odliczeniaNarastajaco: 0, wplaconoWczesniej: 0, stawka: 12 })
  for (const m of miesiace) {
    przych += p.przychodyMiesieczne[m]
    odl += odliczenieOdPrzychodu(zusPoprz)
    ost = ryczaltZaMiesiac({ przychodNarastajaco: przych, odliczeniaNarastajaco: odl, wplaconoWczesniej: wplacono, stawka: 12 })
    wplacono += ost.doZaplaty
    const zus = zusZaMiesiac(przych - spol)
    spol += zus.odliczalne
    zusPoprz = zus
  }
  expect(p.ryczalt).toEqual(ost)
  expect(p.zus).toEqual(zusPoprz)
})

test('faktura grudniowa zwiększa grudzień, nie listopad', () => {
  const s = stanPoczatkowy(tomasz)
  const przed = podsumowanie(firma, s)
  const f: Faktura = {
    id: 'x', numer: 'FV/1/12/2026', numerKsef: 'x', rodzaj: 'wystawiona', data: '2026-12-05',
    kontrahent: firma.kontrahenci[0], pozycje: [{ opis: 'Logo', netto: 200000, stawkaVat: 23 }],
  }
  const po = podsumowanie(firma, { ...s, wystawione: [f] })
  expect(po.razem).toBe(przed.razem)
  expect(po.grudzien.przychod).toBe(przed.grudzien.przychod + 200000)
  expect(po.grudzien.vat).toBe(przed.grudzien.vat + 46000)
})
