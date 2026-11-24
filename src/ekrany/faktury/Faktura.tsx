import { IconPrinter } from '@tabler/icons-react'
import { Navigate, useParams } from 'react-router-dom'
import { formatData } from '../../logika/daty'
import { wartoscFaktury, wszystkieFaktury } from '../../logika/firma'
import { formatZl } from '../../logika/pieniadze'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { Wiersze } from '../../ui/Karta'
import { PasekGorny } from '../../ui/PasekGorny'
import { Przycisk } from '../../ui/Przycisk'

export function Faktura() {
  const { id } = useParams()
  const { osoba, stanOsoby } = useMagazyn()
  const { widok } = useUstawienia()
  const f = osoba.firma ? wszystkieFaktury(osoba.firma, stanOsoby).find((x) => x.id === id) : undefined
  if (!f) return <Navigate to="../faktury" replace />
  const k = wartoscFaktury(f)
  const wyst = f.rodzaj === 'wystawiona'
  const prosty = widok === 'prosty'
  return (
    <>
      <PasekGorny tytul={f.numer} podtytul={wyst ? 'Faktura wystawiona przez Ciebie' : 'Faktura od dostawcy'} />
      <div className="karta karta--zwykla faktura-kwota">
        <span>{wyst ? 'Do zapłaty przez klienta' : 'Do zapłaty'}</span>
        <strong className="kwota kwota--duza">{formatZl(k.brutto)}</strong>
        <span className={`znaczek ${f.zaplacona ? 'znaczek--sukces' : 'znaczek--ostrz'}`}>{f.zaplacona ? 'zapłacona' : 'niezapłacona'}</span>
      </div>
      <div className="karta karta--zwykla">
        <Wiersze
          wiersze={[
            [wyst ? 'Nabywca' : 'Sprzedawca', f.kontrahent.nazwa],
            ...(prosty ? [] : [['NIP', f.kontrahent.nip] as [string, string], ['Adres', f.kontrahent.adres] as [string, string]]),
            ['Data', formatData(f.data)],
            ...f.pozycje.map((p) => ['Usługa', p.opis] as [string, string]),
            ['Netto', formatZl(k.netto)],
            [`VAT ${f.pozycje[0]?.stawkaVat ?? 23}%`, formatZl(k.vat)],
            ['Brutto', formatZl(k.brutto)],
            ...(prosty ? [] : [['Numer KSeF', f.numerKsef] as [string, string]]),
          ]}
        />
      </div>
      <Przycisk ton="drugi" onClick={() => window.print()}><IconPrinter size={22} aria-hidden /> Pobierz PDF</Przycisk>
    </>
  )
}
