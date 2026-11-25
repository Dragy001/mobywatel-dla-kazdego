import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { DZIS, formatData } from '../../logika/daty'
import { formatZl } from '../../logika/pieniadze'
import { pitRoczny } from '../../logika/firma'
import { useMagazyn } from '../../stan/magazyn'
import { Wiersze } from '../../ui/Karta'
import { useKrok, useSzkic } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { useTrasa } from '../../ui/trasa'
import { Wynik } from '../../ui/Wynik'
import { usePodsumowanie } from '../firma/usePodsumowanie'
import { doZaplaty, ODBIORCA, platnosci } from './platnosci'

const SPOSOBY = {
  eplatnosci: ['ePłatności', 'Wybierasz swój bank i potwierdzasz w jego aplikacji'],
  przelew: ['Przelew z banku — pokażemy dane', 'Sam wpisujesz przelew w swoim banku'],
} as const
type Sposob = keyof typeof SPOSOBY

export function Zaplac() {
  const { id = '' } = useParams()
  const { krok, idz } = useKrok(`zaplac/${id}`)
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const p = usePodsumowanie()
  const [szkic, ustaw, usun] = useSzkic<{ sposob: Sposob }>(`zaplata-${id}`, { sposob: 'eplatnosci' })
  const [zaplacono, setZaplacono] = useState(false)
  const pl = p && osoba.firma ? platnosci(p, pitRoczny(osoba.firma, stanOsoby).roznica).find((x) => x.id === id) : undefined
  if (!pl || !doZaplaty(pl)) return <Navigate to={t('terminy')} replace />
  const kwota = formatZl(pl.kwota!)
  const odbiorca = ODBIORCA[pl.odbiorca]
  const tytul = `${pl.tytul} 2026`

  if (zaplacono)
    return (
      <>
        <PasekGorny tytul="Zapłać" wstecz={false} />
        <Wynik bezDopisku tytul="Zapłacono" wiersze={[['Za co', pl.tytul], ['Kwota', kwota], ['Odbiorca', odbiorca], ['Data', formatData(DZIS)]]} dalej={{ etykieta: 'Gotowe', do: 'terminy' }}>
          <p className="uwaga">Płatność pokazowa — pieniądze nie zostały pobrane.</p>
        </Wynik>
      </>
    )
  if (stanOsoby.zaplacone.includes(pl.id) || krok > 3) return <Navigate to={t('terminy')} replace />

  return (
    <>
      <PasekGorny tytul="Zapłać" />
      <Kroki krok={krok} z={3} />
      {krok === 1 && (
        <>
          <p className="kwota-duza">{kwota}</p>
          <div className="karta karta--zwykla"><Wiersze wiersze={[['Za co', tytul], ['Odbiorca', odbiorca], ['Termin', formatData(pl.termin)]]} /></div>
          <Dol><Przycisk onClick={() => idz(2)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 2 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Jak chcesz zapłacić?</legend>
            {(Object.keys(SPOSOBY) as Sposob[]).map((s) => (
              <label key={s} className="opcja">
                <input type="radio" name="sposob" checked={szkic.sposob === s} onChange={() => ustaw({ sposob: s })} />
                <span className="opcja__tekst"><strong>{SPOSOBY[s][0]}</strong><span className="opcja__opis">{SPOSOBY[s][1]}</span></span>
              </label>
            ))}
          </fieldset>
          <Dol><Przycisk onClick={() => idz(3)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 3 && (
        <SprawdzIPotwierdz
          wiersze={[['Za co', tytul], ['Kwota', kwota], ['Odbiorca', odbiorca], ['Sposób', SPOSOBY[szkic.sposob][0]]]}
          uwaga={szkic.sposob === 'przelew' ? 'Numer rachunku i tytuł przelewu skopiujesz jednym dotknięciem. To wersja pokazowa — nic nie zostanie pobrane.' : 'Przejdziesz do swojego banku i tam potwierdzisz. To wersja pokazowa — nic nie zostanie pobrane.'}
          etykieta={`Zapłać ${kwota}`}
          onPotwierdz={() => { wyslij({ t: 'zaplac', id: pl.id }); usun(); setZaplacono(true) }}
        />
      )}
    </>
  )
}
