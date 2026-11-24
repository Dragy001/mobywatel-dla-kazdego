# mObywatel dla każdego: projekt prototypu na mObywatel Challenge

Data: 24.11.2026 · Termin zgłoszenia konkursowego: 30.11.2026 (koniec dnia, czas polski)

## 1. Po co to robimy

Zgłaszamy koncepcję do konkursu **mObywatel Challenge** (mobywatel.ai, organizator: klub Rozwój Plus,
10 najlepszych koncepcji pokazanych w Sejmie). Konkurs ocenia **klikalny prototyp pod linkiem https**,
działający bez logowania.

Nasza teza, w jednym zdaniu: *mObywatel może być nowoczesny i jednocześnie prosty dla seniora, a przedsiębiorca
z jednoosobową firmą może w nim naprawdę prowadzić sprawy firmy (KSeF, podatki, ZUS, CEIDG), a nie tylko
oglądać dane z rejestru.*

Dzisiejszy mObywatel i prototyp wzorcowy z konkursu (Janusz Cieszyński, asystent AI + portfel dokumentów)
pokazują firmę jako jedną kartę „Firma i KRS” (dane z rejestru, opis, zawieszenie). Tu wyróżniamy się najbardziej.

## 2. Cele, czego nie robimy, czego nie wolno nam zepsuć

**Cele**
1. Jury w 3 minuty klikania widzi dwie rzeczy: (a) senior się nie gubi, (b) firma w aplikacji jest użyteczna.
2. Prototyp działa na telefonie i komputerze, pod publicznym linkiem, bez logowania i bez kosztów.
3. Każdy ekran jest dopracowany wizualnie; lepiej mniej ekranów niż ekrany „na szkic”.

**Nie robimy**
- prawdziwej aplikacji React Native (może kiedyś; teraz tylko kod ułożony tak, by logikę dało się przenieść),
- połączeń z prawdziwym KSeF, CEIDG, ZUS, płatnościami, modelem AI,
- logowania, kont, serwera, bazy danych,
- wersji językowych innych niż polska.

**Porażka, nawet jeśli „działa”**
- prosty widok wygląda jak zwykły widok z większą czcionką, a nie jak przemyślany tryb,
- moduł firmy jest tabelką liczb bez wyjaśnień („skąd ta kwota?”),
- gdziekolwiek są **prawdziwe dane** właściciela projektu (faktury, NIP, kwoty, token) — dane muszą być zmyślone,
- użyte są godło RP, oficjalne logo mObywatela albo grafiki dokumentów z paczki wzorcowej (nie są na licencji MIT),
- link nie działa w oknie prywatnym albo prosi o logowanie.

## 3. Ograniczenia

- Czas: ok. 5 dni pracy (25–29.11), zgłoszenie 30.11. Sprawdzone 24.11 na żywej stronie: formularz jest aktywny,
  a napis „Nabór zakończony” jest ukryty (pokaże się po terminie). Termin 30.11 jest twardy.
- Koszt hostingu: zero.
- Formularz zgłoszenia: tytuł, opis 30–4000 znaków, link https, opcjonalnie link do filmu.
- Dane wyłącznie fikcyjne. Z narzędzia `~/Documents/Home/ksef-podatki` wolno brać **wiedzę i zasady liczenia**
  (kod `ksef_podatki.py`, `roczne.py`, komentarze w `konfiguracja.toml`), ale **nie wolno** kopiować zawartości
  `faktury/`, `wyniki/`, `reczne.csv` ani wartości osobistych z `konfiguracja.toml` (NIP, nabywcy itp.).
  Publiczne stawki (np. składki ZUS 2026) wolno.

## 4. Rozważone podejścia

| Podejście | Za | Przeciw |
|---|---|---|
| **1. Aplikacja webowa React + Vite + TypeScript (wybrane)** | najszybsza, najlepsza dostępność w przeglądarce (czytniki ekranu, skalowanie tekstu), darmowy statyczny hosting | to nie React Native; ekrany trzeba by przepisać przy prawdziwej aplikacji |
| 2. Expo (React Native) z eksportem na web | jeden kod na telefon i web | dopracowanie wersji web i dostępności kosztuje czas, którego nie mamy |
| 3. Przeróbka prototypu wzorcowego (ZIP, MIT) | dużo gotowe | chcemy go unowocześnić, a nie dokleić moduł; jesteśmy związani jego wyglądem i budową |

Wybrał właściciel: **podejście 1**. Asystent działa na gotowych scenariuszach (bez modelu AI, bez kluczy, bez kosztów).

## 5. Dwie osoby w pokazie (dane fikcyjne)

Na ekranie wejściowym jury wybiera osobę, jak w prototypie wzorcowym.

### Pani Halina Nowak, 71 lat, emerytka, Radom — bez firmy
Startuje w **prostym widoku**. Pokazuje, że starsza osoba się nie gubi.
- **Pokaż dowód** — mDowód na pełnym ekranie, duże dane, przycisk „Pokaż kod do sprawdzenia” (kod QR jako grafika).
- **Dowód traci ważność za 41 dni** — przypomnienie na starcie → wniosek o nowy dowód krok po kroku
  (sprawdź dane → wybierz urząd i termin odbioru → sprawdź i wyślij → potwierdzenie z datą).
- **Poproś wnuczkę o pomoc** — wybór osoby (wnuczka Ola), co może zrobić (tylko ta jedna sprawa),
  na jak długo (24 godziny), potwierdzenie; potem na górze pasek „Ola pomaga Ci do jutra 18:00 · Zakończ”.
- **Czy ten SMS to oszustwo?** — wybór gotowego SMS-a („dopłata do paczki 1,99 zł”) → werdykt „To oszustwo”,
  co zrobić, przycisk „Zgłoś do CERT” (udawany).
- **Kto sprawdzał moje dane** — prosta lista (apteka, przychodnia, bank) — temat prywatności z konkursu.

### Pan Tomasz Wójcik, 34 lata, grafik, Poznań — JDG na ryczałcie z VAT
Startuje w **zwykłym widoku**. Pokazuje cały moduł „Moja firma” oraz to, że firma jest częścią jednej aplikacji
(ma też dowód, prawo jazdy, auto z kończącym się OC).
- Firma: „Studio Graficzne Tomasz Wójcik”, NIP fikcyjny, ryczałt 12%, VAT miesięczny, pełny ZUS,
  4–6 zmyślonych kontrahentów, ok. 10 faktur wystawionych i 4 kosztowe w bieżącym miesiącu.

### Ekran łączący
W ustawieniach są „Rozmiar tekstu” (3 poziomy) i „Prosty widok”. Tomasz może włączyć prosty widok
(np. pokazując aplikację tacie) — jury widzi, że to jedna aplikacja z dwoma trybami, a nie dwie aplikacje.

## 6. Zasady projektowe

1. **Start to lista „do zrobienia”, nie menu.** Sprawy ułożone wg terminu, najpilniejsza na górze,
   każda z jednym głównym przyciskiem (Zapłać, Sprawdź, Złóż wniosek).
2. **Jeden ekran = jedna decyzja.** Dłuższe sprawy to kroki z paskiem „Krok 2 z 3” i przyciskiem „Wróć”.
3. **Każda kwota ma „Skąd ta kwota?”** wyjaśnione prostym językiem, liczba po liczbie.
4. **Nic nie wychodzi bez ekranu „Sprawdź i potwierdź”** (faktura do KSeF, wniosek, zawieszenie, płatność, zgoda na pomoc).
   Po wysłaniu: wyraźne potwierdzenie z numerem i datą.
5. **Prosty język.** Zamiast „JPK_V7M” → „Rozliczenie VAT (JPK)”; termin fachowy zawsze z krótkim wyjaśnieniem.
6. **Prosty widok to osobny układ, nie tylko większa czcionka:**
   - najwyżej 5 dużych przycisków na starcie, zawsze ikona + napis,
   - jedna najważniejsza sprawa w zdaniu („Jedna sprawa czeka: …”),
   - przycisk „Wróć” zawsze w tym samym miejscu u góry; żadnych gestów (przesuwania) jako jedynej drogi,
   - przycisk „Czytaj na głos” na każdym ekranie (synteza mowy przeglądarki, język polski),
   - stały przycisk „Poproś o pomoc”,
   - bez dolnego paska zakładek.
7. **Zwykły widok:** dolny pasek: Start · Dokumenty · Firma (tylko gdy osoba ma firmę) · Sprawy;
   pole „Co chcesz załatwić?” otwiera asystenta.

### Zasięg prostego widoku (decyzja właściciela: pełny)
Prosty widok ma **własny układ na każdym ekranie**, także w całym module firmy (Moja firma, faktury, skąd ta kwota,
terminy, kto ma dostęp, CEIDG, PIT-28), a nie tylko na starcie. Na każdym ekranie: jedna główna informacja zdaniem,
najwyżej kilka dużych przycisków, „Wróć” i „Czytaj na głos” w stałym miejscu, terminy fachowe zastąpione słowami.
Ekran z §12 trafia do zgłoszenia dopiero wtedy, gdy jest gotowy **w obu widokach**. Dlatego ekrany i stan sesji
mają być wspólne, a różnić się tylko warstwą układu (np. jeden komponent ekranu z dwoma wariantami widoku).

## 7. Ekrany i przepływy

Szkice pokazane właścicielowi w rozmowie: start (zwykły), start (prosty), Moja firma, wystaw fakturę, skąd ta kwota.

### 7.1 Wejście (dla jury)
Na komputerze: telefon po lewej, po prawej krótki opis koncepcji („co nowego”), wybór osoby i lista
„co sprawdzić” (3–4 podpowiedzi, które ekrany kliknąć). Na telefonie: najpierw wybór osoby, aplikacja na pełnym ekranie.
Przycisk „Zacznij od nowa” przywraca dane pokazowe.
Stopka: „Prototyp koncepcji. Nie jest aplikacją administracji publicznej. Wszystkie dane są fikcyjne.”

### 7.2 Pierwsze uruchomienie (raz na osobę)
„Jak chcesz korzystać z aplikacji?” — dwie duże karty z podglądem: Prosty widok / Zwykły widok,
plus suwak rozmiaru tekstu z podglądem na żywo. Dla Haliny zaznaczony prosty, dla Tomasza zwykły.

### 7.3 Start
Zwykły i prosty widok jak w §6. Dla Tomasza przykładowe sprawy:
- ZUS za listopad — do 20.12,
- Ryczałt za listopad — do 20.12,
- VAT za listopad (rozliczenie JPK) — do 25.12,
- Token KSeF wygasa za 12 dni — „Przedłuż”,
- OC auta kończy się za 16 dni.

(Uwaga do szkicu z rozmowy: ryczałt płaci się do 20., VAT do 25. dnia następnego miesiąca.)

### 7.4 Dokumenty
Lista kart dokumentów (własna, neutralna grafika — nie grafiki z paczki wzorcowej) → dokument na pełnym ekranie.

### 7.5 Moja firma (Tomasz)
- Nagłówek: nazwa firmy, status „aktywna”, forma opodatkowania.
- Karta „Do zapłaty za listopad”: suma oraz VAT / ryczałt / ZUS, każda z terminem i „Skąd ta kwota?”.
- Przychód w miesiącu i od początku roku.
- Wejścia: Faktury KSeF · Terminy i płatności · Kto ma dostęp · Dane w CEIDG · Rozliczenie roczne (PIT-28).
- Główny przycisk: „Wystaw fakturę”.

### 7.6 Faktury KSeF
- Zakładki Wystawione / Otrzymane, wybór miesiąca, status („w KSeF”, numer KSeF).
- Szczegóły faktury: dane, pozycje, numer KSeF, „Pobierz PDF” (udawane).
- Faktura otrzymana: „Zapłać” → **sprawdzenie rachunku na białej liście VAT** („Rachunek jest na białej liście”) → potwierdź.
- **Wystaw fakturę, 3 kroki:**
  1. Komu — ostatni kontrahenci albo „Nowy: wpisz NIP” → dane pobierają się same (udawane, z „rejestru”).
  2. Za co — ostatnio używane usługi, stawka VAT, kwota netto/brutto liczona na żywo.
  3. Sprawdź i wyślij — podgląd faktury → „Wyślij do KSeF” → krótka animacja → numer KSeF i data.
- Wystawiona faktura **zmienia kwoty** na ekranie „Moja firma” (przychód, VAT, ryczałt) w tej sesji.

### 7.7 Skąd ta kwota
Dla każdej z trzech kwot rozpisanie krok po kroku, prostym językiem:
- VAT: VAT z faktur wystawionych − VAT z faktur kosztowych = do zapłaty.
- Ryczałt: przychód × stawka, z uwzględnieniem odliczeń (składki społeczne, połowa składki zdrowotnej) zgodnie z zasadami
  z `ksef_podatki.py`; liczby pokazowe muszą się zgadzać arytmetycznie.
- ZUS: składki społeczne + zdrowotna (próg wg przychodu rocznego), stawki 2026.
- Pod spodem: „Masz księgową? Porównaj z jej kwotą” → pole na kwotę → „Zgadza się” albo „Różnica 120 zł — możliwe przyczyny”.

### 7.8 Terminy i płatności
Kalendarz/lista na 3 miesiące (ZUS, ryczałt, VAT, PIT-28 do 30.04). „Zapłać” → wybór „ePłatności” (udawane) →
sprawdź i potwierdź → zapłacono. Opcja „Przypomnij mi 3 dni wcześniej”.

### 7.9 Kto ma dostęp
- Księgowa „Biuro Rachunkowe Liczydło”: przegląda faktury w KSeF, do 31.03.2027 → „Odbierz dostęp” / „Zmień”.
- Token KSeF do programu księgowego: ważny jeszcze 12 dni → „Przedłuż” (z wyjaśnieniem, że tokeny są ważne 90 dni).
- „Daj dostęp” → komu (NIP/PESEL), do czego (przeglądanie / wystawianie), do kiedy → sprawdź i potwierdź.

### 7.10 Dane w CEIDG
- Dane firmy, adres, PKD (opisane słowami).
- Zmień adres → kroki → potwierdzenie.
- **Zawieś działalność**: wybór daty → ekran „Co się stanie” (ZUS przestaje naliczać składki, nie wystawiasz faktur,
  VAT: co z rejestracją, maks. okres zawieszenia) → sprawdź i potwierdź → status „zawieszona od …”, przycisk „Wznów”.

### 7.11 Rozliczenie roczne (PIT-28)
Podgląd: przychody wg stawek, odliczenia, podatek za rok, wpłaty miesięczne, „do dopłaty / zwrotu”,
lista „do sprawdzenia przed wysłaniem”. Przycisk „Wyślij przez e-Urząd Skarbowy” (udawane, z ekranem potwierdzenia).

### 7.12 Asystent (scenariusze)
Arkusz rozmowy z polem tekstowym i podpowiedziami. Rozpoznaje kilkanaście pytań po słowach kluczowych, np.:
„Co mam zapłacić w tym miesiącu?”, „Wystaw fakturę dla Kowalskiego na 2000 zł”, „Czy mogę zawiesić firmę na zimę?”,
„Kiedy kończy się mój dowód?”, „Dostałam dziwnego SMS-a”. Odpowiedź = krótki tekst + karta akcji prowadząca do ekranu
z §7 (zawsze z „Sprawdź i potwierdź”). Na pytanie spoza scenariuszy: „W tej wersji pokazowej umiem pomóc w: …” + lista.

### 7.13 Ustawienia
Prosty widok (wł./wył.), rozmiar tekstu (3 poziomy), czytanie na głos, osoba pomagająca, „Zacznij od nowa”.

## 8. Dostępność (wymagania, nie „miło by było”)

- WCAG 2.2 AA: kontrast, widoczny fokus, obsługa klawiaturą, semantyczny HTML, etykiety dla czytników ekranu,
  komunikaty o wyniku akcji przez `aria-live`.
- Cele dotyku ≥ 48 px (w prostym widoku ≥ 64 px).
- Tekst skaluje się do 200% bez łamania układu; rozmiar tekstu z ustawień działa przez skalowanie `rem`.
- Brak limitów czasu, brak treści wymagających gestów, `prefers-reduced-motion` respektowane.
- Jasny i ciemny motyw wg ustawień systemu.

## 9. Technika (decyzje)

- React + Vite + TypeScript, routing po stronie przeglądarki działający na statycznym hostingu (np. hash routing).
- Bez biblioteki komponentów UI; własne komponenty i tokeny kolorów (CSS variables). Ikony z otwartej biblioteki.
- Dane pokazowe w plikach TypeScript; stan sesji (wystawione faktury, zawieszenie, zgody) w pamięci + `sessionStorage`,
  „Zacznij od nowa” czyści.
- Logika podatkowa i scenariusze asystenta jako czyste funkcje TS oddzielone od ekranów (łatwiejsze przeniesienie do RN).
- Czytanie na głos: Web Speech API (`speechSynthesis`, `pl-PL`); gdy niedostępne — przycisk ukryty.
- Na komputerze aplikacja w ramce telefonu (~390×844), na telefonie pełny ekran.
- Hosting: **GitHub Pages** z publicznego repozytorium na koncie właściciela `Dragy001`
  (właściciel zgodził się na utworzenie publicznego repozytorium; nazwa robocza `mobywatel-dla-kazdego`).
  Kod na licencji MIT. W repozytorium nie może być żadnych prawdziwych danych ani sekretów (patrz §3).
- Własne oznaczenie (bez godła i oficjalnego logo), kolorystyka nawiązująca do administracji, ale nie kopiująca jej.

## 10. Zgłoszenie

Do przygotowania razem z prototypem: tytuł, opis (≤ 4000 znaków), link https sprawdzony w oknie prywatnym
na telefonie i komputerze; opcjonalnie krótkie nagranie ekranu. Formularz wysyła właściciel.

## 11. Zostawione wykonawcy

- dokładny wygląd (typografia, kolory, ikony) w ramach §6 i §8,
- konkretne zmyślone kwoty, kontrahenci i treści — byle spójne arytmetycznie i realistyczne,
- dokładna lista słów kluczowych asystenta,
- kolejność budowania w ramach poziomów z §12.

## 12. Co musi być, a co może wypaść (decyzja projektanta)

Gdy zabraknie czasu, tniemy od dołu. Poziom A musi być w zgłoszeniu, bo bez niego teza z §1 się nie broni.

- **A — musi być:** wejście dla jury (§7.1); start w obu widokach (§7.3); ustawienia z przełącznikiem
  prostego widoku i rozmiarem tekstu (§7.13); Halina: pokaż dowód, dowód traci ważność → wniosek,
  poproś o pomoc (§5); Tomasz: Moja firma (§7.5), wystaw fakturę (§7.6), skąd ta kwota (§7.7);
  czytanie na głos.
- **B — bardzo chcemy:** zawieszenie i wznowienie w CEIDG (§7.10), kto ma dostęp (§7.9), terminy i płatność (§7.8),
  asystent z ~6 scenariuszami (§7.12), lista faktur z zakładkami.
- **C — jeśli zostanie czas:** SMS-oszustwo, kto sprawdzał moje dane, PIT-28 (§7.11), faktura otrzymana z białą listą,
  porównanie z kwotą księgowej, zmiana adresu w CEIDG, pierwsze uruchomienie (§7.2).

## 13. Przycisk „Poproś o pomoc” (decyzja projektanta)

W prostym widoku stały przycisk „Poproś o pomoc” otwiera ekran z dwiema drogami:
1. **„Poproś bliską osobę”** — przepływ udzielenia pomocy z §5 (osoba, zakres: tylko bieżąca sprawa, czas);
   po zgodzie pasek „Ola pomaga Ci do …” wisi u góry każdego ekranu.
2. **„Zapytaj asystenta”** — ten sam asystent co w §7.12, w prostym widoku z dużymi podpowiedziami
   i odpowiedziami czytanymi na głos.
Na starcie prostego widoku kafelek „Powiedz, czego potrzebujesz” to skrót do drogi 2.
