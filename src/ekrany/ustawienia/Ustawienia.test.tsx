import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

test('przelacznik-zmienia-widok', async () => {
  renderOsoba('tomasz', 'zwykly', 'ustawienia')
  const p = screen.getByRole('switch', { name: /Prosty widok/ })
  expect(p).toHaveAttribute('aria-checked', 'false')
  await userEvent.click(p)
  expect(document.documentElement.dataset.widok).toBe('prosty')
  expect(screen.getByRole('switch', { name: /Prosty widok/ })).toHaveAttribute('aria-checked', 'true')
})

test('rozmiar-tekstu-ustawia-skale', async () => {
  renderOsoba('tomasz', 'zwykly', 'ustawienia')
  await userEvent.click(screen.getByRole('radio', { name: /Bardzo duży/ }))
  expect(document.documentElement.style.getPropertyValue('--skala')).toBe('1.5')
})

test.each(WIDOKI)('ustawienia bez naruszen (%s)', async (w) => {
  const { container } = renderOsoba('halina', w, 'ustawienia')
  expect(screen.getByText(/Ola/)).toBeInTheDocument()
  await bezNaruszen(container)
})
