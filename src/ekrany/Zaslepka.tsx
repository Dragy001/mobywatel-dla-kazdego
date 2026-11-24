import { PasekGorny } from '../ui/PasekGorny'

export function Zaslepka({ tytul }: { tytul: string }) {
  return (
    <>
      <PasekGorny tytul={tytul} />
      <p className="akapit">Ten ekran jest w przygotowaniu.</p>
    </>
  )
}
