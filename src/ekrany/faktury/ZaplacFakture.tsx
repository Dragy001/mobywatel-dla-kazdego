import { IconAlertTriangle, IconLoader2, IconShieldCheck } from '@tabler/icons-react'
import { useEffect, useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DZIS, formatData } from '../../logika/daty'
import { wartoscFaktury, wszystkieFaktury } from '../../logika/firma'
import { formatZl } from '../../logika/pieniadze'
import { useMagazyn } from '../../stan/magazyn'
import { Wiersze } from '../../ui/Karta'
import { useKrok } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk, PrzyciskLink } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'

const OPOZNIENIE = import.meta.env.MODE === 'test' ? 0 : 1200

export function ZaplacFakture() {
  const { id = '' } = useParams()
  const { krok, idz } = useKrok(`faktury/${id}/zaplac`)
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const [sprawdzone, setSprawdzone] = useState(false)
  const [zaplacono, setZaplacono] = useState(false)
  useEffect(() => {
    const h = setTimeout(() => setSprawdzone(true), OPOZNIENIE)
    return () => clearTimeout(h)
  }, [])
  const f = osoba.firma ? wszystkieFaktury(osoba.firma, stanOsoby).find((x) => x.id === id) : undefined
  if (!f || f.rodzaj !== 'otrzymana' || !f.rachunek) return <Navigate to={t('faktury')} replace />
  const kwota = formatZl(wartoscFaktury(f).brutto)

  if (zaplacono)
    return (
      <>
        <PasekGorny tytul="Zapłać fakturę" wstecz={false} />
        <Wynik tytul="Zapłacono" wiersze={[['Faktura', f.numer], ['Odbiorca', f.kontrahent.nazwa], ['Kwota', kwota], ['Data', formatData(DZIS)]]} dalej={{ etykieta: 'Gotowe', do: `faktury/${f.id}` }}>
          <p className="uwaga">Płatność pokazowa — pieniądze nie zostały pobrane.</p>
        </Wynik>
      </>
    )
  if (f.zaplacona || stanOsoby.zaplacone.includes(f.id) || krok > 2) return <Navigate to={t(`faktury/${f.id}`)} replace />

  return (
    <>
      <PasekGorny tytul="Zapłać fakturę" />
      <Kroki krok={krok} z={2} />
      {krok === 1 && !sprawdzone && (
        <p className="karta karta--neutralna wiersz-ikona" role="status"><IconLoader2 size={24} aria-hidden className="kreci" /><span>Sprawdzam rachunek na białej liście VAT…</span></p>
      )}
      {krok === 1 && sprawdzone && f.naBialejLiscie && (
        <>
          <div className="karta karta--sukces wiersz-ikona" role="status"><IconShieldCheck size={24} aria-hidden /><strong>Rachunek jest na białej liście</strong></div>
          <div className="karta karta--zwykla"><Wiersze wiersze={[['Odbiorca', f.kontrahent.nazwa], ['Rachunek', f.rachunek], ['Kwota', kwota]]} /></div>
          <Dol><Przycisk onClick={() => idz(2)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 1 && sprawdzone && !f.naBialejLiscie && (
        <>
          <div className="karta karta--blad" role="alert">
            <p className="wiersz-ikona werdykt__tytul"><IconAlertTriangle size={24} aria-hidden /><span>Rachunku nie ma na białej liście — nie płać, zanim nie wyjaśnisz</span></p>
            <p>Firma {f.kontrahent.nazwa} nie zgłosiła tego numeru do urzędu skarbowego. Zadzwoń do niej i poproś o właściwy numer. Gdy faktura przekracza 15 000 zł, a zapłacisz na rachunek spoza listy, możesz odpowiadać za VAT sprzedawcy.</p>
          </div>
          <div className="karta karta--zwykla"><Wiersze wiersze={[['Rachunek z faktury', f.rachunek]]} /></div>
          <PrzyciskLink ton="drugi" do={`faktury/${f.id}`}>Wróć do faktury</PrzyciskLink>
        </>
      )}
      {krok === 2 && f.naBialejLiscie && (
        <SprawdzIPotwierdz
          wiersze={[['Faktura', f.numer], ['Odbiorca', f.kontrahent.nazwa], ['Rachunek', f.rachunek], ['Kwota', kwota]]}
          uwaga="Przelew przejdzie przez Twój bank. To wersja pokazowa — nic nie zostanie pobrane."
          etykieta={`Zapłać ${kwota}`}
          onPotwierdz={() => { wyslij({ t: 'zaplac', id: f.id }); setZaplacono(true) }}
        />
      )}
      {krok === 2 && !f.naBialejLiscie && <Navigate to={t(`faktury/${f.id}/zaplac/1`)} replace />}
    </>
  )
}
