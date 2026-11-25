import { IconBriefcase, IconFileInvoice, IconId, IconListCheck, IconMessageCircle, IconMessage2Question, IconSettings, IconShieldQuestion } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { dzisSlownie } from '../../logika/daty'
import { zadaniaDla } from '../../logika/zadania'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { CzytajNaGlos } from '../../ui/CzytajNaGlos'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { useTrasa } from '../../ui/trasa'
import { ZadanieKarta } from '../../ui/ZadanieKarta'
import { Znak } from '../../ui/Znak'
import { useEffect } from 'react'

function Naglowek() {
  const t = useTrasa()
  const { osoba } = useMagazyn()
  useEffect(() => { document.title = 'Start — mObywatel dla każdego' }, [])
  return (
    <header className="start__naglowek">
      <div className="pasek-gorny__rzad" data-nie-czytaj>
        <Znak rozmiar={32} />
        <span className="start__akcje">
          <CzytajNaGlos />
          <Link to={t('ustawienia')} className="pigulka pigulka--ikona" aria-label="Ustawienia"><IconSettings size={22} aria-hidden /></Link>
        </span>
      </div>
      <h1 className="pasek-gorny__tytul">Dzień dobry, {osoba.wolacz}</h1>
      <p className="pasek-gorny__podtytul">{dzisSlownie()}</p>
    </header>
  )
}

function StartZwykly() {
  const { osoba, stanOsoby } = useMagazyn()
  const t = useTrasa()
  const zadania = zadaniaDla(osoba, stanOsoby)
  return (
    <>
      <Naglowek />
      <Link to={t('asystent')} className="asystent-pole">
        <IconMessageCircle size={22} aria-hidden />
        <span>Co chcesz załatwić?</span>
      </Link>
      <section aria-labelledby="do-zrobienia">
        <h2 id="do-zrobienia" className="sekcja-tytul">Do zrobienia ({zadania.length})</h2>
        {zadania.length === 0 ? (
          <p className="karta karta--sukces">Wszystko załatwione. Damy znać, gdy coś się pojawi.</p>
        ) : (
          <ul className="zadania" aria-label={`Do zrobienia (${zadania.length})`}>
            {zadania.map((z, i) => <ZadanieKarta key={z.id} z={z} wyroznione={i === 0} />)}
          </ul>
        )}
      </section>
      <section aria-labelledby="dokumenty-tytul">
        <div className="sekcja-naglowek">
          <h2 id="dokumenty-tytul" className="sekcja-tytul">Dokumenty</h2>
          <Link to={t('dokumenty')} className="pigulka pigulka--akcja">Wszystkie</Link>
        </div>
        <div className="dokumenty-rzad">
          {osoba.dokumenty.map((d) => (
            <Link key={d.id} to={t(`dokumenty/${d.id}`)} className={`mini-dok mini-dok--${d.id}`}>
              <span className="mini-dok__nazwa">{d.nazwa}</span>
              <span className="mini-dok__podpis">{d.podpis}</span>
            </Link>
          ))}
        </div>
      </section>
    </>
  )
}

function StartProsty() {
  const { osoba, stanOsoby } = useMagazyn()
  const zadania = zadaniaDla(osoba, stanOsoby)
  const pierwsze = zadania[0]
  const t = useTrasa()
  const zdanie =
    zadania.length === 0 ? 'Nic nie czeka. Wszystko załatwione.'
    : zadania.length === 1 ? `Jedna sprawa czeka: ${pierwsze.tytul.charAt(0).toLowerCase()}${pierwsze.tytul.slice(1)}.`
    : `Masz ${zadania.length} spraw. Najpilniejsza: ${pierwsze.tytul.charAt(0).toLowerCase()}${pierwsze.tytul.slice(1)}.`
  return (
    <>
      <Naglowek />
      <div className={`karta ${zadania.length ? 'karta--ostrzezenie' : 'karta--sukces'} zdanie-dnia`}>
        <p>{zdanie}</p>
        {pierwsze && <Link to={t(pierwsze.akcja.trasa)} className="zdanie-dnia__akcja">{pierwsze.akcja.etykieta}</Link>}
      </div>
      <nav aria-label="Najważniejsze sprawy" className="duze-przyciski">
        <DuzyPrzycisk ikona={<IconId size={28} />} etykieta="Pokaż dowód" do="dokumenty/dowod" ton="glowny" />
        {osoba.firma ? (
          <>
            <DuzyPrzycisk ikona={<IconBriefcase size={28} />} etykieta="Moja firma" do="firma" />
            <DuzyPrzycisk ikona={<IconFileInvoice size={28} />} etykieta="Wystaw fakturę" do="faktura/nowa/1" />
          </>
        ) : (
          <>
            <DuzyPrzycisk ikona={<IconListCheck size={28} />} etykieta="Moje sprawy" do="sprawy" />
            <DuzyPrzycisk ikona={<IconShieldQuestion size={28} />} etykieta="Czy ten SMS to oszustwo?" do="sms" />
          </>
        )}
        <DuzyPrzycisk ikona={<IconMessage2Question size={28} />} etykieta="Powiedz, czego potrzebujesz" do="asystent" />
      </nav>
    </>
  )
}

export function Start() {
  const { widok } = useUstawienia()
  return widok === 'prosty' ? <StartProsty /> : <StartZwykly />
}
