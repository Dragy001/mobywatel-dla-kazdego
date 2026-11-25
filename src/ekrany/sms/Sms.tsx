import { IconAlertTriangle, IconCircleCheck, IconMessage } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { DZIS, formatData } from '../../logika/daty'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { PasekGorny } from '../../ui/PasekGorny'
import { PrzyciskLink } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'

const CO_ZROBIC = [
  'Nie klikaj w link i nie płać.',
  'Nie podawaj danych do banku ani kodów z SMS-ów.',
  'Usuń wiadomość albo zgłoś ją — to ostrzeże innych.',
  'Jeśli już kliknąłeś lub zapłaciłeś, zadzwoń od razu do swojego banku.',
]

export function Sms() {
  const { osoba } = useMagazyn()
  const { widok } = useUstawienia()
  const t = useTrasa()
  const lista = osoba.sms ?? []
  return (
    <>
      <PasekGorny tytul="Czy ten SMS to oszustwo?" />
      {lista.length === 0 ? (
        <p className="akapit">Nie masz SMS-ów do sprawdzenia. W wersji pokazowej przykładowe wiadomości ma Halina.</p>
      ) : (
        <>
          <p className="akapit">{widok === 'prosty' ? 'Wybierz wiadomość, którą chcesz sprawdzić.' : 'Wybierz wiadomość. Sprawdzimy nadawcę, link i treść.'}</p>
          <ul className="lista-sms">
            {lista.map((s) => (
              <li key={s.id}>
                <Link className="karta karta--zwykla karta--link sms" to={t(`sms/${s.id}`)}>
                  <span className="sms__naglowek"><IconMessage size={22} aria-hidden /><strong>{s.nadawca}</strong><span className="opcja__opis">{s.kiedy}</span></span>
                  <span className="sms__tresc">{s.tresc}</span>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </>
  )
}

export function SmsWerdykt() {
  const { id } = useParams()
  const { osoba } = useMagazyn()
  const t = useTrasa()
  const s = osoba.sms?.find((x) => x.id === id)
  if (!s) return <Navigate to={t('sms')} replace />
  return (
    <>
      <PasekGorny tytul="Wynik sprawdzenia" />
      <div className="karta karta--neutralna sms"><strong>{s.nadawca}</strong><span className="sms__tresc">{s.tresc}</span></div>
      <section className={`karta ${s.oszustwo ? 'karta--blad' : 'karta--sukces'} werdykt`} aria-labelledby="werdykt">
        <h2 id="werdykt" className="werdykt__tytul">
          {s.oszustwo ? <IconAlertTriangle size={28} aria-hidden /> : <IconCircleCheck size={28} aria-hidden />}
          {s.oszustwo ? 'To oszustwo' : 'Wygląda na prawdziwą wiadomość'}
        </h2>
        <ul className="werdykt__cechy">{s.cechy.map((c) => <li key={c}>{c}</li>)}</ul>
      </section>
      {s.oszustwo && (
        <>
          <h2 className="sekcja-tytul">Co zrobić</h2>
          <ol className="kroki-lista">{CO_ZROBIC.map((c) => <li key={c}>{c}</li>)}</ol>
          <PrzyciskLink do={`sms/${s.id}/zglos`}>Zgłoś do CERT Polska</PrzyciskLink>
        </>
      )}
    </>
  )
}

export function SmsZglos() {
  const { id } = useParams()
  const { osoba } = useMagazyn()
  const t = useTrasa()
  const [wyslane, setWyslane] = useState(false)
  const s = osoba.sms?.find((x) => x.id === id && x.oszustwo)
  if (!s) return <Navigate to={t('sms')} replace />
  if (wyslane)
    return (
      <>
        <PasekGorny tytul="Zgłoś SMS-a" wstecz={false} />
        <Wynik tytul="Zgłoszenie wysłane" wiersze={[['Nadawca', s.nadawca], ['Do kogo', 'CERT Polska'], ['Data', formatData(DZIS)]]} dalej={{ etykieta: 'Gotowe', do: 'start' }}>
          <p className="uwaga">Zgłoszenie pokazowe — nic nie zostało wysłane. W prawdziwej aplikacji SMS trafi do CERT Polska, a strona z linku może zostać zablokowana.</p>
        </Wynik>
      </>
    )
  return (
    <>
      <PasekGorny tytul="Zgłoś SMS-a" />
      <SprawdzIPotwierdz
        wiersze={[['Nadawca', s.nadawca], ['Treść', s.tresc], ['Do kogo', 'CERT Polska']]}
        uwaga="Wyślemy tylko treść SMS-a i nadawcę. Twoje dane zostają u Ciebie."
        etykieta="Zgłoś SMS-a"
        onPotwierdz={() => setWyslane(true)}
      />
    </>
  )
}
