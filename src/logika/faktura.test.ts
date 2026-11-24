import { kwotySzkicu, nipPoprawny, szukajPoNip, zbudujFakture, type SzkicFaktury } from './faktura'

const k = { nip: '6663810358', nazwa: 'Kawiarnia Ziarno Anna Lis', adres: 'ul. Półwiejska 8, 61-888 Poznań' }

test('zbudujFakture z kwoty netto', () => {
  const s: SzkicFaktury = { kontrahent: k, opis: 'Logo', stawkaVat: 23, kwotaTekst: '1000', tryb: 'netto' }
  const f = zbudujFakture(s, 3, '2026-12-05', '7794210352')
  expect(f.numer).toBe('FV/3/12/2026')
  expect(f.rodzaj).toBe('wystawiona')
  expect(f.data).toBe('2026-12-05')
  expect(f.pozycje).toEqual([{ opis: 'Logo', netto: 100000, stawkaVat: 23 }])
  expect(f.numerKsef).toMatch(/^7794210352-20261205-[0-9A-F]{12}-[0-9A-F]{2}$/)
})

test('zbudujFakture z kwoty brutto', () => {
  const f = zbudujFakture({ kontrahent: k, opis: 'Plakat', stawkaVat: 23, kwotaTekst: '1230,50', tryb: 'brutto' }, 1, '2026-12-05', '7794210352')
  expect(f.pozycje[0].netto).toBe(100041)
})

test('kwotySzkicu', () => {
  expect(kwotySzkicu({ stawkaVat: 23, kwotaTekst: '1230,50', tryb: 'brutto' })).toEqual({ netto: 100041, vat: 23009, brutto: 123050 })
  expect(kwotySzkicu({ stawkaVat: 23, kwotaTekst: 'abc', tryb: 'netto' })).toBeNull()
})

test('rejestr po NIP', () => {
  expect(szukajPoNip('783-122-04-69')?.nazwa).toBe('Biuro Podróży Horyzont sp. z o.o.')
  expect(szukajPoNip('1234567890')).toBeNull()
})

test('suma kontrolna NIP', () => {
  expect(nipPoprawny('7794210352')).toBe(true)
  expect(nipPoprawny('7794210353')).toBe(false)
  expect(nipPoprawny('123')).toBe(false)
})
