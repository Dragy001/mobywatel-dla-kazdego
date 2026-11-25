import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

describe.each(WIDOKI)('widok %s', (w) => {
  test('rachunek na białej liście → zapłacono', async () => {
    const { container } = renderOsoba('tomasz', w, 'faktury/z4')
    await userEvent.click(screen.getByRole('link', { name: 'Zapłać' }))
    expect(await screen.findByText('Rachunek jest na białej liście')).toBeInTheDocument()
    await bezNaruszen(container)
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    await userEvent.click(screen.getByRole('button', { name: /^Zapłać/ }))
    expect(screen.getByRole('status')).toHaveTextContent('Zapłacono')
    expect(screen.getByText('Płatność pokazowa — pieniądze nie zostały pobrane.')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText('zapłacona')).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Zapłać' })).not.toBeInTheDocument()
  })

  test('rachunku nie ma na białej liście → nie płać', async () => {
    renderOsoba('tomasz', w, 'faktury/z3/zaplac/1')
    expect(await screen.findByText('Rachunku nie ma na białej liście — nie płać, zanim nie wyjaśnisz')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Dalej' })).not.toBeInTheDocument()
  })
})

test('zapłacona faktura nie ma przycisku Zapłać', () => {
  renderOsoba('tomasz', 'zwykly', 'faktury/z1')
  expect(screen.queryByRole('link', { name: 'Zapłać' })).not.toBeInTheDocument()
})
