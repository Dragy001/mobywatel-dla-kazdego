import { IconArrowRight, IconBriefcase, IconEye, IconHeartHandshake, IconRefresh, IconShieldCheck } from '@tabler/icons-react'
import { Link, useNavigate } from 'react-router-dom'
import { STOPKA } from '../../App'
import { osoby } from '../../dane'
import type { OsobaId } from '../../dane/typy'
import { useMagazyn } from '../../stan/magazyn'
import { Znak } from '../../ui/Znak'

const CO_SPRAWDZIC: Record<OsobaId, [string, string][]> = {
  halina: [
    ['Pokaż dowód w przychodni', 'dokumenty/dowod'],
    ['Złóż wniosek o nowy dowód', 'dowod/wniosek/1'],
    ['Poproś wnuczkę o pomoc', 'pomoc'],
    ['Sprawdź, czy SMS to oszustwo', 'sms'],
  ],
  tomasz: [
    ['Wystaw fakturę w 3 krokach', 'faktura/nowa/1'],
    ['Zobacz, skąd się wziął podatek', 'firma/kwota/ryczalt'],
    ['Zawieś firmę na zimę', 'ceidg'],
    ['Włącz prosty widok w ustawieniach', 'ustawienia'],
  ],
}

const NOWE = [
  { ikona: IconEye, tytul: 'Prosty widok, nie tylko większe litery', opis: 'Osobny układ każdego ekranu: jedna sprawa naraz, duże przyciski, czytanie na głos.' },
  { ikona: IconHeartHandshake, tytul: 'Pomoc bliskiej osoby', opis: 'Wnuczka pomoże w jednej sprawie, przez określony czas. Nie widzi reszty Twoich danych.' },
  { ikona: IconBriefcase, tytul: 'Firma naprawdę w aplikacji', opis: 'Faktury w KSeF, ZUS, VAT i ryczałt z wyjaśnieniem „skąd ta kwota”, CEIDG, dostęp księgowej.' },
  { ikona: IconShieldCheck, tytul: 'Nic bez Twojej zgody', opis: 'Każde wysłanie, płatność i zgoda przechodzi przez ekran „Sprawdź i potwierdź”.' },
]

export function Wejscie({ panel = false }: { panel?: boolean }) {
  const { wyslij } = useMagazyn()
  const nav = useNavigate()
  return (
    <div className={panel ? 'wejscie wejscie--panel' : 'wejscie'}>
      <main className="wejscie__tresc">
        <Znak />
        <h1 className="wejscie__tytul">mObywatel dla każdego</h1>
        <p className="wejscie__lead">
          Nowoczesny mObywatel, w którym <strong>starsza osoba się nie gubi</strong>, a <strong>przedsiębiorca prowadzi swoją firmę</strong>: faktury w KSeF, podatki, ZUS i CEIDG w jednym miejscu.
        </p>

        <h2 className="wejscie__h2">Wybierz osobę</h2>
        <div className="wejscie__osoby">
          {(Object.keys(osoby) as OsobaId[]).map((id) => {
            const o = osoby[id]
            return (
              <Link key={id} to={`/${id}/start`} className="osoba-karta">
                <span className={`osoba-karta__awatar osoba-karta__awatar--${id}`} aria-hidden>{o.imie[0]}{o.nazwisko[0]}</span>
                <span className="osoba-karta__tekst">
                  <span className="osoba-karta__imie">{o.imie} {o.nazwisko}</span>
                  <span className="osoba-karta__opis">{o.wiek} lat, {o.miasto} · {id === 'halina' ? 'prosty widok' : 'własna firma'}</span>
                  <span className="osoba-karta__zdanie">{o.opis}</span>
                </span>
                <IconArrowRight size={22} aria-hidden />
              </Link>
            )
          })}
        </div>

        <h2 className="wejscie__h2">Co sprawdzić</h2>
        <div className="wejscie__sprawdz">
          {(Object.keys(CO_SPRAWDZIC) as OsobaId[]).map((id) => (
            <section key={id} aria-label={`Co sprawdzić: ${osoby[id].imie}`}>
              <h3 className="wejscie__h3">{osoby[id].imie}</h3>
              <ol className="wejscie__lista">
                {CO_SPRAWDZIC[id].map(([t, cel]) => (
                  <li key={cel}><Link to={`/${id}/${cel}`}>{t}</Link></li>
                ))}
              </ol>
            </section>
          ))}
        </div>

        <h2 className="wejscie__h2">Co nowego w tej koncepcji</h2>
        <ul className="wejscie__nowe">
          {NOWE.map(({ ikona: I, tytul, opis }) => (
            <li key={tytul}>
              <span className="wejscie__nowe-ikona" aria-hidden><I size={22} /></span>
              <span><strong>{tytul}</strong><br />{opis}</span>
            </li>
          ))}
        </ul>

        <button type="button" className="pigulka" onClick={() => { wyslij({ t: 'reset' }); nav('/') }}>
          <IconRefresh size={20} aria-hidden /> <span>Zacznij od nowa</span>
        </button>
      </main>
      <footer className="wejscie__stopka">{STOPKA}</footer>
    </div>
  )
}

/** Ekran w ramce telefonu na komputerze, zanim jury wybierze osobę. */
export function Powitanie() {
  return (
    <div className="powitanie">
      <Znak rozmiar={64} />
      <p>Wybierz osobę obok, żeby zobaczyć aplikację jej oczami.</p>
      <div className="powitanie__osoby">
        <Link className="przycisk przycisk--glowny" to="/halina/start">Pani Halina</Link>
        <Link className="przycisk przycisk--drugi" to="/tomasz/start">Pan Tomasz</Link>
      </div>
    </div>
  )
}
