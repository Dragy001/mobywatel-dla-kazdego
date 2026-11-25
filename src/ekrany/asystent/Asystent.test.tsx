import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

describe.each(WIDOKI)('widok %s', (w) => {
  test('podpowiedź daje odpowiedź z akcją', async () => {
    const { container } = renderOsoba('tomasz', w, 'asystent')
    await userEvent.click(screen.getByRole('button', { name: 'Co mam zapłacić w tym miesiącu?' }))
    expect(screen.getByRole('log')).toHaveTextContent('W tym miesiącu zapłacisz razem')
    expect(screen.getByRole('link', { name: 'Zobacz szczegóły' })).toHaveAttribute('href', '#/tomasz/firma')
    await bezNaruszen(container)
  })

  test('wpisane pytanie', async () => {
    renderOsoba('halina', w, 'asystent')
    await userEvent.type(screen.getByLabelText('Twoje pytanie'), 'Kiedy kończy się mój dowód?')
    await userEvent.click(screen.getByRole('button', { name: 'Wyślij' }))
    expect(screen.getByRole('link', { name: 'Złóż wniosek' })).toHaveAttribute('href', '#/halina/dowod/wniosek/1')
  })
})

test('faktura z asystenta trafia do kroku sprawdzenia', async () => {
  renderOsoba('tomasz', 'zwykly', 'asystent')
  await userEvent.type(screen.getByLabelText('Twoje pytanie'), 'Wystaw fakturę dla Kawiarni Ziarno na 800 zł')
  await userEvent.click(screen.getByRole('button', { name: 'Wyślij' }))
  await userEvent.click(screen.getByRole('link', { name: 'Sprawdź i wyślij' }))
  expect(screen.getByText('Krok 3 z 3')).toBeInTheDocument()
  expect(screen.getByText('Kawiarnia Ziarno Anna Lis')).toBeInTheDocument()
})
