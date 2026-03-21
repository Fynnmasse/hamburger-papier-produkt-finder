import { FinderHeader } from '@/components/finder-header'
import { CategoryGrid } from '@/components/category-grid'
import { CATEGORIES } from '@/lib/finder-config'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative">
      <FinderHeader />

      <main className="flex-1 relative z-10">
        <div className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            {/* Titel-Block */}
            <div className="text-center mb-10 animate-fade-up">
              <h1 className="font-display font-extrabold text-4xl uppercase text-navy text-balance">
                Finden Sie das richtige Hygienepapier
              </h1>
              <p className="text-muted-foreground mt-2">
                Wählen Sie eine Kategorie um zu starten
              </p>
            </div>

            {/* Trust Badges */}
            <ul className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-steel text-xs sm:text-sm mb-8 list-none p-0 m-0">
              <li>179 Produkte</li>
              <li aria-hidden="true" className="text-steel/40">·</li>
              <li>Kostenloser Versand</li>
              <li aria-hidden="true" className="text-steel/40">·</li>
              <li>B2B Großhandelspreise</li>
            </ul>

            {/* Category Grid — identisch zu Unterseiten */}
            <CategoryGrid categories={CATEGORIES.map(({ slug, label, icon }) => ({ slug, label, icon }))} />
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

      <footer className="relative z-10 bg-navy border-t border-white/5 py-4 text-center text-xs text-white/35">
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
