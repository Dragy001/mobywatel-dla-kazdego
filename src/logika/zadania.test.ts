import { osoby } from '../dane'
import { stanPoczatkowy } from '../dane'
import { zadaniaDla } from './zadania'

test('Tomasz: zadania posortowane po terminie', () => {
  const z = zadaniaDla(osoby.tomasz, stanPoczatkowy(osoby.tomasz))
  expect(z.map((x) => x.id)).toEqual(['token-ksef', 'zus-2026-11', 'ryczalt-2026-11', 'oc', 'vat-2026-11'])
  expect(z[1].akcja.trasa).toBe('zaplac/zus-2026-11/1')
  expect(z[1].opis).toContain('zł')
})

test('Halina: jedyne pilne zadanie to dowód (41 dni)', () => {
  const z = zadaniaDla(osoby.halina, stanPoczatkowy(osoby.halina))
  const pilne = z.filter((x) => x.pilne)
  expect(pilne.map((x) => x.id)).toEqual(['dowod'])
  expect(pilne[0].dni).toBe(41)
})

test('zapłacony ZUS znika z zadań', () => {
  const s = { ...stanPoczatkowy(osoby.tomasz), zaplacone: ['zus-2026-11'] }
  expect(zadaniaDla(osoby.tomasz, s).map((x) => x.id)).not.toContain('zus-2026-11')
})

test('złożony wniosek o dowód usuwa przypomnienie', () => {
  const s = { ...stanPoczatkowy(osoby.halina), wnioski: [{ id: 'dowod', rodzaj: 'Nowy dowód osobisty', zlozony: '2026-12-05' }] }
  expect(zadaniaDla(osoby.halina, s).map((x) => x.id)).not.toContain('dowod')
})

test('przedłużony token znika z zadań', () => {
  const s = { ...stanPoczatkowy(osoby.tomasz), tokenKsefWaznyDo: '2027-03-05' }
  expect(zadaniaDla(osoby.tomasz, s).map((x) => x.id)).not.toContain('token-ksef')
})
