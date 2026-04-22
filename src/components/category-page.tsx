import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'
import { FinderHeader } from '@/components/finder-header'
import { FinderFooter } from '@/components/finder-footer'
import { Breadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from '@/components/breadcrumbs'
import { StepSelection } from '@/components/step-selection'
import { ProductResults } from '@/components/product-results'
import { CrossSelling } from '@/components/cross-selling'
import {
  CATEGORY_MAP,
  STEP_VALUE_LABELS,
  DIMENSION_SEO,
  filterProducts,
  parseStepParams,
  getCurrentStep,
  resolveSteps,
  getCrossSelling,
  type CategorySlug,
} from '@/lib/finder-config'
import { fetchAllProducts } from '@/lib/shopware-api'
import { mapShopwareToProducts } from '@/lib/product-mapper'

interface CategoryPageProps {
  kategorie: CategorySlug
  segments: string[] // additional URL segments after category
}

export async function CategoryPage({ kategorie, segments }: CategoryPageProps) {
  const catDef = CATEGORY_MAP.get(kategorie)
  if (!catDef) return null

  // Produkte von Shopware laden und mappen (gecacht, alle 30 Sek aktualisiert)
  const shopwareProducts = await fetchAllProducts()
  const mappedProducts = mapShopwareToProducts(shopwareProducts)
  // Shopware-Produkte nutzen wenn verfügbar, sonst Fallback auf statische Daten
  const externalProducts = mappedProducts.length > 0 ? mappedProducts : undefined

  const params = parseStepParams(kategorie, segments)
  const products = filterProducts(params, externalProducts)
  const currentStep = getCurrentStep(kategorie, segments, externalProducts)
  const isResults = !currentStep

  // Soft-404-Prävention: Ergebnis-Seite ohne Produkte ist für Google eine leere Seite.
  // Hartes 404 statt leerem Ergebnis-Grid.
  if (isResults && segments.length > 0 && products.length === 0) {
    notFound()
  }

  // Cross-Selling
  const crossSelling = isResults ? getCrossSelling(kategorie, segments) : null
  let crossSellingProducts: typeof products = []
  if (crossSelling && !crossSelling.links) {
    if (crossSelling.productNums) {
      // Exakte Artikelnummern filtern
      const nums = new Set(crossSelling.productNums)
      const allProducts = filterProducts({ category: crossSelling.productCategory, subtype: crossSelling.productSubtype }, externalProducts)
      crossSellingProducts = allProducts.filter(p => nums.has(p.num))
    } else {
      crossSellingProducts = filterProducts({ category: crossSelling.productCategory, subtype: crossSelling.productSubtype }, externalProducts).slice(0, 3)
    }
  }

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', href: '/' },
    ...(segments.length > 0 || isResults
      ? [{ label: catDef.label, href: `/${kategorie}` }]
      : [{ label: catDef.label }]),
  ]

  // Add segments to breadcrumbs
  const steps = resolveSteps(catDef, segments)
  let path = `/${kategorie}`
  segments.forEach((seg, i) => {
    const stepDef = steps[i]
    if (!stepDef) return
    const labelMap = STEP_VALUE_LABELS[stepDef.slug]
    const label = labelMap?.[seg] || seg
    path += `/${seg}`
    if (i < segments.length - 1 || isResults) {
      breadcrumbs.push({ label, href: path })
    } else {
      breadcrumbs.push({ label })
    }
  })

  if (isResults && segments.length > 0) {
    breadcrumbs.push({ label: 'Ergebnis' })
  }

  // Step progress
  const totalSteps = steps.length + 1 // +1 for results
  const currentStepNum = segments.length + 1

  // Spender path detection
  const isSpenderPath = kategorie === 'papierhandtuecher' && segments[0] === 'spender'
  const dimensionSlug = isSpenderPath && segments.length >= 2 ? segments[1] : null
  const dimensionSeoText = dimensionSlug ? DIMENSION_SEO[dimensionSlug] : null

  // Back href
  const backHref = segments.length > 0
    ? `/${kategorie}/${segments.slice(0, -1).join('/')}`
    : '/'

  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative z-10">
      <FinderHeader />

      <main className="flex-1">
        <h1 className="sr-only">Hamburgpapier Produktberater — {catDef.label}</h1>

        <div className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {isResults ? (
            <>
              {isSpenderPath && products.length > 0 && (
                <div className="max-w-6xl mx-auto mb-4 animate-fade-up">
                  <div className="inline-flex items-center gap-2 bg-green-50 border border-green-200 text-green-800 text-sm font-medium px-4 py-2 rounded-lg">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M13.3 4.3a1 1 0 0 1 0 1.4l-6 6a1 1 0 0 1-1.4 0l-3-3a1 1 0 1 1 1.4-1.4L6.6 9.6l5.3-5.3a1 1 0 0 1 1.4 0z" fill="currentColor"/></svg>
                    Passt in Ihren vorhandenen Spender
                  </div>
                </div>
              )}
              <ProductResults
                products={products}
                title={catDef.label}
                kategorie={kategorie}
                backHref={backHref}
              />
              {crossSelling && products.length > 0 && (
                <CrossSelling
                  title={crossSelling.title}
                  description={crossSelling.description}
                  linkHref={crossSelling.linkHref}
                  linkLabel={crossSelling.linkLabel}
                  links={crossSelling.links}
                  products={crossSellingProducts}
                  utmCampaign={crossSelling.utmCampaign}
                />
              )}
            </>
          ) : (
            <div className={`${currentStep.options.length >= 6 ? 'max-w-5xl' : 'max-w-3xl'} mx-auto`}>
              <div className="text-center mb-10 animate-fade-up">
                <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">
                  Schritt {currentStepNum} von {totalSteps}
                </div>
                <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl uppercase text-navy text-balance">
                  {currentStep.title}
                </h2>
                <p className="text-muted-foreground mt-2">{currentStep.subtitle}</p>
              </div>

              <StepSelection
                step={currentStep}
                basePath={`/${kategorie}${segments.length > 0 ? '/' + segments.join('/') : ''}`}
              />

              <div className="flex justify-start mt-8">
                <Link href={backHref} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                  <ArrowLeft size={16} /> Zurück
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* SEO Content Block */}
        {segments.length === 0 && (
          <section className="bg-white py-12 px-4 mt-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-steel leading-relaxed text-sm">{catDef.seoContent}</p>
            </div>
          </section>
        )}
        {dimensionSeoText && !isResults && (
          <section className="bg-white py-12 px-4 mt-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-steel leading-relaxed text-sm">{dimensionSeoText}</p>
            </div>
          </section>
        )}
      </main>

      <FinderFooter />

      {/* Breadcrumb JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />

      {/* Product JSON-LD on results pages */}
      {isResults && products.length > 0 && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'ItemList',
              name: `${catDef.label} — Ergebnis`,
              numberOfItems: products.length,
              itemListElement: products.slice(0, 10).map((p, i) => ({
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
