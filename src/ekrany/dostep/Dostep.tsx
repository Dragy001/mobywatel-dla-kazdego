import { IconKey, IconUserPlus, IconUsers } from '@tabler/icons-react'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DZIS, dniDo, dodajDni, formatData } from '../../logika/daty'
import type { Dostep as TDostep } from '../../dane/typy'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { Wiersze } from '../../ui/Karta'
import { PasekGorny } from '../../ui/PasekGorny'
import { PrzyciskLink } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'

export const ZAKRES: Record<TDostep['zakres'], string> = {
  przegladanie: 'Przeglądanie faktur w KSeF',
  wystawianie: 'Wystawianie faktur w Twoim imieniu',
}
export const WYJASNIENIE_TOKENU = 'Tokeny KSeF są ważne 90 dni. Po tym czasie program księgowy traci dostęp do faktur.'

function useToken() {
  const { osoba, stanOsoby } = useMagazyn()
  return stanOsoby.tokenKsefWaznyDo ?? osoba.firma?.tokenKsefWaznyDo ?? DZIS
}

export function Dostep() {
  const { osoba, stanOsoby } = useMagazyn()
  const { widok } = useUstawienia()
  const t = useTrasa()
  const token = useToken()
  if (!osoba.firma) return <Navigate to={t('start')} replace />
  const prosty = widok === 'prosty'
  const dni = dniDo(token)
  const pilny = dni <= 30

  return (
    <>
      <PasekGorny tytul="Kto ma dostęp" podtytul={prosty ? undefined : 'Do Twoich faktur w KSeF'} />
      <h2 className="sekcja-tytul"><IconUsers size={22} aria-hidden /> Osoby i firmy</h2>
      {stanOsoby.dostepy.length === 0 && <p className="akapit">Nikt poza Tobą nie ma dostępu do Twoich faktur.</p>}
      {stanOsoby.dostepy.map((d) => (
        <section key={d.id} className="karta karta--zwykla dostep" aria-label={d.kto}>
          <p className="dostep__kto">{d.kto}</p>
          <Wiersze wiersze={prosty ? [['Może', ZAKRES[d.zakres]], ['Do kiedy', formatData(d.doKiedy)]] : [['Kto to', d.rodzaj === 'ksiegowa' ? 'Biuro rachunkowe' : 'Osoba'], ['Może', ZAKRES[d.zakres]], ['Do kiedy', formatData(d.doKiedy)]]} />
          <PrzyciskLink ton="drugi" do={`dostep/odbierz/${d.id}`}>Odbierz dostęp</PrzyciskLink>
        </section>
      ))}
      <h2 className="sekcja-tytul"><IconKey size={22} aria-hidden /> Token do programu księgowego</h2>
      <section className={`karta ${pilny ? 'karta--ostrzezenie' : 'karta--zwykla'} dostep`} aria-label="Token KSeF">
        <p className="dostep__kto">Token KSeF {dni >= 0 ? `ważny jeszcze ${dni} dni` : 'wygasł'}</p>
        {!prosty && <Wiersze wiersze={[['Ważny do', formatData(token)], ['Używa go', 'Biuro Rachunkowe Liczydło']]} />}
        <p className="akapit">{WYJASNIENIE_TOKENU}</p>
        <PrzyciskLink ton={pilny ? 'glowny' : 'drugi'} do="dostep/token">Przedłuż o 90 dni</PrzyciskLink>
      </section>
      {prosty ? (
        <div className="duze-przyciski"><DuzyPrzycisk ikona={<IconUserPlus size={28} />} etykieta="Daj dostęp" opis="Np. nowej księgowej" do="dostep/nowy/1" /></div>
      ) : (
        <PrzyciskLink ton="drugi" do="dostep/nowy/1"><IconUserPlus size={20} aria-hidden /> Daj dostęp</PrzyciskLink>
      )}
    </>
  )
}

export function PrzedluzToken() {
  const { wyslij } = useMagazyn()
  const token = useToken()
  const [gotowe, setGotowe] = useState(false)
  const nowa = dodajDni(DZIS, 90)
  if (gotowe)
    return (
      <>
        <PasekGorny tytul="Przedłuż token" wstecz={false} />
        <Wynik tytul={`Token przedłużony do ${formatData(nowa)}`} wiersze={[['Ważny do', formatData(nowa)], ['Używa go', 'Biuro Rachunkowe Liczydło']]} dalej={{ etykieta: 'Gotowe', do: 'dostep' }}>
          <p className="akapit">Program księgowy dalej widzi Twoje faktury. Przypomnimy Ci 30 dni przed końcem.</p>
        </Wynik>
      </>
    )
  return (
    <>
      <PasekGorny tytul="Przedłuż token" />
      <SprawdzIPotwierdz
        wiersze={[['Teraz ważny do', formatData(token)], ['Po przedłużeniu', formatData(nowa)], ['Używa go', 'Biuro Rachunkowe Liczydło']]}
        uwaga={WYJASNIENIE_TOKENU}
        etykieta="Przedłuż token"
        onPotwierdz={() => { wyslij({ t: 'przedluzToken', doKiedy: nowa }); setGotowe(true) }}
      />
    </>
  )
}

export function OdbierzDostep() {
  const { id } = useParams()
  const { stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const [odebrany, setOdebrany] = useState<TDostep | null>(null)
  if (odebrany)
    return (
      <>
        <PasekGorny tytul="Odbierz dostęp" wstecz={false} />
        <Wynik tytul="Dostęp odebrany" wiersze={[['Kto', odebrany.kto], ['Od kiedy', formatData(DZIS)]]} dalej={{ etykieta: 'Gotowe', do: 'dostep' }}>
          <p className="akapit">{odebrany.kto} nie widzi już Twoich faktur.</p>
        </Wynik>
      </>
    )
  const d = stanOsoby.dostepy.find((x) => x.id === id)
  if (!d) return <Navigate to={t('dostep')} replace />
  return (
    <>
      <PasekGorny tytul="Odbierz dostęp" />
      <SprawdzIPotwierdz
        wiersze={[['Kto', d.kto], ['Teraz może', ZAKRES[d.zakres]], ['Od kiedy bez dostępu', 'od razu']]}
        uwaga="Dostęp możesz dać ponownie w każdej chwili."
        etykieta="Odbierz dostęp"
        onPotwierdz={() => { wyslij({ t: 'odbierzDostep', id: d.id }); setOdebrany(d) }}
      />
    </>
  )
}
