import { Navigate, Route, Routes } from 'react-router-dom'
import { Zaslepka } from './Zaslepka'
import { Ustawienia } from './ustawienia/Ustawienia'
import { Start } from './start/Start'
import { Sprawy } from './sprawy/Sprawy'

const ZASLEPKI: [string, string][] = [
  ['start', 'Start'],
  ['sprawy', 'Sprawy'],
  ['dokumenty', 'Dokumenty'],
  ['dokumenty/:id', 'Dokument'],
  ['dowod/wniosek/:krok', 'Wniosek o nowy dowód'],
  ['pomoc', 'Poproś o pomoc'],
  ['pomoc/bliska/:krok', 'Poproś bliską osobę'],
  ['asystent', 'Asystent'],
  ['ustawienia', 'Ustawienia'],
  ['firma', 'Moja firma'],
  ['firma/kwota/:rodzaj', 'Skąd ta kwota'],
  ['faktury', 'Faktury'],
  ['faktury/:id', 'Faktura'],
  ['faktura/nowa/:krok', 'Nowa faktura'],
  ['terminy', 'Terminy i płatności'],
  ['zaplac/:id/:krok', 'Zapłać'],
  ['dostep', 'Kto ma dostęp'],
  ['dostep/nowy/:krok', 'Daj dostęp'],
  ['ceidg', 'Dane w CEIDG'],
  ['ceidg/zawies/:krok', 'Zawieś działalność'],
  ['ceidg/adres/:krok', 'Zmień adres'],
  ['pit', 'Rozliczenie roczne'],
  ['sms', 'Czy ten SMS to oszustwo?'],
  ['historia', 'Kto sprawdzał moje dane'],
]

/** Ekrany gotowe nadpisują zaślepki — dopisuj je tutaj. */
const GOTOWE: [string, JSX.Element][] = [
  ['ustawienia', <Ustawienia />],
  ['start', <Start />],
  ['sprawy', <Sprawy />],
]

export function TrasyOsoby() {
  const gotowe = new Set(GOTOWE.map(([p]) => p))
  return (
    <Routes>
      {GOTOWE.map(([p, el]) => <Route key={p} path={p} element={el} />)}
      {ZASLEPKI.filter(([p]) => !gotowe.has(p)).map(([p, t]) => <Route key={p} path={p} element={<Zaslepka tytul={t} />} />)}
      <Route path="*" element={<Navigate to="start" replace />} />
    </Routes>
  )
}
