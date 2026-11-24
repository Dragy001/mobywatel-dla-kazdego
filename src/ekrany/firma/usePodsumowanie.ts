import { useMemo } from 'react'
import { podsumowanie } from '../../logika/firma'
import { useMagazyn } from '../../stan/magazyn'

export function usePodsumowanie() {
  const { osoba, stanOsoby } = useMagazyn()
  return useMemo(() => (osoba.firma ? podsumowanie(osoba.firma, stanOsoby) : null), [osoba.firma, stanOsoby])
}
