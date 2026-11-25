import { useState, type FormEvent } from 'react'
import { formatZl, parseKwota, type Grosze } from '../../logika/pieniadze'
import { Przycisk } from '../../ui/Przycisk'

type Wynik = { t: 'zgodne' } | { t: 'roznica'; ile: Grosze } | { t: 'blad' }

/** Porównanie naszej kwoty z tą, którą podała księgowa. */
export function PorownajZKsiegowa({ kwota }: { kwota: Grosze }) {
  const [tekst, setTekst] = useState('')
  const [wynik, setWynik] = useState<Wynik | null>(null)
  const porownaj = (e: FormEvent) => {
    e.preventDefault()
    const g = parseKwota(tekst)
    if (g === null) return setWynik({ t: 'blad' })
    setWynik(g === kwota ? { t: 'zgodne' } : { t: 'roznica', ile: Math.abs(g - kwota) })
  }
  return (
    <section className="porownaj" aria-labelledby="porownaj-tytul">
      <h2 id="porownaj-tytul" className="sekcja-tytul">Księgowa podała inną kwotę?</h2>
      <form className="pole" onSubmit={porownaj}>
        <label htmlFor="kwota-ksiegowej">Kwota od księgowej</label>
        <input id="kwota-ksiegowej" inputMode="decimal" autoComplete="off" value={tekst} onChange={(e) => setTekst(e.target.value)} placeholder="np. 1568,00" aria-describedby="porownanie" />
        <Przycisk type="submit" ton="drugi">Porównaj</Przycisk>
      </form>
      <div id="porownanie" data-testid="porownanie" aria-live="polite">
        {wynik?.t === 'zgodne' && <p className="karta karta--sukces">Zgadza się. Możesz spokojnie płacić.</p>}
        {wynik?.t === 'roznica' && (
          <p className="karta karta--ostrzezenie">
            Różnica {formatZl(wynik.ile)} — możliwe przyczyny: faktura z innego miesiąca, inna stawka, wpłata nieuwzględniona. Zapytaj księgową, którą fakturę policzyła inaczej.
          </p>
        )}
        {wynik?.t === 'blad' && <p className="pole__blad" role="alert">Wpisz kwotę, np. 1568,00</p>}
      </div>
    </section>
  )
}
