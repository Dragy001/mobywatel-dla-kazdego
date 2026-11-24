import { odliczenieOdPrzychodu, ryczaltZaMiesiac, vatZaMiesiac, zusZaMiesiac } from './podatki'

test('ZUS 2026 przy przychodzie 100 000 zł', () => {
  expect(zusZaMiesiac(10_000_000)).toEqual({
    emerytalna: 110327,
    rentowa: 45216,
    chorobowa: 13847,
    wypadkowa: 9439,
    fp: 13847,
    spoleczne: 192676,
    odliczalne: 178829,
    zdrowotna: 83058,
    razem: 275734,
  })
})

test('próg zdrowotnej', () => {
  expect(zusZaMiesiac(5_000_000).zdrowotna).toBe(49835)
  expect(zusZaMiesiac(6_000_000).zdrowotna).toBe(49835)
  expect(zusZaMiesiac(6_000_001).zdrowotna).toBe(83058)
  expect(zusZaMiesiac(40_000_000).zdrowotna).toBe(149504)
})

test('odliczenie od przychodu = społeczne bez FP + połowa zdrowotnej', () => {
  expect(odliczenieOdPrzychodu(zusZaMiesiac(10_000_000))).toBe(220358)
})

test('ryczałt narastająco', () => {
  expect(
    ryczaltZaMiesiac({ przychodNarastajaco: 10_000_000, odliczeniaNarastajaco: 2_203_580, wplaconoWczesniej: 850_000, stawka: 12 }),
  ).toEqual({
    przychodNarastajaco: 10_000_000,
    odliczeniaNarastajaco: 2_203_580,
    podatekNarastajaco: 935600,
    wplaconoWczesniej: 850_000,
    doZaplaty: 85600,
    stawka: 12,
  })
})

test('ryczałt nie jest ujemny', () => {
  expect(ryczaltZaMiesiac({ przychodNarastajaco: 100000, odliczeniaNarastajaco: 500000, wplaconoWczesniej: 0, stawka: 12 }).doZaplaty).toBe(0)
})

test('VAT za miesiąc', () => {
  expect(vatZaMiesiac([230000], [46000])).toEqual({ nalezny: 230000, naliczony: 46000, doZaplaty: 184000 })
  expect(vatZaMiesiac([1000], [5000]).doZaplaty).toBe(0)
})
