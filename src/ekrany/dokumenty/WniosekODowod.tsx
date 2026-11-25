import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useTrasa } from '../../ui/trasa'
import { dataSlownie, DZIS, dodajDni, formatData } from '../../logika/daty'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { Wiersze } from '../../ui/Karta'
import { useKrok, useSzkic } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { Wynik } from '../../ui/Wynik'

const URZEDY = [
  { id: 'radom', nazwa: 'Urząd Miasta Radomia', adres: 'ul. Kilińskiego 30', dni: 30 },
  { id: 'delegatura', nazwa: 'Delegatura Urzędu Miasta', adres: 'ul. Czachowskiego 9', dni: 30 },
  { id: 'jedlinsk', nazwa: 'Urząd Gminy Jedlińsk', adres: 'ul. Warecka 1, Jedlińsk', dni: 21 },
]

const BAZA = 'dowod/wniosek'

export function WniosekODowod() {
  const { krok, idz } = useKrok(BAZA)
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const t = useTrasa()
  const { widok } = useUstawienia()
  const [szkic, ustaw, usun] = useSzkic<{ urzad?: string }>('wniosek-dowod', {})
  const [blad, setBlad] = useState('')
  const [niezgodne, setNiezgodne] = useState(false)
  const prosty = widok === 'prosty'
  const urzad = URZEDY.find((u) => u.id === szkic.urzad)
  const gotowy = urzad ? dodajDni(DZIS, urzad.dni) : ''

  const zlozony = stanOsoby.wnioski.some((w) => w.id === 'dowod')
  if ((krok >= 4 && !zlozony) || (krok === 3 && !urzad)) return <Navigate to={t(`${BAZA}/1`)} replace />
  if (krok >= 4)
    return (
      <>
        <PasekGorny tytul="Wniosek o nowy dowód" wstecz={false} />
        <Wynik
          tytul="Wniosek złożony"
          wiersze={[
            ['Numer wniosku', 'WD/2026/12/04817'],
            ['Złożony', formatData(DZIS)],
            ['Odbiór', 'Dostaniesz SMS i powiadomienie, gdy dowód będzie gotowy.'],
          ]}
          dalej={{ etykieta: 'Wróć na start', do: 'start' }}
        />
      </>
    )

  return (
    <>
      <PasekGorny tytul="Wniosek o nowy dowód" />
      <Kroki krok={krok} z={3} />
      {krok === 1 && (
        <>
          <h2 className="sekcja-tytul">Sprawdź swoje dane</h2>
          <div className="karta karta--zwykla">
            <Wiersze
              wiersze={
                prosty
                  ? [['Imię i nazwisko', `${osoba.imie} ${osoba.nazwisko}`], ['Adres', osoba.adres]]
                  : [['Imię', osoba.imie], ['Nazwisko', osoba.nazwisko], ['PESEL', osoba.pesel], ['Adres', osoba.adres], ['Zdjęcie', 'z 28.11.2026, przesłane przez zakład Foto-Radom']]
              }
            />
          </div>
          {niezgodne && (
            <p className="uwaga" role="status">
              Dane zmienisz w urzędzie gminy albo w aplikacji, w sprawie „Zmiana danych”. Możesz też poprosić bliską osobę o pomoc.
            </p>
          )}
          <Dol>
            <Przycisk onClick={() => idz(2)}>Wszystko się zgadza</Przycisk>
            <Przycisk ton="drugi" onClick={() => setNiezgodne(true)}>Coś się nie zgadza</Przycisk>
          </Dol>
        </>
      )}
      {krok === 2 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Gdzie odbierzesz dowód?</legend>
            {URZEDY.map((u) => (
              <label key={u.id} className="opcja">
                <input type="radio" name="urzad" checked={szkic.urzad === u.id} onChange={() => { ustaw({ urzad: u.id }); setBlad('') }} />
                <span className="opcja__tekst">
                  <strong>{u.nazwa}</strong>
                  <span className="opcja__opis">{u.adres} · gotowy około {dataSlownie(dodajDni(DZIS, u.dni), true)}</span>
                </span>
              </label>
            ))}
          </fieldset>
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol>
            <Przycisk onClick={() => (szkic.urzad ? idz(3) : setBlad('Wybierz urząd, w którym odbierzesz dowód.'))}>Dalej</Przycisk>
          </Dol>
        </>
      )}
      {krok === 3 && (
        <SprawdzIPotwierdz
          wiersze={[
            ['Sprawa', 'Nowy dowód osobisty'],
            ['Powód', 'Kończy się ważność obecnego'],
            ['Odbiór', urzad ? `${urzad.nazwa}, ${urzad.adres}` : '—'],
            ['Gotowy około', gotowy ? formatData(gotowy) : '—'],
            ['Opłata', 'bezpłatnie'],
          ]}
          uwaga="Obecny dowód jest ważny do 15 stycznia 2027. Do tego dnia możesz go normalnie używać."
          etykieta="Złóż wniosek"
          onPotwierdz={() => {
            wyslij({ t: 'zlozWniosek', wniosek: { id: 'dowod', rodzaj: 'Nowy dowód osobisty', zlozony: DZIS, szczegoly: urzad ? `odbiór: ${urzad.nazwa}` : undefined } })
            usun()
            idz(4)
          }}
        />
      )}
    </>
  )
}
