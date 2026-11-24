import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, przygotujStan, renderApp } from '../../test/render'
import { KLUCZ } from '../../stan/magazyn'

test('wybor-osoby-otwiera-start', async () => {
  renderApp('#/')
  await userEvent.click(screen.getByRole('link', { name: /Tomasz Wójcik/ }))
  expect(window.location.hash).toBe('#/tomasz/start')
})

test('co-sprawdzic-prowadzi-do-ekranow', () => {
  renderApp('#/')
  expect(screen.getByRole('link', { name: /Wystaw fakturę w 3 krokach/ })).toHaveAttribute('href', '#/tomasz/faktura/nowa/1')
  expect(screen.getByRole('link', { name: /Poproś wnuczkę o pomoc/ })).toHaveAttribute('href', '#/halina/pomoc')
})

test('zacznij-od-nowa-czysci-stan', async () => {
  przygotujStan((s) => { s.osoby.tomasz.zaplacone = ['zus-2026-11'] })
  renderApp('#/')
  await userEvent.click(screen.getByRole('button', { name: 'Zacznij od nowa' }))
  expect(JSON.parse(window.sessionStorage.getItem(KLUCZ)!).osoby.tomasz.zaplacone).toEqual([])
})

test('wejscie bez naruszen', async () => {
  const { container } = renderApp('#/')
  await bezNaruszen(container)
})
