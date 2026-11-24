export function Przelacznik({ etykieta, opis, wlaczony, onZmiana }: { etykieta: string; opis?: string; wlaczony: boolean; onZmiana: (v: boolean) => void }) {
  return (
    <button type="button" role="switch" aria-checked={wlaczony} className="przelacznik" onClick={() => onZmiana(!wlaczony)}>
      <span className="przelacznik__tekst">
        <span className="przelacznik__etykieta">{etykieta}</span>
        {opis && <span className="przelacznik__opis">{opis}</span>}
      </span>
      <span className="przelacznik__tor" aria-hidden><span className="przelacznik__galka" /></span>
    </button>
  )
}
