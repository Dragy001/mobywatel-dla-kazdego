import type { Osoba } from './typy'

export const halina: Osoba = {
  id: 'halina',
  imie: 'Halina',
  nazwisko: 'Nowak',
  wolacz: 'Halino',
  wiek: 71,
  miasto: 'Radom',
  adres: 'ul. Słowackiego 14 m. 3, 26-600 Radom',
  pesel: '55031504828',
  opis: 'Emerytka. Chce pokazać dowód w przychodni i nie przegapić ważnych terminów.',
  widokDomyslny: 'prosty',
  dokumenty: [
    {
      id: 'dowod',
      nazwa: 'mDowód',
      podpis: 'Ważny do 15.01.2027',
      waznyDo: '2027-01-15',
      pola: [
        ['Imię', 'Halina'],
        ['Nazwisko', 'Nowak'],
        ['Data urodzenia', '15.03.1955'],
        ['PESEL', '55031504828'],
        ['Numer dowodu', 'DKR 418207'],
        ['Ważny do', '15.01.2027'],
      ],
    },
    {
      id: 'legitymacja-emeryta',
      nazwa: 'Legitymacja emeryta',
      podpis: 'ZUS, bezterminowa',
      pola: [
        ['Imię i nazwisko', 'Halina Nowak'],
        ['Numer', 'ZUS 0412/2020/7781'],
        ['Ważna', 'bezterminowo'],
      ],
    },
  ],
  pomocnicy: [{ id: 'ola', imie: 'Ola', relacja: 'wnuczka', telefon: '600 100 200' }],
  sms: [
    {
      id: 'paczka',
      nadawca: 'Paczka24',
      tresc: 'Twoja paczka czeka na odbiór. Brakuje dopłaty 1,99 zł. Zapłać dziś, inaczej paczka wróci: https://paczka24-dostawa.top/pl',
      kiedy: 'dziś, 9:12',
      oszustwo: true,
      cechy: [
        'Pospiesza Cię i każe zapłacić od razu.',
        'Link prowadzi na dziwną stronę (paczka24-dostawa.top), a nie na stronę firmy kurierskiej.',
        'Prawdziwi kurierzy nie proszą o dopłaty SMS-em z linkiem.',
      ],
    },
    {
      id: 'przychodnia',
      nadawca: 'Przychodnia Zdrowie',
      tresc: 'Przypominamy o wizycie u dr Kowalczyk 9.12 o 10:30. Odwołanie wizyty: 48 360 12 00.',
      kiedy: 'wczoraj, 17:40',
      oszustwo: false,
      cechy: ['Nie ma linku ani prośby o pieniądze.', 'Numer telefonu to numer przychodni z Twojej karty pacjenta.'],
    },
  ],
  historiaSprawdzen: [
    { kto: 'Apteka Pod Orłem, Radom', kiedy: '2026-12-02', co: 'mDowód', poCo: 'Odbiór leku na receptę' },
    { kto: 'Przychodnia Zdrowie, Radom', kiedy: '2026-11-28', co: 'mDowód', poCo: 'Potwierdzenie, kim jesteś, przed wizytą' },
    { kto: 'Bank Mazowiecki', kiedy: '2026-11-15', co: 'Zastrzeżenie numeru PESEL', poCo: 'Sprawdzenie przed wydaniem nowej karty' },
  ],
}
