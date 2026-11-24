import { IconAlertTriangle, IconCalendarDue } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import type { Zadanie } from '../logika/zadania'
import { zaIleDni } from '../logika/daty'
import { useTrasa } from './trasa'

export function ZadanieKarta({ z, wyroznione }: { z: Zadanie; wyroznione?: boolean }) {
  const t = useTrasa()
  return (
    <li className={`zadanie${wyroznione ? ' zadanie--pilne' : ''}`}>
      <div className="zadanie__gora">
        <span className="zadanie__ikona" aria-hidden>{wyroznione ? <IconAlertTriangle size={20} /> : <IconCalendarDue size={20} />}</span>
        <h3 className="zadanie__tytul">{z.tytul}</h3>
        {z.termin && <span className="zadanie__kiedy">{zaIleDni(z.termin)}</span>}
      </div>
      <p className="zadanie__opis">{z.opis}</p>
      <Link className="zadanie__akcja" to={t(z.akcja.trasa)}>
        {z.akcja.etykieta}<span className="sr-only">: {z.tytul}</span>
      </Link>
    </li>
  )
}
