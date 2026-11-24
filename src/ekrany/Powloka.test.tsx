import { screen } from '@testing-library/react'
import { bezNaruszen, renderApp, renderOsoba, WIDOKI } from '../test/render'

test('zakladki-tylko-w-zwyklym', () => {
  renderOsoba('tomasz', 'zwykly', 'start')
  expect(screen.getByRole('navigation', { name: 'Główne sekcje' })).toBeInTheDocument()
  expect(screen.queryByRole('link', { name: /Poproś o pomoc/ })).not.toBeInTheDocument()
})

test('pomoc-tylko-w-prostym', () => {
  renderOsoba('tomasz', 'prosty', 'start')
  expect(screen.queryByRole('navigation', { name: 'Główne sekcje' })).not.toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Poproś o pomoc/ })).toHaveAttribute('href', '#/tomasz/pomoc')
})

test('zakladka-firma-tylko-gdy-jest-firma', () => {
  renderOsoba('halina', 'zwykly', 'start')
  const nav = screen.getByRole('navigation', { name: 'Główne sekcje' })
  expect(nav).not.toHaveTextContent('Firma')
})

test('zakladka-firma-u-tomasza', () => {
  renderOsoba('tomasz', 'zwykly', 'start')
  expect(screen.getByRole('link', { name: 'Firma' })).toHaveAttribute('href', '#/tomasz/firma')
})

test('nieznana-osoba-wraca-na-wejscie', () => {
  renderApp('#/jan/start')
  expect(window.location.hash).toBe('#/')
})

test('pasek-pomocnika-gdy-ktos-pomaga', () => {
  renderOsoba('halina', 'prosty', 'start', (s) => {
    s.osoby.halina.pomoc = { pomocnikId: 'ola', sprawa: 'Wniosek o nowy dowód', doKiedy: '2026-12-06T18:00' }
  })
  expect(screen.getByRole('status', { name: 'Pomoc bliskiej osoby' })).toHaveTextContent('Ola pomaga Ci do jutra 18:00')
})

test.each(WIDOKI)('powloka bez naruszen dostepnosci (%s)', async (w) => {
  const { container } = renderOsoba('tomasz', w, 'start')
  await bezNaruszen(container)
})
