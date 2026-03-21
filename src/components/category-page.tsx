import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { FinderHeader } from '@/components/finder-header'
import { Breadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from '@/components/breadcrumbs'
import { StepSelection } from '@/components/step-selection'
import { ProductResults } from '@/components/product-results'
import {
  CATEGORY_MAP,
  STEP_VALUE_LABELS,
  filterProducts,
  parseStepParams,
  getCurrentStep,
  type CategorySlug,
} from '@/lib/finder-config'

interface CategoryPageProps {
  kategorie: CategorySlug
  segments: string[] // additional URL segments after category
}

export function CategoryPage({ kategorie, segments }: CategoryPageProps) {
  const catDef = CATEGORY_MAP.get(kategorie)
  if (!catDef) return null

  const params = parseStepParams(kategorie, segments)
  const products = filterProducts(params)
  const currentStep = getCurrentStep(kategorie, segments)
  const isResults = !currentStep

  // Build breadcrumbs
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', href: '/' },
    ...(segments.length > 0 || isResults
      ? [{ label: catDef.label, href: `/${kategorie}` }]
      : [{ label: catDef.label }]),
  ]

  // Add segments to breadcrumbs
  let path = `/${kategorie}`
  segments.forEach((seg, i) => {
    const stepDef = catDef.steps[i]
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
  const totalSteps = catDef.steps.length + 1 // +1 for results
  const currentStepNum = segments.length + 1

  // Back href
  const backHref = segments.length > 0
    ? `/${kategorie}/${segments.slice(0, -1).join('/')}`
    : '/'

  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative z-10">
      <FinderHeader />

      <main className="flex-1">
        <h1 className="sr-only">Hamburg Papier Produktberater — {catDef.label}</h1>

        <div className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          {isResults ? (
            <ProductResults
              products={products}
              title={catDef.label}
              kategorie={kategorie}
              backHref={backHref}
            />
          ) : (
            <div className="max-w-3xl mx-auto">
              <div className="text-center mb-10 animate-fade-up">
                <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">
                  Schritt {currentStepNum} von {totalSteps}
                </div>
                <h2 className="font-display font-extrabold text-4xl uppercase text-navy text-balance">
                  {currentStep.title}
                </h2>
                <p className="text-muted-foreground mt-2">{currentStep.subtitle}</p>
              </div>

              <StepSelection
                step={currentStep}
                basePath={`/${kategorie}${segments.length > 0 ? '/' + segments.join('/') : ''}`}
              />

              <div className="flex justify-start mt-8">
                <Link href={backHref} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy transition-colors rounded">
                  <ArrowLeft size={16} /> Zurück
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* SEO Content Block (only on first step / category page) */}
        {segments.length === 0 && (
          <section className="bg-white py-12 px-4 mt-4">
            <div className="max-w-3xl mx-auto">
              <p className="text-steel leading-relaxed text-sm">{catDef.seoContent}</p>
            </div>
          </section>
        )}
      </main>

      <footer className="bg-navy border-t border-white/5 py-4 text-center text-xs text-white/35">
        © {new Date().getFullYear()} Hamburg Papier ·{' '}
        <a href="https://www.hamburgpapier-shop.de" target="_blank" rel="noopener" className="hover:text-white/60 transition-colors">
          hamburgpapier-shop.de
        </a>
        {' '}· Alle Preise inkl. 19% MwSt.
      </footer>

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
