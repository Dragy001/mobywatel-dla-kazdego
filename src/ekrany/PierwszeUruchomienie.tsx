import { useEffect, useRef } from 'react'
import type { Ustawienia } from '../dane/typy'
import { useMagazyn, useUstawienia } from '../stan/magazyn'
import { Dol, Przycisk } from '../ui/Przycisk'

const SKALE: { skala: Ustawienia['skala']; nazwa: string }[] = [
  { skala: 1, nazwa: 'Normalny' },
  { skala: 1.25, nazwa: 'Duży' },
  { skala: 1.5, nazwa: 'Bardzo duży' },
]

function PodgladProsty() {
  return (
    <span className="podglad podglad--prosty" aria-hidden>
      <span className="podglad__duzy" /><span className="podglad__duzy" /><span className="podglad__duzy podglad__duzy--pomoc" />
    </span>
  )
}
function PodgladZwykly() {
  return (
    <span className="podglad podglad--zwykly" aria-hidden>
      <span className="podglad__wiersz" /><span className="podglad__wiersz" /><span className="podglad__wiersz" /><span className="podglad__wiersz" />
      <span className="podglad__zakladki"><span /><span /><span /><span /></span>
    </span>
  )
}

/** §7.2 — raz na osobę, zanim zobaczy start. */
export function PierwszeUruchomienie() {
  const u = useUstawienia()
  const { osoba } = useMagazyn()
  const h1 = useRef<HTMLHeadingElement>(null)
  useEffect(() => h1.current?.focus({ preventScroll: true }), [])
  const poziom = Math.max(0, SKALE.findIndex((s) => s.skala === u.skala))

  return (
    <div className="pierwsze">
      <h1 ref={h1} tabIndex={-1} className="pasek-gorny__tytul">Jak chcesz korzystać z aplikacji?</h1>
      <p className="akapit">{osoba.wolacz}, wybierz wygląd. Zmienisz go w każdej chwili w Ustawieniach.</p>
      <fieldset className="wybor pierwsze__karty">
        <legend className="sr-only">Wygląd aplikacji</legend>
        <label className="opcja opcja--karta">
          <input type="radio" name="widok" checked={u.widok === 'prosty'} onChange={() => u.ustaw({ widok: 'prosty' })} />
          <PodgladProsty />
          <span className="opcja__tekst"><strong>Prosty widok</strong><span className="opcja__opis">Duże przyciski, jedna sprawa naraz, pomoc zawsze pod ręką</span></span>
        </label>
        <label className="opcja opcja--karta">
          <input type="radio" name="widok" checked={u.widok === 'zwykly'} onChange={() => u.ustaw({ widok: 'zwykly' })} />
          <PodgladZwykly />
          <span className="opcja__tekst"><strong>Zwykły widok</strong><span className="opcja__opis">Więcej informacji na ekranie i zakładki na dole</span></span>
        </label>
      </fieldset>
      <div className="pole">
        <label htmlFor="suwak-skali">Rozmiar tekstu</label>
        <input
          id="suwak-skali"
          type="range"
          min={0}
          max={2}
          step={1}
          value={poziom}
          aria-valuetext={SKALE[poziom].nazwa}
          onChange={(e) => u.ustaw({ skala: SKALE[Number(e.target.value)].skala })}
        />
        <p className="pierwsze__probka" aria-live="polite">{SKALE[poziom].nazwa}: tak będzie wyglądał tekst w aplikacji.</p>
      </div>
      <Dol><Przycisk onClick={() => u.ustaw({ pierwszeUruchomienieZrobione: true })}>Zaczynamy</Przycisk></Dol>
    </div>
  )
}
