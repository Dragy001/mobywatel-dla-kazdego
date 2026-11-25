import { render } from '@testing-library/react'
import { tekstDoCzytania } from './CzytajNaGlos'

test('wiersze czytane jako „etykieta: wartość”, akapity z przerwą', () => {
  const { container } = render(
    <main>
      <h1>Dokument</h1>
      <dl><div><dt>Adres</dt><dd>ul. Słowackiego 14 m. 3</dd></div><div><dt>NIP</dt><dd>7794210352</dd></div></dl>
      <p>Koniec</p>
      <button>Nie czytaj mnie</button>
    </main>,
  )
  expect(tekstDoCzytania(container.querySelector('main')!)).toBe('Dokument. Adres: ulica Słowackiego 14 mieszkanie 3. NIP: 7 7 9 4 2 1 0 3 5 2. Koniec.')
})

test('elementy blokowe nie sklejają się, ukryte nie są czytane', () => {
  const { container } = render(
    <main>
      <div><div>Składki ZUS</div><div>2{' '}757,34{' '}zł</div><div>do 21 grudnia</div></div>
      <div style={{ display: 'none' }}>Ukryte</div>
      <p>Ryczałt 12% · VAT co miesiąc</p>
    </main>,
  )
  expect(tekstDoCzytania(container.querySelector('main')!)).toBe('Składki ZUS. 2757 złotych 34 grosze. do 21 grudnia. Ryczałt 12 procent, VAT co miesiąc.')
})
