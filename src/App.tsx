import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MagazynProvider } from './stan/magazyn'
import { Powloka } from './ekrany/Powloka'
import { Powitanie, Wejscie } from './ekrany/wejscie/Wejscie'
import { RamkaTelefonu, useSzeroki } from './ui/RamkaTelefonu'
import './styl/ui.css'

export const STOPKA =
  'Prototyp koncepcji. Nie jest aplikacją administracji publicznej. Wszystkie dane są fikcyjne.'

function Uklad() {
  const szeroki = useSzeroki()
  const trasy = (
    <Routes>
      <Route path="/" element={szeroki ? <Powitanie /> : <Wejscie />} />
      <Route path="/:osoba/*" element={<Powloka />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
  if (!szeroki) return trasy
  return (
    <div className="pulpit">
      <RamkaTelefonu>{trasy}</RamkaTelefonu>
      <Wejscie panel />
    </div>
  )
}

export default function App() {
  return (
    <MagazynProvider>
      <HashRouter>
        <Uklad />
      </HashRouter>
    </MagazynProvider>
  )
}
