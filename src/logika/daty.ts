/** Data „dziś” w pokazie jest zamrożona, żeby terminy zawsze wyglądały tak samo. */
export const DZIS = '2026-12-05'

const doUtc = (d: string) => {
  const [r, m, dz] = d.split('-').map(Number)
  return Date.UTC(r, m - 1, dz)
}

export function dniDo(data: string, dzis: string = DZIS): number {
  return Math.round((doUtc(data) - doUtc(dzis)) / 86_400_000)
}

export function dodajDni(data: string, dni: number): string {
  return new Date(doUtc(data) + dni * 86_400_000).toISOString().slice(0, 10)
}

export function formatData(data: string): string {
  const [r, m, d] = data.split('-')
  return `${d}.${m}.${r}`
}

const MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']
const MIESIACE_M = ['styczeń', 'luty', 'marzec', 'kwiecień', 'maj', 'czerwiec', 'lipiec', 'sierpień', 'wrzesień', 'październik', 'listopad', 'grudzień']

/** "20 grudnia" — do zdań w prostym widoku. */
export function dataSlownie(data: string, zRokiem = false): string {
  const [r, m, d] = data.split('-').map(Number)
  return `${d} ${MIESIACE[m - 1]}${zRokiem ? ` ${r}` : ''}`
}

/** "listopad 2026" */
export function nazwaMiesiaca(miesiac: string, zRokiem = true): string {
  const [r, m] = miesiac.split('-').map(Number)
  return `${MIESIACE_M[m - 1]}${zRokiem ? ` ${r}` : ''}`
}

/** "za 12 dni", "jutro", "dziś", "3 dni temu" */
export function zaIleDni(data: string): string {
  const n = dniDo(data)
  if (n === 0) return 'dziś'
  if (n === 1) return 'jutro'
  if (n < 0) return `${-n} dni temu`
  return `za ${n} dni`
}
