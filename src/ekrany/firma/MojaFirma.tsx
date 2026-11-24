import { IconBuilding, IconCalendarDue, IconChevronRight, IconCoin, IconFileInvoice, IconFileText, IconListDetails, IconUsers } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { dataSlownie, formatData } from '../../logika/daty'
import { formatZl } from '../../logika/pieniadze'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { PasekGorny } from '../../ui/PasekGorny'
import { PrzyciskLink } from '../../ui/Przycisk'
import { useTrasa } from '../../ui/trasa'
import { usePodsumowanie } from './usePodsumowanie'

const WEJSCIA = [
  { do: 'faktury', etykieta: 'Faktury KSeF', opis: 'Wystawione i otrzymane', ikona: IconFileInvoice },
  { do: 'terminy', etykieta: 'Terminy i płatności', opis: 'ZUS, VAT, ryczałt', ikona: IconCalendarDue },
  { do: 'dostep', etykieta: 'Kto ma dostęp', opis: 'Księgowa, token KSeF', ikona: IconUsers },
  { do: 'ceidg', etykieta: 'Dane w CEIDG', opis: 'Adres, PKD, zawieszenie', ikona: IconBuilding },
  { do: 'pit', etykieta: 'Rozliczenie roczne', opis: 'PIT-28 za 2026', ikona: IconFileText },
]

function StatusFirmy() {
  const { stanOsoby } = useMagazyn()
  return stanOsoby.statusFirmy === 'aktywna'
    ? <span className="znaczek znaczek--sukces">aktywna</span>
    : <span className="znaczek znaczek--ostrz">zawieszona od {formatData(stanOsoby.zawieszonaOd!)}</span>
}

function MojaFirmaZwykla() {
  const { osoba } = useMagazyn()
  const p = usePodsumowanie()!
  const t = useTrasa()
  const firma = osoba.firma!
  const pozycje = [
    { rodzaj: 'zus', nazwa: 'Składki ZUS', kwota: p.zus.razem, termin: p.terminy.zus },
    { rodzaj: 'ryczalt', nazwa: `Ryczałt ${firma.stawkaRyczaltu}%`, kwota: p.ryczalt.doZaplaty, termin: p.terminy.ryczalt },
    { rodzaj: 'vat', nazwa: 'VAT', kwota: p.vat.doZaplaty, termin: p.terminy.vat },
  ]
  return (
    <>
      <PasekGorny tytul="Moja firma" wstecz={false} />
      <div className="firma-naglowek">
        <div>
          <p className="firma-naglowek__nazwa">{firma.nazwa}</p>
          <p className="akapit">Ryczałt {firma.stawkaRyczaltu}% · VAT co miesiąc · NIP {firma.nip}</p>
        </div>
        <StatusFirmy />
      </div>

      <section className="karta karta--zwykla do-zaplaty" aria-labelledby="do-zaplaty-tytul">
        <h2 id="do-zaplaty-tytul" className="do-zaplaty__tytul">Do zapłaty za listopad</h2>
        <p className="kwota kwota--duza">{formatZl(p.razem)}</p>
        <ul className="do-zaplaty__lista">
          {pozycje.map((x) => (
            <li key={x.rodzaj}>
              <div className="do-zaplaty__wiersz">
                <span>{x.nazwa}</span>
                <strong className="kwota">{formatZl(x.kwota)}</strong>
              </div>
              <div className="do-zaplaty__wiersz do-zaplaty__wiersz--maly">
                <span>do {dataSlownie(x.termin)}</span>
                <Link to={t(`firma/kwota/${x.rodzaj}`)}>Skąd ta kwota?<span className="sr-only"> {x.nazwa}</span></Link>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="karta karta--neutralna" aria-labelledby="grudzien-tytul">
        <h2 id="grudzien-tytul" className="sekcja-tytul">Grudzień do tej pory</h2>
        <div className="do-zaplaty__wiersz"><span>Przychód</span><strong className="kwota">{formatZl(p.grudzien.przychod)}</strong></div>
        <div className="do-zaplaty__wiersz"><span>VAT (szacunek)</span><strong className="kwota">{formatZl(p.grudzien.vat)}</strong></div>
        <div className="do-zaplaty__wiersz"><span>Ryczałt (szacunek)</span><strong className="kwota">{formatZl(p.grudzien.ryczaltSzacunek)}</strong></div>
        <p className="akapit maly">Przychód od początku roku: {formatZl(p.przychodRok + p.grudzien.przychod, { bezGroszy: true })}</p>
      </section>

      <nav aria-label="Sprawy firmy">
        <ul className="lista-wejsc">
          {WEJSCIA.map(({ do: cel, etykieta, opis, ikona: I }) => (
            <li key={cel}>
              <Link to={t(cel)} className="wejscie-firmy">
                <span className="wejscie-firmy__ikona" aria-hidden><I size={22} /></span>
                <span className="wejscie-firmy__tekst"><strong>{etykieta}</strong><span>{opis}</span></span>
                <IconChevronRight size={20} aria-hidden />
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <PrzyciskLink do="faktura/nowa/1"><IconFileInvoice size={22} aria-hidden /> Wystaw fakturę</PrzyciskLink>
    </>
  )
}

function MojaFirmaProsta() {
  const { osoba } = useMagazyn()
  const p = usePodsumowanie()!
  const [wiecej, setWiecej] = useState(false)
  return (
    <>
      <PasekGorny tytul="Moja firma" />
      <div className="firma-naglowek"><p className="firma-naglowek__nazwa">{osoba.firma!.nazwa}</p><StatusFirmy /></div>
      <p className="zdanie-glowne">W tym miesiącu zapłacisz razem {formatZl(p.razem)}. Najbliższy termin: {dataSlownie(p.terminy.zus)}.</p>
      <section className="karta karta--zwykla do-zaplaty" aria-label="Do zapłaty za listopad">
        {[
          ['Składki ZUS', p.zus.razem, 'zus'],
          ['Podatek (ryczałt)', p.ryczalt.doZaplaty, 'ryczalt'],
          ['Podatek VAT', p.vat.doZaplaty, 'vat'],
        ].map(([n, k, r]) => (
          <DuzyPrzycisk key={r as string} ikona={<IconCoin size={28} />} etykieta={`${n}: ${formatZl(k as number)}`} opis="Zobacz, skąd ta kwota" do={`firma/kwota/${r}`} />
        ))}
      </section>
      <div className="duze-przyciski">
        <DuzyPrzycisk ikona={<IconFileInvoice size={28} />} etykieta="Wystaw fakturę" do="faktura/nowa/1" ton="glowny" />
        <DuzyPrzycisk ikona={<IconCoin size={28} />} etykieta="Zapłać" opis="ZUS i podatki" do="terminy" />
        <DuzyPrzycisk ikona={<IconListDetails size={28} />} etykieta="Moje faktury" do="faktury" />
        {!wiecej ? (
          <DuzyPrzycisk ikona={<IconChevronRight size={28} />} etykieta="Więcej spraw firmy" onClick={() => setWiecej(true)} />
        ) : (
          WEJSCIA.filter((w) => w.do !== 'faktury' && w.do !== 'terminy').map(({ do: cel, etykieta, opis, ikona: I }) => (
            <DuzyPrzycisk key={cel} ikona={<I size={28} />} etykieta={etykieta} opis={opis} do={cel} />
          ))
        )}
      </div>
    </>
  )
}

export function MojaFirma() {
  const { osoba } = useMagazyn()
  const { widok } = useUstawienia()
  if (!osoba.firma) return <Navigate to="../start" replace />
  return widok === 'prosty' ? <MojaFirmaProsta /> : <MojaFirmaZwykla />
}
