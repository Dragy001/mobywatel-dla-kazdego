import { doMowy } from '../logika/mowa'
import { IconPlayerStop, IconVolume } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

const PO_KROPCE = new Set(['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'P', 'LI', 'DD', 'LEGEND', 'LABEL', 'TD', 'TH', 'FIGCAPTION'])

/** Tekst ekranu do czytania: z przerwami po nagłówkach i akapitach, wiersze jako „etykieta: wartość”. */
export function tekstDoCzytania(root: Element | null = document.querySelector('main')): string {
  if (!root) return ''
  let wynik = ''
  const idz = (n: Node) => {
    if (n.nodeType === Node.TEXT_NODE) { wynik += n.textContent ?? ''; return }
    if (!(n instanceof Element)) return
    if (n.matches('[data-nie-czytaj], button, [aria-hidden="true"], script, style')) return
    const styl = getComputedStyle(n)
    if (styl.display === 'none' || styl.visibility === 'hidden') return
    n.childNodes.forEach(idz)
    if (n.tagName === 'DT') wynik += ': '
    else if (PO_KROPCE.has(n.tagName) || !styl.display.startsWith('inline')) wynik += '. '
  }
  idz(root)
  const t = wynik.replace(/\s+/g, ' ').replace(/\s+([.:,])/g, '$1').replace(/([.!?:])(\s*\.)+/g, '$1').trim()
  return doMowy(t)
}

export function czytaj(tekst: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(doMowy(tekst))
  u.lang = 'pl-PL'
  u.rate = 0.95
  window.speechSynthesis.speak(u)
}

export function CzytajNaGlos() {
  const [czyta, setCzyta] = useState(false)
  useEffect(() => () => { if ('speechSynthesis' in window) window.speechSynthesis.cancel() }, [])
  if (!('speechSynthesis' in window)) return null
  const klik = () => {
    if (czyta) {
      window.speechSynthesis.cancel()
      setCzyta(false)
      return
    }
    const u = new SpeechSynthesisUtterance(tekstDoCzytania())
    u.lang = 'pl-PL'
    u.rate = 0.95
    u.onend = () => setCzyta(false)
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(u)
    setCzyta(true)
  }
  return (
    <button type="button" className="pigulka" onClick={klik} aria-pressed={czyta} data-nie-czytaj>
      {czyta ? <IconPlayerStop size={20} aria-hidden /> : <IconVolume size={20} aria-hidden />}
      <span>{czyta ? 'Zatrzymaj' : 'Czytaj na głos'}</span>
    </button>
  )
}
