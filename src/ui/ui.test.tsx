import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { vi } from 'vitest'
import { CzytajNaGlos } from './CzytajNaGlos'
import { SprawdzIPotwierdz } from './SprawdzIPotwierdz'
import { Wynik } from './Wynik'
import { Kroki } from './Kroki'

afterEach(() => {
  delete (window as any).speechSynthesis
  delete (window as any).SpeechSynthesisUtterance
})

test('czytaj-na-glos-ukryte-bez-speechSynthesis', () => {
  render(<CzytajNaGlos />)
  expect(screen.queryByRole('button', { name: /Czytaj/ })).not.toBeInTheDocument()
})

test('czytaj-na-glos-czyta-main-po-polsku', async () => {
  const speak = vi.fn()
  ;(window as any).speechSynthesis = { speak, cancel: vi.fn(), speaking: false }
  ;(window as any).SpeechSynthesisUtterance = function (this: any, t: string) { this.text = t }
  render(<main><p>Jedna sprawa czeka</p><CzytajNaGlos /></main>)
  await userEvent.click(screen.getByRole('button', { name: /Czytaj na głos/ }))
  expect(speak).toHaveBeenCalledTimes(1)
  const u = speak.mock.calls[0][0]
  expect(u.lang).toBe('pl-PL')
  expect(u.text).toContain('Jedna sprawa czeka')
  expect(u.text).not.toContain('Czytaj na głos')
})

test('sprawdz-i-potwierdz-wywoluje-onPotwierdz', async () => {
  const ok = vi.fn()
  render(<MemoryRouter><SprawdzIPotwierdz tytul="Sprawdź i potwierdź" wiersze={[['Kwota', '100 zł']]} etykieta="Wyślij" onPotwierdz={ok} /></MemoryRouter>)
  expect(screen.getByText('100 zł')).toBeInTheDocument()
  await userEvent.click(screen.getByRole('button', { name: 'Wyślij' }))
  expect(ok).toHaveBeenCalled()
})

test('wynik-ma-role-status', () => {
  render(<MemoryRouter><Wynik tytul="Wysłano" wiersze={[['Numer', '1']]} dalej={{ etykieta: 'Gotowe', do: '/x' }} /></MemoryRouter>)
  expect(screen.getByRole('status')).toHaveTextContent('Wysłano')
})

test('kroki-pokazuja-postep', () => {
  render(<Kroki krok={2} z={3} />)
  expect(screen.getByText('Krok 2 z 3')).toBeInTheDocument()
  expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '2')
})
