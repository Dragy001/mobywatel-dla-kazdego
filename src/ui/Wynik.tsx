import { IconCircleCheck } from '@tabler/icons-react'
import type { ReactNode } from 'react'
import { Wiersze } from './Karta'
import { Dol, PrzyciskLink } from './Przycisk'

export function Wynik({ tytul, wiersze, dalej, children }: { tytul: string; wiersze: [string, string][]; dalej: { etykieta: string; do: string }; children?: ReactNode }) {
  return (
    <section className="wynik">
      <div role="status" className="wynik__naglowek">
        <IconCircleCheck size={56} aria-hidden className="wynik__ikona" />
        <p className="wynik__tytul">{tytul}</p>
      </div>
      <div className="karta karta--zwykla"><Wiersze wiersze={wiersze} /></div>
      {children}
      <Dol><PrzyciskLink do={dalej.do}>{dalej.etykieta}</PrzyciskLink></Dol>
    </section>
  )
}
