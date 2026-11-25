/**
 * Tekst ekranu → tekst do syntezy mowy (pl-PL).
 * Skróty czytamy w pełnym brzmieniu, numery identyfikacyjne cyfra po cyfrze,
 * kwoty jako „złotych i groszy”, daty słownie.
 */
const MIESIACE = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia']

function forma(n: number, jeden: string, kilka: string, wiele: string): string {
  if (n === 1) return jeden
  const j = n % 10, d = n % 100
  return j >= 2 && j <= 4 && (d < 12 || d > 14) ? kilka : wiele
}

function kwotaSlowami(minus: boolean, zl: number, gr: number): string {
  const czesci: string[] = []
  if (zl > 0 || gr === 0) czesci.push(`${zl} ${forma(zl, 'złoty', 'złote', 'złotych')}`)
  if (gr > 0) czesci.push(`${gr} ${forma(gr, 'grosz', 'grosze', 'groszy')}`)
  return `${minus ? 'minus ' : ''}${czesci.join(' ')}`
}

const SKROTY: [RegExp, string][] = [
  [/\bsp\.\s*z\s*o\.\s*o\.?/gi, 'spółka z ograniczoną odpowiedzialnością'],
  [/\bs\.\s?c\./gi, 'spółka cywilna'],
  [/\bSA\b/g, 'spółka akcyjna'],
  [/\b[Uu]l\./g, 'ulica'],
  [/\b[Aa]l\./g, 'aleja'],
  [/\b[Oo]s\./g, 'osiedle'],
  [/\bm\.\s*(?=\d)/g, 'mieszkanie '],
  [/\b[Nn]r\b\.?/g, 'numer'],
  [/\b[Tt]el\./g, 'telefon'],
  [/\b[Nn]p\./g, 'na przykład'],
  [/\btys\./g, 'tysięcy'],
  [/\bok\.(?=\s*\d)/g, 'około'],
  [/\bgodz\./g, 'godzina'],
  [/\bdr\b\.?/g, 'doktor'],
  [/\bKSeF\b/g, 'Ksef'],
  [/(?<!\p{L})zł(?!\p{L})/gu, 'złotych'],
  [/(\d)\s*%/g, '$1 procent'],
  [/[·—]/g, ','],
]

export function doMowy(tekst: string): string {
  let t = tekst.replace(/[  ]/g, ' ')
  const schowane: string[] = []
  const schowaj = (s: string) => `\u0001${schowane.push(s) - 1}\u0001`

  // kwoty: „1 568,00 zł”, „− 23 408,83 zł”
  t = t.replace(/(−\s*)?(\d{1,3}(?: \d{3})+|\d+)(?:,(\d{2}))?\s*zł(?!\p{L})/gu, (_, m, zl, gr) =>
    schowaj(kwotaSlowami(!!m, Number(zl.replace(/ /g, '')), gr ? Number(gr) : 0)),
  )
  // daty „21.12.2026”
  t = t.replace(/\b(\d{1,2})\.(\d{1,2})\.(\d{4})\b/g, (_, d, m, r) => schowaj(`${Number(d)} ${MIESIACE[Number(m) - 1]} ${r}`))
  // kod pocztowy „26-600” i nazwy formularzy „PIT-28”
  t = t.replace(/\b(\d{2})-(\d{3})\b/g, (_, a, b) => schowaj(`${a} ${b}`))
  t = t.replace(/\b([A-Z]{2,})-(\d+)/g, '$1 $2')
  // NIP, PESEL, telefony, rachunki — cyfra po cyfrze, grupy z krótką przerwą
  t = t.replace(/\d(?:[ -]?\d){6,}/g, (s) => s.split(/[ -]/).map((g) => g.split('').join(' ')).join(', '))
  for (const [re, na] of SKROTY) t = t.replace(re, na)
  t = t.replace(/\u0001(\d+)\u0001/g, (_, i) => schowane[Number(i)])
  return t.replace(/\s+/g, ' ').replace(/\s+([,.])/g, '$1').trim()
}
