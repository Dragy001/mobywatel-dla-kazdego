/** Własny, neutralny znak prototypu (bez godła i oficjalnego logo). */
export function Znak({ rozmiar = 36 }: { rozmiar?: number }) {
  return (
    <span className="znak">
      <svg width={rozmiar} height={rozmiar} viewBox="0 0 36 36" aria-hidden>
        <rect width="36" height="36" rx="10" fill="var(--akcent)" />
        <path d="M9 25V15.5c0-2 1.4-3.5 3.3-3.5 1.9 0 3.2 1.5 3.2 3.5V25M15.5 15.5c0-2 1.4-3.5 3.3-3.5 1.9 0 3.2 1.5 3.2 3.5V25" stroke="var(--na-akcencie)" strokeWidth="2.6" fill="none" strokeLinecap="round" />
        <circle cx="27" cy="23" r="2.4" fill="var(--na-akcencie)" />
      </svg>
      <span className="znak__tekst">mObywatel <span className="znak__dopisek">koncepcja</span></span>
    </span>
  )
}
