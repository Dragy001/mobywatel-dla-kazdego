import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTrasa } from './trasa'

type Ton = 'glowny' | 'drugi' | 'tekst' | 'niebezpieczny'

export function Przycisk({ ton = 'glowny', children, ...p }: ButtonHTMLAttributes<HTMLButtonElement> & { ton?: Ton }) {
  return <button type="button" {...p} className={`przycisk przycisk--${ton} ${p.className ?? ''}`}>{children}</button>
}

export function PrzyciskLink({ ton = 'glowny', do: cel, children }: { ton?: Ton; do: string; children: ReactNode }) {
  const t = useTrasa()
  return <Link className={`przycisk przycisk--${ton}`} to={t(cel)}>{children}</Link>
}

/** Przyciski przyklejone do dołu ekranu. */
export function Dol({ children }: { children: ReactNode }) {
  return <div className="dol" data-nie-czytaj>{children}</div>
}
