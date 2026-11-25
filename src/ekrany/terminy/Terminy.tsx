import { IconFileText } from '@tabler/icons-react'
import { Navigate } from 'react-router-dom'
import { dataSlownie, formatData, zaIleDni } from '../../logika/daty'
import { formatZl } from '../../logika/pieniadze'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { PasekGorny } from '../../ui/PasekGorny'
import { Przelacznik } from '../../ui/Przelacznik'
import { PrzyciskLink } from '../../ui/Przycisk'
import { useTrasa } from '../../ui/trasa'
import { usePodsumowanie } from '../firma/usePodsumowanie'
import { doZaplaty, platnosci } from './platnosci'

const MIESIACE: [string, string][] = [['2026-12', 'Grudzień 2026'], ['2027-01', 'Styczeń 2027'], ['2027-02', 'Luty 2027']]

export function Terminy() {
  const { stanOsoby, wyslij } = useMagazyn()
  const { widok } = useUstawienia()
  const t = useTrasa()
  const p = usePodsumowanie()
  if (!p) return <Navigate to={t('start')} replace />
  const prosty = widok === 'prosty'
  const lista = platnosci(p)

  return (
    <>
      <PasekGorny tytul="Terminy i płatności" podtytul={prosty ? undefined : 'Najbliższe 3 miesiące'} />
      <Przelacznik etykieta="Przypomnij mi 3 dni wcześniej" opis="Powiadomienie w aplikacji przed każdym terminem" wlaczony={stanOsoby.przypomnienia} onZmiana={(v) => wyslij({ t: 'przypomnienia', wlaczone: v })} />
      {MIESIACE.map(([m, nazwa]) => (
        <section key={m} aria-labelledby={`m-${m}`}>
          <h2 id={`m-${m}`} className="sekcja-tytul">{nazwa}</h2>
          <ul className="terminy">
            {lista.filter((pl) => pl.termin.startsWith(m)).map((pl) => {
              const zaplacone = stanOsoby.zaplacone.includes(pl.id)
              return (
                <li key={pl.id} className={`karta karta--zwykla termin${zaplacone ? ' termin--zaplacone' : ''}`}>
                  <div className="termin__data"><strong>{dataSlownie(pl.termin)}</strong>{!prosty && !zaplacone && <span className="opcja__opis">{zaIleDni(pl.termin)}</span>}</div>
                  <div className="termin__tresc">
                    <span>{pl.tytul}</span>
                    <span className="termin__kwota">
                      {pl.kwota === undefined ? 'kwotę policzymy po zamknięciu miesiąca' : `${pl.szacunek ? 'około ' : ''}${formatZl(pl.kwota)}`}
                    </span>
                    {zaplacone && <span className="znaczek znaczek--sukces">zapłacone</span>}
                  </div>
                  {!zaplacone && doZaplaty(pl) && <PrzyciskLink do={`zaplac/${pl.id}/1`}>Zapłać</PrzyciskLink>}
                </li>
              )
            })}
          </ul>
        </section>
      ))}
      <h2 className="sekcja-tytul">Później</h2>
      {prosty ? (
        <div className="duze-przyciski"><DuzyPrzycisk ikona={<IconFileText size={28} />} etykieta="Rozliczenie roczne PIT-28" opis={`do ${formatData('2027-04-30')}`} do="pit" /></div>
      ) : (
        <div className="karta karta--neutralna termin">
          <div className="termin__data"><strong>{dataSlownie('2027-04-30', true)}</strong></div>
          <div className="termin__tresc"><span>Rozliczenie roczne PIT-28 za 2026</span></div>
          <PrzyciskLink ton="drugi" do="pit">Zobacz</PrzyciskLink>
        </div>
      )}
    </>
  )
}
