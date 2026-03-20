import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
import type { Product } from '@/lib/products'

interface ProductCardProps {
  p: Product
  index: number
  kategorie?: string
}

export function ProductCard({ p, index, kategorie }: ProductCardProps) {
  const utmBase = `utm_source=produktfinder&utm_medium=ergebnis&utm_campaign=${kategorie || 'allgemein'}`
  const shopUrl = p.url
    ? `${p.url}?${utmBase}`
    : `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}&${utmBase}`
  const price = p.price > 0 ? `${(p.price / 1.19).toFixed(2).replace('.', ',')} €` : 'Auf Anfrage'
  const name = p.name.length > 80 ? p.name.substring(0, 77) + '…' : p.name

  return (
    <a
      href={shopUrl}
      target="_blank"
      rel="noopener"
      className="bg-white border border-border rounded-xl overflow-hidden flex flex-col opacity-0 translate-y-2 animate-card-in hover:-translate-y-1 hover:scale-[1.01] hover:border-primary hover:shadow-lg transition-[border-color,box-shadow,transform,opacity] duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, animationFillMode: 'forwards' }}
      aria-label={`Im Shop kaufen: ${p.name}`}
    >
      <div className="w-full aspect-[4/3] bg-white overflow-hidden relative flex items-center justify-center p-2">
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
      <div className="p-4 flex flex-col gap-2 flex-1">
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
        <div className="flex items-center justify-between gap-2 mt-1">
          <div>
            <div className="font-display font-extrabold text-xl text-navy leading-none">{price}</div>
            <div className="text-xs text-muted-foreground mt-0.5">zzgl. 19% MwSt.</div>
          </div>
          <span className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg min-h-[40px] flex-shrink-0">
            Kaufen
            <ExternalLink size={12} />
          </span>
        </div>
      </div>
    </a>
  )
}
