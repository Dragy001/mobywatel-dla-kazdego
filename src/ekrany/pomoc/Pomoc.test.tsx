import { screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { bezNaruszen, renderOsoba, WIDOKI } from '../../test/render'

const UWAGA = 'Ola zobaczy tylko tę sprawę. Nie zobaczy Twoich innych dokumentów. Możesz to zakończyć w każdej chwili.'

async function przejdzZgode() {
  await userEvent.click(screen.getByRole('radio', { name: /Ola/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
  await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
  await userEvent.click(screen.getByRole('radio', { name: /Do jutra/ }))
  await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
}

describe.each(WIDOKI)('widok %s', (w) => {
  test('ekran pomocy ma dwie drogi', async () => {
    const { container } = renderOsoba('halina', w, 'pomoc')
    expect(screen.getByRole('link', { name: /Poproś bliską osobę/ })).toHaveAttribute('href', '#/halina/pomoc/bliska/1')
    expect(screen.getByRole('link', { name: /Zapytaj asystenta/ })).toHaveAttribute('href', '#/halina/asystent')
    await bezNaruszen(container)
  })

  test('zgoda-pokazuje-pasek-pomocnika-na-innych-ekranach', async () => {
    renderOsoba('halina', w, 'pomoc/bliska/1')
    await przejdzZgode()
    expect(screen.getByText(UWAGA)).toBeInTheDocument()
    expect(screen.getByText(/Wniosek o nowy dowód|Twój dowód traci ważność/)).toBeInTheDocument()
    await userEvent.click(screen.getByRole('button', { name: 'Poproś o pomoc' }))
    expect(screen.getAllByRole('status').some((s) => /Ola dostała prośbę/.test(s.textContent ?? ''))).toBe(true)
    await userEvent.click(screen.getByRole('link', { name: 'Wróć na start' }))
    expect(screen.getByRole('status', { name: 'Pomoc bliskiej osoby' })).toHaveTextContent('Ola pomaga Ci do jutra 18:00')
  })

  test('kroki zgody bez naruszeń', async () => {
    const { container } = renderOsoba('halina', w, 'pomoc/bliska/1')
    await bezNaruszen(container)
  })
})

test('zakoncz-usuwa-pasek', async () => {
  renderOsoba('halina', 'prosty', 'start', (s) => {
    s.osoby.halina.pomoc = { pomocnikId: 'ola', sprawa: 'Twój dowód traci ważność', doKiedy: '2026-12-06T18:00' }
  })
  await userEvent.click(screen.getByRole('button', { name: 'Zakończ' }))
  expect(screen.queryByRole('status', { name: 'Pomoc bliskiej osoby' })).not.toBeInTheDocument()
})

test('bez wybranej osoby nie przechodzi dalej', async () => {
  renderOsoba('halina', 'prosty', 'pomoc/bliska/1')
  await userEvent.click(screen.getByRole('button', { name: 'Dalej' }))
  expect(screen.getByText('Wybierz osobę, która Ci pomoże.')).toBeInTheDocument()
})
