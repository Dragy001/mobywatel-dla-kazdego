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

const DNI = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']

/** "sobota, 5 grudnia" */
export function dzisSlownie(data: string = DZIS): string {
  return `${DNI[new Date(doUtc(data)).getUTCDay()]}, ${dataSlownie(data)}`
}

/** Stałe dni wolne (bez świąt ruchomych — w okresie pokazu ich nie ma). Wigilia wolna od 2025 r. */
const WOLNE = ['01-01', '01-06', '05-01', '05-03', '08-15', '11-01', '11-11', '12-24', '12-25', '12-26']

/** Termin wypadający w sobotę, niedzielę lub święto przechodzi na następny dzień roboczy. */
export function dzienRoboczy(data: string): string {
  let d = data
  for (;;) {
    const dt = new Date(doUtc(d)).getUTCDay()
    if (dt !== 0 && dt !== 6 && !WOLNE.includes(d.slice(5))) return d
    d = dodajDni(d, 1)
  }
}

/** "maja" — miesiąc w dopełniaczu z "2026-05". */
export function miesiacDopelniacz(m: string): string {
  return MIESIACE[Number(m.slice(5, 7)) - 1]
}
