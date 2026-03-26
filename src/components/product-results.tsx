import Link from 'next/link'
import { Home, Edit, BarChart3, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/products'
import { findGuenstigsteOption } from '@/lib/price-utils'

interface ProductResultsProps {
  products: Product[]
  title: string
  kategorie: string
  backHref: string
}

export function ProductResults({ products, title, kategorie, backHref }: ProductResultsProps) {
  const shown = products.slice(0, 24)
  const guenstigste = findGuenstigsteOption(shown)

  return (
    <>
      <div className="max-w-6xl mx-auto mb-8 animate-fade-up">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-display font-extrabold text-3xl uppercase text-navy">{title}</h2>
            <p className="text-sm text-muted-foreground mt-1" aria-live="polite" aria-atomic="true">
              {products.length === 0
                ? 'Keine Produkte gefunden'
                : `${products.length} Produkte gefunden${products.length > 24 ? ' — Top 24 werden angezeigt' : ''}`}
            </p>
          </div>
          <div className="flex gap-3 items-center">
            <Link href={backHref} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <Edit size={15} aria-hidden="true" /> Suche anpassen
            </Link>
            <Link href="/" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
              <Home size={15} aria-hidden="true" /> Neu starten
            </Link>
          </div>
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="text-center py-16 max-w-sm mx-auto">
          <div className="text-5xl mb-4">🔍</div>
          <h3 className="font-display font-bold text-2xl uppercase text-navy mb-2">Keine Produkte gefunden</h3>
          <p className="text-muted-foreground text-sm mb-6">Mit diesen Filtereinstellungen haben wir leider keine Treffer. Versuchen Sie andere Kombinationen.</p>
          <Link href="/" className="group relative overflow-hidden inline-flex items-center justify-center bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
            <span className="mr-6 transition-opacity duration-500 group-hover:opacity-0 whitespace-nowrap">Alle Kategorien anzeigen</span>
            <span className="absolute right-1 top-1 bottom-1 rounded z-10 grid w-8 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
              <ChevronRight size={16} strokeWidth={2} aria-hidden="true" />
            </span>
          </Link>
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {shown.map((p, i) => (
            <ProductCard key={p.num} p={p} index={i} kategorie={kategorie} isBesterPreis={guenstigste?.num === p.num} />
          ))}
        </div>
      )}

      {shown.length > 0 && kategorie !== 'waschraum' && kategorie !== 'reinigung' && (
        <div className="max-w-6xl mx-auto mt-6">
          <Link
            href={`/vergleich/${kategorie}`}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            <BarChart3 size={15} aria-hidden="true" />
            Alle {title} nach Grundpreis vergleichen
          </Link>
        </div>
      )}
    </>
  )
}
