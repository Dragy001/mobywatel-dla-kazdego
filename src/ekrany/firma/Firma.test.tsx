import { screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { osoby, stanPoczatkowy } from '../../dane'
import { podsumowanie } from '../../logika/firma'
import { formatZl as fz } from '../../logika/pieniadze'
const formatZl = (g: number, o?: { bezGroszy?: boolean }) => fz(g, o).replace(/\u00a0/g, ' ')
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const p = podsumowanie(osoby.tomasz.firma!, stanPoczatkowy(osoby.tomasz))

test('zwykly: karta do zapłaty z trzema kwotami i wyjaśnieniami', () => {
  renderOsoba('tomasz', 'zwykly', 'firma')
  const karta = screen.getByRole('region', { name: /Do zapłaty za listopad/ })
  expect(karta).toHaveTextContent(formatZl(p.razem))
  expect(karta).toHaveTextContent(formatZl(p.vat.doZaplaty))
  expect(karta).toHaveTextContent(formatZl(p.ryczalt.doZaplaty))
  expect(karta).toHaveTextContent(formatZl(p.zus.razem))
  const linki = within(karta).getAllByRole('link', { name: /Skąd ta kwota/ }).map((a) => a.getAttribute('href'))
  expect(linki).toEqual(['#/tomasz/firma/kwota/zus', '#/tomasz/firma/kwota/ryczalt', '#/tomasz/firma/kwota/vat'])
  expect(screen.getByRole('link', { name: /Wystaw fakturę/ })).toHaveAttribute('href', '#/tomasz/faktura/nowa/1')
  expect(screen.getByText('aktywna')).toBeInTheDocument()
})

test('prosty: zdanie z sumą i najbliższym terminem', async () => {
  renderOsoba('tomasz', 'prosty', 'firma')
  expect(screen.getByText(`W tym miesiącu zapłacisz razem ${formatZl(p.razem)}. Najbliższy termin: 21 grudnia.`)).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Moje faktury/ })).toHaveAttribute('href', '#/tomasz/faktury')
  await userEvent.click(screen.getByRole('button', { name: /Więcej spraw firmy/ }))
  expect(screen.getByRole('link', { name: /Dane w CEIDG/ })).toHaveAttribute('href', '#/tomasz/ceidg')
})

test('zawieszona firma ma status zawieszona', () => {
  renderOsoba('tomasz', 'zwykly', 'firma', (s) => { s.osoby.tomasz.statusFirmy = 'zawieszona'; s.osoby.tomasz.zawieszonaOd = '2026-12-01' })
  expect(screen.getByText(/zawieszona od 01.12.2026/)).toBeInTheDocument()
})

test('Halina nie ma firmy — wraca na start', () => {
  renderOsoba('halina', 'zwykly', 'firma')
  expect(window.location.hash).toBe('#/halina/start')
})

describe.each(WIDOKI)('skąd ta kwota (%s)', (w) => {
  test.each([
    ['ryczalt', p.ryczalt.doZaplaty],
    ['vat', p.vat.doZaplaty],
    ['zus', p.zus.razem],
  ] as const)('%s: kwota zgadza się z Moją firmą', (rodzaj, kwota) => {
    renderOsoba('tomasz', w, `firma/kwota/${rodzaj}`)
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(formatZl(kwota, { bezGroszy: rodzaj === 'ryczalt' }))
    expect(screen.getByTestId('do-zaplaty')).toHaveTextContent(formatZl(kwota))
    expect(screen.getByRole('link', { name: 'Zapłać' })).toHaveAttribute('href', `#/tomasz/zaplac/${rodzaj}-2026-11/1`)
  })

  test('ekrany firmy bez naruszeń', async () => {
    const a = renderOsoba('tomasz', w, 'firma')
    await bezNaruszen(a.container)
    a.unmount()
    const b = renderOsoba('tomasz', w, 'firma/kwota/ryczalt')
    await bezNaruszen(b.container)
  })
})

test('„Skąd ta kwota?” wygląda jak przycisk z celem dotyku', () => {
  renderOsoba('tomasz', 'zwykly', 'firma')
  const l = screen.getByRole('link', { name: 'Skąd ta kwota? VAT' })
  expect(l).toHaveClass('pigulka')
})
