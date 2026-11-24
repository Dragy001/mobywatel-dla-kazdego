import type { Grosze } from '../logika/pieniadze'

export type OsobaId = 'halina' | 'tomasz'
export type Widok = 'zwykly' | 'prosty'

export interface Dokument {
  id: 'dowod' | 'prawo-jazdy' | 'pojazd' | 'legitymacja-emeryta'
  nazwa: string
  podpis: string
  waznyDo?: string
  pola: [string, string][]
}

export interface Kontrahent {
  nip: string
  nazwa: string
  adres: string
}

export interface Usluga {
  opis: string
  stawkaVat: number
  ostatniaKwotaNetto?: Grosze
}

export interface Pozycja {
  opis: string
  netto: Grosze
  stawkaVat: number
}

export interface Faktura {
  id: string
  numer: string
  numerKsef: string
  rodzaj: 'wystawiona' | 'otrzymana'
  data: string
  kontrahent: Kontrahent
  pozycje: Pozycja[]
  rachunek?: string
  naBialejLiscie?: boolean
  zaplacona?: boolean
}

export interface Dostep {
  id: string
  kto: string
  nip?: string
  rodzaj: 'ksiegowa' | 'osoba'
  zakres: 'przegladanie' | 'wystawianie'
  doKiedy: string
}

export interface Firma {
  nazwa: string
  wlasciciel: string
  nip: string
  regon: string
  adres: string
  dataRozpoczecia: string
  pkd: { kod: string; opis: string }[]
  stawkaRyczaltu: number
  /** Przychód (netto) z miesięcy przed listopadem, bez rozpisywania faktur. */
  przychodyWczesniej: Record<string, Grosze>
  kontrahenci: Kontrahent[]
  uslugi: Usluga[]
  faktury: Faktura[]
  dostepy: Dostep[]
  tokenKsefWaznyDo: string
  rachunekVat: string
}

export interface Pomocnik {
  id: string
  imie: string
  relacja: string
  telefon: string
}

export interface Sms {
  id: string
  nadawca: string
  tresc: string
  kiedy: string
  oszustwo: boolean
  cechy: string[]
}

export interface Sprawdzenie {
  kto: string
  kiedy: string
  co: string
  poCo: string
}

export interface Osoba {
  id: OsobaId
  imie: string
  nazwisko: string
  wolacz: string
  wiek: number
  miasto: string
  adres: string
  pesel: string
  opis: string
  widokDomyslny: Widok
  dokumenty: Dokument[]
  firma?: Firma
  pomocnicy: Pomocnik[]
  sms?: Sms[]
  historiaSprawdzen?: Sprawdzenie[]
}

export interface Ustawienia {
  widok: Widok
  skala: 1 | 1.25 | 1.5
  czytanie: boolean
  pierwszeUruchomienieZrobione: boolean
}

export interface Wniosek {
  id: string
  rodzaj: string
  zlozony: string
  szczegoly?: string
}

export interface StanOsoby {
  ustawienia: Ustawienia
  wystawione: Faktura[]
  zaplacone: string[]
  statusFirmy: 'aktywna' | 'zawieszona'
  zawieszonaOd?: string
  dostepy: Dostep[]
  tokenKsefWaznyDo?: string
  pomoc?: { pomocnikId: string; sprawa: string; doKiedy: string }
  wnioski: Wniosek[]
  szkice: Record<string, unknown>
  adresFirmy?: string
  przypomnienia: boolean
}
