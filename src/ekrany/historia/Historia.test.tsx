import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

describe.each(WIDOKI)('widok %s', (w) => {
  test('lista kto, kiedy i po co', async () => {
    const { container } = renderOsoba('halina', w, 'historia')
    expect(screen.getByText('Apteka Pod Orłem, Radom')).toBeInTheDocument()
    expect(screen.getByText('Odbiór leku na receptę')).toBeInTheDocument()
    expect(screen.getByText('Bank Mazowiecki')).toBeInTheDocument()
    expect(screen.getByText(/2 grudnia/)).toBeInTheDocument()
    await bezNaruszen(container)
  })

  test('wejście z Moich spraw', async () => {
    renderOsoba('halina', w, 'sprawy')
    await userEvent.click(screen.getByRole('link', { name: /Kto sprawdzał moje dane/ }))
    expect(screen.getByRole('heading', { level: 1, name: 'Kto sprawdzał moje dane' })).toBeInTheDocument()
  })
})

test('wejście z ustawień', async () => {
  renderOsoba('tomasz', 'zwykly', 'ustawienia')
  await userEvent.click(screen.getByRole('link', { name: /Kto sprawdzał moje dane/ }))
  expect(screen.getByText(/Nikt nie sprawdzał Twoich danych/)).toBeInTheDocument()
})
