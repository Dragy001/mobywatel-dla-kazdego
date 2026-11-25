import { IconMessage2Question, IconSend } from '@tabler/icons-react'
import { useState, type FormEvent } from 'react'
import { odpowiedz, podpowiedzi, type Odpowiedz } from '../../logika/asystent'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { czytaj } from '../../ui/CzytajNaGlos'
import { DuzyPrzycisk } from '../../ui/DuzyPrzycisk'
import { Wiersze } from '../../ui/Karta'
import { PasekGorny } from '../../ui/PasekGorny'
import { Przycisk, PrzyciskLink } from '../../ui/Przycisk'

interface Wpis { pytanie: string; odp: Odpowiedz }

export function Asystent() {
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const { widok, czytanie } = useUstawienia()
  const prosty = widok === 'prosty'
  const [rozmowa, setRozmowa] = useState<Wpis[]>([])
  const [tekst, setTekst] = useState('')

  const zapytaj = (pytanie: string) => {
    if (!pytanie.trim()) return
    const odp = odpowiedz(pytanie, osoba, stanOsoby)
    if (odp.szkic) wyslij({ t: 'zapiszSzkic', klucz: odp.szkic.klucz, wartosc: odp.szkic.wartosc })
    setRozmowa((r) => [...r, { pytanie, odp }])
    setTekst('')
    if (prosty && czytanie) czytaj(odp.tekst)
  }
  const wyslijFormularz = (e: FormEvent) => {
    e.preventDefault()
    zapytaj(tekst)
  }

  return (
    <>
      <PasekGorny tytul="Asystent" podtytul={prosty ? undefined : 'Wersja pokazowa: odpowiada na kilka przygotowanych pytań'} />
      <div className="rozmowa" role="log" aria-live="polite" aria-label="Rozmowa z asystentem">
        {rozmowa.length === 0 && (
          <p className="dymek dymek--asystent">{osoba.wolacz}, w czym pomóc? {prosty ? 'Wybierz pytanie albo je napisz.' : 'Wybierz pytanie poniżej albo wpisz własne.'}</p>
        )}
        {rozmowa.map((w, i) => (
          <div key={i} className="rozmowa__para">
            <p className="dymek dymek--ty">{w.pytanie}</p>
            <div className="dymek dymek--asystent">
              <p>{w.odp.tekst}</p>
              {w.odp.karta && (
                <div className="karta karta--neutralna">
                  <strong>{w.odp.karta.tytul}</strong>
                  {w.odp.karta.wiersze.length > 0 && <Wiersze wiersze={w.odp.karta.wiersze} />}
                  <PrzyciskLink do={w.odp.karta.akcja.trasa}>{w.odp.karta.akcja.etykieta}</PrzyciskLink>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <h2 className="sekcja-tytul">{prosty ? 'Wybierz pytanie' : 'Podpowiedzi'}</h2>
      {prosty ? (
        <div className="duze-przyciski">
          {podpowiedzi(osoba).map((p) => <DuzyPrzycisk key={p} ikona={<IconMessage2Question size={28} />} etykieta={p} onClick={() => zapytaj(p)} />)}
        </div>
      ) : (
        <div className="podpowiedzi">
          {podpowiedzi(osoba).map((p) => <button key={p} type="button" className="pigulka" onClick={() => zapytaj(p)}>{p}</button>)}
        </div>
      )}
      <form className="pole pole--wiersz" onSubmit={wyslijFormularz}>
        <label htmlFor="pytanie">Twoje pytanie</label>
        <input id="pytanie" value={tekst} onChange={(e) => setTekst(e.target.value)} placeholder={prosty ? 'Napisz tutaj' : 'np. Kiedy wygasa token KSeF?'} autoComplete="off" />
        <Przycisk type="submit"><IconSend size={20} aria-hidden /> Wyślij</Przycisk>
      </form>
    </>
  )
}
