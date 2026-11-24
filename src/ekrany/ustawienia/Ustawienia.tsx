import { IconHeartHandshake, IconRefresh } from '@tabler/icons-react'
import { useNavigate } from 'react-router-dom'
import type { Ustawienia as U } from '../../dane/typy'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { PasekGorny } from '../../ui/PasekGorny'
import { Przelacznik } from '../../ui/Przelacznik'
import { Przycisk } from '../../ui/Przycisk'

const ROZMIARY: { skala: U['skala']; nazwa: string }[] = [
  { skala: 1, nazwa: 'Normalny' },
  { skala: 1.25, nazwa: 'Duży' },
  { skala: 1.5, nazwa: 'Bardzo duży' },
]

export function Ustawienia() {
  const u = useUstawienia()
  const { osoba, wyslij } = useMagazyn()
  const nav = useNavigate()
  const prosty = u.widok === 'prosty'
  return (
    <>
      <PasekGorny tytul="Ustawienia" />
      {prosty && <p className="akapit">Tu zmienisz wygląd aplikacji. Zmiany widać od razu.</p>}
      <div className="karta karta--zwykla lista-ustawien">
        <Przelacznik
          etykieta="Prosty widok"
          opis="Duże przyciski, jedna sprawa naraz, bez zakładek."
          wlaczony={prosty}
          onZmiana={(v) => u.ustaw({ widok: v ? 'prosty' : 'zwykly' })}
        />
        <Przelacznik
          etykieta="Czytaj odpowiedzi na głos"
          opis="Asystent sam przeczyta odpowiedź."
          wlaczony={u.czytanie}
          onZmiana={(v) => u.ustaw({ czytanie: v })}
        />
      </div>

      <fieldset className="wybor">
        <legend className="sekcja-tytul">Rozmiar tekstu</legend>
        {ROZMIARY.map((r) => (
          <label key={r.skala} className="opcja">
            <input type="radio" name="skala" checked={u.skala === r.skala} onChange={() => u.ustaw({ skala: r.skala })} />
            <span className="opcja__tekst">
              <span style={{ fontSize: `${r.skala}em`, fontWeight: 700 }}>{r.nazwa}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <h2 className="sekcja-tytul">Osoba pomagająca</h2>
      {osoba.pomocnicy.map((p) => (
        <div key={p.id} className="karta karta--zwykla wiersz-ikona">
          <IconHeartHandshake size={24} aria-hidden />
          <span><strong>{p.imie}</strong>, {p.relacja} · tel. {p.telefon}</span>
        </div>
      ))}

      <Przycisk ton="drugi" onClick={() => { wyslij({ t: 'reset' }); nav('/') }}>
        <IconRefresh size={20} aria-hidden /> Zacznij od nowa
      </Przycisk>
    </>
  )
}
