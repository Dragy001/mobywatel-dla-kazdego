import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const porownaj = async (t: string) => {
  const pole = screen.getByLabelText('Kwota od księgowej')
  await userEvent.clear(pole)
  await userEvent.type(pole, t)
  await userEvent.click(screen.getByRole('button', { name: 'Porównaj' }))
  return (screen.getByTestId('porownanie').textContent ?? '').replace(/ /g, ' ')
}

describe.each(WIDOKI)('widok %s', (w) => {
  test('zgadza się / różnica / zła kwota', async () => {
    const { container } = renderOsoba('tomasz', w, 'firma/kwota/ryczalt')
    expect(await porownaj('1568')).toContain('Zgadza się')
    const r = await porownaj('1 600,00 zł')
    expect(r).toContain('Różnica 32,00 zł')
    expect(r).toContain('faktura z innego miesiąca, inna stawka, wpłata nieuwzględniona')
    await bezNaruszen(container)
    expect(await porownaj('abc')).toContain('Wpisz kwotę, np. 1568,00')
  })
})
