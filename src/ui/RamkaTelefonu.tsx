import { useEffect, useState, type ReactNode } from 'react'

export const SZEROKI = '(min-width: 900px)'

export function useSzeroki(): boolean {
  const mq = typeof window.matchMedia === 'function' ? window.matchMedia(SZEROKI) : null
  const [szeroki, set] = useState(mq?.matches ?? false)
  useEffect(() => {
    if (!mq) return
    const f = () => set(mq.matches)
    mq.addEventListener('change', f)
    return () => mq.removeEventListener('change', f)
  }, [mq])
  return szeroki
}

/** Na komputerze aplikacja w ramce telefonu, na telefonie pełny ekran. */
export function RamkaTelefonu({ children }: { children: ReactNode }) {
  return (
    <div className="ramka">
      <div className="ramka__ekran">{children}</div>
    </div>
  )
}
