import { IconId } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { KartaDokumentu } from '../../ui/grafiki/KartaDokumentu'
import { PasekGorny } from '../../ui/PasekGorny'
import { useTrasa } from '../../ui/trasa'

export function Dokumenty() {
  const { osoba } = useMagazyn()
  const { widok } = useUstawienia()
  const t = useTrasa()
  if (widok === 'prosty')
    return (
      <>
        <PasekGorny tytul="Moje dokumenty" />
        <div className="duze-przyciski">
          {osoba.dokumenty.map((d) => <DuzyPrzycisk key={d.id} ikona={<IconId size={28} />} etykieta={d.nazwa} opis={d.podpis} do={`dokumenty/${d.id}`} />)}
        </div>
      </>
    )
  return (
    <>
      <PasekGorny tytul="Dokumenty" wstecz={false} />
      <ul className="lista-dokumentow">
        {osoba.dokumenty.map((d) => (
          <li key={d.id}>
            <Link to={t(`dokumenty/${d.id}`)} className="lista-dokumentow__link" aria-label={`${d.nazwa}, ${d.podpis}`}>
              <KartaDokumentu dok={d} osoba={osoba} />
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
