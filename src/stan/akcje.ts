import type { Dostep, Faktura, OsobaId, StanOsoby, Ustawienia, Wniosek } from '../dane/typy'

export interface Stan {
  osoba?: OsobaId
  osoby: Record<OsobaId, StanOsoby>
}

export type Akcja =
  | { t: 'wybierzOsobe'; id: OsobaId }
  | { t: 'ustaw'; zmiana: Partial<Ustawienia> }
  | { t: 'wystawFakture'; faktura: Faktura }
  | { t: 'zaplac'; id: string }
  | { t: 'zawies'; od: string }
  | { t: 'wznow' }
  | { t: 'dajDostep'; dostep: Dostep }
  | { t: 'odbierzDostep'; id: string }
  | { t: 'przedluzToken'; doKiedy: string }
  | { t: 'popros'; pomoc: NonNullable<StanOsoby['pomoc']> }
  | { t: 'zakonczPomoc' }
  | { t: 'zlozWniosek'; wniosek: Wniosek }
  | { t: 'zapiszSzkic'; klucz: string; wartosc: unknown }
  | { t: 'usunSzkic'; klucz: string }
  | { t: 'zmienAdres'; adres: string }
  | { t: 'przypomnienia'; wlaczone: boolean }
  | { t: 'reset' }
