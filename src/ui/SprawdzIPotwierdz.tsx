import { IconShieldCheck } from '@tabler/icons-react'
import { useState } from 'react'
import { Wiersze } from './Karta'
import { Dol, Przycisk } from './Przycisk'

interface Props {
  tytul?: string
  wiersze: [string, string][]
  uwaga?: string
  etykieta: string
  onPotwierdz: () => void
  zajete?: string
}

export function SprawdzIPotwierdz({ tytul = 'Sprawdź i potwierdź', wiersze, uwaga, etykieta, onPotwierdz, zajete }: Props) {
  const [wTrakcie, setWTrakcie] = useState(false)
  return (
    <section className="potwierdz" aria-labelledby="potwierdz-tytul">
      <h2 id="potwierdz-tytul" className="sekcja-tytul">
        <IconShieldCheck size={22} aria-hidden /> {tytul}
      </h2>
      <div className="karta karta--zwykla"><Wiersze wiersze={wiersze} /></div>
      {uwaga && <p className="uwaga">{uwaga}</p>}
      <Dol>
        <Przycisk
          onClick={() => {
            setWTrakcie(true)
            onPotwierdz()
          }}
          aria-busy={wTrakcie}
          disabled={wTrakcie && !!zajete}
        >
          {wTrakcie && zajete ? zajete : etykieta}
        </Przycisk>
      </Dol>
    </section>
  )
}
