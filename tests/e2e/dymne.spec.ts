import { expect, test, type Page } from '@playwright/test'

const WSPOLNE = ['start', 'sprawy', 'dokumenty', 'dokumenty/dowod', 'dowod/wniosek/1', 'dowod/wniosek/2', 'pomoc', 'pomoc/bliska/1', 'asystent', 'ustawienia', 'sms', 'historia']
const FIRMA = [
  'firma', 'firma/kwota/vat', 'firma/kwota/ryczalt', 'firma/kwota/zus', 'faktury', 'faktury/s1', 'faktury/z3', 'faktury/z3/zaplac/1', 'faktury/z4/zaplac/1',
  'faktura/nowa/1', 'terminy', 'zaplac/zus-2026-11/1', 'zaplac/vat-2026-11/2', 'dostep', 'dostep/token', 'dostep/odbierz/liczydlo', 'dostep/nowy/1',
  'ceidg', 'ceidg/zawies/1', 'ceidg/zawies/2', 'ceidg/adres/1', 'pit', 'pit/wyslij',
]
const TRASY = { halina: [...WSPOLNE, 'sms/paczka', 'sms/paczka/zglos'], tomasz: [...WSPOLNE, ...FIRMA] }

/** Pierwsze uruchomienie: wybierz widok i największy tekst. */
async function wejdz(page: Page, osoba: string, widok: 'Prosty widok' | 'Zwykły widok') {
  await page.goto(`#/${osoba}/start`)
  await page.getByRole('radio', { name: new RegExp(widok) }).check()
  await page.getByRole('slider', { name: 'Rozmiar tekstu' }).fill('2')
  await page.getByRole('button', { name: 'Zaczynamy' }).click()
  await expect(page.locator('html')).toHaveAttribute('style', /--skala: 1.5/)
}

for (const osoba of ['halina', 'tomasz'] as const)
  for (const widok of ['Prosty widok', 'Zwykły widok'] as const)
    test(`bez-przewijania-w-poziomie: ${osoba}, ${widok}, tekst 1.5`, async ({ page }) => {
      await page.setViewportSize({ width: 360, height: 740 })
      await wejdz(page, osoba, widok)
      const zle: string[] = []
      const tytuly = new Set<string>()
      for (const t of TRASY[osoba]) {
        await page.evaluate((h) => { location.hash = h }, `#/${osoba}/${t}`)
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))))
        tytuly.add(await page.locator('main h1').first().innerText())
        const problem = await page.evaluate(() => {
          const d = document.documentElement
          if (d.scrollWidth > d.clientWidth) return `strona ${d.scrollWidth} > ${d.clientWidth}`
          const m = document.getElementById('tresc')!
          if (m.scrollWidth > m.clientWidth) return `#tresc ${m.scrollWidth} > ${m.clientWidth}`
          const wPrzewijanym = (e: Element) => {
            for (let p = e.parentElement; p && p !== m; p = p.parentElement) if (getComputedStyle(p).overflowX !== 'visible') return true
            return false
          }
          const poza = [...m.querySelectorAll('*')].find((e) => e.getBoundingClientRect().right > window.innerWidth + 0.5 && !wPrzewijanym(e))
          return poza ? `poza ekranem: ${poza.tagName}.${poza.className} ${Math.round(poza.getBoundingClientRect().right)}` : ''
        })
        if (problem) zle.push(`${t}: ${problem}`)
      }
      expect(zle).toEqual([])
      expect(tytuly.size).toBeGreaterThan(osoba === 'tomasz' ? 25 : 10)
    })

test('link-gleboki-po-odswiezeniu', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await wejdz(page, 'tomasz', 'Zwykły widok')
  await page.goto('#/tomasz/faktura/nowa/1')
  await page.getByRole('radio', { name: /Kawiarnia Ziarno/ }).check()
  await page.getByRole('button', { name: 'Dalej' }).click()
  await expect(page.getByText('Krok 2 z 3')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Krok 2 z 3')).toBeVisible()
  await expect(page.getByRole('radio', { name: /Projekt graficzny/ })).toBeVisible()
})

test('nieznana osoba wraca na wejście', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('#/ktos/start')
  await expect(page).toHaveURL(/#\/$/)
})

test('sciezka-co-sprawdzic', async ({ page }) => {
  const bledy: string[] = []
  page.on('console', (m) => { if (m.type() === 'error') bledy.push(m.text()) })
  page.on('pageerror', (e) => bledy.push(e.message))
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.goto('')
  for (const imie of ['Halina', 'Tomasz']) {
    const lista = page.getByRole('region', { name: `Co sprawdzić: ${imie}` }).getByRole('link')
    const ile = await lista.count()
    expect(ile).toBeGreaterThan(0)
    for (let i = 0; i < ile; i++) {
      await lista.nth(i).click()
      const zacznij = page.getByRole('button', { name: 'Zaczynamy' })
      if (await zacznij.isVisible()) await zacznij.click()
      await expect(page.locator('main h1').first()).toBeVisible()
    }
  }
  expect(bledy).toEqual([])
})
