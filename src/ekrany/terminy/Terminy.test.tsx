import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const idzDo = (h: string) => act(() => { window.location.hash = h })
const zl = (t: string) => t.replace(/ /g, ' ')

describe.each(WIDOKI)('widok %s', (w) => {
  test('terminy na 3 miesiące i przypomnienia', async () => {
    const { container } = renderOsoba('tomasz', w, 'terminy')
    for (const m of ['Grudzień 2026', 'Styczeń 2027', 'Luty 2027']) expect(screen.getByRole('heading', { name: m })).toBeInTheDocument()
    expect(screen.getAllByText(/Składki ZUS za listopad/).length).toBeGreaterThan(0)
    const p = screen.getByRole('switch', { name: /Przypomnij mi 3 dni wcześniej/ })
    const przed = p.getAttribute('aria-checked')
    await userEvent.click(p)
    expect(p).toHaveAttribute('aria-checked', przed === 'true' ? 'false' : 'true')
    await bezNaruszen(container)
  })

  test('zaplata-zus-usuwa-zadanie-ze-startu', async () => {
    const { container } = renderOsoba('tomasz', w, 'zaplac/zus-2026-11/1')
    expect(screen.getByText('Twój rachunek składkowy w ZUS')).toBeInTheDocument()
    expect(zl(container.textContent ?? '')).toContain('2 757,34 zł')
    await bezNaruszen(container)
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByRole('radio', { name: /ePłatności/ })).toBeChecked()
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByText('Krok 3 z 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: /^Zapłać/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Zapłacono')
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    await screen.findByRole('heading', { level: 1, name: 'Terminy i płatności' })
    expect(screen.getAllByText('zapłacone').length).toBeGreaterThan(0)
    idzDo('#/tomasz/start')
    await screen.findByText(/Podatek VAT za listopad/)
    expect(screen.queryByText('Składki ZUS za listopad')).not.toBeInTheDocument()
  })

  test('wynik-ma-dopisek-o-platnosci-pokazowej', async () => {
    renderOsoba('tomasz', w, 'zaplac/ryczalt-2026-11/1')
    expect(screen.getByText('Twój mikrorachunek podatkowy')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    await userEvent.click(screen.getByRole('radio', { name: /Przelew z banku/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    await userEvent.click(screen.getByRole('button', { name: /^Zapłać/ }))
    expect(screen.getByText('Płatność pokazowa — pieniądze nie zostały pobrane.')).toBeInTheDocument()
  })
})

test('nieznana płatność wraca do terminów', async () => {
  renderOsoba('tomasz', 'zwykly', 'zaplac/cos-innego/1')
  expect(await screen.findByRole('heading', { level: 1, name: 'Terminy i płatności' })).toBeInTheDocument()
})
