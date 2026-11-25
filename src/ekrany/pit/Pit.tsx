import { IconChecklist } from '@tabler/icons-react'
import { useMemo, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { DZIS, formatData } from '../../logika/daty'
import { pitRoczny } from '../../logika/firma'
import { formatZl } from '../../logika/pieniadze'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { Wiersze } from '../../ui/Karta'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, PrzyciskLink } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'

const TERMIN = '2027-04-30'
const TERMIN_GRUDNIA = '2027-01-20'
const DO_SPRAWDZENIA = [
  'Czy wszystkie faktury z grudnia są już w KSeF.',
  'Czy przysługują Ci ulgi, np. za internet albo darowizny — dopisz je przed wysłaniem.',
  'Czy wszystkie zaliczki za styczeń–listopad zostały zapłacone.',
  'Numer rachunku do ewentualnego zwrotu.',
]

function usePit() {
  const { osoba, stanOsoby } = useMagazyn()
  return useMemo(() => (osoba.firma ? pitRoczny(osoba.firma, stanOsoby) : null), [osoba.firma, stanOsoby])
}

const wynikSlowami = (r: number) => (r >= 0 ? 'Zostaje do zapłaty' : 'Do zwrotu')

export function Pit() {
  const pit = usePit()
  const { widok } = useUstawienia()
  const t = useTrasa()
  if (!pit) return <Navigate to={t('start')} replace />
  const prosty = widok === 'prosty'
  return (
    <>
      <PasekGorny tytul="Rozliczenie roczne PIT-28" podtytul={prosty ? undefined : `Za 2026 · wysyłasz do ${formatData(TERMIN)}`} />
      <p className="karta karta--neutralna">Szacunek: grudzień przyjęliśmy taki sam jak listopad. Gdy grudzień się skończy, policzymy dokładnie.</p>
      <section className="karta karta--zwykla pit__wynik" aria-label="Wynik rozliczenia">
        <p className="pit__etykieta">{wynikSlowami(pit.roznica)}</p>
        <p className="kwota-duza">{formatZl(Math.abs(pit.roznica))}</p>
        <p className="opcja__opis">do {formatData(pit.roznica >= 0 ? TERMIN_GRUDNIA : TERMIN)}</p>
        {pit.roznica >= 0 && <p className="akapit">Zapłacisz to jako zaliczkę za grudzień do {formatData(TERMIN_GRUDNIA)} albo razem z PIT-28, jeśli wyślesz go przed tym dniem.</p>}
      </section>
      <div className="karta karta--zwykla">
        <Wiersze
          wiersze={prosty
            ? [['Przychód za rok', formatZl(pit.przychod)], ['Podatek za rok', formatZl(pit.podatek)], ['Już zapłacone', formatZl(pit.wplacono)]]
            : [
                [`Przychód (stawka ${pit.stawka}%)`, formatZl(pit.przychod)],
                ['Odliczone składki ZUS', `− ${formatZl(pit.odliczenia)}`],
                ['Podatek za rok', formatZl(pit.podatek)],
                ['Zaliczki styczeń–listopad', `− ${formatZl(pit.wplacono)}`],
                [wynikSlowami(pit.roznica), formatZl(Math.abs(pit.roznica))],
              ]}
        />
      </div>
      <h2 className="sekcja-tytul"><IconChecklist size={22} aria-hidden /> Do sprawdzenia przed wysłaniem</h2>
      <ul className="werdykt__cechy pit__lista">{DO_SPRAWDZENIA.map((d) => <li key={d}>{d}</li>)}</ul>
      <Dol><PrzyciskLink do="pit/wyslij">Wyślij przez e-Urząd Skarbowy</PrzyciskLink></Dol>
    </>
  )
}

export function PitWyslij() {
  const pit = usePit()
  const { osoba } = useMagazyn()
  const t = useTrasa()
  const [wyslany, setWyslany] = useState(false)
  if (!pit) return <Navigate to={t('start')} replace />
  const wiersze: [string, string][] = [['Formularz', 'PIT-28 za 2026'], ['Podatnik', `${osoba.imie} ${osoba.nazwisko}`], ['Podatek za rok', formatZl(pit.podatek)], [wynikSlowami(pit.roznica), formatZl(Math.abs(pit.roznica))]]
  if (wyslany)
    return (
      <>
        <PasekGorny tytul="Wyślij PIT-28" wstecz={false} />
        <Wynik bezDopisku tytul="PIT-28 wysłany" wiersze={[...wiersze, ['Data wysłania', formatData(DZIS)]]} dalej={{ etykieta: 'Gotowe', do: 'firma' }}>
          <p className="uwaga">Wysyłka pokazowa — nic nie trafiło do urzędu skarbowego.</p>
        </Wynik>
      </>
    )
  return (
    <>
      <PasekGorny tytul="Wyślij PIT-28" />
      <SprawdzIPotwierdz
        wiersze={wiersze}
        uwaga="Zeznanie trafi do e-Urzędu Skarbowego. Korektę złożysz w każdej chwili."
        etykieta="Wyślij PIT-28"
        onPotwierdz={() => setWyslany(true)}
      />
    </>
  )
}
