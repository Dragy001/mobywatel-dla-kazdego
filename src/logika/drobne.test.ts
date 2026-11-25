import { osoby, stanPoczatkowy } from '../dane'
import { odpowiedz } from './asystent'
import { dzienRoboczy } from './daty'
import { miesiacProguZdrowotnej, podsumowanie } from './firma'

const T = osoby.tomasz
const s = stanPoczatkowy(T)

test.each([
  ['2026-12-20', '2026-12-21'],
  ['2026-12-25', '2026-12-28'],
  ['2027-02-20', '2027-02-22'],
  ['2027-01-20', '2027-01-20'],
  ['2027-01-06', '2027-01-07'],
])('dzienRoboczy(%s) = %s', (d, w) => expect(dzienRoboczy(d)).toBe(w))

test('terminy przesunięte na dzień roboczy', () => {
  expect(podsumowanie(T.firma!, s).terminy).toEqual({ zus: '2026-12-21', ryczalt: '2026-12-21', vat: '2026-12-28' })
})

test('próg zdrowotnej 60 tys. przekroczony w maju', () => {
  expect(miesiacProguZdrowotnej(podsumowanie(T.firma!, s))).toBe('2026-05')
})

describe('asystent', () => {
  test('brutto zostaje brutto', () => {
    const o = odpowiedz('Wystaw fakturę dla Kawiarni Ziarno na 800 zł brutto', T, s)
    expect(o.szkic?.wartosc).toMatchObject({ kwotaTekst: '800', tryb: 'brutto' })
    expect(o.tekst).toContain('800 zł brutto')
  })
  test('data nie jest kwotą', () => {
    const o = odpowiedz('Faktura dla Kawiarni Ziarno na 12 grudnia za 800 zł', T, s)
    expect(o.szkic?.wartosc).toMatchObject({ kwotaTekst: '800' })
  })
  test('zapłać fakturę prowadzi do faktury od dostawcy', () => {
    const o = odpowiedz('Zapłać fakturę od Telekom Plus', T, s)
    expect(o.szkic).toBeUndefined()
    expect(o.karta?.akcja.trasa).toBe('faktury/z4')
  })
})
