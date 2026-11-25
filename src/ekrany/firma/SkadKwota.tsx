import { Navigate, useParams } from 'react-router-dom'
import { dataSlownie, nazwaMiesiaca } from '../../logika/daty'
import { formatZl, type Grosze } from '../../logika/pieniadze'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, PrzyciskLink } from '../../ui/Przycisk'
import { PorownajZKsiegowa } from './PorownajZKsiegowa'
import { usePodsumowanie } from './usePodsumowanie'

interface Krok { nazwa: string; kwota: Grosze; znak?: '−' | '=' | '×'; wyjasnienie: string }

export function SkadKwota() {
  const { rodzaj = '' } = useParams()
  const { osoba, stanOsoby } = useMagazyn()
  const { widok } = useUstawienia()
  const p = usePodsumowanie()
  if (!p || !['vat', 'ryczalt', 'zus'].includes(rodzaj)) return <Navigate to="../firma" replace />
  const firma = osoba.firma!
  const faktury = [...firma.faktury, ...stanOsoby.wystawione].filter((f) => f.data.startsWith(p.miesiac))
  const ileW = faktury.filter((f) => f.rodzaj === 'wystawiona').length
  const ileO = faktury.filter((f) => f.rodzaj === 'otrzymana').length

  let tytul = ''
  let doZaplaty = 0
  let termin = ''
  let kroki: Krok[] = []
  if (rodzaj === 'ryczalt') {
    const r = p.ryczalt
    doZaplaty = r.doZaplaty
    termin = p.terminy.ryczalt
    tytul = `Skąd ${formatZl(r.doZaplaty, { bezGroszy: true })} ryczałtu?`
    kroki = [
      { nazwa: 'Przychód od początku roku', kwota: r.przychodNarastajaco, wyjasnienie: `Suma Twoich faktur od stycznia do listopada, bez VAT. W listopadzie: ${formatZl(p.przychod)}.` },
      { nazwa: 'Składki odliczane od przychodu', znak: '−', kwota: r.odliczeniaNarastajaco, wyjasnienie: 'Składki społeczne ZUS i połowa składki zdrowotnej zapłacone w tym roku. Dzięki nim płacisz mniej podatku.' },
      { nazwa: `Podatek ${r.stawka}% od reszty`, znak: '=', kwota: r.podatekNarastajaco, wyjasnienie: `Twoja stawka dla usług graficznych to ${r.stawka}%. Wynik zaokrągla się do pełnych złotych.` },
      { nazwa: 'Wpłacone za styczeń–październik', znak: '−', kwota: r.wplaconoWczesniej, wyjasnienie: 'Ryczałt liczy się od początku roku, więc odejmujemy to, co już zapłaciłeś.' },
    ]
  } else if (rodzaj === 'vat') {
    doZaplaty = p.vat.doZaplaty
    termin = p.terminy.vat
    tytul = `Skąd ${formatZl(doZaplaty)} VAT?`
    kroki = [
      { nazwa: 'VAT z Twoich faktur', kwota: p.vat.nalezny, wyjasnienie: `Z ${ileW} faktur wystawionych w listopadzie i wysłanych do KSeF. Ten VAT doliczyłeś klientom.` },
      { nazwa: 'VAT z faktur za zakupy', znak: '−', kwota: p.vat.naliczony, wyjasnienie: `Z ${ileO} faktur, które dostałeś w KSeF (programy, sprzęt, internet). Ten VAT możesz odliczyć.` },
    ]
  } else {
    const z = p.zus
    doZaplaty = z.razem
    termin = p.terminy.zus
    tytul = `Skąd ${formatZl(doZaplaty)} składek ZUS?`
    kroki = [
      { nazwa: 'Emerytalna', kwota: z.emerytalna, wyjasnienie: '19,52% od podstawy 5 652 zł — na Twoją przyszłą emeryturę.' },
      { nazwa: 'Rentowa', kwota: z.rentowa, wyjasnienie: '8% — na wypadek niezdolności do pracy.' },
      { nazwa: 'Chorobowa', kwota: z.chorobowa, wyjasnienie: '2,45% — dobrowolna. Dzięki niej dostaniesz zasiłek, gdy zachorujesz.' },
      { nazwa: 'Wypadkowa', kwota: z.wypadkowa, wyjasnienie: '1,67% — na wypadek wypadku przy pracy.' },
      { nazwa: 'Fundusz Pracy', kwota: z.fp, wyjasnienie: '2,45% — tej części nie odliczasz od przychodu.' },
      { nazwa: 'Zdrowotna', kwota: z.zdrowotna, wyjasnienie: 'Stała kwota dla przychodu od 60 do 300 tys. zł w roku — tyle masz od kwietnia.' },
    ]
  }
  const prosty = widok === 'prosty'
  return (
    <>
      <PasekGorny tytul={tytul} podtytul={`Za ${nazwaMiesiaca(p.miesiac)} · zapłać do ${dataSlownie(termin)}`} />
      <ol className={prosty ? 'skad skad--prosty' : 'skad'}>
        {kroki.map((k) => (
          <li key={k.nazwa} className="skad__krok">
            <div className="skad__gora">
              <span className="skad__nazwa">{k.znak && <span className="skad__znak" aria-hidden>{k.znak}</span>}{k.znak === '−' ? 'Minus: ' : ''}{k.nazwa}</span>
              <strong className="kwota">{formatZl(k.kwota)}</strong>
            </div>
            <p className="skad__wyjasnienie">{k.wyjasnienie}</p>
          </li>
        ))}
      </ol>
      <div className="karta karta--neutralna skad__wynik" data-testid="do-zaplaty">
        <span>Do zapłaty do {dataSlownie(termin)}</span>
        <strong className="kwota">{formatZl(doZaplaty)}</strong>
      </div>
      <PorownajZKsiegowa key={rodzaj} kwota={doZaplaty} />
      <Dol><PrzyciskLink do={`zaplac/${rodzaj}-${p.miesiac}/1`}>Zapłać</PrzyciskLink></Dol>
    </>
  )
}
