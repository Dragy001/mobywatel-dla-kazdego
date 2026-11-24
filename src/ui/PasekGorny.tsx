import { IconChevronLeft } from '@tabler/icons-react'
import { useEffect, useRef } from 'react'
import { CzytajNaGlos } from './CzytajNaGlos'
import { useWstecz } from './trasa'

export function PasekGorny({ tytul, wstecz = true, podtytul }: { tytul: string; wstecz?: boolean; podtytul?: string }) {
  const wroc = useWstecz()
  const h1 = useRef<HTMLHeadingElement>(null)
  useEffect(() => {
    document.title = `${tytul} — mObywatel dla każdego`
    h1.current?.focus({ preventScroll: true })
  }, [tytul])
  return (
    <header className="pasek-gorny">
      <div className="pasek-gorny__rzad" data-nie-czytaj>
        {wstecz ? (
          <button type="button" className="pigulka pigulka--wroc" onClick={wroc}>
            <IconChevronLeft size={22} aria-hidden />
            <span>Wróć</span>
          </button>
        ) : <span />}
        <CzytajNaGlos />
      </div>
      <h1 ref={h1} tabIndex={-1} className="pasek-gorny__tytul">{tytul}</h1>
      {podtytul && <p className="pasek-gorny__podtytul">{podtytul}</p>}
    </header>
  )
}
