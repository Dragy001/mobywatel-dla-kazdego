import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

describe.each(WIDOKI)('widok %s', (w) => {
  test('oszustwo → co zrobić → zgłoszenie do CERT', async () => {
    const { container } = renderOsoba('halina', w, 'sms')
    await bezNaruszen(container)
    await userEvent.click(screen.getByRole('link', { name: /Paczka24/ }))
    expect(screen.getByRole('heading', { name: 'To oszustwo' })).toBeInTheDocument()
    expect(screen.getByText('Pospiesza Cię i każe zapłacić od razu.')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Co zrobić' })).toBeInTheDocument()
    await bezNaruszen(container)
    await userEvent.click(screen.getByRole('link', { name: 'Zgłoś do CERT Polska' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zgłoś SMS-a' }))
    expect(screen.getByRole('status')).toHaveTextContent('Zgłoszenie wysłane')
    expect(screen.getByText(/Zgłoszenie pokazowe/)).toBeInTheDocument()
  })

  test('prawdziwa wiadomość nie ma zgłoszenia', async () => {
    renderOsoba('halina', w, 'sms/przychodnia')
    expect(screen.getByRole('heading', { name: 'Wygląda na prawdziwą wiadomość' })).toBeInTheDocument()
    expect(screen.queryByRole('link', { name: 'Zgłoś do CERT Polska' })).not.toBeInTheDocument()
  })
})

test('osoba bez SMS-ów', () => {
  renderOsoba('tomasz', 'zwykly', 'sms')
  expect(screen.getByText(/Nie masz SMS-ów do sprawdzenia/)).toBeInTheDocument()
})
