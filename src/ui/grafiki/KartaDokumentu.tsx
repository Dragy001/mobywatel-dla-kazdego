import type { Dokument, Osoba } from '../../dane/typy'

function Sylwetka() {
  return (
    <svg viewBox="0 0 60 72" className="dok__zdjecie" aria-hidden>
      <rect width="60" height="72" rx="6" fill="rgb(255 255 255 / 85%)" />
      <circle cx="30" cy="27" r="12" fill="#9aa6bb" />
      <path d="M8 70c2-14 11-21 22-21s20 7 22 21z" fill="#9aa6bb" />
    </svg>
  )
}

export function KartaDokumentu({ dok, osoba }: { dok: Dokument; osoba: Osoba }) {
  const pierwszaLinia = dok.pola[0]?.[1]
  return (
    <div className={`dok dok--${dok.id}`}>
      <div className="dok__gora">
        <span className="dok__nazwa">{dok.nazwa}</span>
        <span className="dok__rp" aria-hidden>PL</span>
      </div>
      <div className="dok__srodek">
        {dok.id !== 'pojazd' && <Sylwetka />}
        <div className="dok__dane">
          <span className="dok__osoba">{dok.id === 'pojazd' ? pierwszaLinia : `${osoba.imie} ${osoba.nazwisko}`.toUpperCase()}</span>
          <span className="dok__podpis">{dok.podpis}</span>
        </div>
      </div>
      <div className="dok__hologram" aria-hidden />
    </div>
  )
}

/** Pokazowy kod (nie jest prawdziwym QR) — stały wzór z ramkami jak w kodzie QR. */
export function KodSprawdzenia() {
  const n = 25
  const pola: [number, number][] = []
  let x = 7
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++) {
      const wRogu = (r < 8 && c < 8) || (r < 8 && c >= n - 8) || (r >= n - 8 && c < 8)
      x = (x * 1103515245 + 12345) & 0x7fffffff
      if (!wRogu && x % 100 < 47) pola.push([r, c])
    }
  const ramka = (r: number, c: number) => (
    <g key={`${r}-${c}`}>
      <rect x={c} y={r} width="7" height="7" fill="#10203a" />
      <rect x={c + 1} y={r + 1} width="5" height="5" fill="#fff" />
      <rect x={c + 2} y={r + 2} width="3" height="3" fill="#10203a" />
    </g>
  )
  return (
    <svg viewBox={`-2 -2 ${n + 4} ${n + 4}`} className="kod" role="img" aria-label="Kod do sprawdzenia dokumentu">
      <rect x="-2" y="-2" width={n + 4} height={n + 4} fill="#fff" />
      {pola.map(([r, c]) => <rect key={`${r}.${c}`} x={c} y={r} width="1" height="1" fill="#10203a" />)}
      {ramka(0, 0)}
      {ramka(0, n - 7)}
      {ramka(n - 7, 0)}
    </svg>
  )
}
