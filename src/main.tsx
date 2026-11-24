import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './styl/tokeny.css'
import './styl/baza.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
