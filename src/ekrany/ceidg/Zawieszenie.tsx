import { IconCalendarPause, IconCash, IconFileOff, IconReceiptTax, IconRefresh } from '@tabler/icons-react'
import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DZIS, dodajDni, formatData } from '../../logika/daty'
import { useMagazyn } from '../../stan/magazyn'
import { useKrok, useSzkic } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'

const BAZA = 'ceidg/zawies'
const JUTRO = dodajDni(DZIS, 1)

export const CO_SIE_STANIE: [string, typeof IconCash][] = [
  ['Nie płacisz składek ZUS za pełne miesiące zawieszenia.', IconCash],
  ['Nie możesz wystawiać faktur ani przyjmować nowych zleceń.', IconFileOff],
  ['Zostajesz czynnym podatnikiem VAT, ale za miesiące, w których zawieszenie trwa cały miesiąc, nie składasz rozliczenia VAT (JPK).', IconReceiptTax],
  ['Możesz zawiesić działalność bezterminowo i wznowić ją w każdej chwili w aplikacji.', IconRefresh],
]

export function Zawieszenie() {
  const { krok, idz } = useKrok(BAZA)
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const [szkic, ustaw, usun] = useSzkic('zawieszenie', { od: '2027-01-01' })
  const [blad, setBlad] = useState('')
  if (!osoba.firma) return <Navigate to={t('start')} replace />

  if (stanOsoby.statusFirmy === 'zawieszona')
    return krok >= 4 ? (
      <>
        <PasekGorny tytul="Zawieś działalność" wstecz={false} />
        <Wynik
          tytul={`Działalność zawieszona od ${formatData(stanOsoby.zawieszonaOd!)}`}
          wiersze={[['Firma', osoba.firma.nazwa], ['Zawieszona od', formatData(stanOsoby.zawieszonaOd!)], ['Na jak długo', 'bez terminu']]}
          dalej={{ etykieta: 'Gotowe', do: 'ceidg' }}
        >
          <p className="akapit">Informacja trafiła do ZUS i urzędu skarbowego. Nie musisz nic zgłaszać osobno.</p>
        </Wynik>
      </>
    ) : <Navigate to={t('ceidg')} replace />

  if (krok >= 4) return <Navigate to={t(`${BAZA}/1`)} replace />

  const krok1 = () => {
    if (!szkic.od || szkic.od < JUTRO) return setBlad(`Wybierz datę od jutra, czyli od ${formatData(JUTRO)}.`)
    setBlad('')
    idz(2)
  }

  return (
    <>
      <PasekGorny tytul="Zawieś działalność" />
      <Kroki krok={krok} z={3} />
      {krok === 1 && (
        <>
          <div className="pole">
            <label htmlFor="od">Od kiedy zawieszasz działalność?</label>
            <input id="od" type="date" min={JUTRO} value={szkic.od} onChange={(e) => { ustaw({ od: e.target.value }); setBlad('') }} aria-describedby="od-opis" aria-invalid={!!blad} />
            <p id="od-opis" className="pole__opis">Najwcześniej od jutra. Wiele osób zawiesza od pierwszego dnia miesiąca.</p>
          </div>
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={krok1}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 2 && (
        <>
          <h2 className="sekcja-tytul"><IconCalendarPause size={22} aria-hidden /> Co się stanie</h2>
          <ul className="punkty">
            {CO_SIE_STANIE.map(([z, Ikona]) => (
              <li key={z} className="karta karta--neutralna wiersz-ikona"><Ikona size={24} aria-hidden /><span>{z}</span></li>
            ))}
          </ul>
          <Dol><Przycisk onClick={() => idz(3)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 3 && (
        <SprawdzIPotwierdz
          wiersze={[['Firma', osoba.firma.nazwa], ['Zawieszenie od', formatData(szkic.od)], ['Na jak długo', 'bez terminu — wznowisz, kiedy zechcesz']]}
          uwaga="Zgłoszenie trafi do CEIDG, a stamtąd do ZUS i urzędu skarbowego."
          etykieta="Zawieś działalność"
          onPotwierdz={() => { wyslij({ t: 'zawies', od: szkic.od }); usun(); idz(4) }}
        />
      )}
    </>
  )
}

export function Wznowienie() {
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const [gotowe, setGotowe] = useState(false)
  if (!osoba.firma) return <Navigate to={t('start')} replace />
  if (gotowe)
    return (
      <>
        <PasekGorny tytul="Wznów działalność" wstecz={false} />
        <Wynik tytul="Działalność wznowiona" wiersze={[['Firma', osoba.firma.nazwa], ['Wznowiona od', formatData(DZIS)]]} dalej={{ etykieta: 'Gotowe', do: 'ceidg' }}>
          <p className="akapit">Znów wystawiasz faktury. Składki ZUS płacisz od dziś.</p>
        </Wynik>
      </>
    )
  if (stanOsoby.statusFirmy === 'aktywna') return <Navigate to={t('ceidg')} replace />
  return (
    <>
      <PasekGorny tytul="Wznów działalność" />
      <SprawdzIPotwierdz
        wiersze={[['Firma', osoba.firma.nazwa], ['Zawieszona od', formatData(stanOsoby.zawieszonaOd!)], ['Wznowienie od', formatData(DZIS)]]}
        uwaga="Od dziś znów płacisz składki ZUS i możesz wystawiać faktury."
        etykieta="Wznów działalność"
        onPotwierdz={() => { wyslij({ t: 'wznow' }); setGotowe(true) }}
      />
    </>
  )
}
