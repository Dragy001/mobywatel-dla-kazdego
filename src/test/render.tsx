import { render } from '@testing-library/react'
import App from '../App'

export function renderApp(trasa: string) {
  window.location.hash = trasa.replace(/^#/, '')
  return render(<App />)
}
