import { act, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../App'
import { osoby, stanPoczatkowy } from '../dane'
import { pitRoczny, podsumowanie } from '../logika/firma'
import { renderOsoba } from '../test/render'
import { Wynik } from '../ui/Wynik'
import { platnosci } from './terminy/platnosci'

const idzDo = (h: string) => act(() => { window.location.hash = h })

describe('wynik tylko po prawdziwym złożeniu', () => {
  test('dowod/wniosek/4 bez wniosku → krok 1', () => {
    renderOsoba('halina', 'zwykly', 'dowod/wniosek/4')
    expect(screen.queryByText('Wniosek złożony')).not.toBeInTheDocument()
    expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
  })
  test('dowod/wniosek/3 z pustym szkicem → krok 1', () => {
    renderOsoba('halina', 'prosty', 'dowod/wniosek/3')
    expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
  })
  test('pomoc/bliska/5 bez prośby → krok 1', () => {
    renderOsoba('halina', 'prosty', 'pomoc/bliska/5')
    expect(screen.queryByText(/dostała prośbę o pomoc/)).not.toBeInTheDocument()
    expect(screen.getByText('Krok 1 z 4')).toBeInTheDocument()
  })
  test('pomoc/bliska/4 z pustym szkicem → krok 1', () => {
    renderOsoba('halina', 'zwykly', 'pomoc/bliska/4')
    expect(screen.getByText('Krok 1 z 4')).toBeInTheDocument()
  })
})

describe('wynik faktury przeżywa odświeżenie i Wstecz', () => {
  test('odświeżenie na wyniku i powrót do kroku 3', async () => {
    const { unmount } = renderOsoba('tomasz', 'zwykly', 'faktura/nowa/3', (s) => {
      s.osoby.tomasz.szkice['nowa-faktura'] = { kontrahent: { nip: '6663810358', nazwa: 'Kawiarnia Ziarno Anna Lis', adres: 'x' }, opis: 'Projekt graficzny', stawkaVat: 23, kwotaTekst: '100', tryb: 'netto' }
    })
    await userEvent.click(screen.getByRole('button', { name: 'Wyślij do KSeF' }))
    expect(await screen.findByText('Faktura jest w KSeF')).toBeInTheDocument()
    unmount()
    render(<App />)
    expect(await screen.findByText('Faktura jest w KSeF')).toBeInTheDocument()
    idzDo('#/tomasz/faktura/nowa/3')
    expect(await screen.findByRole('heading', { level: 1, name: 'FV/3/12/2026' })).toBeInTheDocument()
  })
  test('krok 4 bez wysłanej faktury → lista faktur', async () => {
    renderOsoba('tomasz', 'zwykly', 'faktura/nowa/4')
    expect(await screen.findByRole('heading', { level: 1, name: /Faktury|Twoje faktury/ })).toBeInTheDocument()
  })
})

describe('zawieszenie od przyszłej daty', () => {
  const od = (d: string) => (s: Parameters<NonNullable<Parameters<typeof renderOsoba>[3]>>[0]) => {
    s.osoby.tomasz.statusFirmy = 'zawieszona'
    s.osoby.tomasz.zawieszonaOd = d
  }
  test('zaplanowane: faktury dalej można wystawiać', () => {
    renderOsoba('tomasz', 'zwykly', 'faktura/nowa/1', od('2027-01-01'))
    expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
  })
  test('zaplanowane: status mówi, że zaplanowane', () => {
    renderOsoba('tomasz', 'zwykly', 'firma', od('2027-01-01'))
    expect(screen.getByText('zawieszenie zaplanowane od 01.01.2027')).toBeInTheDocument()
  })
  test('trwające: blokuje faktury', () => {
    renderOsoba('tomasz', 'zwykly', 'faktura/nowa/1', od('2026-12-01'))
    expect(screen.getByText(/W tym czasie nie wystawiasz faktur/)).toBeInTheDocument()
  })
})

test('każdy wynik mówi, że to wersja pokazowa', () => {
  render(<MemoryRouter><Wynik tytul="Wysłano" wiersze={[]} dalej={{ etykieta: 'Gotowe', do: '/x' }} /></MemoryRouter>)
  expect(screen.getByText('To wersja pokazowa — nic nie zostało wysłane.')).toBeInTheDocument()
})

describe('grudniowy ryczałt jednakowo w terminach i w PIT-28', () => {
  const T = osoby.tomasz
  const s = stanPoczatkowy(T)
  test('zaliczka za grudzień = to, co zostaje z PIT-28', () => {
    const pit = pitRoczny(T.firma!, s)
    expect(platnosci(podsumowanie(T.firma!, s), pit.roznica).find((p) => p.id === 'ryczalt-2026-12')?.kwota).toBe(pit.roznica)
  })
  test('PIT-28 podaje termin 20 stycznia', () => {
    renderOsoba('tomasz', 'zwykly', 'pit')
    expect(screen.getByRole('region', { name: 'Wynik rozliczenia' })).toHaveTextContent('do 20.01.2027')
  })
})
