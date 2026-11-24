import { bruttoZNetto, formatZl, nettoZBrutto, parseKwota } from './pieniadze'

const N = ' '

test('formatZl z groszami i separatorem tysięcy', () => {
  expect(formatZl(192676)).toBe(`1${N}926,76${N}zł`)
  expect(formatZl(5)).toBe(`0,05${N}zł`)
  expect(formatZl(123456789)).toBe(`1${N}234${N}567,89${N}zł`)
})

test('formatZl bez groszy', () => {
  expect(formatZl(129800, { bezGroszy: true })).toBe(`1${N}298${N}zł`)
})

test.each([
  ['1230,50', 123050],
  ['1 230,5', 123050],
  ['1230.5', 123050],
  ['2000', 200000],
  [' 12,3 zł', 1230],
])('parseKwota(%s) = %i', (t, g) => {
  expect(parseKwota(t)).toBe(g)
})

test.each(['', '0', '-5', 'abc', '1,234', '12,3,4'])('parseKwota odrzuca %s', (t) => {
  expect(parseKwota(t)).toBeNull()
})

test('brutto z netto', () => {
  expect(bruttoZNetto(100000, 23)).toEqual({ netto: 100000, vat: 23000, brutto: 123000 })
})

test('netto z brutto', () => {
  expect(nettoZBrutto(123050, 23)).toEqual({ netto: 100041, vat: 23009, brutto: 123050 })
})
