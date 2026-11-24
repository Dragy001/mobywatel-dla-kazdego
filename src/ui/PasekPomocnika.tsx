import { IconHeartHandshake } from '@tabler/icons-react'
import { DZIS, dodajDni, formatData } from '../logika/daty'
import { useMagazyn } from '../stan/magazyn'

export function doKiedySlownie(iso: string): string {
  const [data, godz] = iso.split('T')
  const g = godz ? ` ${godz.slice(0, 5)}` : ''
  if (data === DZIS) return `do dziś${g}`
  if (data === dodajDni(DZIS, 1)) return `do jutra${g}`
  return `do ${formatData(data)}${g}`
}

export function PasekPomocnika() {
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const p = stanOsoby.pomoc
  if (!p) return null
  const kto = osoba.pomocnicy.find((x) => x.id === p.pomocnikId)
  return (
    <div className="pasek-pomocnika" role="status" aria-label="Pomoc bliskiej osoby" data-nie-czytaj>
      <IconHeartHandshake size={20} aria-hidden />
      <span>{kto?.imie ?? 'Bliska osoba'} pomaga Ci {doKiedySlownie(p.doKiedy)}</span>
      <button type="button" className="pasek-pomocnika__zakoncz" onClick={() => wyslij({ t: 'zakonczPomoc' })}>Zakończ</button>
    </div>
  )
}
