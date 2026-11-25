import { osoby, stanPoczatkowy } from '../dane'
import { odliczenieOdPrzychodu } from './podatki'
import { pitRoczny, podsumowanie } from './firma'

const T = osoby.tomasz
const s = stanPoczatkowy(T)

test('PIT-28: grudzień = listopad, różnica = podatek − wpłacono', () => {
  const p = podsumowanie(T.firma!, s)
  const r = pitRoczny(T.firma!, s)
  expect(r.przychod).toBe(p.przychodRok + p.przychod)
  expect(r.odliczenia).toBe(p.ryczalt.odliczeniaNarastajaco + odliczenieOdPrzychodu(p.zus))
  expect(r.podatek % 100).toBe(0)
  expect(r.podatek).toBe(Math.round(((r.przychod - r.odliczenia) * 12) / 100 / 100) * 100)
  expect(r.wplacono).toBe(p.ryczalt.podatekNarastajaco)
  expect(r.wplacono).toBe(1582900)
  expect(r.roznica).toBe(r.podatek - r.wplacono)
  expect(r.roznica).toBeGreaterThan(0)
})
