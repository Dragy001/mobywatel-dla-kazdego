# mObywatel dla każdego — plan budowy prototypu

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Klikalny prototyp webowy mObywatela z prostym widokiem dla seniora i modułem „Moja firma” (KSeF, podatki, ZUS, CEIDG), opublikowany na GitHub Pages i zgłoszony do mObywatel Challenge do 30.11.2026.

**Architecture:** Statyczna aplikacja SPA (React + Vite + TS) z routingiem hash. Cała logika (podatki, terminy, scenariusze asystenta) to czyste funkcje TS w `src/logika/`, dane pokazowe w `src/dane/`, stan sesji w jednym magazynie (`useReducer` + Context, kopia w `sessionStorage`). Każdy ekran ma dwa warianty układu (`Zwykly`/`Prosty`) nad wspólnym stanem i wspólnymi hookami danych.

**Tech Stack:** Node 24, Vite 6, React 18.3, TypeScript 5, react-router-dom 6 (`HashRouter`), `@tabler/icons-react`, Vitest + @testing-library/react + user-event + jsdom + `vitest-axe`, Playwright (tylko testy dymne na końcu). Bez biblioteki komponentów UI.

**Spec:** `docs/superpowers/specs/2026-11-24-mobywatel-prototyp-design.md` — czytaj razem z planem; numery `§` odnoszą się do niego.

## Global Constraints

- Wszystkie dane fikcyjne. Nie kopiować niczego z `~/Documents/Home/ksef-podatki/{faktury,wyniki,reczne.csv}` ani wartości osobistych z `konfiguracja.toml`. Wolno: publiczne stawki ZUS 2026 i zasady liczenia (§3).
- Bez godła RP, oficjalnego logo mObywatela i grafik z paczki wzorcowej (`card-*`, `strip-*`, `logo-mobywatel*`, `foto-*`). Własny znak i własne grafiki dokumentów (§2, §9).
- Stopka na ekranie wejścia (dosłownie): „Prototyp koncepcji. Nie jest aplikacją administracji publicznej. Wszystkie dane są fikcyjne.”
- Język interfejsu: polski, prosty; termin fachowy zawsze z wyjaśnieniem (§6.5).
- Kwoty liczone w groszach (`number` całkowity); wyświetlane jako `1 926,76 zł` (spacja niełamliwa jako separator tysięcy).
- Data „dziś” w pokazie jest zamrożona: `DZIS = '2026-12-05'` (miesiąc rozliczeniowy: listopad 2026).
- Terminy: ZUS do 20., ryczałt do 20., VAT (JPK) do 25. dnia następnego miesiąca; PIT-28 do 30.04.
- Dostępność: WCAG 2.2 AA; cele dotyku ≥ 48 px (prosty widok ≥ 64 px); tekst skalowany przez `rem` (poziomy 100% / 125% / 150% rozmiaru bazowego 16 px); `prefers-reduced-motion`; jasny i ciemny motyw (§8).
- Każde wysłanie/zapłata/zgoda przechodzi przez ekran „Sprawdź i potwierdź” (§6.4).
- Ekran wchodzi do zgłoszenia dopiero, gdy działa w obu widokach (§6 „Zasięg prostego widoku”).
- Hosting: GitHub Pages, publiczne repo `Dragy001/mobywatel-dla-kazdego`, Vite `base: '/mobywatel-dla-kazdego/'`, licencja MIT. Zero sekretów w repo.
- Priorytety A → B → C z §12. Kolejność zadań poniżej je odzwierciedla; po Zadaniu 11 poziom A jest kompletny i opublikowany.

## Review Focus

1. **Największy tekst + prosty widok na wąskim telefonie (360 px)** — nic nie wychodzi poza ekran, przyciski się nie ucinają, brak przewijania w poziomie. Test: Zadanie 17, Playwright `bez-przewijania-w-poziomie`.
2. **Odświeżenie strony w środku sprawy albo wejście z linku głębokiego** (`#/tomasz/faktura/2`) — stan i krok zostają; link bez wybranej osoby wraca na wejście, a nie pokazuje pusty ekran. Test: Zadanie 4 `odtwarza-stan-z-sessionStorage`, Zadanie 5 `nieznana-osoba-wraca-na-wejscie`.
3. **`sessionStorage` niedostępny (Safari prywatne, zablokowane dane)** — aplikacja działa w pamięci. Test: Zadanie 4 `dziala-gdy-storage-rzuca`.
4. **Kwota wpisana po polsku i błędnie** (`1230,50`, `1 230,5`, pusta, `0`, `-5`, `abc`) — poprawne grosze albo komunikat przy polu, bez przejścia dalej. Test: Zadanie 2 `parseKwota`, Zadanie 11 `blokuje-dalej-przy-zlej-kwocie`.
5. **Przełączenie widoku w trakcie sprawy** (ustawienia → prosty widok, gdy faktura jest w kroku 2) — szkic i krok zostają. Test: Zadanie 11 `zmiana-widoku-zachowuje-szkic`.

---

## Harmonogram

| Dzień | Zadania |
|---|---|
| 25.11 | 1–5 |
| 26.11 | 6–9 |
| 27.11 | 10–11, publikacja poziomu A |
| 28.11 | 12–15 (poziom B) |
| 29.11 | 16–17 (poziom C, dostępność, tekst zgłoszenia) |
| 30.11 | sprawdzenie w oknie prywatnym, zgłoszenie (wysyła właściciel) |

## Struktura plików

```
src/
  main.tsx, App.tsx              # HashRouter, trasy, provider stanu
  styl/tokeny.css, baza.css      # zmienne kolorów (jasny/ciemny), skala tekstu, ramka telefonu
  logika/                        # czyste funkcje, bez Reacta
    pieniadze.ts  podatki.ts  daty.ts  zadania.ts  asystent.ts
  dane/
    typy.ts  halina.ts  tomasz.ts  index.ts
  stan/
    magazyn.tsx                  # Context + reducer + sessionStorage
    akcje.ts                     # typy akcji
  ui/                            # prymitywy wspólne dla obu widoków
    PasekGorny.tsx  CzytajNaGlos.tsx  DuzyPrzycisk.tsx  Karta.tsx  Kroki.tsx
    SprawdzIPotwierdz.tsx  Wynik.tsx  PasekZakladek.tsx  PoprosOPomocPrzycisk.tsx
    PasekPomocnika.tsx  RamkaTelefonu.tsx  Kwota.tsx
  ekrany/
    wejscie/  ustawienia/  start/  dokumenty/  pomoc/  firma/  faktury/
    asystent/  ceidg/  dostep/  terminy/  sms/  historia/  pit/
tests/e2e/                       # Playwright (Zadanie 17)
```

Każdy ekran: `ekrany/<obszar>/<Nazwa>.tsx` eksportuje `<Nazwa/>`, który wybiera `<NazwaZwykly/>` albo `<NazwaProsty/>` (w tym samym pliku lub obok) wg `useUstawienia().widok`. Testy obok: `<Nazwa>.test.tsx`, każdy test ekranu renderuje **oba** warianty (`describe.each(['zwykly','prosty'])`) i sprawdza `axe` bez naruszeń.

---

### Task 1: Szkielet projektu, repozytorium i publikacja

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `src/main.tsx`, `src/App.tsx`, `src/styl/tokeny.css`, `src/styl/baza.css`, `src/test/setup.ts`, `.github/workflows/pages.yml`, `LICENSE` (MIT), `README.md`, `.gitignore`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: `npm test` (vitest run), `npm run build`, `npm run dev`; `renderApp(trasa: string)` w `src/test/render.tsx` (renderuje `<App/>` z `MemoryRouter`-zgodnym wejściem przez `window.location.hash`).

- [ ] **Step 1:** `git init -b main` w katalogu projektu; `npm create vite@latest . -- --template react-ts`; doinstaluj: `react-router-dom@6`, `@tabler/icons-react`, dev: `vitest`, `@testing-library/react`, `@testing-library/user-event`, `@testing-library/jest-dom`, `jsdom`, `vitest-axe`.
- [ ] **Step 2: Test** `App.test.tsx` → `pokazuje-stopke-prototypu`: `renderApp('#/')` i `expect(screen.getByText('Prototyp koncepcji. Nie jest aplikacją administracji publicznej. Wszystkie dane są fikcyjne.')).toBeInTheDocument()`.
- [ ] **Step 3:** `npm test` → FAIL (brak tekstu).
- [ ] **Step 4:** `App.tsx` z `HashRouter` i trasą `/` renderującą tymczasowe wejście ze stopką. `tokeny.css`: zmienne kolorów dla jasnego/ciemnego (`@media (prefers-color-scheme: dark)`), `html { font-size: calc(16px * var(--skala, 1)) }`. `vite.config.ts`: `base: '/mobywatel-dla-kazdego/'`, `test: { environment: 'jsdom', setupFiles: 'src/test/setup.ts' }`.
- [ ] **Step 5:** `npm test` → PASS; `npm run build` → bez błędów.
- [ ] **Step 6:** Workflow `pages.yml`: na push do `main` → `npm ci && npm test && npm run build` → `actions/upload-pages-artifact` (`dist`) → `actions/deploy-pages`.
- [ ] **Step 7: Commit** (razem ze specem i tym planem z `docs/`): `git add -A && git commit -m "chore: szkielet prototypu"`.
- [ ] **Step 8:** `gh repo create Dragy001/mobywatel-dla-kazdego --public --source . --push --description "Koncepcja mObywatela: prosty widok dla seniora i moduł firmy (KSeF). Prototyp na mObywatel Challenge."`; `gh api -X POST repos/Dragy001/mobywatel-dla-kazdego/pages -f build_type=workflow`.
- [ ] **Step 9:** `gh run watch` → zielone; `curl -sI https://dragy001.github.io/mobywatel-dla-kazdego/` → `200`.

### Task 2: Pieniądze i podatki (czysta logika)

**Files:**
- Create: `src/logika/pieniadze.ts`, `src/logika/podatki.ts`
- Test: `src/logika/pieniadze.test.ts`, `src/logika/podatki.test.ts`

**Interfaces:**
- Produces:
  - `type Grosze = number`
  - `formatZl(g: Grosze, opcje?: { bezGroszy?: boolean }): string`
  - `parseKwota(tekst: string): Grosze | null` (null dla pustej, ≤ 0, nienumerycznej)
  - `bruttoZNetto(netto: Grosze, stawkaVat: number): { netto: Grosze; vat: Grosze; brutto: Grosze }`
  - `nettoZBrutto(brutto: Grosze, stawkaVat: number): { netto: Grosze; vat: Grosze; brutto: Grosze }`
  - `ZUS_2026 = { podstawaSpoleczna: 565200, zdrowotna: { do60k: 49835, od60do300k: 83058, pow300k: 149504 } }`
  - `interface Zus { emerytalna; rentowa; chorobowa; wypadkowa; fp; spoleczne; odliczalne; zdrowotna; razem: Grosze }`
  - `zusZaMiesiac(przychodNarastajacoMinusSpoleczne: Grosze): Zus` — stawki: emerytalna 19,52%, rentowa 8%, chorobowa 2,45%, wypadkowa 1,67%, FP 2,45%, każda zaokrąglona do grosza; `odliczalne` = bez FP; próg zdrowotnej: ≤ 60 000 zł → do60k, ≤ 300 000 zł → od60do300k, wyżej → pow300k.
  - `interface Ryczalt { przychodNarastajaco; odliczeniaNarastajaco; podatekNarastajaco; wplaconoWczesniej; doZaplaty: Grosze; stawka: number }`
  - `ryczaltZaMiesiac(a: { przychodNarastajaco: Grosze; odliczeniaNarastajaco: Grosze; wplaconoWczesniej: Grosze; stawka: number }): Ryczalt` — `podatekNarastajaco = zaokrąglenie do pełnych zł((przychód − odliczenia) × stawka)`, `doZaplaty = max(podatek − wpłacono, 0)`.
  - `odliczenieOdPrzychodu(zusPoprzedni: Zus): Grosze` = `odliczalne + round(zdrowotna / 2)`.
  - `vatZaMiesiac(sprzedazVat: Grosze[], zakupyVat: Grosze[]): { nalezny; naliczony; doZaplaty: Grosze }` (doZaplaty ≥ 0; nadwyżka poza zakresem prototypu).

- [ ] **Step 1: Testy** (dokładne wartości):
  - `formatZl(192676)` → `'1 926,76 zł'` (spacja niełamliwa ` ` przed tysiącami i przed „zł”); `formatZl(129800,{bezGroszy:true})` → `'1 298 zł'`.
  - `parseKwota`: `'1230,50'`→123050, `'1 230,5'`→123050, `'1230.5'`→123050, `''`→null, `'0'`→null, `'-5'`→null, `'abc'`→null.
  - `bruttoZNetto(100000, 23)` → `{netto:100000, vat:23000, brutto:123000}`; `nettoZBrutto(123050, 23)` → `{netto:100041, vat:23009, brutto:123050}`.
  - `zusZaMiesiac(10_000_000)` → `emerytalna 110327, rentowa 45216, chorobowa 13847, wypadkowa 9439, fp 13847, spoleczne 192676, odliczalne 178829, zdrowotna 83058, razem 275734`; `zusZaMiesiac(5_000_000).zdrowotna` → 49835; `zusZaMiesiac(40_000_000).zdrowotna` → 149504.
  - `odliczenieOdPrzychodu(zusZaMiesiac(10_000_000))` → 220358.
  - `ryczaltZaMiesiac({przychodNarastajaco:10_000_000, odliczeniaNarastajaco:2_203_580, wplaconoWczesniej:850_000, stawka:12})` → `podatekNarastajaco 935600, doZaplaty 85600`.
  - `vatZaMiesiac([230000],[46000])` → `{nalezny:230000, naliczony:46000, doZaplaty:184000}`.
- [ ] **Step 2:** `npx vitest run src/logika` → FAIL.
- [ ] **Step 3:** Implementacja w podanych plikach (zaokrąglenia: `Math.round` na groszach; do pełnych zł: `Math.round(x/100)*100`).
- [ ] **Step 4:** `npx vitest run src/logika` → PASS.
- [ ] **Step 5: Commit** `feat: logika kwot, ZUS, ryczałtu i VAT`.

### Task 3: Dane pokazowe i terminy

**Files:**
- Create: `src/dane/typy.ts`, `src/dane/halina.ts`, `src/dane/tomasz.ts`, `src/dane/index.ts`, `src/logika/daty.ts`, `src/logika/zadania.ts`
- Test: `src/dane/dane.test.ts`, `src/logika/zadania.test.ts`

**Interfaces:**
- Consumes: Task 2.
- Produces:
  - `typy.ts`: `OsobaId = 'halina' | 'tomasz'`; `Osoba { id; imie; nazwisko; wolacz; wiek; miasto; opis; widokDomyslny: Widok; dokumenty: Dokument[]; firma?: Firma; pomocnicy: Pomocnik[]; sms?: Sms[]; historiaSprawdzen?: Sprawdzenie[] }`; `Dokument { id: 'dowod'|'prawo-jazdy'|'pojazd'|'legitymacja-emeryta'; nazwa; waznyDo?: string; pola: [string,string][] }`; `Firma { nazwa; nip; regon; adres; pkd: {kod,opis}[]; status: 'aktywna'|'zawieszona'; stawkaRyczaltu: number; kontrahenci: Kontrahent[]; uslugi: Usluga[]; faktury: Faktura[]; wplatyRyczaltu: Record<string, Grosze>; dostepy: Dostep[]; tokenKsefWaznyDo: string }`; `Faktura { id; numer; numerKsef; rodzaj: 'wystawiona'|'otrzymana'; data: string; kontrahent: Kontrahent; pozycje: {opis; netto: Grosze; stawkaVat: number}[]; rachunek?: string; zaplacona?: boolean }`; `Kontrahent { nip; nazwa; adres }`; `Usluga { opis; stawkaVat: number; ostatniaKwotaNetto?: Grosze }`; `Dostep { id; kto; rodzaj: 'ksiegowa'|'token'; zakres: 'przegladanie'|'wystawianie'; doKiedy: string }`; `Pomocnik { id; imie; relacja; telefon }`; `Widok = 'zwykly'|'prosty'`.
  - `DZIS = '2026-12-05'`; `dniDo(data: string, dzis?: string): number`; `formatData(data: string): string` → `'15.01.2027'`.
  - `osoby: Record<OsobaId, Osoba>`.
  - `type Zadanie = { id: string; tytul: string; opis: string; termin?: string; dni?: number; pilne: boolean; akcja: { etykieta: string; trasa: string } }`
  - `zadaniaDla(osoba: Osoba, stan: StanOsoby): Zadanie[]` — posortowane rosnąco po `dni`.
  - W `typy.ts` także `Ustawienia` i `StanOsoby` (definicje w Task 4 → Interfaces; tu je tworzysz, Task 4 je importuje).
- Wartości ustalone w specu (muszą wyjść z danych przy `DZIS`): Halina — dowód ważny do `2027-01-15` (41 dni); Tomasz — token KSeF do `2026-12-17` (12 dni), OC auta do `2026-12-21` (16 dni); Tomasz: ryczałt 12%, ~10 faktur wystawionych i 4 kosztowe w listopadzie 2026, przychód listopada ok. 15 000 zł, 4–6 kontrahentów, księgowa „Biuro Rachunkowe Liczydło” z dostępem `przegladanie` do `2027-03-31`. Przychody styczeń–październik 2026 jako sumy miesięczne (bez rozpisywania faktur), wpłaty ryczałtu za te miesiące policzone przez `ryczaltZaMiesiac`, żeby listopad wychodził spójnie. Halina: wnuczka Ola, 2 SMS-y (jeden oszustwo „dopłata do paczki 1,99 zł”, jeden prawdziwy z przychodni), 3 sprawdzenia danych (apteka, przychodnia, bank). NIP-y fikcyjne, ale z poprawną sumą kontrolną.

- [ ] **Step 1: Testy** `dane.test.ts`: `dniDo(osoby.halina dowód.waznyDo)` = 41; `dniDo(tokenKsefWaznyDo)` = 12; dni do OC = 16; każdy NIP ma poprawną sumę kontrolną; żaden NIP/nazwa nie występuje w `~/Documents/Home/ksef-podatki/konfiguracja.toml` (test czyta plik, jeśli istnieje, i pomija się, gdy go nie ma). `zadania.test.ts`: dla Tomasza pierwsze zadania to kolejno: token KSeF (12 dni), ZUS 20.12, ryczałt 20.12, OC 21.12, VAT 25.12; dla Haliny jedyne pilne zadanie to dowód (41 dni); po akcji `zaplac` dla ZUS (stan) zadanie ZUS znika.
- [ ] **Step 2:** FAIL. **Step 3:** implementacja. **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat: dane pokazowe Haliny i Tomasza, zadania na start`.

### Task 4: Stan sesji

**Files:**
- Create: `src/stan/akcje.ts`, `src/stan/magazyn.tsx`
- Test: `src/stan/magazyn.test.tsx`

**Interfaces:**
- Consumes: Task 3 typy.
- Produces (typy `Ustawienia` i `StanOsoby` mieszkają w `src/dane/typy.ts`, reszta w `src/stan/`):
  - `interface Ustawienia { widok: Widok; skala: 1 | 1.25 | 1.5; czytanie: boolean; pierwszeUruchomienieZrobione: boolean }`
  - `interface StanOsoby { ustawienia: Ustawienia; wystawione: Faktura[]; zaplacone: string[] /* id zadań/faktur */; statusFirmy: 'aktywna'|'zawieszona'; zawieszonaOd?: string; dostepy: Dostep[]; pomoc?: { pomocnikId: string; sprawa: string; doKiedy: string }; wnioski: { id: string; rodzaj: string; zlozony: string }[]; szkice: Record<string, unknown>; adresFirmy?: string }`
  - `interface Stan { osoba?: OsobaId; osoby: Record<OsobaId, StanOsoby> }`
  - `type Akcja = { t: 'wybierzOsobe'; id: OsobaId } | { t: 'ustaw'; zmiana: Partial<Ustawienia> } | { t: 'wystawFakture'; faktura: Faktura } | { t: 'zaplac'; id: string } | { t: 'zawies'; od: string } | { t: 'wznow' } | { t: 'dajDostep'; dostep: Dostep } | { t: 'odbierzDostep'; id: string } | { t: 'przedluzToken' } | { t: 'popros'; pomoc: NonNullable<StanOsoby['pomoc']> } | { t: 'zakonczPomoc' } | { t: 'zlozWniosek'; wniosek: StanOsoby['wnioski'][number] } | { t: 'zapiszSzkic'; klucz: string; wartosc: unknown } | { t: 'usunSzkic'; klucz: string } | { t: 'zmienAdres'; adres: string } | { t: 'reset' }`
  - `reduktor(stan: Stan, a: Akcja): Stan`, `<MagazynProvider>`, `useMagazyn(): { stan; osoba: Osoba; stanOsoby: StanOsoby; wyslij: (a: Akcja) => void }`, `useUstawienia(): Ustawienia & { ustaw(z: Partial<Ustawienia>): void }`.
  - Klucz storage: `'mobywatel-prototyp-v1'`. `useUstawienia` ustawia `document.documentElement.style.setProperty('--skala', …)` i `data-widok` na `<html>`.

- [ ] **Step 1: Testy:** `odtwarza-stan-z-sessionStorage` (wyślij `wystawFakture`, odmontuj, zamontuj ponownie → faktura jest); `dziala-gdy-storage-rzuca` (`vi.spyOn(Storage.prototype,'setItem').mockImplementation(()=>{throw new Error()})` i to samo dla `getItem` → akcje działają, brak wyjątku); `reset-przywraca-dane-pokazowe`; `ustawienia-sa-osobne-dla-kazdej-osoby` (Halina prosty, Tomasz zwykły domyślnie, zmiana u jednej nie rusza drugiej); `skala-ustawia-zmienna-css` (`--skala` = `1.5`).
- [ ] **Step 2:** FAIL. **Step 3:** implementacja (każdy odczyt/zapis storage w `try/catch`). **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat: stan sesji z zapisem w sessionStorage`.

### Task 5: Prymitywy UI i powłoka obu widoków

**Files:**
- Create: wszystkie pliki z `src/ui/`, `src/ekrany/Powloka.tsx` (układ trasy osoby: pasek górny, treść `<main>`, zakładki albo przycisk pomocy, pasek pomocnika)
- Modify: `src/App.tsx` (trasy: `/`, `/:osoba/*` → `Powloka`; nieznana osoba → `Navigate` do `/`)
- Test: `src/ui/ui.test.tsx`, `src/ekrany/Powloka.test.tsx`

**Interfaces:**
- Produces (props):
  - `PasekGorny({ tytul: string; wstecz?: boolean })` — „Wróć” (zawsze w lewym górnym rogu, `aria-label="Wróć"`), `CzytajNaGlos` po prawej.
  - `CzytajNaGlos()` — czyta `textContent` elementu `main` przez `speechSynthesis` z `lang='pl-PL'`; niewidoczny, gdy `!('speechSynthesis' in window)`; drugi klik zatrzymuje.
  - `DuzyPrzycisk({ ikona; etykieta; opis?; do?: string; onClick?; ton?: 'glowny'|'zwykly'|'pomoc' })` — min. wysokość 64 px.
  - `Karta({ children; ton?: 'ostrzezenie'|'zwykla'|'neutralna'; do?: string })`.
  - `Kroki({ krok: number; z: number })` → tekst „Krok 2 z 3” + pasek postępu (`role="progressbar"`).
  - `SprawdzIPotwierdz({ tytul; wiersze: [string,string][]; uwaga?: string; etykieta: string; onPotwierdz: () => void })`.
  - `Wynik({ tytul; wiersze: [string,string][]; dalej: { etykieta; do } })` — `role="status"` (`aria-live="polite"`).
  - `PasekZakladek()` — Start · Dokumenty · Firma (tylko gdy `osoba.firma`) · Sprawy; tylko w zwykłym widoku.
  - `PoprosOPomocPrzycisk()` — stały, tylko w prostym widoku, prowadzi do `/:osoba/pomoc`.
  - `PasekPomocnika()` — gdy `stanOsoby.pomoc`: „Ola pomaga Ci do jutra 18:00 · Zakończ”.
  - `Kwota({ grosze; duza?: boolean })`.
  - `RamkaTelefonu({ children })` — ramka ~390×844 przy szerokości okna ≥ 768 px, pełny ekran poniżej.
- Trasy osoby (używane w następnych zadaniach): `start`, `dokumenty`, `dokumenty/:id`, `dowod/wniosek/:krok`, `pomoc`, `pomoc/bliska/:krok`, `asystent`, `ustawienia`, `firma`, `firma/kwota/:rodzaj` (`vat`|`ryczalt`|`zus`), `faktury`, `faktury/:id`, `faktura/nowa/:krok`, `terminy`, `zaplac/:id/:krok`, `dostep`, `dostep/nowy/:krok`, `ceidg`, `ceidg/zawies/:krok`, `ceidg/adres/:krok`, `pit`, `sms`, `historia`, `sprawy`.

- [ ] **Step 1: Testy:** `zakladki-tylko-w-zwyklym`, `pomoc-tylko-w-prostym`, `zakladka-firma-tylko-gdy-jest-firma` (Halina: brak), `czytaj-na-glos-ukryte-bez-speechSynthesis`, `czytaj-na-glos-czyta-main-po-polsku` (mock `speechSynthesis.speak`, sprawdź `utterance.lang === 'pl-PL'`), `sprawdz-i-potwierdz-wywoluje-onPotwierdz`, `nieznana-osoba-wraca-na-wejscie` (`#/jan/start` → wejście), `wynik-ma-role-status`; `axe` bez naruszeń dla `Powloka` w obu widokach.
- [ ] **Step 2:** FAIL. **Step 3:** implementacja + style w `baza.css` (warianty przez `[data-widok="prosty"]`: większe odstępy, przyciski ≥ 64 px, tekst bazowy 20 px). **Step 4:** PASS.
- [ ] **Step 5: Commit** `feat: prymitywy UI i powłoka dwóch widoków`.

### Task 6: Wejście dla jury i ustawienia (A)

**Files:**
- Create: `src/ekrany/wejscie/Wejscie.tsx`, `src/ekrany/ustawienia/Ustawienia.tsx`
- Test: `src/ekrany/wejscie/Wejscie.test.tsx`, `src/ekrany/ustawienia/Ustawienia.test.tsx`

**Interfaces:** Consumes: Task 4–5. Produces: trasa `/` i `/:osoba/ustawienia`.

Treść wejścia (§7.1): po prawej (≥ 768 px) / nad wyborem (telefon) krótki opis „co nowego” (3 punkty: prosty widok dla seniora; firma w aplikacji: KSeF, podatki, ZUS, CEIDG; każda kwota z wyjaśnieniem i nic bez potwierdzenia), dwie karty osób (imię, wiek, miasto, jedno zdanie), lista „Co sprawdzić” (Halina: pokaż dowód, przypomnienie o dowodzie, poproś o pomoc; Tomasz: wystaw fakturę, „Skąd ta kwota?”, zawieś firmę, przełącz prosty widok w ustawieniach), przycisk „Zacznij od nowa”, stopka z Global Constraints.
Ustawienia (§7.13): przełącznik „Prosty widok”, „Rozmiar tekstu” (3 przyciski radiowe z podglądem), „Czytanie na głos”, „Osoba pomagająca”, „Zacznij od nowa”.

- [ ] **Step 1: Testy:** `wybor-osoby-otwiera-start` (klik „Tomasz” → `#/tomasz/start`); `zacznij-od-nowa-czysci-stan`; w ustawieniach `przelacznik-zmienia-widok` (po kliknięciu `html[data-widok="prosty"]`), `rozmiar-tekstu-ustawia-skale`; oba widoki ustawień przechodzą `axe`.
- [ ] **Step 2–4:** FAIL → implementacja → PASS.
- [ ] **Step 5: Commit** `feat: wejście dla jury i ustawienia`.

### Task 7: Start w obu widokach (A)

**Files:** Create `src/ekrany/start/Start.tsx`, `src/ekrany/sprawy/Sprawy.tsx` · Test `src/ekrany/start/Start.test.tsx`

**Interfaces:** Consumes: `zadaniaDla` (Task 3). Produces: trasy `start`, `sprawy`.

- Zwykły (§7.3, szkic 1): „Dzień dobry, {imię}”, sekcja „Do zrobienia (n)” z kartami zadań (pilne: `ton='ostrzezenie'`) i jednym przyciskiem akcji, poziomy rząd dokumentów, pole „Co chcesz załatwić?” → `asystent`, zakładki. „Sprawy” = pełna lista zadań + złożone wnioski.
- Prosty (szkic 2): „Dzień dobry”, jedno zdanie o najpilniejszej sprawie („Jedna sprawa czeka: …” / „Masz n spraw. Najpilniejsza: …”), maks. 5 `DuzyPrzycisk`: Halina — Pokaż dowód, Moje sprawy, Czy ten SMS to oszustwo?, Powiedz, czego potrzebujesz, (stały) Poproś o pomoc; Tomasz — Pokaż dowód, Moja firma, Wystaw fakturę, Powiedz, czego potrzebujesz, (stały) Poproś o pomoc.

- [ ] **Step 1: Testy** (`describe.each` po widokach i osobach): zwykły Tomasz pokazuje 5 zadań w kolejności z Task 3; prosty Halina pokazuje zdanie z „dowód” i ≤ 5 przycisków (`getAllByRole('link')` w `main`); klik akcji zadania ZUS prowadzi do `zaplac/zus-2026-11/1`; `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: ekran startowy w obu widokach`.

### Task 8: Dokumenty i wniosek o dowód (A)

**Files:** Create `src/ekrany/dokumenty/Dokumenty.tsx`, `Dokument.tsx`, `WniosekODowod.tsx`, `src/ui/grafiki/KartaDokumentu.tsx` (własna grafika SVG/CSS) · Test `src/ekrany/dokumenty/*.test.tsx`

**Interfaces:** Produces: trasy `dokumenty`, `dokumenty/:id`, `dowod/wniosek/:krok`; akcja `zlozWniosek({ id: 'dowod', rodzaj: 'Nowy dowód osobisty', zlozony: DZIS })`.

- Dokument na pełnym ekranie: duże dane, przycisk „Pokaż kod do sprawdzenia” (statyczny QR jako SVG). Prosty widok: tylko imię, nazwisko, zdjęcie-sylwetka, „Ważny do”, ten sam przycisk.
- Wniosek o dowód, 3 kroki (§5): 1 „Sprawdź swoje dane” (dane + „Wszystko się zgadza” / „Coś się nie zgadza” → informacja), 2 „Gdzie odbierzesz dowód?” (2–3 urzędy w Radomiu z datą gotowości), 3 `SprawdzIPotwierdz` → `Wynik` „Wniosek złożony” z datą i numerem; przypomnienie o dowodzie znika ze startu, w „Sprawy” pojawia się wniosek.

- [ ] **Step 1: Testy:** `pokazuje-kod-do-sprawdzenia`; `wniosek-3-kroki-konczy-wynikiem` (oba widoki); `po-wniosku-znika-przypomnienie`; `odswiezenie-w-kroku-2-zostaje-w-kroku-2` (krok z trasy, wybór urzędu w `szkice['wniosek-dowod']`); `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: dokumenty i wniosek o nowy dowód`.

### Task 9: Poproś o pomoc (A)

**Files:** Create `src/ekrany/pomoc/Pomoc.tsx`, `PoprosBliska.tsx` · Test `src/ekrany/pomoc/*.test.tsx`

**Interfaces:** Produces: trasy `pomoc`, `pomoc/bliska/:krok`; akcje `popros`, `zakonczPomoc`.

- `pomoc` (§13): dwie drogi — „Poproś bliską osobę”, „Zapytaj asystenta” (→ `asystent`; do czasu Zadania 12 ekran asystenta jest zaślepką „Wkrótce”, którą Zadanie 12 zastępuje).
- `pomoc/bliska`: 1 kogo (lista pomocników), 2 w czym (bieżąca sprawa — domyślnie najpilniejsze zadanie; jedna opcja „Tylko ta sprawa”), 3 na jak długo (24 godziny / do końca tygodnia), 4 `SprawdzIPotwierdz` (uwaga: „Ola zobaczy tylko tę sprawę. Nie zobaczy Twoich innych dokumentów. Możesz to zakończyć w każdej chwili.”) → `Wynik`; pasek pomocnika widoczny na każdym ekranie; „Zakończ” go usuwa.

- [ ] **Step 1: Testy:** `zgoda-pokazuje-pasek-pomocnika-na-innych-ekranach`; `zakoncz-usuwa-pasek`; tekst uwagi dosłownie; oba widoki + `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: prośba o pomoc bliskiej osoby`.

### Task 10: Moja firma i „Skąd ta kwota” (A)

**Files:** Create `src/logika/firma.ts`, `src/ekrany/firma/MojaFirma.tsx`, `src/ekrany/firma/SkadKwota.tsx` · Test `src/logika/firma.test.ts`, `src/ekrany/firma/*.test.tsx`

**Interfaces:**
- Consumes: Task 2, 3, 4.
- Produces: `interface PodsumowanieMiesiaca { miesiac: string; przychod: Grosze; przychodRok: Grosze; vat: ReturnType<typeof vatZaMiesiac>; ryczalt: Ryczalt; zus: Zus; odliczenie: Grosze; razem: Grosze; terminy: { zus: string; ryczalt: string; vat: string } }`; `podsumowanie(firma: Firma, stan: StanOsoby, miesiac = '2026-11'): PodsumowanieMiesiaca` — uwzględnia `stan.wystawione` z danego miesiąca; `usePodsumowanie()` hook.
- Uwaga dot. dat: faktury wystawione w prototypie dostają datę `DZIS` (grudzień), więc **nie** zmieniają listopada. Ekran pokazuje dwa okresy: „Do zapłaty za listopad” (zamknięty) i „Grudzień do tej pory” (przychód i szacowany VAT/ryczałt, rośnie po wystawieniu faktury). To spełnia §7.6 („wystawiona faktura zmienia kwoty”).

- Zwykły (§7.5, szkic 3): nagłówek ze statusem, karta „Do zapłaty za listopad” (suma + 3 wiersze z terminem i linkiem „Skąd ta kwota?”), „Grudzień do tej pory”, wejścia: Faktury KSeF, Terminy i płatności, Kto ma dostęp, Dane w CEIDG, Rozliczenie roczne; przycisk „Wystaw fakturę”.
- Prosty: zdanie „W tym miesiącu zapłacisz razem X zł. Najbliższy termin: 20 grudnia.”, jedna duża karta z trzema kwotami (słowami: „Składki ZUS”, „Podatek (ryczałt)”, „Podatek VAT”), przyciski: Wystaw fakturę, Zapłać, Moje faktury, Więcej spraw firmy (→ lista pozostałych wejść jako duże przyciski).
- „Skąd ta kwota” (§7.7, szkic 5) dla `vat|ryczalt|zus`: wiersze krok po kroku z wartościami z `PodsumowanieMiesiaca` (ryczałt: przychód od początku roku → minus składki odliczane od przychodu → × 12% → minus wpłacone wcześniej → do zapłaty), każdy wiersz z jednym zdaniem wyjaśnienia; przycisk „Zapłać”. Prosty widok: te same kroki, po jednym na kartę, większe, bez skrótów.

- [ ] **Step 1: Testy:** `podsumowanie-listopada-zgadza-sie-arytmetycznie` (`razem === vat.doZaplaty + ryczalt.doZaplaty + zus.razem`); `ryczalt-listopada-z-wplat-styczen-pazdziernik` (`doZaplaty` = wartość policzona w teście z `ryczaltZaMiesiac` na danych z Task 3); `faktura-grudniowa-zwieksza-grudzien-nie-listopad`; ekrany: każda kwota w „Skąd ta kwota” równa tej na „Moja firma”; oba widoki + `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: Moja firma i wyjaśnienie kwot`.

### Task 11: Faktury KSeF — lista i wystawianie (A) + publikacja poziomu A

**Files:** Create `src/ekrany/faktury/Faktury.tsx`, `Faktura.tsx`, `NowaFaktura.tsx`, `src/logika/faktura.ts` · Test `src/logika/faktura.test.ts`, `src/ekrany/faktury/*.test.tsx`

**Interfaces:**
- Produces: `interface SzkicFaktury { kontrahent?: Kontrahent; opis?: string; stawkaVat: number; kwotaTekst: string; tryb: 'netto'|'brutto' }`; `zbudujFakture(szkic: SzkicFaktury, kolejnyNumer: number, dzis: string): Faktura` (numer `FV/{n}/12/2026`, `numerKsef` fikcyjny w formacie `{NIP}-{RRRRMMDD}-{12 znaków hex}-{2 znaki}`); `szukajPoNip(nip: string): Kontrahent | null` (fikcyjny „rejestr” 3 firm). Szkic trzymany w `szkice['nowa-faktura']`.
- Lista (zwykły): zakładki Wystawione / Otrzymane (tu tylko lista + szczegóły; „Zapłać” dla otrzymanej — Task 16), filtr miesiąca, status „w KSeF”. Prosty: „Twoje faktury z tego miesiąca” — duże karty (kontrahent, kwota, data), bez zakładek; otrzymane osobnym przyciskiem „Faktury od innych”.
- Nowa faktura (§7.6, szkic 4): 1 Komu (ostatni kontrahenci + „Nowy: wpisz NIP” → `szukajPoNip`), 2 Za co (ostatnie usługi, stawka VAT, kwota netto/brutto liczona na żywo, komunikat przy polu dla złej kwoty), 3 `SprawdzIPotwierdz` z podglądem → „Wysyłanie do KSeF…” (≤ 1,5 s, bez animacji przy `prefers-reduced-motion`) → `Wynik` z numerem KSeF i datą → „Pobierz PDF” (generuje prosty PDF przez `window.print()` na widoku faktury — wystarczy).

- [ ] **Step 1: Testy:** logika — `zbudujFakture` liczy VAT jak `bruttoZNetto`/`nettoZBrutto`, numer KSeF pasuje do regexu; ekrany — `blokuje-dalej-przy-zlej-kwocie` (`'0'`, `''`, `'abc'` → komunikat „Wpisz kwotę większą od zera, np. 1230,50”, krok się nie zmienia); `zmiana-widoku-zachowuje-szkic` (krok 2 z wpisaną kwotą → ustawienia → prosty → powrót: kwota i krok te same); `wyslana-faktura-jest-na-liscie-i-w-grudniu`; `nip-z-rejestru-uzupelnia-dane`; oba widoki + `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: faktury KSeF — lista i wystawianie`.
- [ ] **Step 6: Publikacja poziomu A:** `git push`; `gh run watch` zielone; ręcznie w przeglądarce (okno prywatne) na `https://dragy001.github.io/mobywatel-dla-kazdego/`: przejdź „Co sprawdzić” dla obu osób w obu widokach. Pokaż link właścicielowi.

### Task 12: Asystent na scenariuszach (B)

**Files:** Create `src/logika/asystent.ts`, `src/ekrany/asystent/Asystent.tsx` (zastępuje zaślepkę) · Test `src/logika/asystent.test.ts`, `src/ekrany/asystent/Asystent.test.tsx`

**Interfaces:**
- Produces: `interface Odpowiedz { tekst: string; karta?: { tytul: string; wiersze: [string,string][]; akcja: { etykieta: string; trasa: string } } }`; `odpowiedz(pytanie: string, osoba: Osoba, stan: StanOsoby): Odpowiedz` — dopasowanie po słowach kluczowych bez polskich znaków i wielkości liter; `podpowiedzi(osoba: Osoba): string[]`.
- Scenariusze (min.): Tomasz — „Co mam zapłacić w tym miesiącu?” (kwoty z `podsumowanie`, akcja → `firma`), „Wystaw fakturę dla {kontrahent} na {kwota}” (wyciąga kontrahenta i kwotę → zapisuje szkic → `faktura/nowa/3`), „Czy mogę zawiesić firmę na zimę?” (→ `ceidg/zawies/1`), „Kiedy wygasa token KSeF?” (→ `dostep`); Halina — „Kiedy kończy się mój dowód?” (→ `dowod/wniosek/1`), „Dostałam dziwnego SMS-a” (→ `sms`); nieznane → „W tej wersji pokazowej umiem pomóc w: …” + podpowiedzi.
- Ekran: arkusz rozmowy, pole tekstowe, podpowiedzi jako przyciski; prosty widok — tylko duże podpowiedzi + pole, odpowiedź czytana na głos automatycznie, gdy `czytanie` włączone.

- [ ] **Step 1: Testy:** każdy scenariusz → właściwa trasa; `'wystaw fakture dla Kowalski na 2000 zl'` → szkic z `kwotaTekst '2000'`; nieznane → lista podpowiedzi; oba widoki + `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: asystent na scenariuszach`.

### Task 13: CEIDG — zawieszenie i wznowienie (B)

**Files:** Create `src/ekrany/ceidg/Ceidg.tsx`, `Zawieszenie.tsx` · Test `src/ekrany/ceidg/*.test.tsx`

- `ceidg`: dane firmy, adres, PKD słowami, status; przyciski „Zawieś działalność” / „Wznów działalność”, „Zmień adres” (Task 16).
- Zawieszenie (§7.10): 1 od kiedy (data ≥ jutro; domyślnie 1.01.2027), 2 „Co się stanie” — dosłownie 4 punkty: „Nie płacisz składek ZUS za czas zawieszenia (zdrowotną płacisz za dni do zawieszenia).”, „Nie możesz wystawiać faktur ani przyjmować nowych zleceń.”, „Zostajesz czynnym podatnikiem VAT, ale za miesiące, w których zawieszenie trwa cały miesiąc, nie składasz rozliczenia VAT (JPK).”, „Możesz zawiesić działalność bezterminowo i wznowić ją w każdej chwili w aplikacji.”, 3 `SprawdzIPotwierdz` → `Wynik` „Działalność zawieszona od …”; status na „Moja firma” i w CEIDG = „zawieszona”; przycisk „Wystaw fakturę” pokazuje informację zamiast kreatora. Wznowienie: 1 krok potwierdzenia.

- [ ] **Step 1: Testy:** `zawieszenie-zmienia-status-wszedzie`; `zawieszona-blokuje-wystawianie-z-wyjasnieniem`; `wznowienie-przywraca-aktywna`; data wcześniejsza niż jutro → komunikat; oba widoki + `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: zawieszanie i wznawianie działalności`.

### Task 14: Kto ma dostęp (B)

**Files:** Create `src/ekrany/dostep/Dostep.tsx`, `NowyDostep.tsx` · Test `src/ekrany/dostep/*.test.tsx`

- Lista (§7.9): księgowa (zakres słowami, do kiedy, „Odbierz dostęp” → `SprawdzIPotwierdz`), token KSeF („ważny jeszcze 12 dni”, wyjaśnienie „Tokeny KSeF są ważne 90 dni. Po tym czasie program księgowy traci dostęp do faktur.”, „Przedłuż” → nowa data `DZIS + 90 dni` = `2027-03-05`, zadanie znika ze startu). „Daj dostęp”: 1 komu (NIP lub PESEL, walidacja sumy kontrolnej NIP; PESEL: 11 cyfr), 2 do czego (przeglądanie / wystawianie), 3 do kiedy, 4 potwierdź.
- [ ] **Step 1: Testy:** `przedluzenie-tokenu-ustawia-2027-03-05-i-usuwa-zadanie`; `odebranie-dostepu-usuwa-z-listy`; `zly-nip-pokazuje-komunikat`; oba widoki + `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: zarządzanie dostępem do KSeF`.

### Task 15: Terminy i płatności (B)

**Files:** Create `src/ekrany/terminy/Terminy.tsx`, `Zaplac.tsx` · Test `src/ekrany/terminy/*.test.tsx`

- `terminy` (§7.8): grudzień 2026 – luty 2027 (ZUS 20., ryczałt 20., VAT 25.; zapłacone oznaczone), przełącznik „Przypomnij mi 3 dni wcześniej”. `zaplac/:id/:krok`: 1 kwota i odbiorca (ZUS: „Twój rachunek składkowy w ZUS”; podatki: „Twój mikrorachunek podatkowy”), 2 sposób („ePłatności”, „Przelew z banku — pokażemy dane”), 3 `SprawdzIPotwierdz` → `Wynik` „Zapłacono” (z dopiskiem „Płatność pokazowa — pieniądze nie zostały pobrane.”). Akcja `zaplac` usuwa zadanie ze startu.
- [ ] **Step 1: Testy:** `zaplata-zus-usuwa-zadanie-ze-startu`; `wynik-ma-dopisek-o-platnosci-pokazowej`; oba widoki + `axe`.
- [ ] **Step 2–4.** **Step 5: Commit** `feat: terminy i płatności`. `git push`.

### Task 16: Poziom C

Każdy podpunkt to osobny commit; robić po kolei, przerwać, gdy kończy się 29.11. Wzór testu jak wyżej: główny przepływ + oba widoki + `axe`.

- [ ] **16a SMS** (`ekrany/sms/Sms.tsx`, trasa `sms`): wybór jednego z SMS-ów → werdykt („To oszustwo” z 2–3 cechami: nacisk na szybką dopłatę, obcy adres strony; albo „Wygląda na prawdziwą wiadomość”) → „Co zrobić” → „Zgłoś do CERT Polska” (`SprawdzIPotwierdz` → `Wynik`, pokazowe). Commit `feat: sprawdzanie SMS-ów`.
- [ ] **16b Kto sprawdzał moje dane** (`ekrany/historia/Historia.tsx`, trasa `historia`, wejście z „Moje sprawy”/ustawień): lista kto, kiedy, po co, prostymi słowami. Commit `feat: historia sprawdzeń danych`.
- [ ] **16c PIT-28** (`ekrany/pit/Pit.tsx`; logika `pitRoczny(firma, stan): { przychod; odliczenia; podatek; wplacono; roznica }` w `logika/firma.ts` — **szacunek za 2026 przy założeniu grudnia = listopad**, napisane na ekranie): wiersze §7.11, lista „do sprawdzenia”, „Wyślij przez e-Urząd Skarbowy” → `Wynik` pokazowy. Test: `roznica === podatek − wplacono`. Commit `feat: przygotowanie PIT-28`.
- [ ] **16d Faktura otrzymana — zapłać z białą listą** (`Faktura.tsx`): „Zapłać” → krok „Sprawdzam rachunek na białej liście VAT…” → „Rachunek jest na białej liście” (dla jednej faktury pokazowej: „Rachunku nie ma na białej liście — nie płać, zanim nie wyjaśnisz”) → potwierdź → `Wynik`. Commit `feat: płatność faktury z białą listą`.
- [ ] **16e Porównaj z księgową** (pod „Skąd ta kwota”): pole kwoty (`parseKwota`) → „Zgadza się” albo „Różnica X zł — możliwe przyczyny: faktura z innego miesiąca, inna stawka, wpłata nieuwzględniona”. Commit `feat: porównanie z kwotą od księgowej`.
- [ ] **16f Zmiana adresu w CEIDG** (`ceidg/adres/:krok`): 1 nowy adres, 2 od kiedy, 3 potwierdź → akcja `zmienAdres`, adres zmienia się w CEIDG i na fakturach nowych. Commit `feat: zmiana adresu firmy`.
- [ ] **16g Pierwsze uruchomienie** (§7.2, `PierwszeUruchomienie.tsx`): po wybraniu osoby, gdy `!pierwszeUruchomienieZrobione` → „Jak chcesz korzystać z aplikacji?” z dwiema kartami-podglądami i suwakiem rozmiaru tekstu; domyślnie zaznaczony `widokDomyslny` osoby. Commit `feat: pierwsze uruchomienie z wyborem widoku`.

### Task 17: Dostępność, testy dymne, tekst zgłoszenia

**Files:** Create `playwright.config.ts`, `tests/e2e/dymne.spec.ts`, `docs/zgloszenie.md`

- [ ] **Step 1: Testy Playwright** (Chromium, `npm run build && npx vite preview` jako `webServer`):
  - `bez-przewijania-w-poziomie`: dla viewport 360×740, obu osób, obu widoków i skali 1.5 — na każdej trasie z listy Task 5 dostępnej dla osoby `document.documentElement.scrollWidth <= clientWidth`.
  - `link-gleboki-po-odswiezeniu`: wejdź na `#/tomasz/faktura/nowa/2` po wybraniu osoby, odśwież → nadal krok 2.
  - `sciezka-co-sprawdzic`: kliknij całą listę „Co sprawdzić” z wejścia dla obu osób bez błędów w konsoli.
- [ ] **Step 2:** `npx playwright test` → popraw, aż PASS.
- [ ] **Step 3:** Ręcznie: VoiceOver (macOS Safari) na starcie Haliny i w kreatorze faktury — każdy przycisk ma sensowną nazwę; ciemny motyw na 3 ekranach.
- [ ] **Step 4:** `docs/zgloszenie.md`: tytuł („mObywatel dla każdego: prosty dla seniora, użyteczny dla firmy” lub lepszy), opis ≤ 4000 znaków (problem, dla kogo, co jest lepsze niż wzorzec: prosty widok jako osobny układ, pomoc bliskiej osoby z ograniczonym zakresem, firma w aplikacji: KSeF, podatki z wyjaśnieniem, ZUS, CEIDG, kontrola dostępu; zastrzeżenie o fikcyjnych danych), link. Opis trzymaj w osobnym pliku `docs/zgloszenie-opis.txt` i sprawdź: `wc -m docs/zgloszenie-opis.txt` → ≤ 4000.
- [ ] **Step 5: Commit + push** `docs: tekst zgłoszenia i testy dymne`; `gh run watch` zielone; otwórz link w oknie prywatnym na telefonie i komputerze. Formularz zgłoszenia wysyła właściciel.
