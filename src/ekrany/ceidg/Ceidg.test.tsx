import { act, fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const idzDo = (h: string) => act(() => { window.location.hash = h })
const zawieszona = (s: Parameters<NonNullable<Parameters<typeof renderOsoba>[3]>>[0]) => {
  s.osoby.tomasz.statusFirmy = 'zawieszona'
  s.osoby.tomasz.zawieszonaOd = '2027-01-01'
}

describe.each(WIDOKI)('widok %s', (w) => {
  test('dane w CEIDG bez naruszeń', async () => {
    const { container } = renderOsoba('tomasz', w, 'ceidg')
    expect(screen.getByText('Projektowanie graficzne i komunikacja wizualna')).toBeInTheDocument()
    expect(screen.getByText('aktywna')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Zawieś działalność/ })).toHaveAttribute('href', '#/tomasz/ceidg/zawies/1')
    await bezNaruszen(container)
  })

  test('zawieszenie-zmienia-status-wszedzie', async () => {
    const { container } = renderOsoba('tomasz', w, 'ceidg/zawies/1')
    expect(screen.getByLabelText('Od kiedy zawieszasz działalność?')).toHaveValue('2027-01-01')
    await bezNaruszen(container)
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    for (const z of [
      'Nie płacisz składek ZUS za czas zawieszenia (zdrowotną płacisz za dni do zawieszenia).',
      'Nie możesz wystawiać faktur ani przyjmować nowych zleceń.',
      'Zostajesz czynnym podatnikiem VAT, ale za miesiące, w których zawieszenie trwa cały miesiąc, nie składasz rozliczenia VAT (JPK).',
      'Możesz zawiesić działalność bezterminowo i wznowić ją w każdej chwili w aplikacji.',
    ]) expect(screen.getByText(z)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByText('Krok 3 z 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Zawieś działalność' }))
    expect(screen.getByRole('status')).toHaveTextContent('Działalność zawieszona od 01.01.2027')
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText('zawieszona od 01.01.2027')).toBeInTheDocument()
    idzDo('#/tomasz/firma')
    expect(await screen.findByRole('heading', { level: 1, name: 'Moja firma' })).toBeInTheDocument()
    expect(screen.getByText(/zawieszona od 01.01.2027/)).toBeInTheDocument()
  })

  test('data wcześniejsza niż jutro → komunikat', async () => {
    renderOsoba('tomasz', w, 'ceidg/zawies/1')
    fireEvent.change(screen.getByLabelText('Od kiedy zawieszasz działalność?'), { target: { value: '2026-12-05' } })
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Wybierz datę od jutra, czyli od 06.12.2026.')
    expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
  })

  test('wznowienie-przywraca-aktywna', async () => {
    renderOsoba('tomasz', w, 'ceidg', zawieszona)
    await userEvent.click(screen.getByRole('link', { name: /Wznów działalność/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Wznów działalność' }))
    expect(screen.getByRole('status')).toHaveTextContent('Działalność wznowiona')
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText('aktywna')).toBeInTheDocument()
  })
})

test('zawieszona-blokuje-wystawianie-z-wyjasnieniem', () => {
  renderOsoba('tomasz', 'prosty', 'faktura/nowa/1', zawieszona)
  expect(screen.getByText(/W tym czasie nie wystawiasz faktur/)).toBeInTheDocument()
  expect(screen.queryByText('Krok 1 z 3')).not.toBeInTheDocument()
})
