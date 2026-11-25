import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DZIS, formatData } from '../../logika/daty'
import { useMagazyn } from '../../stan/magazyn'
import { useKrok, useSzkic } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'

const BAZA = 'ceidg/adres'
const POCZATEK = { ulica: '', kod: '', miasto: '', od: DZIS }

export function ZmianaAdresu() {
  const { krok, idz } = useKrok(BAZA)
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const [s, ustaw, usun] = useSzkic('zmiana-adresu', POCZATEK)
  const [blad, setBlad] = useState('')
  const [gotowe, setGotowe] = useState<{ adres: string; od: string } | null>(null)
  if (!osoba.firma) return <Navigate to={t('start')} replace />
  const stary = stanOsoby.adresFirmy ?? osoba.firma.adres
  const nowy = `${s.ulica.trim()}, ${s.kod.trim()} ${s.miasto.trim()}`

  if (gotowe)
    return (
      <>
        <PasekGorny tytul="Zmień adres" wstecz={false} />
        <Wynik tytul="Adres zmieniony" wiersze={[['Nowy adres', gotowe.adres], ['Od kiedy', formatData(gotowe.od)]]} dalej={{ etykieta: 'Gotowe', do: 'ceidg' }}>
          <p className="akapit">Zmiana trafiła do CEIDG, ZUS i urzędu skarbowego. Nowy adres pojawi się na kolejnych fakturach.</p>
        </Wynik>
      </>
    )
  const poprawny1 = !!s.ulica.trim() && /^\d{2}-\d{3}$/.test(s.kod.trim()) && !!s.miasto.trim()
  if ((krok > 1 && !poprawny1) || krok > 3) return <Navigate to={t(`${BAZA}/1`)} replace />

  const dalej1 = () => {
    if (!s.ulica.trim() || !s.miasto.trim()) return setBlad('Wpisz ulicę z numerem i miejscowość.')
    if (!/^\d{2}-\d{3}$/.test(s.kod.trim())) return setBlad('Kod pocztowy wpisz jak 00-000.')
    setBlad('')
    idz(2)
  }
  const dalej2 = () => {
    if (!s.od || s.od < DZIS) return setBlad(`Wybierz dziś albo późniejszą datę.`)
    setBlad('')
    idz(3)
  }
  const pole = (id: 'ulica' | 'kod' | 'miasto', etykieta: string, extra: object = {}) => (
    <div className="pole">
      <label htmlFor={id}>{etykieta}</label>
      <input id={id} value={s[id]} onChange={(e) => { ustaw({ [id]: e.target.value }); setBlad('') }} {...extra} />
    </div>
  )

  return (
    <>
      <PasekGorny tytul="Zmień adres" />
      <Kroki krok={krok} z={3} />
      {krok === 1 && (
        <>
          <p className="akapit">Teraz: {stary}</p>
          {pole('ulica', 'Ulica i numer', { autoComplete: 'address-line1' })}
          {pole('kod', 'Kod pocztowy', { autoComplete: 'postal-code', inputMode: 'numeric', placeholder: '00-000' })}
          {pole('miasto', 'Miejscowość', { autoComplete: 'address-level2' })}
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={dalej1}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 2 && (
        <>
          <div className="pole">
            <label htmlFor="od">Od kiedy firma jest pod nowym adresem?</label>
            <input id="od" type="date" min={DZIS} value={s.od} onChange={(e) => { ustaw({ od: e.target.value }); setBlad('') }} />
          </div>
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={dalej2}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 3 && (
        <SprawdzIPotwierdz
          wiersze={[['Stary adres', stary], ['Nowy adres', nowy], ['Od kiedy', formatData(s.od)]]}
          uwaga="Wystarczy jedno zgłoszenie — CEIDG przekaże zmianę do ZUS i urzędu skarbowego."
          etykieta="Zmień adres"
          onPotwierdz={() => { wyslij({ t: 'zmienAdres', adres: nowy }); usun(); setGotowe({ adres: nowy, od: s.od }) }}
        />
      )}
    </>
  )
}
