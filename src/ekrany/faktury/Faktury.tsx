import { IconFileInvoice, IconPlus } from '@tabler/icons-react'
import { useState } from 'react'
import { Link, Navigate } from 'react-router-dom'
import type { Faktura } from '../../dane/typy'
import { formatData } from '../../logika/daty'
import { wartoscFaktury, wszystkieFaktury } from '../../logika/firma'
import { formatZl } from '../../logika/pieniadze'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { PasekGorny } from '../../ui/PasekGorny'
import { Przycisk, PrzyciskLink } from '../../ui/Przycisk'
import { useTrasa } from '../../ui/trasa'

const MIESIACE = [
  { id: '', nazwa: 'Wszystkie' },
  { id: '2026-12', nazwa: 'Grudzień 2026' },
  { id: '2026-11', nazwa: 'Listopad 2026' },
]

function ListaFaktur({ faktury, duze }: { faktury: Faktura[]; duze?: boolean }) {
  const t = useTrasa()
  if (!faktury.length) return <p className="akapit">Brak faktur w tym okresie.</p>
  return (
    <ul className={duze ? 'faktury faktury--duze' : 'faktury'} aria-label="Faktury">
      {faktury.map((f) => (
        <li key={f.id}>
          <Link to={t(`faktury/${f.id}`)} className="faktura-wiersz">
            <span className="faktura-wiersz__lewa">
              <strong>{f.kontrahent.nazwa}</strong>
              <span>{f.numer} · {formatData(f.data)}</span>
            </span>
            <span className="faktura-wiersz__prawa">
              <strong className="kwota">{formatZl(wartoscFaktury(f).brutto)}</strong>
              <span className="znaczek znaczek--sukces">w KSeF</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  )
}

const posortuj = (f: Faktura[]) => [...f].sort((a, b) => b.data.localeCompare(a.data) || b.numer.localeCompare(a.numer))

export function Faktury() {
  const { osoba, stanOsoby } = useMagazyn()
  const { widok } = useUstawienia()
  const [zakladka, setZakladka] = useState<'wystawiona' | 'otrzymana'>('wystawiona')
  const [miesiac, setMiesiac] = useState('')
  if (!osoba.firma) return <Navigate to="../start" replace />
  const wszystkie = posortuj(wszystkieFaktury(osoba.firma, stanOsoby))

  if (widok === 'prosty') {
    const lista = wszystkie.filter((f) => f.rodzaj === zakladka)
    return (
      <>
        <PasekGorny tytul={zakladka === 'wystawiona' ? 'Twoje faktury' : 'Faktury od innych'} />
        <PrzyciskLink do="faktura/nowa/1"><IconPlus size={24} aria-hidden /> Wystaw fakturę</PrzyciskLink>
        <ListaFaktur faktury={lista} duze />
        <Przycisk ton="drugi" onClick={() => setZakladka(zakladka === 'wystawiona' ? 'otrzymana' : 'wystawiona')}>
          {zakladka === 'wystawiona' ? 'Faktury od innych' : 'Twoje faktury'}
        </Przycisk>
      </>
    )
  }

  const lista = wszystkie.filter((f) => f.rodzaj === zakladka && f.data.startsWith(miesiac))
  return (
    <>
      <PasekGorny tytul="Faktury KSeF" />
      <div role="tablist" aria-label="Rodzaj faktur" className="zakladki-wew">
        {(['wystawiona', 'otrzymana'] as const).map((z) => (
          <button key={z} type="button" role="tab" id={`tab-${z}`} aria-controls="panel-faktur" aria-selected={zakladka === z} className="zakladki-wew__tab" onClick={() => setZakladka(z)}>
            {z === 'wystawiona' ? 'Wystawione' : 'Otrzymane'}
          </button>
        ))}
      </div>
      <div className="pole">
        <label htmlFor="miesiac">Okres</label>
        <select id="miesiac" value={miesiac} onChange={(e) => setMiesiac(e.target.value)}>
          {MIESIACE.map((m) => <option key={m.id} value={m.id}>{m.nazwa}</option>)}
        </select>
      </div>
      <div role="tabpanel" id="panel-faktur" aria-labelledby={`tab-${zakladka}`}>
        <ListaFaktur faktury={lista} />
      </div>
      <PrzyciskLink do="faktura/nowa/1"><IconFileInvoice size={22} aria-hidden /> Wystaw fakturę</PrzyciskLink>
    </>
  )
}
