import { act, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const idzDo = (h: string) => act(() => { window.location.hash = h })

describe.each(WIDOKI)('widok %s', (w) => {
  test('nowy adres w CEIDG i na nowej fakturze', async () => {
    const { container } = renderOsoba('tomasz', w, 'ceidg/adres/1', (s) => {
      s.osoby.tomasz.szkice['nowa-faktura'] = { kontrahent: { nip: '6663810358', nazwa: 'Kawiarnia Ziarno Anna Lis', adres: 'x' }, opis: 'Projekt graficzny', stawkaVat: 23, kwotaTekst: '100', tryb: 'netto' }
    })
    await bezNaruszen(container)
    await userEvent.type(screen.getByLabelText('Ulica i numer'), 'ul. Dąbrowskiego 15')
    await userEvent.type(screen.getByLabelText('Kod pocztowy'), '60-838')
    await userEvent.type(screen.getByLabelText('Miejscowość'), 'Poznań')
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByText('Krok 2 z 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    await userEvent.click(screen.getByRole('button', { name: 'Zmień adres' }))
    expect(screen.getByRole('status')).toHaveTextContent('Adres zmieniony')
    await userEvent.click(screen.getByRole('link', { name: 'Gotowe' }))
    expect(await screen.findByText('ul. Dąbrowskiego 15, 60-838 Poznań')).toBeInTheDocument()
    idzDo('#/tomasz/faktura/nowa/3')
    expect(await screen.findByText('Krok 3 z 3')).toBeInTheDocument()
    expect(screen.getByText('ul. Dąbrowskiego 15, 60-838 Poznań')).toBeInTheDocument()
  })

  test('zły kod pocztowy', async () => {
    renderOsoba('tomasz', w, 'ceidg/adres/1')
    await userEvent.type(screen.getByLabelText('Ulica i numer'), 'ul. Długa 1')
    await userEvent.type(screen.getByLabelText('Kod pocztowy'), '60838')
    await userEvent.type(screen.getByLabelText('Miejscowość'), 'Poznań')
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByRole('alert')).toHaveTextContent('Kod pocztowy wpisz jak 00-000.')
  })
})
