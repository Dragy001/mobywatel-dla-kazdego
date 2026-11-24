export function Kroki({ krok, z }: { krok: number; z: number }) {
  return (
    <div className="kroki">
      <span className="kroki__tekst">Krok {krok} z {z}</span>
      <div className="kroki__pasek" role="progressbar" aria-label="Postęp" aria-valuemin={1} aria-valuemax={z} aria-valuenow={krok}>
        <div className="kroki__wypelnienie" style={{ width: `${(krok / z) * 100}%` }} />
      </div>
    </div>
  )
}
