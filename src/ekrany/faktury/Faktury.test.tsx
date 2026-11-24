import { act, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const idzDo = (h: string) => act(() => { window.location.hash = h })

describe.each(WIDOKI)('widok %s', (w) => {
  test('wyslana-faktura-jest-na-liscie-i-w-grudniu', async () => {
    renderOsoba('tomasz', w, 'faktura/nowa/1')
    expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /Kawiarnia Ziarno/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    await userEvent.click(screen.getByRole('radio', { name: /Projekt graficzny/ }))
    await userEvent.type(screen.getByLabelText(/Kwota/), '1000')
    expect(screen.getByTestId('podsumowanie-kwot')).toHaveTextContent('1 230,00 zł')
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByText('Kawiarnia Ziarno Anna Lis')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Wyślij do KSeF' }))
    const wynik = await screen.findByRole('status')
    expect(wynik).toHaveTextContent('Faktura jest w KSeF')
    expect(screen.getByText(/^7794210352-20261205-/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText(/FV\/3\/12\/2026/)).toBeInTheDocument()
  })

  test('blokuje-dalej-przy-zlej-kwocie', async () => {
    renderOsoba('tomasz', w, 'faktura/nowa/2', (s) => {
      s.osoby.tomasz.szkice['nowa-faktura'] = { kontrahent: { nip: '6663810358', nazwa: 'Kawiarnia Ziarno Anna Lis', adres: 'x' }, opis: 'Projekt graficzny', stawkaVat: 23, kwotaTekst: '', tryb: 'netto' }
    })
    for (const zla of ['', '0', 'abc']) {
      const pole = screen.getByLabelText(/Kwota/)
      await userEvent.clear(pole)
      if (zla) await userEvent.type(pole, zla)
      await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
      expect(screen.getByText('Wpisz kwotę większą od zera, np. 1230,50')).toBeInTheDocument()
      expect(screen.getByText('Krok 2 z 3')).toBeInTheDocument()
    }
  })

  test('kroki i lista bez naruszeń', async () => {
    const a = renderOsoba('tomasz', w, 'faktura/nowa/2')
    await bezNaruszen(a.container)
    a.unmount()
    const b = renderOsoba('tomasz', w, 'faktury')
    await bezNaruszen(b.container)
    b.unmount()
    const c = renderOsoba('tomasz', w, 'faktury/s1')
    expect(screen.getByText('FV/1/11/2026')).toBeInTheDocument()
    await bezNaruszen(c.container)
  })
})

test('nip-z-rejestru-uzupelnia-dane', async () => {
  renderOsoba('tomasz', 'zwykly', 'faktura/nowa/1')
  await userEvent.click(screen.getByRole('radio', { name: /Nowy kontrahent/ }))
  await userEvent.type(screen.getByLabelText('NIP'), '7831220469')
  await userEvent.click(screen.getByRole('button', { name: 'Znajdź firmę' }))
  expect(screen.getByText('Biuro Podróży Horyzont sp. z o.o.')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
  expect(screen.getByText('Krok 2 z 3')).toBeInTheDocument()
})

test('zly NIP pokazuje komunikat', async () => {
  renderOsoba('tomasz', 'zwykly', 'faktura/nowa/1')
  await userEvent.click(screen.getByRole('radio', { name: /Nowy kontrahent/ }))
  await userEvent.type(screen.getByLabelText('NIP'), '1234567890')
  await userEvent.click(screen.getByRole('button', { name: 'Znajdź firmę' }))
  expect(screen.getByText('Ten NIP ma błąd. Sprawdź cyfry.')).toBeInTheDocument()
})

test('zmiana-widoku-zachowuje-szkic', async () => {
  renderOsoba('tomasz', 'zwykly', 'faktura/nowa/2', (s) => {
    s.osoby.tomasz.szkice['nowa-faktura'] = { kontrahent: { nip: '6663810358', nazwa: 'Kawiarnia Ziarno Anna Lis', adres: 'x' }, opis: 'Projekt graficzny', stawkaVat: 23, kwotaTekst: '', tryb: 'netto' }
  })
  await userEvent.type(screen.getByLabelText(/Kwota/), '2500,50')
  idzDo('#/tomasz/ustawienia')
  await userEvent.click(await screen.findByRole('switch', { name: /Prosty widok/ }))
  idzDo('#/tomasz/faktura/nowa/2')
  expect(await screen.findByText('Krok 2 z 3')).toBeInTheDocument()
  expect(screen.getByLabelText(/Kwota/)).toHaveValue('2500,50')
  expect(document.documentElement.dataset.widok).toBe('prosty')
})

test('lista ma zakładki wystawione i otrzymane', async () => {
  renderOsoba('tomasz', 'zwykly', 'faktury')
  await userEvent.click(screen.getByRole('tab', { name: 'Otrzymane' }))
  const lista = screen.getByRole('list', { name: /Faktury/ })
  expect(within(lista).getByText('Drukarnia Wielkopolska')).toBeInTheDocument()
})
