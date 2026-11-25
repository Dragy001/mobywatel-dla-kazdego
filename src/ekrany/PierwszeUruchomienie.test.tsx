import { fireEvent, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, przygotujStan, renderApp } from '../test/render'

test('Halina: zaznaczony prosty widok, wybór zwykłego i start', async () => {
  przygotujStan()
  const { container } = renderApp('#/halina/start')
  expect(screen.getByRole('heading', { level: 1, name: 'Jak chcesz korzystać z aplikacji?' })).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: /Prosty widok/ })).toBeChecked()
  await bezNaruszen(container)
  await userEvent.click(screen.getByRole('radio', { name: /Zwykły widok/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Zaczynamy' }))
  expect(screen.getByRole('navigation', { name: 'Główne sekcje' })).toBeInTheDocument()
})

test('Tomasz: zaznaczony zwykły; suwak zmienia rozmiar tekstu na żywo', () => {
  przygotujStan()
  renderApp('#/tomasz/start')
  expect(screen.getByRole('radio', { name: /Zwykły widok/ })).toBeChecked()
  const suwak = screen.getByRole('slider', { name: 'Rozmiar tekstu' })
  fireEvent.change(suwak, { target: { value: '2' } })
  expect(suwak).toHaveAttribute('aria-valuetext', 'Bardzo duży')
  expect(document.documentElement.style.getPropertyValue('--skala')).toBe('1.5')
})

test('głęboki link zostaje po wyborze', async () => {
  przygotujStan()
  renderApp('#/tomasz/terminy')
  await userEvent.click(screen.getByRole('button', { name: 'Zaczynamy' }))
  expect(screen.getByRole('heading', { level: 1, name: 'Terminy i płatności' })).toBeInTheDocument()
})

test('pokazuje się raz', async () => {
  przygotujStan()
  const { unmount } = renderApp('#/halina/start')
  await userEvent.click(screen.getByRole('button', { name: 'Zaczynamy' }))
  unmount()
  renderApp('#/halina/start')
  expect(screen.queryByText('Jak chcesz korzystać z aplikacji?')).not.toBeInTheDocument()
})
