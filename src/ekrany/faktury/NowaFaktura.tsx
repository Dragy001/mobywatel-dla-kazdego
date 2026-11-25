import { IconBuildingStore, IconSearch } from '@tabler/icons-react'
import { Navigate } from 'react-router-dom'
import { DZIS, formatData, dodajDni } from '../../logika/daty'
import { kwotySzkicu, nipPoprawny, SZKIC_POCZATKOWY, szukajPoNip, zbudujFakture, type SzkicFaktury } from '../../logika/faktura'
import { wszystkieFaktury, zawieszonaTeraz } from '../../logika/firma'
import { useTrasa } from '../../ui/trasa'
import { useEffect, useState } from 'react'
import { formatZl } from '../../logika/pieniadze'
import { useMagazyn, useUstawienia } from '../../stan/magazyn'
import { useKrok, useSzkic } from '../../ui/kreator'
import { Kroki } from '../../ui/Kroki'
import { PasekGorny } from '../../ui/PasekGorny'
import { Dol, Przycisk, PrzyciskLink } from '../../ui/Przycisk'
import { SprawdzIPotwierdz } from '../../ui/SprawdzIPotwierdz'
import { Wynik } from '../../ui/Wynik'

const BAZA = 'faktura/nowa'
const OPOZNIENIE = import.meta.env.MODE === 'test' ? 0 : 1200
const STAWKI = [23, 8, 5, 0]

export function NowaFaktura() {
  const { krok, idz } = useKrok(BAZA)
  const { osoba, stanOsoby, wyslij } = useMagazyn()
  const { widok } = useUstawienia()
  const [szkic, ustaw, usun] = useSzkic<SzkicFaktury & { nowy?: boolean; nip?: string; inna?: boolean }>('nowa-faktura', SZKIC_POCZATKOWY)
  const [blad, setBlad] = useState('')
  const [wynik, ustawWynik, usunWynik] = useSzkic<{ id?: string }>('nowa-faktura-wynik', {})
  const wyslana = wynik.id
  const t = useTrasa()
  useEffect(() => { if (krok === 1 && wynik.id) usunWynik() }, [krok, wynik.id]) // eslint-disable-line react-hooks/exhaustive-deps
  const firma = osoba.firma
  if (!firma) return <Navigate to="../start" replace />
  const prosty = widok === 'prosty'

  if (zawieszonaTeraz(stanOsoby))
    return (
      <>
        <PasekGorny tytul="Wystaw fakturę" />
        <div className="karta karta--ostrzezenie zdanie-dnia">
          <p>Twoja firma jest zawieszona od {formatData(stanOsoby.zawieszonaOd!)}. W tym czasie nie wystawiasz faktur.</p>
          <p>Wznów działalność, żeby znów wystawiać faktury.</p>
        </div>
        <PrzyciskLink do="ceidg">Przejdź do danych w CEIDG</PrzyciskLink>
      </>
    )

  const ostatnia = wszystkieFaktury(firma, stanOsoby).filter((f) => f.rodzaj === 'wystawiona').find((f) => f.id === wyslana)
  if (krok >= 4 && ostatnia)
    return (
      <>
        <PasekGorny tytul="Nowa faktura" wstecz={false} />
        <Wynik
          tytul="Faktura jest w KSeF"
          wiersze={[
            ['Numer faktury', ostatnia.numer],
            ['Numer KSeF', ostatnia.numerKsef],
            ['Nabywca', ostatnia.kontrahent.nazwa],
            ['Data', formatData(ostatnia.data)],
          ]}
          dalej={{ etykieta: 'Gotowe', do: 'faktury' }}
        >
          <p className="akapit">Klient zobaczy fakturę w KSeF. Nie musisz jej wysyłać mailem.</p>
        </Wynik>
      </>
    )
  if (krok >= 4) return <Navigate to={t('faktury')} replace />

  const kwoty = kwotySzkicu(szkic)
  const kontrahent = szkic.kontrahent

  const krok1 = () => {
    if (szkic.nowy) {
      if (!kontrahent || !szkic.nip || kontrahent.nip !== szkic.nip.replace(/[\s-]/g, '')) return setBlad('Wpisz NIP i znajdź firmę.')
    } else if (!kontrahent) return setBlad('Wybierz, komu wystawiasz fakturę.')
    setBlad('')
    idz(2)
  }
  const znajdz = () => {
    const nip = (szkic.nip ?? '').replace(/[\s-]/g, '')
    if (!nipPoprawny(nip)) return setBlad('Ten NIP ma błąd. Sprawdź cyfry.')
    const k = szukajPoNip(nip)
    if (!k) return setBlad('Nie znaleźliśmy firmy z tym NIP-em.')
    setBlad('')
    ustaw({ kontrahent: k })
  }
  const krok2 = () => {
    if (!szkic.opis?.trim()) return setBlad('Wybierz albo wpisz, za co jest faktura.')
    if (!kwoty) return setBlad('Wpisz kwotę większą od zera, np. 1230,50')
    setBlad('')
    idz(3)
  }
  const wyslijDoKsef = () => {
    const numer = wszystkieFaktury(firma, stanOsoby).filter((f) => f.rodzaj === 'wystawiona' && f.data.startsWith(DZIS.slice(0, 7))).length + 1
    const f = zbudujFakture(szkic, numer, DZIS, firma.nip)
    setTimeout(() => {
      wyslij({ t: 'wystawFakture', faktura: f })
      ustawWynik({ id: f.id })
      usun()
      idz(4)
    }, OPOZNIENIE)
  }

  return (
    <>
      <PasekGorny tytul="Nowa faktura" />
      <Kroki krok={krok} z={3} />
      {krok === 1 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Komu wystawiasz fakturę?</legend>
            {zWybranym(firma.kontrahenci, prosty ? 3 : 5, (k) => !szkic.nowy && k.nip === kontrahent?.nip).map((k) => (
              <label key={k.nip} className="opcja">
                <input type="radio" name="komu" checked={!szkic.nowy && kontrahent?.nip === k.nip} onChange={() => { ustaw({ kontrahent: k, nowy: false }); setBlad('') }} />
                <span className="opcja__tekst"><strong>{k.nazwa}</strong>{!prosty && <span className="opcja__opis">NIP {k.nip}</span>}</span>
              </label>
            ))}
            <label className="opcja">
              <input type="radio" name="komu" checked={!!szkic.nowy} onChange={() => { ustaw({ nowy: true, kontrahent: undefined }); setBlad('') }} />
              <span className="opcja__tekst"><strong>Nowy kontrahent</strong><span className="opcja__opis">Wpisz NIP, resztę uzupełnimy</span></span>
            </label>
          </fieldset>
          {szkic.nowy && (
            <div className="pole">
              <label htmlFor="nip">NIP</label>
              <input id="nip" inputMode="numeric" autoComplete="off" value={szkic.nip ?? ''} onChange={(e) => ustaw({ nip: e.target.value, kontrahent: undefined })} placeholder="np. 783 122 04 69" />
              <Przycisk ton="drugi" onClick={znajdz}><IconSearch size={20} aria-hidden /> Znajdź firmę</Przycisk>
              {kontrahent && (
                <div className="karta karta--sukces wiersz-ikona" role="status">
                  <IconBuildingStore size={24} aria-hidden />
                  <span><strong>{kontrahent.nazwa}</strong><br />{kontrahent.adres}</span>
                </div>
              )}
            </div>
          )}
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={krok1}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 2 && (
        <>
          <fieldset className="wybor">
            <legend className="sekcja-tytul">Za co jest faktura?</legend>
            {zWybranym(firma.uslugi, prosty ? 3 : 4, (u) => !szkic.inna && u.opis === szkic.opis).map((u) => (
              <label key={u.opis} className="opcja">
                <input type="radio" name="za-co" checked={!szkic.inna && szkic.opis === u.opis} onChange={() => { ustaw({ opis: u.opis, stawkaVat: u.stawkaVat, inna: false }); setBlad('') }} />
                <span className="opcja__tekst"><strong>{u.opis}</strong><span className="opcja__opis">VAT {u.stawkaVat}%{u.ostatniaKwotaNetto ? ` · ostatnio ${formatZl(u.ostatniaKwotaNetto, { bezGroszy: true })} netto` : ''}</span></span>
              </label>
            ))}
            <label className="opcja">
              <input type="radio" name="za-co" checked={!!szkic.inna} onChange={() => ustaw({ inna: true, opis: '' })} />
              <span className="opcja__tekst"><strong>Inna usługa</strong></span>
            </label>
          </fieldset>
          {szkic.inna && (
            <div className="pole">
              <label htmlFor="opis">Nazwa usługi</label>
              <input id="opis" value={szkic.opis ?? ''} onChange={(e) => ustaw({ opis: e.target.value })} placeholder="np. Projekt ulotki" />
            </div>
          )}
          {!prosty && (
            <div className="pole">
              <label htmlFor="stawka">Stawka VAT</label>
              <select id="stawka" value={szkic.stawkaVat} onChange={(e) => ustaw({ stawkaVat: Number(e.target.value) })}>
                {STAWKI.map((s) => <option key={s} value={s}>{s}%</option>)}
              </select>
            </div>
          )}
          <fieldset className="wybor wybor--poziomy">
            <legend className="sekcja-tytul">Wpisujesz kwotę</legend>
            {(['netto', 'brutto'] as const).map((tr) => (
              <label key={tr} className="opcja">
                <input type="radio" name="tryb" checked={szkic.tryb === tr} onChange={() => ustaw({ tryb: tr })} />
                <span className="opcja__tekst"><strong>{tr === 'netto' ? 'bez VAT (netto)' : 'z VAT (brutto)'}</strong></span>
              </label>
            ))}
          </fieldset>
          <div className="pole">
            <label htmlFor="kwota">Kwota {szkic.tryb === 'netto' ? 'netto' : 'brutto'} w zł</label>
            <input id="kwota" inputMode="decimal" autoComplete="off" value={szkic.kwotaTekst} onChange={(e) => { ustaw({ kwotaTekst: e.target.value }); setBlad('') }} placeholder="np. 1230,50" aria-describedby="kwota-wynik" aria-invalid={!!blad && !kwoty} />
          </div>
          <div id="kwota-wynik" className="karta karta--neutralna kwoty-na-zywo" data-testid="podsumowanie-kwot" aria-live="polite">
            {kwoty ? (
              <>
                <span>Netto {formatZl(kwoty.netto)} · VAT {formatZl(kwoty.vat)}</span>
                <strong>Klient zapłaci {formatZl(kwoty.brutto)}</strong>
              </>
            ) : <span>Wpisz kwotę, a policzymy VAT.</span>}
          </div>
          {blad && <p className="pole__blad" role="alert">{blad}</p>}
          <Dol><Przycisk onClick={krok2}>Dalej</Przycisk></Dol>
        </>
      )}
      {krok === 3 && kontrahent && kwoty && (
        <SprawdzIPotwierdz
          wiersze={[
            ['Nabywca', kontrahent.nazwa],
            ['NIP nabywcy', kontrahent.nip],
            ['Usługa', szkic.opis ?? ''],
            ['Netto', formatZl(kwoty.netto)],
            [`VAT ${szkic.stawkaVat}%`, formatZl(kwoty.vat)],
            ['Brutto', formatZl(kwoty.brutto)],
            ['Twój adres', stanOsoby.adresFirmy ?? firma.adres],
            ['Data wystawienia', formatData(DZIS)],
            ['Termin płatności', formatData(dodajDni(DZIS, 14))],
          ]}
          uwaga="Po wysłaniu faktura trafi do KSeF i klient od razu ją zobaczy. Błąd poprawisz fakturą korygującą."
          etykieta="Wyślij do KSeF"
          zajete="Wysyłanie do KSeF…"
          onPotwierdz={wyslijDoKsef}
        />
      )}
      {krok === 3 && !(kontrahent && kwoty) && <Navigate to={t(wyslana ? `faktury/${wyslana}` : `${BAZA}/1`)} replace />}
    </>
  )
}

/** Pierwsze `n` pozycji, a jeśli wybrana jest dalej — także ona, żeby wybór nigdy nie był ukryty. */
function zWybranym<T>(lista: T[], n: number, wybrana: (x: T) => boolean): T[] {
  const pocz = lista.slice(0, n)
  const w = lista.find(wybrana)
  return w && !pocz.includes(w) ? [...pocz, w] : pocz
}
