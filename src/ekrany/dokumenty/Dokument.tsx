import { IconQrcode } from '@tabler/icons-react'
import { useState } from 'react'
import { Navigate, useParams } from 'react-router-dom'
import { dniDo, formatData } from '../../logika/daty'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { Wiersze } from '../../ui/Karta'
import { KartaDokumentu, KodSprawdzenia } from '../../ui/grafiki/KartaDokumentu'
import { PasekGorny } from '../../ui/PasekGorny'
import { Przycisk, PrzyciskLink } from '../../ui/Przycisk'

export function Dokument() {
  const { id } = useParams()
  const { osoba, stanOsoby } = useMagazyn()
  const { widok } = useUstawienia()
  const [kod, setKod] = useState(false)
  const dok = osoba.dokumenty.find((d) => d.id === id)
  if (!dok) return <Navigate to="../dokumenty" replace />
  const prosty = widok === 'prosty'
  const konczySie = dok.id === 'dowod' && dok.waznyDo && dniDo(dok.waznyDo) <= 60 && !stanOsoby.wnioski.some((w) => w.id === 'dowod')
  const wiersze: [string, string][] = prosty
    ? [['Imię i nazwisko', `${osoba.imie} ${osoba.nazwisko}`], ...(dok.waznyDo ? [[dok.id === 'pojazd' ? 'OC ważne do' : 'Ważny do', formatData(dok.waznyDo)] as [string, string]] : [])]
    : dok.pola
  return (
    <>
      <PasekGorny tytul={dok.nazwa} />
      <KartaDokumentu dok={dok} osoba={osoba} />
      {konczySie && (
        <div className="karta karta--ostrzezenie zdanie-dnia">
          <p>Ten dowód traci ważność za {dniDo(dok.waznyDo!)} dni.</p>
          <PrzyciskLink do="dowod/wniosek/1">Złóż wniosek o nowy</PrzyciskLink>
        </div>
      )}
      {kod ? (
        <section className="karta karta--zwykla kod-sekcja" aria-label="Kod do sprawdzenia">
          <KodSprawdzenia />
          <p>Pokaż ten kod osobie, która sprawdza dokument. Kod jest ważny 3 minuty.</p>
          <Przycisk ton="drugi" onClick={() => setKod(false)}>Ukryj kod</Przycisk>
        </section>
      ) : (
        <Przycisk onClick={() => setKod(true)}><IconQrcode size={22} aria-hidden /> Pokaż kod do sprawdzenia</Przycisk>
      )}
      <div className="karta karta--zwykla"><Wiersze wiersze={wiersze} /></div>
    </>
  )
}
