import { IconCircleCheck, IconEye } from '@tabler/icons-react'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { formatData } from '../../logika/daty'
import { zadaniaDla } from '../../logika/zadania'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { PasekGorny } from '../../ui/PasekGorny'
import { ZadanieKarta } from '../../ui/ZadanieKarta'

export function Sprawy() {
  const { osoba, stanOsoby } = useMagazyn()
  const { widok } = useUstawienia()
  const zadania = zadaniaDla(osoba, stanOsoby)
  return (
    <>
      <PasekGorny tytul={widok === 'prosty' ? 'Moje sprawy' : 'Sprawy'} wstecz={widok === 'prosty'} />
      <section aria-labelledby="czeka">
        <h2 id="czeka" className="sekcja-tytul">Czeka na Ciebie ({zadania.length})</h2>
        {zadania.length ? (
          <ul className="zadania" aria-label="Czeka na Ciebie">
            {zadania.map((z, i) => <ZadanieKarta key={z.id} z={z} wyroznione={i === 0} />)}
          </ul>
        ) : <p className="karta karta--sukces">Nic nie czeka.</p>}
      </section>
      <section aria-labelledby="zalatwione">
        <h2 id="zalatwione" className="sekcja-tytul">Załatwione</h2>
        {stanOsoby.wnioski.length === 0 && stanOsoby.zaplacone.length === 0 ? (
          <p className="akapit">Tu zobaczysz złożone wnioski i opłacone sprawy.</p>
        ) : (
          <ul className="zadania">
            {stanOsoby.wnioski.map((w) => (
              <li key={w.id} className="zadanie zadanie--gotowe">
                <div className="zadanie__gora">
                  <span className="zadanie__ikona" aria-hidden><IconCircleCheck size={20} /></span>
                  <h3 className="zadanie__tytul">{w.rodzaj}</h3>
                </div>
                <p className="zadanie__opis">Złożony {formatData(w.zlozony)}{w.szczegoly ? ` · ${w.szczegoly}` : ''}</p>
              </li>
            ))}
            {stanOsoby.zaplacone.map((id) => (
              <li key={id} className="zadanie zadanie--gotowe">
                <div className="zadanie__gora">
                  <span className="zadanie__ikona" aria-hidden><IconCircleCheck size={20} /></span>
                  <h3 className="zadanie__tytul">Zapłacono: {opisPlatnosci(id)}</h3>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
      <h2 className="sekcja-tytul">Twoje dane</h2>
      <DuzyPrzycisk ikona={<IconEye size={28} />} etykieta="Kto sprawdzał moje dane" opis="Apteka, przychodnia, bank — kto i po co" do="historia" />
    </>
  )
}

export function opisPlatnosci(id: string): string {
  if (id.startsWith('zus-')) return 'składki ZUS za listopad'
  if (id.startsWith('ryczalt-')) return 'podatek (ryczałt) za listopad'
  if (id.startsWith('vat-')) return 'podatek VAT za listopad'
  return 'faktura'
}
