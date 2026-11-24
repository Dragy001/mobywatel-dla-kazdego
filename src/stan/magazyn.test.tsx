import { act, render } from '@testing-library/react'
import { vi } from 'vitest'
import { MagazynProvider, useMagazyn, useUstawienia, KLUCZ } from './magazyn'
import type { Faktura } from '../dane/typy'

let api: ReturnType<typeof useMagazyn>
let ust: ReturnType<typeof useUstawienia>
function Podglad() {
  api = useMagazyn()
  ust = useUstawienia()
  return null
}
const montuj = () => render(<MagazynProvider><Podglad /></MagazynProvider>)

const f = { id: 'n1', numer: 'FV/1/12/2026', numerKsef: 'k', rodzaj: 'wystawiona', data: '2026-12-05', kontrahent: { nip: '6663810358', nazwa: 'X', adres: 'Y' }, pozycje: [] } as Faktura

test('odtwarza-stan-z-sessionStorage', () => {
  const r = montuj()
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'tomasz' }))
  act(() => api.wyslij({ t: 'wystawFakture', faktura: f }))
  r.unmount()
  montuj()
  expect(api.stan.osoba).toBe('tomasz')
  expect(api.stanOsoby.wystawione.map((x) => x.id)).toEqual(['n1'])
  expect(window.sessionStorage.getItem(KLUCZ)).toBeTruthy()
})

test('dziala-gdy-storage-rzuca', () => {
  const s1 = vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('zablokowane') })
  const s2 = vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('zablokowane') })
  montuj()
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'halina' }))
  act(() => api.wyslij({ t: 'zaplac', id: 'x' }))
  expect(api.stanOsoby.zaplacone).toEqual(['x'])
  s1.mockRestore(); s2.mockRestore()
})

test('reset-przywraca-dane-pokazowe', () => {
  montuj()
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'tomasz' }))
  act(() => api.wyslij({ t: 'zawies', od: '2027-01-01' }))
  expect(api.stanOsoby.statusFirmy).toBe('zawieszona')
  act(() => api.wyslij({ t: 'reset' }))
  expect(api.stan.osoba).toBeUndefined()
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'tomasz' }))
  expect(api.stanOsoby.statusFirmy).toBe('aktywna')
})

test('ustawienia-sa-osobne-dla-kazdej-osoby', () => {
  montuj()
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'halina' }))
  expect(ust.widok).toBe('prosty')
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'tomasz' }))
  expect(ust.widok).toBe('zwykly')
  act(() => ust.ustaw({ widok: 'prosty' }))
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'halina' }))
  expect(api.stan.osoby.tomasz.ustawienia.widok).toBe('prosty')
  expect(api.stan.osoby.halina.ustawienia.skala).toBe(1.25)
})

test('skala-ustawia-zmienna-css', () => {
  montuj()
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'tomasz' }))
  act(() => ust.ustaw({ skala: 1.5 }))
  expect(document.documentElement.style.getPropertyValue('--skala')).toBe('1.5')
  expect(document.documentElement.dataset.widok).toBe('zwykly')
})

test('szkice-zapis-i-usuniecie', () => {
  montuj()
  act(() => api.wyslij({ t: 'wybierzOsobe', id: 'tomasz' }))
  act(() => api.wyslij({ t: 'zapiszSzkic', klucz: 'a', wartosc: { k: 1 } }))
  expect(api.stanOsoby.szkice.a).toEqual({ k: 1 })
  act(() => api.wyslij({ t: 'usunSzkic', klucz: 'a' }))
  expect(api.stanOsoby.szkice.a).toBeUndefined()
})
