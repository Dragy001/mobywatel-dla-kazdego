import { IconHomeEdit, IconPlayerPause, IconPlayerPlay } from '@tabler/icons-react'
import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { formatData } from '../../logika/daty'
import { zawieszonaTeraz } from '../../logika/firma'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { Wiersze } from '../../ui/Karta'
import { PasekGorny } from '../../ui/PasekGorny'
import { PrzyciskLink } from '../../ui/Przycisk'
import { useTrasa } from '../../ui/trasa'

export function StatusFirmy() {
  const { stanOsoby } = useMagazyn()
  if (stanOsoby.statusFirmy === 'aktywna') return <span className="znaczek znaczek--sukces">aktywna</span>
  return zawieszonaTeraz(stanOsoby)
    ? <span className="znaczek znaczek--ostrz">zawieszona od {formatData(stanOsoby.zawieszonaOd!)}</span>
    : <span className="znaczek znaczek--neutralny">zawieszenie zaplanowane od {formatData(stanOsoby.zawieszonaOd!)}</span>
}

export function Ceidg() {
  const { osoba, stanOsoby } = useMagazyn()
  const { widok } = useUstawienia()
  const t = useTrasa()
  const firma = osoba.firma
  if (!firma) return <Navigate to={t('start')} replace />
  const prosty = widok === 'prosty'
  const aktywna = stanOsoby.statusFirmy === 'aktywna'
  const adres = stanOsoby.adresFirmy ?? firma.adres

  const wiersze: [ReactNode, ReactNode][] = prosty
    ? [['Nazwa', firma.nazwa], ['Adres', adres], ['Stan firmy', <StatusFirmy />]]
    : [
        ['Nazwa', firma.nazwa],
        ['Właściciel', firma.wlasciciel],
        ['NIP', firma.nip],
        ['REGON', firma.regon],
        ['Adres', adres],
        ['Działa od', formatData(firma.dataRozpoczecia)],
        ['Stan firmy', <StatusFirmy />],
      ]

  return (
    <>
      <PasekGorny tytul="Dane w CEIDG" podtytul={prosty ? undefined : 'Centralna Ewidencja i Informacja o Działalności Gospodarczej'} />
      <div className="karta karta--zwykla"><Wiersze wiersze={wiersze} /></div>
      <h2 className="sekcja-tytul">Czym się zajmujesz</h2>
      <ul className="lista-prosta">
        {firma.pkd.map((p) => (
          <li key={p.kod}>
            <span>{p.opis}</span>
            {!prosty && <span className="opcja__opis"> · PKD {p.kod}</span>}
          </li>
        ))}
      </ul>
      <h2 className="sekcja-tytul">Co chcesz zrobić?</h2>
      {prosty ? (
        <div className="duze-przyciski">
          {aktywna
            ? <DuzyPrzycisk ikona={<IconPlayerPause size={28} />} etykieta="Zawieś działalność" opis="Na zimę, urlop albo dłużej" do="ceidg/zawies/1" />
            : <DuzyPrzycisk ikona={<IconPlayerPlay size={28} />} etykieta="Wznów działalność" opis="Znów wystawiasz faktury" do="ceidg/wznow" ton="glowny" />}
          <DuzyPrzycisk ikona={<IconHomeEdit size={28} />} etykieta="Zmień adres" do="ceidg/adres/1" />
        </div>
      ) : (
        <div className="przyciski-kolumna">
          {aktywna
            ? <PrzyciskLink ton="drugi" do="ceidg/zawies/1"><IconPlayerPause size={20} aria-hidden /> Zawieś działalność</PrzyciskLink>
            : <PrzyciskLink do="ceidg/wznow"><IconPlayerPlay size={20} aria-hidden /> Wznów działalność</PrzyciskLink>}
          <PrzyciskLink ton="drugi" do="ceidg/adres/1"><IconHomeEdit size={20} aria-hidden /> Zmień adres</PrzyciskLink>
        </div>
      )}
    </>
  )
}
