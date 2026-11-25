import type { Kontrahent, Osoba, StanOsoby } from '../dane/typy'
import { dataSlownie, formatData, zaIleDni } from './daty'
import { REJESTR, SZKIC_POCZATKOWY, type SzkicFaktury } from './faktura'
import { podsumowanie, wszystkieFaktury } from './firma'
import { formatZl } from './pieniadze'

export interface Odpowiedz {
  tekst: string
  karta?: { tytul: string; wiersze: [string, string][]; akcja: { etykieta: string; trasa: string } }
  /** Szkic sprawy, który ekran zapisuje, zanim przejdziesz dalej. */
  szkic?: { klucz: string; wartosc: SzkicFaktury }
}

/** Małe litery, bez polskich znaków. */
export function normalizuj(t: string): string {
  return t.toLowerCase().replaceAll('ł', 'l').normalize('NFD').replace(/[̀-ͯ]/g, '')
}

const POMIJANE = new Set(['spolka', 'z', 'o.o.', 'sp.', 'sa', 's.c.', 'o.o'])

function znajdzKontrahenta(q: string, lista: Kontrahent[]): Kontrahent | undefined {
  return lista.find((k) =>
    normalizuj(k.nazwa)
      .split(/\s+/)
      .filter((s) => s.length >= 4 && !POMIJANE.has(s))
      .some((s) => q.includes(s.slice(0, 5))),
  )
}

const MIESIAC = /^\s*(stycz|lut|mar|kwie|maj|czerw|lip|sierp|wrze|pazdz|listop|grud)/

/** Kwota: najpierw liczba z „zł”/„pln”, potem „na <liczba>”, ale nie „na 12 grudnia”. */
function znajdzKwote(q: string): string | undefined {
  const zl = q.match(/(\d[\d\s]*(?:[.,]\d{1,2})?)\s*(?:zl|pln)\b/)
  if (zl) return zl[1].replace(/\s/g, '')
  for (const m of q.matchAll(/\bna\s+(\d+(?:[.,]\d{1,2})?)/g)) {
    if (!MIESIAC.test(q.slice((m.index ?? 0) + m[0].length))) return m[1]
  }
  return undefined
}

export function podpowiedzi(osoba: Osoba): string[] {
  return osoba.firma
    ? ['Co mam zapłacić w tym miesiącu?', 'Wystaw fakturę dla Kawiarni Ziarno na 800 zł', 'Czy mogę zawiesić firmę na zimę?', 'Kiedy wygasa token KSeF?']
    : ['Kiedy kończy się mój dowód?', 'Dostałam dziwnego SMS-a']
}

export function odpowiedz(pytanie: string, osoba: Osoba, stan: StanOsoby): Odpowiedz {
  const q = normalizuj(pytanie)
  const ma = (...slowa: string[]) => slowa.some((s) => q.includes(s))
  const firma = osoba.firma

  if (firma && ma('faktur') && ma('zaplac', 'oplac')) {
    const doZaplaty = wszystkieFaktury(firma, stan).filter((f) => f.rodzaj === 'otrzymana' && !f.zaplacona && !stan.zaplacone.includes(f.id))
    const k = znajdzKontrahenta(q, doZaplaty.map((f) => f.kontrahent))
    const f = k && doZaplaty.find((x) => x.kontrahent.nip === k.nip)
    return f
      ? {
          tekst: `Faktura od ${f.kontrahent.nazwa} czeka na zapłatę. Zanim zapłacisz, sprawdzimy rachunek na białej liście VAT.`,
          karta: { tytul: f.numer, wiersze: [['Od kogo', f.kontrahent.nazwa], ['Termin', formatData(f.data)]], akcja: { etykieta: 'Zobacz fakturę', trasa: `faktury/${f.id}` } },
        }
      : { tekst: 'Faktury od innych firm znajdziesz na liście faktur. Przy każdej niezapłaconej jest przycisk „Zapłać”.', karta: { tytul: 'Faktury', wiersze: [], akcja: { etykieta: 'Zobacz faktury', trasa: 'faktury' } } }
  }

  if (firma && ma('faktur')) {
    const k = znajdzKontrahenta(q, [...firma.kontrahenci, ...REJESTR])
    const kwota = znajdzKwote(q)
    if (k && kwota) {
      const u = firma.uslugi[0]
      const tryb = ma('brutto') ? 'brutto' : 'netto'
      const wartosc: SzkicFaktury = { ...SZKIC_POCZATKOWY, kontrahent: k, kwotaTekst: kwota, tryb, opis: u.opis, stawkaVat: u.stawkaVat }
      return {
        tekst: `Przygotowałem fakturę dla ${k.nazwa} na ${kwota} zł ${tryb}. Sprawdź ją przed wysłaniem do KSeF.`,
        karta: { tytul: 'Szkic faktury', wiersze: [['Nabywca', k.nazwa], ['Usługa', u.opis], [`Kwota ${tryb}`, `${kwota} zł`]], akcja: { etykieta: 'Sprawdź i wyślij', trasa: 'faktura/nowa/3' } },
        szkic: { klucz: 'nowa-faktura', wartosc },
      }
    }
    return {
      tekst: 'Fakturę wystawisz w trzech krokach: komu, za co i ile, a potem sprawdzasz i wysyłasz do KSeF.',
      karta: { tytul: 'Nowa faktura', wiersze: [], akcja: { etykieta: 'Wystaw fakturę', trasa: 'faktura/nowa/1' } },
    }
  }

  if (firma && ma('zaplac', 'zaplat', 'podat', 'skladk', 'zus')) {
    const p = podsumowanie(firma, stan)
    return {
      tekst: `W tym miesiącu zapłacisz razem ${formatZl(p.razem)}: VAT, ryczałt i składki ZUS za ${p.miesiac === '2026-11' ? 'listopad' : p.miesiac}.`,
      karta: {
        tytul: 'Do zapłaty',
        wiersze: [['ZUS', `${formatZl(p.zus.razem)} do ${dataSlownie(p.terminy.zus)}`], ['Ryczałt', `${formatZl(p.ryczalt.doZaplaty)} do ${dataSlownie(p.terminy.ryczalt)}`], ['VAT', `${formatZl(p.vat.doZaplaty)} do ${dataSlownie(p.terminy.vat)}`]],
        akcja: { etykieta: 'Zobacz szczegóły', trasa: 'firma' },
      },
    }
  }

  if (firma && ma('zawies')) {
    return {
      tekst: stan.statusFirmy === 'zawieszona'
        ? 'Twoja firma jest już zawieszona. Możesz ją wznowić w danych CEIDG.'
        : 'Tak. Zawieszenie zgłosisz tutaj, w CEIDG. Na czas zawieszenia nie płacisz składek społecznych ZUS i nie wystawiasz faktur.',
      karta: { tytul: 'Zawieszenie działalności', wiersze: [], akcja: stan.statusFirmy === 'zawieszona' ? { etykieta: 'Dane w CEIDG', trasa: 'ceidg' } : { etykieta: 'Zawieś działalność', trasa: 'ceidg/zawies/1' } },
    }
  }

  if (firma && ma('token', 'ksef')) {
    const doKiedy = stan.tokenKsefWaznyDo ?? firma.tokenKsefWaznyDo
    return {
      tekst: `Token KSeF dla biura rachunkowego jest ważny do ${dataSlownie(doKiedy, true)} (${zaIleDni(doKiedy)}). Możesz go przedłużyć jednym przyciskiem.`,
      karta: { tytul: 'Token KSeF', wiersze: [['Ważny do', dataSlownie(doKiedy, true)]], akcja: { etykieta: 'Zobacz, kto ma dostęp', trasa: 'dostep' } },
    }
  }

  const dowod = osoba.dokumenty.find((d) => d.id === 'dowod')
  if (dowod?.waznyDo && ma('dowod', 'dowodu')) {
    return {
      tekst: `Twój dowód jest ważny do ${dataSlownie(dowod.waznyDo, true)} (${zaIleDni(dowod.waznyDo)}). Wniosek o nowy złożysz tutaj, bez wychodzenia z domu.`,
      karta: { tytul: 'Dowód osobisty', wiersze: [['Ważny do', dataSlownie(dowod.waznyDo, true)]], akcja: { etykieta: 'Złóż wniosek', trasa: 'dowod/wniosek/1' } },
    }
  }

  if (ma('sms', 'wiadomosc', 'oszust')) {
    return {
      tekst: 'Nie klikaj w link z SMS-a. Sprawdźmy razem, czy to oszustwo.',
      karta: { tytul: 'Sprawdź SMS-a', wiersze: [], akcja: { etykieta: 'Sprawdź SMS-a', trasa: 'sms' } },
    }
  }

  return { tekst: `W tej wersji pokazowej umiem pomóc w: ${podpowiedzi(osoba).join('; ')}` }
}
