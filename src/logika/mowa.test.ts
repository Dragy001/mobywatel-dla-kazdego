import { doMowy } from './mowa'

const nb = (t: string) => t.replace(/ /g, ' ')

test.each([
  ['ul. Słowackiego 14 m. 3, 26-600 Radom', 'ulica Słowackiego 14 mieszkanie 3, 26 600 Radom'],
  ['al. Jerozolimskie 200', 'aleja Jerozolimskie 200'],
  ['NIP 7794210352', 'NIP 7 7 9 4 2 1 0 3 5 2'],
  ['PESEL 51031203456', 'PESEL 5 1 0 3 1 2 0 3 4 5 6'],
  ['tel. 600 100 200', 'telefon 6 0 0, 1 0 0, 2 0 0'],
  [nb('1 568,00 zł'), '1568 złotych'],
  [nb('2 757,34 zł'), '2757 złotych 34 grosze'],
  ['1,00 zł', '1 złoty'],
  ['22 zł', '22 złote'],
  ['12 zł', '12 złotych'],
  ['0,01 zł', '1 grosz'],
  [nb('1 234 567,00 zł'), '1234567 złotych'],
  [nb('− 23 408,83 zł'), 'minus 23408 złotych 83 grosze'],
  ['21.12.2026', '21 grudnia 2026'],
  ['01.01.2027', '1 stycznia 2027'],
  ['Agencja Nordwind sp. z o.o.', 'Agencja Nordwind spółka z ograniczoną odpowiedzialnością'],
  ['Księgarnia Pod Lipą s.c.', 'Księgarnia Pod Lipą spółka cywilna'],
  ['Wizyta u dr Kowalczyk', 'Wizyta u doktor Kowalczyk'],
  ['VAT 23%', 'VAT 23 procent'],
  ['PIT-28 za 2026', 'PIT 28 za 2026'],
  ['Faktury w KSeF', 'Faktury w Ksef'],
  ['np. 1230,50', 'na przykład 1230,50'],
])('%s → %s', (z, na) => expect(doMowy(z)).toBe(na))
