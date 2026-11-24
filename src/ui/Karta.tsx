import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTrasa } from './trasa'

export function Karta({ children, ton = 'zwykla', do: cel, etykieta }: { children: ReactNode; ton?: 'ostrzezenie' | 'zwykla' | 'neutralna' | 'sukces' | 'blad'; do?: string; etykieta?: string }) {
  const t = useTrasa()
  const kl = `karta karta--${ton}${cel ? ' karta--link' : ''}`
  return cel ? <Link className={kl} to={t(cel)} aria-label={etykieta}>{children}</Link> : <div className={kl}>{children}</div>
}

/** Wiersz etykieta–wartość. */
export function Wiersz({ etykieta, wartosc, mocno }: { etykieta: ReactNode; wartosc: ReactNode; mocno?: boolean }) {
  return (
    <div className={`wiersz${mocno ? ' wiersz--mocno' : ''}`}>
      <dt>{etykieta}</dt>
      <dd>{wartosc}</dd>
    </div>
  )
}

export function Wiersze({ wiersze }: { wiersze: [ReactNode, ReactNode][] }) {
  return <dl className="wiersze">{wiersze.map(([e, w], i) => <Wiersz key={i} etykieta={e} wartosc={w} />)}</dl>
}
