import { HashRouter, Navigate, Route, Routes } from 'react-router-dom'
import { MagazynProvider } from './stan/magazyn'
import { Powloka } from './ekrany/Powloka'
import { Wejscie } from './ekrany/wejscie/Wejscie'
import { RamkaTelefonu, useSzeroki } from './ui/RamkaTelefonu'
import './styl/ui.css'

export const STOPKA =
  'Prototyp koncepcji. Nie jest aplikacją administracji publicznej. Wszystkie dane są fikcyjne.'

function Uklad() {
  const szeroki = useSzeroki()
  const aplikacja = (
    <Routes>
      <Route path="/" element={<Wejscie />} />
      <Route path="/:osoba/*" element={<Powloka />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
  return szeroki ? <RamkaTelefonu>{aplikacja}</RamkaTelefonu> : aplikacja
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
