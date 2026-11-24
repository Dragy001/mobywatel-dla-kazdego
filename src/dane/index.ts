import { halina } from './halina'
import { tomasz } from './tomasz'
import type { Osoba, OsobaId, StanOsoby } from './typy'

export const osoby: Record<OsobaId, Osoba> = { halina, tomasz }

export const jestOsoba = (id: string | undefined): id is OsobaId => id === 'halina' || id === 'tomasz'

export function stanPoczatkowy(o: Osoba): StanOsoby {
  return {
    ustawienia: { widok: o.widokDomyslny, skala: o.widokDomyslny === 'prosty' ? 1.25 : 1, czytanie: o.widokDomyslny === 'prosty', pierwszeUruchomienieZrobione: false },
    wystawione: [],
    zaplacone: [],
    statusFirmy: 'aktywna',
    dostepy: o.firma?.dostepy ?? [],
    wnioski: [],
    szkice: {},
    przypomnienia: true,
  }
}
