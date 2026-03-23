import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import type { Product } from '@/lib/products'
import { getReferencedId, sampleProductIds } from '@/lib/sample-products'
import { MusterButton } from '@/components/muster-button'
import { formatPreis, getGuenstigsterGrundpreis, getGrundpreisEinheit } from '@/lib/price-utils'

interface ProductCardProps {
  p: Product
  index: number
  kategorie?: string
  isBesterPreis?: boolean
}

export function ProductCard({ p, index, kategorie, isBesterPreis }: ProductCardProps) {
  const utmBestellen = `utm_source=produktfinder&utm_medium=bestellen&utm_campaign=${kategorie || 'allgemein'}`
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
        target="_blank"
        rel="noopener"
        aria-label={`Im Shop kaufen: ${p.name}`}
        className="flex flex-col flex-1 cursor-pointer focus-visible:outline-none"
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
            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#c8c4bf" strokeWidth="1.5">
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
            <div className="font-display font-extrabold text-xl text-navy leading-none">{priceLabel}</div>
            {grundpreis !== null && (
              <div className="text-xs text-primary font-semibold mt-0.5">
                = {formatPreis(grundpreis)} € / {einheit}
              </div>
            )}
            <div className="text-xs text-muted-foreground mt-0.5">zzgl. 19% MwSt.</div>
          </div>
        </div>
      </a>

      {/* Staffelpreis-Tabelle */}
      {hasStaffel && p.staffelpreise!.length > 1 && (
        <div className="px-4 pb-2">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-sand/60 text-steel">
                <th className="text-left py-1 px-2 font-semibold">Ab</th>
                <th className="text-right py-1 px-2 font-semibold">Stückpreis</th>
                <th className="text-right py-1 px-2 font-semibold">Grundpreis</th>
              </tr>
            </thead>
            <tbody>
              {p.staffelpreise!.map((tier, i) => (
                <tr
                  key={tier.quantity}
                  className={i === p.staffelpreise!.length - 1 ? 'font-bold text-navy' : 'text-steel'}
                >
                  <td className="py-1 px-2">{tier.quantity} Stk.</td>
                  <td className="text-right py-1 px-2">{formatPreis(tier.unitPrice)} €</td>
                  <td className="text-right py-1 px-2">
                    {tier.referencePrice
                      ? `${formatPreis(tier.referencePrice.price)} € / ${tier.referencePrice.unitName}`
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="px-4 pb-4 pt-2">
        <div className={`grid gap-2 ${canSample ? 'grid-cols-2' : 'grid-cols-1'}`}>
          <a
            href={shopUrl}
            target="_blank"
            rel="noopener"
            className="flex items-center justify-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg min-h-[40px] hover:bg-primary/90 transition-colors"
          >
            Jetzt bestellen
            <ExternalLink size={12} />
          </a>
          {canSample && (
            <MusterButton referencedId={referencedId} kategorie={kategorie} />
          )}
        </div>
      </div>
    </div>
  )
}
