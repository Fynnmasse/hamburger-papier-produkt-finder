import type { Metadata } from 'next'
import { FinderHeader } from '@/components/finder-header'
import { Breadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from '@/components/breadcrumbs'
import { VergleichInhalt } from '@/components/vergleich-inhalt'
import { fetchAllProducts } from '@/lib/shopware-api'
import { mapShopwareToProducts } from '@/lib/product-mapper'
import type { Product } from '@/lib/products'

interface VergleichKategorieConfig {
  label: string
  seoText: string
  filter: (p: Product) => boolean
}

const VERGLEICH_CONFIG: Record<string, VergleichKategorieConfig> = {
  // Toilettenpapier aufgesplittet
  'toilettenpapier-kleinrollen': {
    label: 'Toilettenpapier Kleinrollen',
    seoText: 'Kleinrollen-Toilettenpapier ist der Standard für jeden Rollenhalter — ob im Büro, in der Gastronomie oder in öffentlichen Einrichtungen. Der Grundpreis pro Rolle zeigt Ihnen die günstigste Option. Große Paletten senken den Stückpreis deutlich.',
    filter: p => p.category === 'toilettenpapier' && !p.name.toLowerCase().includes('jumbo') && !p.name.toLowerCase().includes('spender') && p.layers > 0,
  },
  'jumbotoilettenpapier': {
    label: 'Jumbotoilettenpapier',
    seoText: 'Jumborollen für Toilettenpapier-Spender bieten deutlich mehr Meter pro Rolle und reduzieren den Wartungsaufwand in stark frequentierten WC-Anlagen. Vergleichen Sie hier alle Jumborollen nach dem günstigsten Grundpreis pro Rolle.',
    filter: p => p.category === 'toilettenpapier' && p.name.toLowerCase().includes('jumbo') && p.layers > 0,
  },
  // Papierhandtücher (bleibt)
  papierhandtuecher: {
    label: 'Papierhandtücher',
    seoText: 'Bei Papierhandtüchern ist der Grundpreis pro Blatt oder pro Tuch der entscheidende Vergleichswert. Große Kartons und Paletten bieten deutlich günstigere Stückpreise als kleine Verpackungseinheiten.',
    filter: p => p.category === 'papierhandtuecher',
  },
  // Handtuchrollen (bleibt)
  handtuchrollen: {
    label: 'Handtuchrollen',
    seoText: 'Handtuchrollen werden in verschiedenen Längen und Durchmessern angeboten. Der Preis pro Rolle ermöglicht einen fairen Vergleich über alle Varianten hinweg — von Standard-Rollen bis zu Autocut-Systemen.',
    filter: p => p.category === 'handtuchrollen',
  },
  // Putzpapier aufgesplittet
  'putzpapier-rollen': {
    label: 'Putzpapier-Rollen',
    seoText: 'Industrie-Putzrollen eignen sich für Werkstätten, Produktionshallen und Reinräume. Vergleichen Sie alle Putzpapier-Rollen nach dem günstigsten Grundpreis — von kleinen Kartons bis zu wirtschaftlichen Paletten.',
    filter: p => p.category === 'putzpapier' && /putz|werkstatt/i.test(p.name),
  },
  'putzpapier-aerzte': {
    label: 'Ärzte- & Liegenrollen',
    seoText: 'Ärzte- und Liegenrollen aus Zellstoff sind in Arztpraxen, Krankenhäusern und Physiotherapiepraxen Standard. Vergleichen Sie hier alle Varianten nach dem günstigsten Grundpreis pro Rolle.',
    filter: p => p.category === 'putzpapier' && /ärzt|liegen/i.test(p.name),
  },
  'putzpapier-mikrofaser': {
    label: 'Mikrofaser & Wischmop',
    seoText: 'Mikrofasertücher und Wischmops sind die wiederverwendbare Alternative für die tägliche Unterhaltsreinigung. Vergleichen Sie alle Produkte nach dem günstigsten Stückpreis.',
    filter: p => p.category === 'putzpapier' && /mikrofaser|wischmop/i.test(p.name),
  },
  // Küchenrollen aufgesplittet
  kuechenrollen: {
    label: 'Küchenrollen',
    seoText: 'Küchenrollen in verschiedenen Größen und Qualitäten für die Profiküche, Teeküchen und Aufenthaltsräume. Vergleichen Sie alle Küchenrollen nach dem günstigsten Grundpreis pro Rolle.',
    filter: p => p.category === 'kuechenrollen',
  },
  servietten: {
    label: 'Servietten',
    seoText: 'Servietten sind in der Gastronomie und Hotellerie unverzichtbar. Vergleichen Sie verschiedene Formate und Qualitäten nach dem günstigsten Grundpreis pro Stück.',
    filter: p => p.category === 'servietten',
  },
  kosmetiktuecher: {
    label: 'Kosmetiktücher',
    seoText: 'Kosmetiktücher in der Box sind ideal für Hotelzimmer, Empfangsbereiche und Konferenzräume. Vergleichen Sie alle Varianten nach dem günstigsten Stückpreis.',
    filter: p => p.category === 'kosmetiktuecher',
  },
  // Spender (bleibt)
  spender: {
    label: 'Spender & Zubehör',
    seoText: 'Spender und Zubehör für Papierhandtücher, Toilettenpapier und Seife im Preisvergleich. Vergleichen Sie verschiedene Spender-Systeme nach dem besten Preis-Leistungs-Verhältnis.',
    filter: p => p.category === 'spender',
  },
}

const ALL_SLUGS = Object.keys(VERGLEICH_CONFIG)

export function generateStaticParams() {
  return ALL_SLUGS.map(slug => ({ kategorie: slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ kategorie: string }> }): Promise<Metadata> {
  const { kategorie } = await params
  const config = VERGLEICH_CONFIG[kategorie]
  const label = config?.label || kategorie
  return {
    title: `${label} Preisvergleich — Grundpreis pro Rolle | Hamburgpapier`,
    description: `Vergleichen Sie alle ${label} nach dem günstigsten Grundpreis pro Rolle. B2B Großhandelspreise netto zzgl. MwSt.`,
  }
}

export default async function VergleichKategoriePage({ params }: { params: Promise<{ kategorie: string }> }) {
  const { kategorie } = await params
  const config = VERGLEICH_CONFIG[kategorie]
  if (!config) return null

  const shopwareProducts = await fetchAllProducts()
  const mappedProducts = mapShopwareToProducts(shopwareProducts)

  const allProducts = mappedProducts.length > 0
    ? mappedProducts
    : (await import('@/lib/products')).PRODUCTS

  const products = allProducts.filter(config.filter)

  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', href: '/' },
    { label: 'Preisvergleich', href: '/vergleich' },
    { label: config.label },
  ]

  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative z-10">
      <FinderHeader />

      <main className="flex-1">
        <h1 className="sr-only">{config.label} Preisvergleich — Hamburgpapier</h1>

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
                {config.label}
              </h2>
              <p className="text-muted-foreground mt-1 text-sm">
                Alle Produkte sortiert nach günstigstem Grundpreis. Preise netto zzgl. 19% MwSt.
              </p>
            </div>

            <VergleichInhalt
              products={products}
              kategorie={kategorie}
              kategorieLabel={config.label}
            />
          </div>
        </div>

        {config.seoText && (
          <section className="bg-white py-12 px-4 mt-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-steel leading-relaxed text-sm">{config.seoText}</p>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-navy border-t border-white/5 py-4 text-center text-xs text-white/35">
        © {new Date().getFullYear()} Hamburgpapier ·{' '}
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
              name: `${config.label} Preisvergleich`,
              numberOfItems: Math.min(products.length, 20),
              itemListElement: products.slice(0, 20).map((p, i) => ({
                '@type': 'ListItem',
                position: i + 1,
                item: {
                  '@type': 'Product',
                  name: p.name,
                  url: p.url || `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}`,
                  brand: { '@type': 'Brand', name: 'Hamburgpapier' },
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
