import { render } from '@testing-library/react'
import { axe } from 'vitest-axe'
import App from '../App'
import { KLUCZ, stanStartowy } from '../stan/magazyn'
import type { Stan } from '../stan/akcje'
import type { OsobaId, Widok } from '../dane/typy'

export function renderApp(trasa: string) {
  window.location.hash = trasa.replace(/^#/, '')
  return render(<App />)
}

/** Ustawia stan startowy (np. widok osoby) zanim aplikacja się zamontuje. */
export function przygotujStan(zmien: (s: Stan) => void = () => {}) {
  const s = stanStartowy()
  zmien(s)
  window.sessionStorage.setItem(KLUCZ, JSON.stringify(s))
}

export function renderOsoba(osoba: OsobaId, widok: Widok, trasa: string, zmien: (s: Stan) => void = () => {}) {
  przygotujStan((s) => {
    s.osoba = osoba
    s.osoby[osoba].ustawienia.widok = widok
    s.osoby[osoba].ustawienia.pierwszeUruchomienieZrobione = true
    zmien(s)
  })
  return renderApp(`#/${osoba}/${trasa}`)
}

export async function bezNaruszen(el: Element) {
  const wynik = await axe(el, { rules: { region: { enabled: false } } })
  expect(wynik).toHaveNoViolations()
}

export const WIDOKI: Widok[] = ['zwykly', 'prosty']
