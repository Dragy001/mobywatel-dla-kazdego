import type { Osoba, StanOsoby } from '../dane/typy'
import { dataSlownie, dniDo } from './daty'
import { podsumowanie } from './firma'
import { formatZl } from './pieniadze'

export interface Zadanie {
  id: string
  tytul: string
  opis: string
  termin?: string
  dni?: number
  pilne: boolean
  akcja: { etykieta: string; trasa: string }
}

const PILNE_DNI = 45

export function zadaniaDla(osoba: Osoba, stan: StanOsoby): Zadanie[] {
  const z: Zadanie[] = []
  const dodaj = (x: Omit<Zadanie, 'dni' | 'pilne'> & { termin: string }) => {
    const dni = dniDo(x.termin)
    z.push({ ...x, dni, pilne: dni <= PILNE_DNI })
  }

  const dowod = osoba.dokumenty.find((d) => d.id === 'dowod')
  if (dowod?.waznyDo && dniDo(dowod.waznyDo) <= 60 && !stan.wnioski.some((w) => w.id === 'dowod')) {
    dodaj({
      id: 'dowod',
      tytul: 'Twój dowód traci ważność',
      opis: `Ważny do ${dataSlownie(dowod.waznyDo, true)}. Złóż wniosek o nowy, to zajmie kilka minut.`,
      termin: dowod.waznyDo,
      akcja: { etykieta: 'Złóż wniosek', trasa: 'dowod/wniosek/1' },
    })
  }

  const firma = osoba.firma
  if (firma) {
    const token = stan.tokenKsefWaznyDo ?? firma.tokenKsefWaznyDo
    if (dniDo(token) <= 30) {
      dodaj({
        id: 'token-ksef',
        tytul: 'Token KSeF wygasa',
        opis: `Program księgowy straci dostęp do Twoich faktur ${dataSlownie(token)}.`,
        termin: token,
        akcja: { etykieta: 'Przedłuż', trasa: 'dostep' },
      })
    }
    const p = podsumowanie(firma, stan)
    const platnosci = [
      { id: `zus-${p.miesiac}`, tytul: 'Składki ZUS za listopad', kwota: p.zus.razem, termin: p.terminy.zus },
      { id: `ryczalt-${p.miesiac}`, tytul: 'Podatek (ryczałt) za listopad', kwota: p.ryczalt.doZaplaty, termin: p.terminy.ryczalt },
      { id: `vat-${p.miesiac}`, tytul: 'Podatek VAT za listopad', kwota: p.vat.doZaplaty, termin: p.terminy.vat },
    ]
    for (const pl of platnosci) {
      if (stan.zaplacone.includes(pl.id) || pl.kwota === 0) continue
      dodaj({
        id: pl.id,
        tytul: pl.tytul,
        opis: `${formatZl(pl.kwota)} · do ${dataSlownie(pl.termin)}`,
        termin: pl.termin,
        akcja: { etykieta: 'Zapłać', trasa: `zaplac/${pl.id}/1` },
      })
    }
  }

  const auto = osoba.dokumenty.find((d) => d.id === 'pojazd')
  if (auto?.waznyDo && dniDo(auto.waznyDo) <= 30) {
    dodaj({
      id: 'oc',
      tytul: 'Kończy się OC auta',
      opis: `${auto.podpis} · ${dataSlownie(auto.waznyDo)}`,
      termin: auto.waznyDo,
      akcja: { etykieta: 'Sprawdź', trasa: 'dokumenty/pojazd' },
    })
  }

  return z.sort((a, b) => (a.dni ?? 0) - (b.dni ?? 0))
}
