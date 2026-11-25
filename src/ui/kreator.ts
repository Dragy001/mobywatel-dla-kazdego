import { useNavigate, useParams } from 'react-router-dom'
import { useMagazyn } from '../stan/magazyn'
import { useTrasa } from './trasa'

/** Numer kroku z adresu (…/:krok) i przejście do innego kroku. */
export function useKrok(baza: string) {
  const { krok = '1' } = useParams()
  const nav = useNavigate()
  const t = useTrasa()
  const n = Number(krok)
  return { krok: Number.isInteger(n) && n >= 1 ? n : 1, idz: (n: number | string) => nav(t(`${baza}/${n}`)) }
}

/** Szkic sprawy trzymany w stanie sesji — przeżywa odświeżenie i zmianę widoku. */
export function useSzkic<T extends object>(klucz: string, poczatek: T): [T, (z: Partial<T>) => void, () => void] {
  const { stanOsoby, wyslij } = useMagazyn()
  const wartosc = { ...poczatek, ...((stanOsoby.szkice[klucz] as Partial<T>) ?? {}) }
  return [
    wartosc,
    (z) => wyslij({ t: 'zapiszSzkic', klucz, wartosc: { ...wartosc, ...z } }),
    () => wyslij({ t: 'usunSzkic', klucz }),
  ]
}
