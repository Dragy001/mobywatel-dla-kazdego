import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import App from '../App'
import { KLUCZ, stanStartowy } from '../stan/magazyn'
import { renderApp, renderOsoba } from '../test/render'

test('ZUS: zdrowotna wyższa od maja', () => {
  renderOsoba('tomasz', 'zwykly', 'firma/kwota/zus')
  expect(screen.getByText(/od maja/)).toBeInTheDocument()
})

test('termin ZUS 21 grudnia w terminach', () => {
  renderOsoba('tomasz', 'zwykly', 'terminy')
  expect(screen.getAllByText('21 grudnia').length).toBeGreaterThan(0)
  expect(screen.queryByText('20 grudnia')).not.toBeInTheDocument()
})

test.each(['-1', '2.5', 'abc'])('dziwny krok %s → krok 1', (k) => {
  renderOsoba('tomasz', 'zwykly', `faktura/nowa/${k}`)
  expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
})

test('ukryty wybór zostaje widoczny po przejściu na prosty widok', () => {
  renderOsoba('tomasz', 'prosty', 'faktura/nowa/1', (s) => {
    s.osoby.tomasz.szkice['nowa-faktura'] = { kontrahent: { nip: '6345110356', nazwa: 'Księgarnia Pod Lipą s.c.', adres: 'x' }, stawkaVat: 23, kwotaTekst: '', tryb: 'netto' }
  })
  expect(screen.getByRole('radio', { name: /Księgarnia Pod Lipą/ })).toBeChecked()
})

test('ukryta usługa zostaje widoczna w prostym widoku', () => {
  renderOsoba('tomasz', 'prosty', 'faktura/nowa/2', (s) => {
    s.osoby.tomasz.szkice['nowa-faktura'] = { kontrahent: { nip: '6663810358', nazwa: 'Kawiarnia Ziarno Anna Lis', adres: 'x' }, opis: 'Skład i łamanie publikacji', stawkaVat: 23, kwotaTekst: '', tryb: 'netto' }
  })
  expect(screen.getByRole('radio', { name: /Skład i łamanie publikacji/ })).toBeChecked()
})

test('stary kształt stanu w sessionStorage nie wywraca aplikacji', () => {
  const s = stanStartowy() as unknown as { osoba: string; osoby: Record<string, Record<string, unknown>> }
  s.osoba = 'halina'
  delete s.osoby.halina.szkice
  delete s.osoby.halina.wnioski
  ;(s.osoby.halina.ustawienia as Record<string, unknown>).pierwszeUruchomienieZrobione = true
  window.sessionStorage.setItem(KLUCZ, JSON.stringify(s))
  renderApp('#/halina/dowod/wniosek/1')
  expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
})

test('zepsuty JSON w sessionStorage → stan startowy', () => {
  window.sessionStorage.setItem(KLUCZ, '{"osoby":')
  renderApp('#/')
  expect(screen.getAllByText(/Halina/).length).toBeGreaterThan(0)
})

describe('PIT-28', () => {
  test('przed końcem roku wysyłka tylko pokazowa', () => {
    renderOsoba('tomasz', 'zwykly', 'pit')
    expect(screen.getByText(/Zeznanie za 2026 wyślesz od 1 stycznia 2027/)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Zobacz, jak wygląda wysyłka' })).toBeInTheDocument()
  })
  test('po wysłaniu i odświeżeniu nie da się wysłać drugi raz', async () => {
    const { unmount } = renderOsoba('tomasz', 'zwykly', 'pit/wyslij')
    await userEvent.click(screen.getByRole('button', { name: 'Wyślij PIT-28' }))
    unmount()
    render(<App />)
    expect(screen.getByRole('status')).toHaveTextContent('PIT-28 wysłany')
    expect(screen.queryByRole('button', { name: 'Wyślij PIT-28' })).not.toBeInTheDocument()
  })
})
