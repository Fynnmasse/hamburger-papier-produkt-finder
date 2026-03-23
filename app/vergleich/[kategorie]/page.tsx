import type { Metadata } from 'next'
import { FinderHeader } from '@/components/finder-header'
import { Breadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from '@/components/breadcrumbs'
import { VergleichInhalt } from '@/components/vergleich-inhalt'
import { CATEGORIES, type CategorySlug } from '@/lib/finder-config'
import { fetchAllProducts } from '@/lib/shopware-api'
import { mapShopwareToProducts } from '@/lib/product-mapper'

const VERGLEICH_KATEGORIEN = CATEGORIES.filter(c => c.slug !== 'seife')
const CATEGORY_MAP = new Map(CATEGORIES.map(c => [c.slug, c]))

const VERGLEICH_SEO: Record<string, string> = {
  toilettenpapier: 'Der Preis pro Rolle ist der fairste Vergleichswert beim Kauf von Toilettenpapier im Großhandel. Durch den Kauf größerer Mengen (Palettenversand) sinkt der Rollenpreis deutlich. Vergleichen Sie hier alle Toilettenpapier-Varianten nach dem günstigsten Grundpreis pro Rolle.',
  papierhandtuecher: 'Bei Papierhandtüchern ist der Grundpreis pro Blatt oder pro Tuch der entscheidende Vergleichswert. Große Kartons und Paletten bieten deutlich günstigere Stückpreise als kleine Verpackungseinheiten.',
  handtuchrollen: 'Handtuchrollen werden in verschiedenen Längen und Durchmessern angeboten. Der Preis pro Rolle ermöglicht einen fairen Vergleich über alle Varianten hinweg — von Standard-Rollen bis zu Autocut-Systemen.',
  putzpapier: 'Putzpapier und Reinigungstücher variieren stark in Größe, Material und Ergiebigkeit. Der Grundpreis pro Rolle hilft Ihnen die wirtschaftlichste Option für Ihren Betrieb zu finden.',
  kuechenrollen: 'Küchenrollen, Servietten und Kosmetiktücher im Grundpreis-Vergleich. Finden Sie die günstigste Option für Gastronomie und Hotellerie.',
  spender: 'Spender und Zubehör für Papierhandtücher, Toilettenpapier und Seife im Preisvergleich. Vergleichen Sie verschiedene Spender-Systeme nach dem besten Preis-Leistungs-Verhältnis.',
}

// Multi-Category Slugs (kuechenrollen umfasst auch servietten und kosmetiktuecher)
const MULTI_CATEGORY_MAP: Record<string, string[]> = {
  kuechenrollen: ['kuechenrollen', 'servietten', 'kosmetiktuecher'],
}

export function generateStaticParams() {
  return VERGLEICH_KATEGORIEN.map(c => ({ kategorie: c.slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string }> }): Promise<Metadata> {
  const { kategorie } = await params
  const cat = CATEGORY_MAP.get(kategorie as CategorySlug)
  const label = cat?.label || kategorie
  return {
    title: `${label} Preisvergleich — Grundpreis pro Rolle | Hamburg Papier`,
    description: `Vergleichen Sie alle ${label} nach dem günstigsten Grundpreis pro Rolle. B2B Großhandelspreise netto zzgl. MwSt.`,
  }
}

export default async function VergleichKategoriePage({ params }: { params: Promise<{ kategorie: string }> }) {
  const { kategorie } = await params
  const cat = CATEGORY_MAP.get(kategorie as CategorySlug)
  if (!cat) return null

  const shopwareProducts = await fetchAllProducts()
  const mappedProducts = mapShopwareToProducts(shopwareProducts)

  const allowedCategories = MULTI_CATEGORY_MAP[kategorie] || [kategorie]
  const products = mappedProducts.length > 0
    ? mappedProducts.filter(p => allowedCategories.includes(p.category))
    : (await import('@/lib/products')).PRODUCTS.filter(p => allowedCategories.includes(p.category))

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', href: '/' },
    { label: 'Preisvergleich', href: '/vergleich' },
    { label: cat.label },
  ]

  const seoText = VERGLEICH_SEO[kategorie] || ''

  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative z-10">
      <FinderHeader />

      <main className="flex-1">
        <h1 className="sr-only">{cat.label} Preisvergleich — Hamburg Papier</h1>

        <div className="py-10 px-4">
          <div className="max-w-6xl mx-auto">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <div className="max-w-6xl mx-auto">
            <div className="mb-8 animate-fade-up">
              <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">
                Preisvergleich
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl uppercase text-navy">
                {cat.label}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Alle Produkte sortiert nach günstigstem Grundpreis. Preise netto zzgl. 19% MwSt.
              </p>
            </div>

            <VergleichInhalt
              products={products}
              kategorie={kategorie}
              kategorieLabel={cat.label}
            />
          </div>
        </div>

        {seoText && (
          <section className="bg-white py-12 px-4 mt-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-steel leading-relaxed text-sm">{seoText}</p>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-navy border-t border-white/5 py-4 text-center text-xs text-white/35">
        © {new Date().getFullYear()} Hamburg Papier ·{' '}
        <a href="https://www.hamburgpapier-shop.de" target="_blank" rel="noopener" className="hover:text-white/60 transition-colors">
          hamburgpapier-shop.de
        </a>
        {' '}· Alle Preise zzgl. 19% MwSt.
      </footer>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      {products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: `${cat.label} Preisvergleich`,
              numberOfItems: Math.min(products.length, 20),
              itemListElement: products.slice(0, 20).map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'Product',
                  name: p.name,
                  url: p.url || `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}`,
                  brand: { '@type': 'Brand', name: 'Hamburg Papier' },
                  ...(p.price > 0 ? {
                    offers: {
                      '@type': 'Offer',
                      priceCurrency: 'EUR',
                      price: (p.price / 1.19).toFixed(2),
                      availability: 'https://schema.org/InStock',
                    },
                  } : {}),
                },
              })),
            }),
          }}
        />
      )}
    </div>
  )
}
