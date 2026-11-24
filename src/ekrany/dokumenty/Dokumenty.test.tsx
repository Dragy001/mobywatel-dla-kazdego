import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'
import { KLUCZ } from '../../stan/magazyn'

describe.each(WIDOKI)('widok %s', (w) => {
  test('pokazuje-kod-do-sprawdzenia', async () => {
    renderOsoba('halina', w, 'dokumenty/dowod')
    expect(screen.getAllByText(/Ważny do/).length).toBeGreaterThan(0)
    await userEvent.click(screen.getByRole('button', { name: /Pokaż kod do sprawdzenia/ }))
    expect(screen.getByRole('img', { name: /Kod do sprawdzenia dokumentu/ })).toBeInTheDocument()
  })

  test('wniosek-3-kroki-konczy-wynikiem', async () => {
    renderOsoba('halina', w, 'dowod/wniosek/1')
    expect(screen.getByText('Krok 1 z 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Wszystko się zgadza' }))
    expect(screen.getByText('Krok 2 z 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('radio', { name: /Urząd Miasta Radomia/ }))
    await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
    expect(screen.getByText('Krok 3 z 3')).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Złóż wniosek' }))
    expect(screen.getByRole('status')).toHaveTextContent('Wniosek złożony')
  })

  test('lista dokumentów i bez naruszeń', async () => {
    const { container } = renderOsoba('tomasz', w, 'dokumenty')
    expect(screen.getByRole('link', { name: /mPrawo jazdy/ })).toHaveAttribute('href', '#/tomasz/dokumenty/prawo-jazdy')
    await bezNaruszen(container)
  })

  test('dokument i kroki wniosku bez naruszeń', async () => {
    const { container, unmount } = renderOsoba('halina', w, 'dokumenty/dowod')
    await bezNaruszen(container)
    unmount()
    const r = renderOsoba('halina', w, 'dowod/wniosek/2')
    await bezNaruszen(r.container)
  })
})

test('bez wyboru urzędu nie przechodzi dalej', async () => {
  renderOsoba('halina', 'prosty', 'dowod/wniosek/2')
  await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
  expect(screen.getByText('Wybierz urząd, w którym odbierzesz dowód.')).toBeInTheDocument()
  expect(screen.getByText('Krok 2 z 3')).toBeInTheDocument()
})

test('po-wniosku-znika-przypomnienie', async () => {
  renderOsoba('halina', 'prosty', 'dowod/wniosek/3', (s) => { s.osoby.halina.szkice['wniosek-dowod'] = { urzad: 'radom' } })
  await userEvent.click(screen.getByRole('button', { name: 'Złóż wniosek' }))
  await userEvent.click(screen.getByRole('link', { name: 'Wróć na start' }))
  expect(screen.queryByText(/Jedna sprawa czeka/)).not.toBeInTheDocument()
  expect(screen.getByText(/Nic nie czeka/)).toBeInTheDocument()
})

test('odswiezenie-w-kroku-2-zostaje-w-kroku-2', async () => {
  const r = renderOsoba('halina', 'zwykly', 'dowod/wniosek/2')
  await userEvent.click(screen.getByRole('radio', { name: /Delegatura/ }))
  r.unmount()
  const zapis = JSON.parse(window.sessionStorage.getItem(KLUCZ)!)
  window.sessionStorage.setItem(KLUCZ, JSON.stringify(zapis))
  const { renderApp } = await import('../../test/render')
  renderApp('#/halina/dowod/wniosek/2')
  expect(screen.getByText('Krok 2 z 3')).toBeInTheDocument()
  expect(screen.getByRole('radio', { name: /Delegatura/ })).toBeChecked()
})
