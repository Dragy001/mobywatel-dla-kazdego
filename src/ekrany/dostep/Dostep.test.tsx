import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const idzDo = (h: string) => act(() => { window.location.hash = h })

describe.each(WIDOKI)('widok %s', (w) => {
  test('lista dostępów bez naruszeń', async () => {
    const { container } = renderOsoba('tomasz', w, 'dostep')
    expect(screen.getByRole('region', { name: 'Biuro Rachunkowe Liczydło' })).toBeInTheDocument()
    expect(screen.getByText(/ważny jeszcze 12 dni/)).toBeInTheDocument()
    expect(screen.getByText('Tokeny KSeF są ważne 90 dni. Po tym czasie program księgowy traci dostęp do faktur.')).toBeInTheDocument()
    await bezNaruszen(container)
  })

  test('przedluzenie-tokenu-ustawia-2027-03-05-i-usuwa-zadanie', async () => {
    renderOsoba('tomasz', w, 'dostep')
    await userEvent.click(screen.getByRole('link', { name: /Przedłuż/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Przedłuż token' }))
    expect(screen.getByRole('status')).toHaveTextContent('Token przedłużony do 05.03.2027')
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText(/ważny jeszcze 90 dni/)).toBeInTheDocument()
    idzDo('#/tomasz/start')
    await screen.findByRole('heading', { level: 1 })
    expect(screen.queryByText('Token KSeF wygasa')).not.toBeInTheDocument()
  })

  test('odebranie-dostepu-usuwa-z-listy', async () => {
    renderOsoba('tomasz', w, 'dostep')
    await userEvent.click(screen.getByRole('link', { name: /Odbierz dostęp/ }))
    expect(screen.getByText('Biuro Rachunkowe Liczydło')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Odbierz dostęp' }))
    expect(screen.getByRole('status')).toHaveTextContent('Dostęp odebrany')
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText('Nikt poza Tobą nie ma dostępu do Twoich faktur.')).toBeInTheDocument()
  })

  test('zly-nip-pokazuje-komunikat', async () => {
    const { container } = renderOsoba('tomasz', w, 'dostep/nowy/1')
    await userEvent.type(screen.getByLabelText('NIP firmy'), '1234567890')
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Ten NIP ma błąd. Sprawdź cyfry.')
    expect(screen.getByText('Krok 1 z 4')).toBeInTheDocument()
    await bezNaruszen(container)
  })

  test('zly PESEL', async () => {
    renderOsoba('tomasz', w, 'dostep/nowy/1')
    await userEvent.click(screen.getByRole('radio', { name: /Osoba/ }))
    await userEvent.type(screen.getByLabelText('Imię i nazwisko'), 'Ewa Nowak')
    await userEvent.type(screen.getByLabelText('PESEL'), '8501011234')
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByRole('alert')).toHaveTextContent('PESEL ma 11 cyfr.')
  })

  test('daj dostęp w 4 krokach', async () => {
    renderOsoba('tomasz', w, 'dostep/nowy/1')
    await userEvent.type(screen.getByLabelText('NIP firmy'), '5218320463')
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByText('Krok 2 z 4')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /Wystawianie faktur/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByLabelText('Do kiedy?')).toHaveValue('2027-03-31')
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByText('Kowalski Meble Jan Kowalski')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Daj dostęp' }))
    expect(screen.getByRole('status')).toHaveTextContent('Dostęp nadany')
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText('Kowalski Meble Jan Kowalski')).toBeInTheDocument()
  })
})
