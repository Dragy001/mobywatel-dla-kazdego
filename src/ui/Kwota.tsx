import { formatZl, type Grosze } from '../logika/pieniadze'

export function Kwota({ grosze, duza, bezGroszy }: { grosze: Grosze; duza?: boolean; bezGroszy?: boolean }) {
  return <span className={duza ? 'kwota kwota--duza' : 'kwota'}>{formatZl(grosze, { bezGroszy })}</span>
}
