import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IconChevronRight } from '@tabler/icons-react'
import { useTrasa } from './trasa'

interface Props {
  ikona: ReactNode
  etykieta: string
  opis?: string
  do?: string
  onClick?: () => void
  ton?: 'glowny' | 'zwykly' | 'pomoc'
}

export function DuzyPrzycisk({ ikona, etykieta, opis, do: cel, onClick, ton = 'zwykly' }: Props) {
  const t = useTrasa()
  const tresc = (
    <>
      <span className="duzy__ikona" aria-hidden>{ikona}</span>
      <span className="duzy__tekst">
        <span className="duzy__etykieta">{etykieta}</span>
        {opis && <span className="duzy__opis">{opis}</span>}
      </span>
      <IconChevronRight className="duzy__strzalka" size={22} aria-hidden />
    </>
  )
  const kl = `duzy duzy--${ton}`
  return cel ? (
    <Link className={kl} to={t(cel)} onClick={onClick}>{tresc}</Link>
  ) : (
    <button type="button" className={kl} onClick={onClick}>{tresc}</button>
  )
}
