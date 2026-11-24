import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

test('zwykly Tomasz: 5 zadań w kolejności terminów', () => {
  renderOsoba('tomasz', 'zwykly', 'start')
  const lista = screen.getByRole('list', { name: /Do zrobienia/ })
  const tytuly = within(lista).getAllByRole('heading', { level: 3 }).map((h) => h.textContent)
  expect(tytuly).toEqual(['Token KSeF wygasa', 'Składki ZUS za listopad', 'Podatek (ryczałt) za listopad', 'Kończy się OC auta', 'Podatek VAT za listopad'])
})

test('akcja ZUS prowadzi do płatności', async () => {
  renderOsoba('tomasz', 'zwykly', 'start')
  const karta = screen.getByRole('heading', { name: 'Składki ZUS za listopad' }).closest('li')!
  await userEvent.click(within(karta).getByRole('link', { name: /Zapłać/ }))
  expect(window.location.hash).toBe('#/tomasz/zaplac/zus-2026-11/1')
})

test('zwykly: pole asystenta prowadzi do asystenta', () => {
  renderOsoba('tomasz', 'zwykly', 'start')
  expect(screen.getByRole('link', { name: /Co chcesz załatwić/ })).toHaveAttribute('href', '#/tomasz/asystent')
})

test('prosty Halina: jedno zdanie o dowodzie i najwyżej 5 dużych przycisków', () => {
  const { container } = renderOsoba('halina', 'prosty', 'start')
  expect(screen.getByText(/Jedna sprawa czeka/)).toHaveTextContent(/dowód/)
  expect(container.querySelectorAll('main .duzy').length).toBeLessThanOrEqual(5)
  expect(screen.getByRole('link', { name: /Pokaż dowód/ })).toHaveAttribute('href', '#/halina/dokumenty/dowod')
})

test('prosty Tomasz: przyciski firmy', () => {
  renderOsoba('tomasz', 'prosty', 'start')
  expect(screen.getByText(/Masz 5 spraw/)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Moja firma/ })).toHaveAttribute('href', '#/tomasz/firma')
  expect(screen.getByRole('link', { name: /Wystaw fakturę/ })).toHaveAttribute('href', '#/tomasz/faktura/nowa/1')
})

test('sprawy pokazują złożone wnioski', () => {
  renderOsoba('halina', 'zwykly', 'sprawy', (s) => {
    s.osoby.halina.wnioski = [{ id: 'dowod', rodzaj: 'Nowy dowód osobisty', zlozony: '2026-12-05' }]
  })
  expect(screen.getByText('Nowy dowód osobisty')).toBeInTheDocument()
})

describe.each(WIDOKI)('widok %s', (w) => {
  test.each(['halina', 'tomasz'] as const)('start %s bez naruszeń', async (o) => {
    const { container } = renderOsoba(o, w, 'start')
    await bezNaruszen(container)
  })
  test('sprawy bez naruszeń', async () => {
    const { container } = renderOsoba('tomasz', w, 'sprawy')
    await bezNaruszen(container)
  })
})
