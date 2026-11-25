import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import type { Dostep } from '../../dane/typy'
import { DZIS, dodajDni, formatData } from '../../logika/daty'
import { nipPoprawny, szukajPoNip } from '../../logika/faktura'
import { useMagazyn } from '../../stan/magazyn'
import { useKrok, useSzkic } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'
import { ZAKRES } from './Dostep'

const BAZA = 'dostep/nowy'
const JUTRO = dodajDni(DZIS, 1)
interface Szkic { rodzaj: 'firma' | 'osoba'; nip: string; pesel: string; imie: string; zakres: Dostep['zakres']; doKiedy: string }
const POCZATEK: Szkic = { rodzaj: 'firma', nip: '', pesel: '', imie: '', zakres: 'przegladanie', doKiedy: '2027-03-31' }

export function NowyDostep() {
  const { krok, idz } = useKrok(BAZA)
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const [s, ustaw, usun] = useSzkic<Szkic>('nowy-dostep', POCZATEK)
  const [blad, setBlad] = useState('')
  const [nadany, setNadany] = useState<Dostep | null>(null)
  if (!osoba.firma) return <Navigate to={t('start')} replace />

  if (nadany)
    return (
      <>
        <PasekGorny tytul="Daj dostęp" wstecz={false} />
        <Wynik tytul="Dostęp nadany" wiersze={[['Kto', nadany.kto], ['Może', ZAKRES[nadany.zakres]], ['Do kiedy', formatData(nadany.doKiedy)]]} dalej={{ etykieta: 'Gotowe', do: 'dostep' }}>
          <p className="akapit">Dostęp odbierzesz w każdej chwili na liście „Kto ma dostęp”.</p>
        </Wynik>
      </>
    )

  const nip = s.nip.replace(/[\s-]/g, '')
  const kto = s.rodzaj === 'firma'
    ? (szukajPoNip(nip) ?? osoba.firma.kontrahenci.find((k) => k.nip === nip))?.nazwa ?? `Firma, NIP ${nip}`
    : s.imie.trim()
  const poprawnyKrok1 = s.rodzaj === 'firma' ? nipPoprawny(nip) : !!s.imie.trim() && /^\d{11}$/.test(s.pesel.trim())
  if (krok > 1 && krok <= 4 && !poprawnyKrok1) return <Navigate to={t(`${BAZA}/1`)} replace />
  if (krok > 4) return <Navigate to={t(`${BAZA}/1`)} replace />

  const dalej1 = () => {
    if (s.rodzaj === 'firma') {
      if (!nipPoprawny(nip)) return setBlad('Ten NIP ma błąd. Sprawdź cyfry.')
    } else {
      if (!s.imie.trim()) return setBlad('Wpisz imię i nazwisko.')
      if (!/^\d{11}$/.test(s.pesel.trim())) return setBlad('PESEL ma 11 cyfr.')
    }
    setBlad('')
    idz(2)
  }
  const dalej3 = () => {
    if (!s.doKiedy || s.doKiedy < JUTRO) return setBlad(`Wybierz datę od jutra, czyli od ${formatData(JUTRO)}.`)
    setBlad('')
    idz(4)
  }
  const potwierdz = () => {
    const d: Dostep = { id: `d${stanOsoby.dostepy.length + 1}-${s.rodzaj === 'firma' ? nip : s.pesel.slice(-4)}`, kto, nip: s.rodzaj === 'firma' ? nip : undefined, rodzaj: 'osoba', zakres: s.zakres, doKiedy: s.doKiedy }
    wyslij({ t: 'dajDostep', dostep: d })
    usun()
    setNadany(d)
  }
  const opcja = (name: string, wartosc: string, zaznaczona: boolean, onChange: () => void, tytul: string, opis?: string) => (
    <label key={wartosc} className="opcja">
      <input type="radio" name={name} checked={zaznaczona} onChange={() => { onChange(); setBlad('') }} />
      <span className="opcja__tekst"><strong>{tytul}</strong>{opis && <span className="opcja__opis">{opis}</span>}</span>
    </label>
  )

  return (
    <>
      <PasekGorny tytul="Daj dostęp" />
      <Kroki krok={krok} z={4} />
      {krok === 1 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Komu dajesz dostęp?</legend>
            {opcja('komu', 'firma', s.rodzaj === 'firma', () => ustaw({ rodzaj: 'firma' }), 'Firma', 'np. biuro rachunkowe — po NIP')}
            {opcja('komu', 'osoba', s.rodzaj === 'osoba', () => ustaw({ rodzaj: 'osoba' }), 'Osoba', 'np. księgowa na własny rachunek — po PESEL')}
          </fieldset>
          {s.rodzaj === 'firma' ? (
            <div className="pole">
              <label htmlFor="nip">NIP firmy</label>
              <input id="nip" inputMode="numeric" autoComplete="off" value={s.nip} onChange={(e) => ustaw({ nip: e.target.value })} aria-invalid={!!blad} placeholder="np. 521 832 04 63" />
            </div>
          ) : (
            <>
              <div className="pole">
                <label htmlFor="imie">Imię i nazwisko</label>
                <input id="imie" autoComplete="off" value={s.imie} onChange={(e) => ustaw({ imie: e.target.value })} />
              </div>
              <div className="pole">
                <label htmlFor="pesel">PESEL</label>
                <input id="pesel" inputMode="numeric" autoComplete="off" value={s.pesel} onChange={(e) => ustaw({ pesel: e.target.value })} aria-invalid={!!blad} />
              </div>
            </>
          )}
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={dalej1}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 2 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Co {kto} może robić?</legend>
            {opcja('zakres', 'przegladanie', s.zakres === 'przegladanie', () => ustaw({ zakres: 'przegladanie' }), 'Przeglądanie faktur', 'Widzi faktury, nic nie zmienia')}
            {opcja('zakres', 'wystawianie', s.zakres === 'wystawianie', () => ustaw({ zakres: 'wystawianie' }), 'Wystawianie faktur', 'Może wystawiać faktury w Twoim imieniu')}
          </fieldset>
          <Dol><Przycisk onClick={() => idz(3)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 3 && (
        <>
          <div className="pole">
            <label htmlFor="do-kiedy">Do kiedy?</label>
            <input id="do-kiedy" type="date" min={JUTRO} value={s.doKiedy} onChange={(e) => { ustaw({ doKiedy: e.target.value }); setBlad('') }} />
            <p className="pole__opis">Po tej dacie dostęp sam się wyłączy.</p>
          </div>
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={dalej3}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 4 && (
        <SprawdzIPotwierdz
          wiersze={[['Kto', kto], [s.rodzaj === 'firma' ? 'NIP' : 'PESEL', s.rodzaj === 'firma' ? nip : s.pesel], ['Może', ZAKRES[s.zakres]], ['Do kiedy', formatData(s.doKiedy)]]}
          uwaga="Dostęp zadziała od razu. Odbierzesz go w każdej chwili."
          etykieta="Daj dostęp"
          onPotwierdz={potwierdz}
        />
      )}
    </>
  )
}
