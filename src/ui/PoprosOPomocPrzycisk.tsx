import { IconHeartHandshake } from '@tabler/icons-react'
import { Link } from 'react-router-dom'
import { useTrasa } from './trasa'

export function PoprosOPomocPrzycisk() {
  const t = useTrasa()
  return (
    <div className="pomoc-dol" data-nie-czytaj>
      <Link className="duzy duzy--pomoc" to={t('pomoc')}>
        <span className="duzy__ikona" aria-hidden><IconHeartHandshake size={28} /></span>
        <span className="duzy__tekst"><span className="duzy__etykieta">Poproś o pomoc</span></span>
      </Link>
    </div>
  )
}
