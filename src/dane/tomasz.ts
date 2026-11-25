import type { Faktura, Kontrahent, Osoba } from './typy'

const K: Record<string, Kontrahent> = {
  ziarno: { nip: '6663810358', nazwa: 'Kawiarnia Ziarno Anna Lis', adres: 'ul. Półwiejska 8, 61-888 Poznań' },
  nordwind: { nip: '5273110351', nazwa: 'Agencja Nordwind sp. z o.o.', adres: 'ul. Grochowska 21, 60-335 Poznań' },
  linia: { nip: '7771210354', nazwa: 'Pracownia Architektoniczna Linia', adres: 'ul. Wierzbięcice 4, 61-569 Poznań' },
  fundacja: { nip: '8301010351', nazwa: 'Fundacja Zielony Poznań', adres: 'ul. Garbary 50, 61-758 Poznań' },
  lipa: { nip: '6345110356', nazwa: 'Księgarnia Pod Lipą s.c.', adres: 'ul. Głogowska 102, 60-263 Poznań' },
}

const D: Record<string, Kontrahent> = {
  chmura: { nip: '5921310353', nazwa: 'Chmura Pliki sp. z o.o.', adres: 'ul. Prosta 1, 00-838 Warszawa' },
  bit: { nip: '9473310358', nazwa: 'Sklep Komputerowy Bit', adres: 'ul. Dąbrowskiego 77, 60-529 Poznań' },
  drukarnia: { nip: '7779110356', nazwa: 'Drukarnia Wielkopolska', adres: 'ul. Fabryczna 12, 61-111 Poznań' },
  telekom: { nip: '5840110354', nazwa: 'Telekom Plus SA', adres: 'al. Jerozolimskie 200, 02-486 Warszawa' },
}

const NIP_TOMASZA = '7794210352'

function ksef(data: string, n: number, nip = NIP_TOMASZA) {
  const hex = (0x3a7f20c91b4e + n * 7919).toString(16).toUpperCase().padStart(12, '0').slice(-12)
  return `${nip}-${data.replaceAll('-', '')}-${hex}-${String((n * 37) % 100).padStart(2, '0')}`
}

const sprzedaz: [string, Kontrahent, string, number][] = [
  ['2026-11-03', K.ziarno, 'Projekt menu i plakatów', 180000],
  ['2026-11-05', K.nordwind, 'Grafiki do kampanii — listopad', 320000],
  ['2026-11-07', K.linia, 'Identyfikacja wizualna — etap 1', 250000],
  ['2026-11-12', K.nordwind, 'Banery internetowe (12 szt.)', 145000],
  ['2026-11-14', K.fundacja, 'Projekt raportu rocznego', 190000],
  ['2026-11-18', K.ziarno, 'Ilustracje na kubki', 65000],
  ['2026-11-20', K.lipa, 'Projekt okładki książki', 120000],
  ['2026-11-24', K.nordwind, 'Grafiki do kampanii — poprawki', 87000],
  ['2026-11-27', K.linia, 'Identyfikacja wizualna — etap 2', 130000],
  ['2026-11-29', K.fundacja, 'Plakaty wydarzenia', 40000],
  ['2026-12-02', K.nordwind, 'Grafiki do kampanii — grudzień', 280000],
  ['2026-12-04', K.lipa, 'Projekt zakładek do książek', 45000],
]

const zakupy: [string, Kontrahent, string, number, string, boolean, boolean][] = [
  ['2026-11-02', D.chmura, 'Abonament na programy graficzne', 24900, 'PL 27 1140 2004 0000 3102 7531 8800', true, true],
  ['2026-11-10', D.bit, 'Tablet graficzny', 189900, 'PL 83 1020 4027 0000 1702 0118 2290', true, true],
  ['2026-11-15', D.drukarnia, 'Wydruki próbne', 32000, 'PL 14 2490 0005 0000 4530 9822 1047', false, false],
  ['2026-11-21', D.telekom, 'Internet i telefon', 12000, 'PL 55 1050 0099 7603 1234 5678 9123', true, false],
]

const faktury: Faktura[] = [
  ...sprzedaz.map(([data, k, opis, netto], i): Faktura => ({
    id: `s${i + 1}`,
    numer: data.startsWith('2026-12') ? `FV/${i - 9}/12/2026` : `FV/${i + 1}/11/2026`,
    numerKsef: ksef(data, i + 1),
    rodzaj: 'wystawiona',
    data,
    kontrahent: k,
    pozycje: [{ opis, netto, stawkaVat: 23 }],
    zaplacona: i < 7 || i === 10,
  })),
  ...zakupy.map(([data, k, opis, netto, rachunek, biala, zaplacona], i): Faktura => ({
    id: `z${i + 1}`,
    numer: `${['CP', 'BIT', 'DW', 'TP'][i]}/${1100 + i * 37}/2026`,
    numerKsef: ksef(data, 100 + i, k.nip),
    rodzaj: 'otrzymana',
    data,
    kontrahent: k,
    pozycje: [{ opis, netto, stawkaVat: 23 }],
    rachunek,
    naBialejLiscie: biala,
    zaplacona,
  })),
]

export const tomasz: Osoba = {
  id: 'tomasz',
  imie: 'Tomasz',
  nazwisko: 'Wójcik',
  wolacz: 'Tomasz',
  wiek: 34,
  miasto: 'Poznań',
  adres: 'ul. Jeżycka 31 m. 7, 60-865 Poznań',
  pesel: '92061207719',
  opis: 'Grafik, jednoosobowa firma na ryczałcie z VAT. Chce wiedzieć, ile i kiedy zapłacić, bez szukania po pięciu serwisach.',
  widokDomyslny: 'zwykly',
  dokumenty: [
    {
      id: 'dowod',
      nazwa: 'mDowód',
      podpis: 'Ważny do 12.06.2031',
      waznyDo: '2031-06-12',
      pola: [
        ['Imię', 'Tomasz'],
        ['Nazwisko', 'Wójcik'],
        ['Data urodzenia', '12.06.1992'],
        ['PESEL', '92061207719'],
        ['Numer dowodu', 'CFP 302114'],
        ['Ważny do', '12.06.2031'],
      ],
    },
    {
      id: 'prawo-jazdy',
      nazwa: 'mPrawo jazdy',
      podpis: 'Kat. B, bez punktów karnych',
      waznyDo: '2036-03-01',
      pola: [
        ['Kategorie', 'B'],
        ['Ważne do', '01.03.2036'],
        ['Punkty karne', '0'],
      ],
    },
    {
      id: 'pojazd',
      nazwa: 'Mój pojazd',
      podpis: 'Toyota Yaris, PO 4K218',
      waznyDo: '2026-12-21',
      pola: [
        ['Pojazd', 'Toyota Yaris 1.5, 2021'],
        ['Numer rejestracyjny', 'PO 4K218'],
        ['OC do', '21.12.2026'],
        ['Badanie techniczne do', '14.05.2027'],
      ],
    },
  ],
  pomocnicy: [{ id: 'anna', imie: 'Anna', relacja: 'siostra', telefon: '601 200 300' }],
  firma: {
    nazwa: 'Studio Graficzne Tomasz Wójcik',
    wlasciciel: 'Tomasz Wójcik',
    nip: NIP_TOMASZA,
    regon: '387214560',
    adres: 'ul. Jeżycka 31 m. 7, 60-865 Poznań',
    dataRozpoczecia: '2021-03-01',
    pkd: [
      { kod: '74.12.Z', opis: 'Projektowanie graficzne i komunikacja wizualna' },
      { kod: '58.19.Z', opis: 'Pozostała działalność wydawnicza' },
    ],
    stawkaRyczaltu: 12,
    przychodyWczesniej: {
      '2026-01': 1240000,
      '2026-02': 1385000,
      '2026-03': 1620000,
      '2026-04': 1190000,
      '2026-05': 1470000,
      '2026-06': 1530000,
      '2026-07': 980000,
      '2026-08': 1260000,
      '2026-09': 1740000,
      '2026-10': 1590000,
    },
    kontrahenci: Object.values(K),
    uslugi: [
      { opis: 'Projekt graficzny', stawkaVat: 23, ostatniaKwotaNetto: 150000 },
      { opis: 'Identyfikacja wizualna', stawkaVat: 23, ostatniaKwotaNetto: 250000 },
      { opis: 'Ilustracje', stawkaVat: 23, ostatniaKwotaNetto: 65000 },
      { opis: 'Skład i łamanie publikacji', stawkaVat: 23, ostatniaKwotaNetto: 120000 },
    ],
    faktury,
    dostepy: [
      { id: 'liczydlo', kto: 'Biuro Rachunkowe Liczydło', rodzaj: 'ksiegowa', zakres: 'przegladanie', doKiedy: '2027-03-31' },
    ],
    tokenKsefWaznyDo: '2026-12-17',
    rachunekVat: 'PL 61 1090 1014 0000 0712 1981 2874',
  },
}
