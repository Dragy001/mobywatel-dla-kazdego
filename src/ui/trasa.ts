import { useLocation, useNavigate, useParams } from 'react-router-dom'

/** Ścieżka w obrębie aktualnej osoby: t('firma') → '/tomasz/firma'. */
export function useTrasa() {
  const { osoba = 'halina' } = useParams()
  return (p: string) => (p.startsWith('/') ? p : `/${osoba}/${p}`)
}

export function useWstecz() {
  const nav = useNavigate()
  const loc = useLocation()
  const t = useTrasa()
  return () => (loc.key === 'default' ? nav(t('start')) : nav(-1))
}
