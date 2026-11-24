import { useState } from 'react'
import { zadaniaDla } from '../../logika/zadania'
import { useMagazyn } from '../../stan/magazyn'
import { doKiedySlownie } from '../../ui/PasekPomocnika'
import { useKrok, useSzkic } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { Wynik } from '../../ui/Wynik'

const CZAS = [
  { id: 'jutro', nazwa: 'Do jutra, 18:00', doKiedy: '2026-12-06T18:00' },
  { id: 'tydzien', nazwa: 'Na 7 dni', doKiedy: '2026-12-12T18:00' },
]

interface Szkic { pomocnikId?: string; czas?: string }

export function PoprosBliska() {
  const { krok, idz } = useKrok('pomoc/bliska')
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const [szkic, ustaw, usun] = useSzkic<Szkic>('pomoc-bliska', {})
  const [blad, setBlad] = useState('')
  const kto = osoba.pomocnicy.find((p) => p.id === szkic.pomocnikId)
  const sprawa = zadaniaDla(osoba, stanOsoby)[0]?.tytul ?? 'Pytania o aplikację'
  const czas = CZAS.find((c) => c.id === szkic.czas)

  if (krok >= 5)
    return (
      <>
        <PasekGorny tytul="Poproś bliską osobę" wstecz={false} />
        <Wynik
          tytul={`${stanOsoby.pomoc ? (osoba.pomocnicy.find((p) => p.id === stanOsoby.pomoc!.pomocnikId)?.imie ?? 'Bliska osoba') : 'Bliska osoba'} dostała prośbę o pomoc`}
          wiersze={[
            ['Sprawa', stanOsoby.pomoc?.sprawa ?? sprawa],
            ['Pomoc trwa', stanOsoby.pomoc ? doKiedySlownie(stanOsoby.pomoc.doKiedy) : '—'],
            ['Co dalej', 'Dostanie SMS z linkiem. Na górze ekranu zobaczysz, że pomaga.'],
          ]}
          dalej={{ etykieta: 'Wróć na start', do: 'start' }}
        />
      </>
    )

  const dalej = (warunek: boolean, komunikat: string, n: number) => (warunek ? (setBlad(''), idz(n)) : setBlad(komunikat))

  return (
    <>
      <PasekGorny tytul="Poproś bliską osobę" />
      <Kroki krok={krok} z={4} />
      {krok === 1 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Kto ma Ci pomóc?</legend>
            {osoba.pomocnicy.map((p) => (
              <label key={p.id} className="opcja">
                <input type="radio" name="kto" checked={szkic.pomocnikId === p.id} onChange={() => { ustaw({ pomocnikId: p.id }); setBlad('') }} />
                <span className="opcja__tekst"><strong>{p.imie}</strong><span className="opcja__opis">{p.relacja}, {p.telefon}</span></span>
              </label>
            ))}
          </fieldset>
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={() => dalej(!!kto, 'Wybierz osobę, która Ci pomoże.', 2)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 2 && (
        <>
          <h2 className="sekcja-tytul">W czym ma pomóc?</h2>
          <div className="karta karta--zwykla">
            <p><strong>Tylko ta sprawa:</strong> {sprawa}</p>
          </div>
          <p className="akapit">{kto?.imie ?? 'Ta osoba'} nie zobaczy innych spraw ani dokumentów.</p>
          <Dol><Przycisk onClick={() => idz(3)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 3 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Na jak długo?</legend>
            {CZAS.map((c) => (
              <label key={c.id} className="opcja">
                <input type="radio" name="czas" checked={szkic.czas === c.id} onChange={() => { ustaw({ czas: c.id }); setBlad('') }} />
                <span className="opcja__tekst"><strong>{c.nazwa}</strong></span>
              </label>
            ))}
          </fieldset>
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={() => dalej(!!czas, 'Wybierz, jak długo ma trwać pomoc.', 4)}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 4 && (
        <SprawdzIPotwierdz
          wiersze={[
            ['Kto pomoże', kto ? `${kto.imie} (${kto.relacja})` : '—'],
            ['Sprawa', sprawa],
            ['Jak długo', czas?.nazwa ?? '—'],
          ]}
          uwaga={`${kto?.imie ?? 'Ta osoba'} zobaczy tylko tę sprawę. Nie zobaczy Twoich innych dokumentów. Możesz to zakończyć w każdej chwili.`}
          etykieta="Poproś o pomoc"
          onPotwierdz={() => {
            if (kto && czas) wyslij({ t: 'popros', pomoc: { pomocnikId: kto.id, sprawa, doKiedy: czas.doKiedy } })
            usun()
            idz(5)
          }}
        />
      )}
    </>
  )
}
