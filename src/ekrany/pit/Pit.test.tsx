import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

describe.each(WIDOKI)('widok %s', (w) => {
  test('podgląd PIT-28 i wysyłka pokazowa', async () => {
    const { container } = renderOsoba('tomasz', w, 'pit')
    expect(screen.getByText(/grudzień przyjęliśmy taki sam jak listopad/)).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Wynik rozliczenia' })).toHaveTextContent('Zostaje do zapłaty')
    expect(screen.getByRole('heading', { name: 'Do sprawdzenia przed wysłaniem' })).toBeInTheDocument()
    await bezNaruszen(container)
    await userEvent.click(screen.getByRole('link', { name: 'Zobacz, jak wygląda wysyłka' }))
    await userEvent.click(screen.getByRole('button', { name: 'Wyślij PIT-28' }))
    expect(screen.getByRole('status')).toHaveTextContent('PIT-28 wysłany')
    expect(screen.getByText(/Wysyłka pokazowa/)).toBeInTheDocument()
  })
})
