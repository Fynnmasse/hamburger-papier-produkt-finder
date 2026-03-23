import Link from 'next/link'
import { BarChart3, Package, Truck, BadgePercent } from 'lucide-react'
import { FinderHeader } from '@/components/finder-header'
import { CategoryGrid } from '@/components/category-grid'

import { CATEGORIES } from '@/lib/finder-config'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative">
      <FinderHeader />

      <main className="flex-1 relative z-10">
        <div className="bg-sand py-14 md:py-20 px-4">
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Titel-Block */}
            <div className="text-center mb-12 animate-fade-up">
              <span className="inline-block text-[.7rem] font-bold tracking-[.2em] uppercase text-primary mb-3 bg-primary/10 rounded-full px-3 py-1">
                Produktberater
              </span>
              <h1 className="font-display font-extrabold text-3xl sm:text-4xl md:text-5xl uppercase text-navy text-balance">
                Finden Sie das <span className="text-primary">richtige</span> Hygienepapier
              </h1>
              <p className="text-steel mt-3 text-base sm:text-lg">
                Wählen Sie eine Kategorie um zu starten
              </p>
            </div>

            {/* Trust Badges */}
            <ul className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 mb-10 list-none p-0 m-0">
              <li className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm text-navy text-xs sm:text-sm font-medium rounded-full px-3 py-1.5">
                <Package size={14} className="text-primary" aria-hidden="true" />
                179 Produkte
              </li>
              <li className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm text-navy text-xs sm:text-sm font-medium rounded-full px-3 py-1.5">
                <Truck size={14} className="text-primary" aria-hidden="true" />
                Kostenloser Versand
              </li>
              <li className="flex items-center gap-1.5 bg-white/60 backdrop-blur-sm text-navy text-xs sm:text-sm font-medium rounded-full px-3 py-1.5">
                <BadgePercent size={14} className="text-primary" aria-hidden="true" />
                B2B Großhandelspreise
              </li>
            </ul>

            {/* Category Grid */}
            <CategoryGrid categories={CATEGORIES.map(({ slug, label, icon }) => ({ slug, label, icon }))} />

            {/* Preisvergleich Link */}
            <div className="mt-8 text-center">
              <Link
                href="/vergleich"
                className="inline-flex items-center gap-2 text-sm font-medium text-steel hover:text-navy bg-white/60 backdrop-blur-sm rounded-full px-4 py-2 transition-colors"
              >
                <BarChart3 size={16} aria-hidden="true" />
                Preisvergleich — Günstigsten Preis pro Rolle finden
              </Link>
            </div>
          </div>
        </div>

        {/* SEO Content Block */}
        <section className="bg-white py-12 px-4 mt-4">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-display font-bold text-2xl text-navy mb-4">
              Finden Sie das richtige Hygienepapier für Ihren Betrieb — in nur 3 Klicks
            </h2>
            <p className="text-steel leading-relaxed mb-4">
              Unser Produktberater hilft Ihnen, aus über 179 Produkten genau das richtige
              Hygienepapier für Ihren Bedarf zu finden. Ob Toilettenpapier, Papierhandtücher,
              Putzpapier oder Spender — beantworten Sie einfach ein paar kurze Fragen zu
              Ihrem Einsatzbereich und Ihren Anforderungen. Der Berater empfiehlt Ihnen sofort
              die passenden Produkte aus unserem B2B Großhandel-Sortiment.
            </p>
            <p className="text-steel leading-relaxed">
              Wir beliefern Gastronomie, Hotels, Facility Management, Arztpraxen, Werkstätten
              und Industriebetriebe in ganz Deutschland. Profitieren Sie von Großhandelspreisen,
              schnellem Versand und kostenloser Beratung. Alle Produkte sind auch als Palette
              für maximale Kostenersparnis verfügbar.
            </p>
          </div>
        </section>
      </main>

      <footer className="relative z-10 bg-navy border-t border-white/5 py-4 text-center text-xs text-white/35" suppressHydrationWarning>
        © {new Date().getFullYear()} Hamburg Papier ·{' '}
        <a href="https://www.hamburgpapier-shop.de" target="_blank" rel="noopener" className="hover:text-white/60 transition-colors">
          hamburgpapier-shop.de
        </a>
        {' '}· Alle Preise inkl. 19% MwSt.
      </footer>

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Hamburg Papier Produktberater',
            description:
              'B2B-Produktberater für Hygienepapier. Finden Sie Toilettenpapier, Papierhandtücher, Putzpapier und Spender für Ihren Betrieb.',
            url: 'https://www.hamburgpapier-shop.de/produktberater',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'AggregateOffer',
              itemCount: 179,
              priceCurrency: 'EUR',
            },
            provider: {
              '@type': 'Organization',
              name: 'Hamburg Papier',
              url: 'https://www.hamburgpapier-shop.de',
            },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              {
                '@type': 'Question',
                name: 'Welche Papierhandtücher passen in meinen Spender?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Die Falzung entscheidet: Z-Falz ist der Standard für die meisten Spender. C-Falz-Tücher passen in ältere C-Falz-Spender, und Interfold-Tücher sind für Interfold-Spendersysteme konzipiert.',
                },
              },
              {
                '@type': 'Question',
                name: 'Was ist der Unterschied zwischen Recycling- und Zellstoff-Papier?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Recycling-Papier wird aus 100% Altpapier hergestellt, ist nachhaltig und kostengünstig. Zellstoff-Papier besteht aus Frischfasern und ist weicher, weißer und saugstärker.',
                },
              },
              {
                '@type': 'Question',
                name: 'Ab welcher Menge lohnt sich eine Palette?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Eine Palette bietet den besten Preis pro Einheit und lohnt sich bereits ab mittlerem Verbrauch. Für kleinere Bestellungen bieten wir Kartonversand an.',
                },
              },
            ],
          }),
        }}
      />
    </div>
  )
}
