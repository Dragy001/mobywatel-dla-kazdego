import { screen } from '@testing-library/react'
import { renderApp } from './test/render'

test('pokazuje-stopke-prototypu', () => {
  renderApp('#/')
  expect(
    screen.getByText('Prototyp koncepcji. Nie jest aplikacją administracji publicznej. Wszystkie dane są fikcyjne.'),
  ).toBeInTheDocument()
})
