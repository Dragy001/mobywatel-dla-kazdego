import { IconEye } from '@tabler/icons-react'
import { dataSlownie } from '../../logika/daty'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { Wiersze } from '../../ui/Karta'
import { PasekGorny } from '../../ui/PasekGorny'

export function Historia() {
  const { osoba } = useMagazyn()
  const { widok } = useUstawienia()
  const prosty = widok === 'prosty'
  const lista = [...(osoba.historiaSprawdzen ?? [])].sort((a, b) => b.kiedy.localeCompare(a.kiedy))
  return (
    <>
      <PasekGorny tytul="Kto sprawdzał moje dane" podtytul={prosty ? undefined : 'Ostatnie 30 dni'} />
      <p className="akapit">Tu widzisz każde miejsce, które sprawdziło Twoje dane w aplikacji. {prosty ? '' : 'Jeśli czegoś nie rozpoznajesz, zgłoś to.'}</p>
      {lista.length === 0 ? (
        <p className="karta karta--sukces">Nikt nie sprawdzał Twoich danych w ostatnich 30 dniach.</p>
      ) : (
        <ul className="lista-prosta">
          {lista.map((s) => (
            <li key={`${s.kto}-${s.kiedy}`} className="sprawdzenie">
              <p className="wiersz-ikona sprawdzenie__kto"><IconEye size={22} aria-hidden /><strong>{s.kto}</strong></p>
              <Wiersze wiersze={prosty ? [['Kiedy', dataSlownie(s.kiedy)], ['Po co', s.poCo]] : [['Kiedy', dataSlownie(s.kiedy, true)], ['Co sprawdził', s.co], ['Po co', s.poCo]]} />
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
