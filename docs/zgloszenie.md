# Zgłoszenie do mObywatel Challenge

Formularz na mobywatel.ai wysyła właściciel projektu. Termin: 30.11.2026.

| Pole | Wartość |
|---|---|
| Tytuł | mObywatel dla każdego: prosty dla seniora, użyteczny dla firmy |
| Link do prototypu | https://dragy001.github.io/mobywatel-dla-kazdego/ |
| Kod źródłowy | https://github.com/Dragy001/mobywatel-dla-kazdego |
| Opis (≤ 4000 znaków) | [`zgloszenie-opis.txt`](zgloszenie-opis.txt) — sprawdź: `wc -m docs/zgloszenie-opis.txt` |

## Przed wysłaniem

- [ ] Otwórz link w oknie prywatnym na telefonie i na komputerze — działa bez logowania.
- [ ] Przejdź listę „Co sprawdzić” dla Haliny i Tomasza.
- [ ] Skopiuj opis z `zgloszenie-opis.txt` do formularza.

## Co jest w prototypie

- Prosty widok jako osobny układ każdego ekranu, wybierany przy pierwszym uruchomieniu.
- Pomoc bliskiej osoby w jednej sprawie i na określony czas.
- Sprawdzanie SMS-ów, historia sprawdzeń danych.
- Firma: faktury w KSeF, „Skąd ta kwota” dla VAT, ryczałtu i ZUS, porównanie z księgową, terminy i płatności,
  biała lista VAT, zawieszenie i zmiana adresu w CEIDG, kto ma dostęp i token KSeF, szacunek PIT-28.
- Asystent na gotowych scenariuszach.

Wszystkie dane są fikcyjne. Płatności i wysyłki są udawane.

## Testy

```bash
npm test            # Vitest + axe, oba widoki
npm run test:e2e    # Playwright: 360 px i tekst ×1,5 bez przewijania w poziomie, link głęboki, „Co sprawdzić”
```
