import { HashRouter, Route, Routes } from 'react-router-dom'

export const STOPKA =
  'Prototyp koncepcji. Nie jest aplikacją administracji publicznej. Wszystkie dane są fikcyjne.'

function WejscieTymczasowe() {
  return (
    <main>
      <h1>mObywatel dla każdego</h1>
      <footer>{STOPKA}</footer>
    </main>
  )
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<WejscieTymczasowe />} />
      </Routes>
    </HashRouter>
  )
}
