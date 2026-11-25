import { createContext, useContext, useEffect, useMemo, useReducer, type ReactNode } from 'react'
import { osoby, stanPoczatkowy } from '../dane'
import type { Osoba, StanOsoby, Ustawienia } from '../dane/typy'
import type { Akcja, Stan } from './akcje'

export const KLUCZ = 'mobywatel-prototyp-v1'

export function stanStartowy(): Stan {
  return { osoby: { halina: stanPoczatkowy(osoby.halina), tomasz: stanPoczatkowy(osoby.tomasz) } }
}

function zmienOsobe(stan: Stan, f: (s: StanOsoby) => StanOsoby): Stan {
  const id = stan.osoba ?? 'halina'
  return { ...stan, osoby: { ...stan.osoby, [id]: f(stan.osoby[id]) } }
}

export function reduktor(stan: Stan, a: Akcja): Stan {
  switch (a.t) {
    case 'wybierzOsobe':
      return { ...stan, osoba: a.id }
    case 'reset':
      return stanStartowy()
    case 'ustaw':
      return zmienOsobe(stan, (s) => ({ ...s, ustawienia: { ...s.ustawienia, ...a.zmiana } }))
    case 'wystawFakture':
      return zmienOsobe(stan, (s) => ({ ...s, wystawione: [...s.wystawione, a.faktura] }))
    case 'zaplac':
      return zmienOsobe(stan, (s) => (s.zaplacone.includes(a.id) ? s : { ...s, zaplacone: [...s.zaplacone, a.id] }))
    case 'zawies':
      return zmienOsobe(stan, (s) => ({ ...s, statusFirmy: 'zawieszona', zawieszonaOd: a.od }))
    case 'wznow':
      return zmienOsobe(stan, (s) => ({ ...s, statusFirmy: 'aktywna', zawieszonaOd: undefined }))
    case 'dajDostep':
      return zmienOsobe(stan, (s) => ({ ...s, dostepy: [...s.dostepy, a.dostep] }))
    case 'odbierzDostep':
      return zmienOsobe(stan, (s) => ({ ...s, dostepy: s.dostepy.filter((d) => d.id !== a.id) }))
    case 'przedluzToken':
      return zmienOsobe(stan, (s) => ({ ...s, tokenKsefWaznyDo: a.doKiedy }))
    case 'popros':
      return zmienOsobe(stan, (s) => ({ ...s, pomoc: a.pomoc }))
    case 'zakonczPomoc':
      return zmienOsobe(stan, (s) => ({ ...s, pomoc: undefined }))
    case 'zlozWniosek':
      return zmienOsobe(stan, (s) => ({ ...s, wnioski: [...s.wnioski.filter((w) => w.id !== a.wniosek.id), a.wniosek] }))
    case 'zapiszSzkic':
      return zmienOsobe(stan, (s) => ({ ...s, szkice: { ...s.szkice, [a.klucz]: a.wartosc } }))
    case 'usunSzkic':
      return zmienOsobe(stan, (s) => {
        const { [a.klucz]: _usuniety, ...reszta } = s.szkice
        return { ...s, szkice: reszta }
      })
    case 'zmienAdres':
      return zmienOsobe(stan, (s) => ({ ...s, adresFirmy: a.adres }))
    case 'przypomnienia':
      return zmienOsobe(stan, (s) => ({ ...s, przypomnienia: a.wlaczone }))
  }
}

/** Stan zapisany przez starszą wersję może nie mieć nowych pól — uzupełniamy je ze stanu startowego. */
function uzupelnij(z: Partial<Stan>): Stan {
  const start = stanStartowy()
  if (!z || typeof z !== 'object' || typeof z.osoby !== 'object' || !z.osoby) return start
  const osoby = { ...start.osoby }
  for (const id of Object.keys(start.osoby) as (keyof Stan['osoby'])[]) {
    const o = z.osoby[id]
    if (o && typeof o === 'object') osoby[id] = { ...start.osoby[id], ...o, ustawienia: { ...start.osoby[id].ustawienia, ...(o.ustawienia ?? {}) } }
  }
  return { osoba: z.osoba && z.osoba in osoby ? z.osoba : undefined, osoby }
}

function wczytaj(): Stan {
  try {
    const t = window.sessionStorage.getItem(KLUCZ)
    if (t) return uzupelnij(JSON.parse(t) as Partial<Stan>)
  } catch {
    /* storage niedostępny — działamy w pamięci */
  }
  return stanStartowy()
}

interface Api {
  stan: Stan
  osoba: Osoba
  stanOsoby: StanOsoby
  wyslij: (a: Akcja) => void
}

const Kontekst = createContext<Api | null>(null)

export function MagazynProvider({ children }: { children: ReactNode }) {
  const [stan, wyslij] = useReducer(reduktor, undefined, wczytaj)
  const id = stan.osoba ?? 'halina'
  const stanOsoby = stan.osoby[id]

  useEffect(() => {
    try {
      window.sessionStorage.setItem(KLUCZ, JSON.stringify(stan))
    } catch {
      /* storage niedostępny — trudno, zostaje pamięć */
    }
  }, [stan])

  const { skala, widok } = stanOsoby.ustawienia
  useEffect(() => {
    const html = document.documentElement
    html.style.setProperty('--skala', String(stan.osoba ? skala : 1))
    html.dataset.widok = stan.osoba ? widok : 'zwykly'
  }, [skala, widok, stan.osoba])

  const api = useMemo(() => ({ stan, osoba: osoby[id], stanOsoby, wyslij }), [stan, id, stanOsoby])
  return <Kontekst.Provider value={api}>{children}</Kontekst.Provider>
}

export function useMagazyn(): Api {
  const k = useContext(Kontekst)
  if (!k) throw new Error('useMagazyn poza MagazynProvider')
  return k
}

export function useUstawienia(): Ustawienia & { ustaw: (z: Partial<Ustawienia>) => void } {
  const { stanOsoby, wyslij } = useMagazyn()
  return useMemo(() => ({ ...stanOsoby.ustawienia, ustaw: (zmiana: Partial<Ustawienia>) => wyslij({ t: 'ustaw', zmiana }) }), [stanOsoby.ustawienia, wyslij])
}
