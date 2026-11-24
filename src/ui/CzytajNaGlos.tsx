import { IconPlayerStop, IconVolume } from '@tabler/icons-react'
import { useEffect, useState } from 'react'

function tekstDoCzytania(): string {
  const main = document.querySelector('main')
  if (!main) return ''
  const kopia = main.cloneNode(true) as HTMLElement
  kopia.querySelectorAll('[data-nie-czytaj], button, [aria-hidden="true"]').forEach((e) => e.remove())
  return (kopia.textContent ?? '').replace(/\s+/g, ' ').trim()
}

export function czytaj(tekst: string) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const u = new SpeechSynthesisUtterance(tekst)
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
