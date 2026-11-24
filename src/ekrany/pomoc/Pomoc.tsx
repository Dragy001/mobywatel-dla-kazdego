import { IconMessage2Question, IconPhone, IconUsers } from '@tabler/icons-react'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { PasekGorny } from '../../ui/PasekGorny'

export function Pomoc() {
  const { osoba } = useMagazyn()
  const { widok } = useUstawienia()
  const bliska = osoba.pomocnicy[0]
  return (
    <>
      <PasekGorny tytul="Poproś o pomoc" />
      <p className="akapit">{widok === 'prosty' ? 'Wybierz, kto ma Ci pomóc.' : 'Nie musisz robić tego sam. Wybierz, kto ma pomóc.'}</p>
      <div className="duze-przyciski">
        <DuzyPrzycisk ikona={<IconUsers size={28} />} etykieta="Poproś bliską osobę" opis={bliska ? `${bliska.imie} pomoże Ci w jednej sprawie` : undefined} do="pomoc/bliska/1" ton="glowny" />
        <DuzyPrzycisk ikona={<IconMessage2Question size={28} />} etykieta="Zapytaj asystenta" opis="Napisz albo wybierz pytanie" do="asystent" />
      </div>
      {bliska && (
        <a className="duzy" href={`tel:${bliska.telefon.replaceAll(' ', '')}`}>
          <span className="duzy__ikona" aria-hidden><IconPhone size={28} /></span>
          <span className="duzy__tekst"><span className="duzy__etykieta">Zadzwoń: {bliska.imie}</span><span className="duzy__opis">{bliska.relacja}, {bliska.telefon}</span></span>
        </a>
      )}
    </>
  )
}
