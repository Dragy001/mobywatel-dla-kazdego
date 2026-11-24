import { IconBriefcase, IconHome, IconId, IconListCheck } from '@tabler/icons-react'
import { NavLink } from 'react-router-dom'
import { useMagazyn } from '../stan/magazyn'
import { useTrasa } from './trasa'

export function PasekZakladek() {
  const { osoba } = useMagazyn()
  const t = useTrasa()
  const zakladki = [
    { do: 'start', etykieta: 'Start', ikona: IconHome },
    { do: 'dokumenty', etykieta: 'Dokumenty', ikona: IconId },
    ...(osoba.firma ? [{ do: 'firma', etykieta: 'Firma', ikona: IconBriefcase }] : []),
    { do: 'sprawy', etykieta: 'Sprawy', ikona: IconListCheck },
  ]
  return (
    <nav className="zakladki" aria-label="Główne sekcje" data-nie-czytaj>
      {zakladki.map(({ do: cel, etykieta, ikona: Ikona }) => (
        <NavLink key={cel} to={t(cel)} className="zakladki__link">
          <Ikona size={24} aria-hidden />
          <span>{etykieta}</span>
        </NavLink>
      ))}
    </nav>
  )
}
