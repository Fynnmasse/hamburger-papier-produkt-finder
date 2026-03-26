import Image from 'next/image'
import { ChevronRight } from 'lucide-react'
import type { Product } from '@/lib/products'
import { getReferencedId, sampleProductIds } from '@/lib/sample-products'
import { MusterButton } from '@/components/muster-button'
import { formatPreis, getGuenstigsterGrundpreis, getGrundpreisEinheit } from '@/lib/price-utils'

interface ProductCardProps {
  p: Product
  index: number
  kategorie?: string
  isBesterPreis?: boolean
  utmMedium?: string
}

export function ProductCard({ p, index, kategorie, isBesterPreis, utmMedium }: ProductCardProps) {
  const utmBestellen = `utm_source=produktfinder&utm_medium=${utmMedium || 'bestellen'}&utm_campaign=${kategorie || 'allgemein'}`
  const shopUrl = p.url
    ? `${p.url}?${utmBestellen}`
    : `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}&${utmBestellen}`

  const hasStaffel = p.staffelpreise && p.staffelpreise.length > 0
  const grundpreis = getGuenstigsterGrundpreis(p)
  const einheit = getGrundpreisEinheit(p)

  // Preis: günstigster Staffelpreis oder Fallback auf price/1.19
  const displayPrice = hasStaffel
    ? p.staffelpreise![p.staffelpreise!.length - 1].unitPrice
    : p.price > 0 ? p.price / 1.19 : 0
  const priceLabel = displayPrice > 0
    ? `${hasStaffel ? 'ab ' : ''}${formatPreis(displayPrice)} €`
    : 'Auf Anfrage'

  const name = p.name.length > 80 ? p.name.substring(0, 77) + '…' : p.name
  const referencedId = p.url ? getReferencedId(p.url) : null
  const canSample = referencedId !== null && sampleProductIds.has(referencedId)

  return (
    <div
      className="bg-white border border-border rounded-xl overflow-hidden flex flex-col opacity-0 translate-y-2 animate-card-in hover:-translate-y-1 hover:scale-[1.01] hover:border-primary hover:shadow-lg transition-[border-color,box-shadow,transform,opacity] duration-200 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, animationFillMode: 'forwards' }}
    >
      <a
        href={shopUrl}
        aria-label={`Im Shop kaufen: ${p.name}`}
        className="flex flex-col flex-1 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-inset"
      >
        <div className="w-full aspect-[4/3] bg-white overflow-hidden relative flex items-center justify-center p-2">
          {isBesterPreis && (
            <span className="absolute top-2 left-2 z-10 bg-green-100 text-green-800 text-[.65rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded">
              Bester Preis pro {einheit}
            </span>
          )}
          {p.img ? (
            <Image
              src={p.img}
              alt={p.name}
              width={400}
              height={300}
              className="w-full h-full object-contain"
              loading="lazy"
            />
          ) : (
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#c8c4bf" strokeWidth="1.5" aria-hidden="true">
              <rect x="8" y="8" width="32" height="32" rx="4" />
              <path d="M16 28l6-8 5 6 4-4 5 6" /><circle cx="18" cy="20" r="3" />
            </svg>
          )}
        </div>
        <div className="p-4 pb-2 flex flex-col gap-2 flex-1">
          <div className="flex flex-wrap gap-1">
            {p.quantity === 'palette' && <span className="tag-dark">Palette</span>}
            {p.quantity === 'karton' && <span className="tag-blue">Karton</span>}
            {p.layers >= 1 && <span className="tag-grey">{p.layers}-lagig</span>}
            {p.material === 'premium' && <span className="tag-orange">Premium</span>}
            {p.material === 'recycling' && <span className="tag-green">ECO</span>}
            {p.eco?.includes('ecolabel') && <span className="tag-green">EU Ecolabel ✓</span>}
            {!p.eco?.includes('ecolabel') && p.eco?.includes('blauer-engel') && <span className="tag-green">Blauer Engel</span>}
          </div>
          <p className="text-sm font-semibold text-navy leading-snug flex-1">{name}</p>
          <div className="mt-1">
            <div className="font-display font-extrabold text-xl text-navy leading-none tabular-nums">{priceLabel}</div>
            {grundpreis !== null && (
              <div className="text-xs text-primary font-semibold mt-0.5 tabular-nums">
                = {formatPreis(grundpreis)} € / {einheit}
              </div>
            )}
          </div>
        </div>
      </a>

      <div className="px-4 pb-4 pt-2">
        <div className={`grid gap-2 ${canSample ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <a
            href={shopUrl}
            className="group relative overflow-hidden flex items-center justify-center bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg min-h-[44px] hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <span className="mr-6 transition-opacity duration-500 group-hover:opacity-0 whitespace-nowrap">Jetzt bestellen</span>
            <span className="absolute right-1 top-1 bottom-1 rounded z-10 grid w-7 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
              <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
            </span>
          </a>
          {canSample && (
            <MusterButton referencedId={referencedId} kategorie={kategorie} />
          )}
        </div>
      </div>
    </div>
  )
}
