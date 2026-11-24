import { useEffect } from 'react'
import { Navigate, useLocation, useParams } from 'react-router-dom'
import { jestOsoba } from '../dane'
import { useMagazyn, useUstawienia } from '../stan/magazyn'
import { PasekPomocnika } from '../ui/PasekPomocnika'
import { PasekZakladek } from '../ui/PasekZakladek'
import { PoprosOPomocPrzycisk } from '../ui/PoprosOPomocPrzycisk'
import { TrasyOsoby } from './trasy'

export function Powloka() {
  const { osoba: param } = useParams()
  const { stan, wyslij } = useMagazyn()
  const { widok } = useUstawienia()
  const loc = useLocation()
  const ok = jestOsoba(param)

  useEffect(() => {
    if (ok && stan.osoba !== param) wyslij({ t: 'wybierzOsobe', id: param })
  }, [ok, param, stan.osoba, wyslij])

  useEffect(() => {
    document.getElementById('tresc')?.scrollTo?.({ top: 0 })
  }, [loc.pathname])

  if (!ok) return <Navigate to="/" replace />
  if (stan.osoba !== param) return null
  const naPomocy = loc.pathname.endsWith('/pomoc') || loc.pathname.includes('/pomoc/')

  return (
    <div className="aplikacja" data-widok={widok}>
      <PasekPomocnika />
      <main id="tresc" className="tresc">
        <TrasyOsoby />
      </main>
      {widok === 'zwykly' ? <PasekZakladek /> : !naPomocy && <PoprosOPomocPrzycisk />}
    </div>
  )
}
