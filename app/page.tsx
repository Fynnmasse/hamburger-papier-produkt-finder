import { HeroSection } from '@/components/hero-section'
import { CategoryGrid } from '@/components/category-grid'
import { CATEGORIES } from '@/lib/finder-config'

export default function HomePage() {
  return (
    <>
      <HeroSection />
      <section id="finder" className="bg-sand font-body py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-display font-extrabold text-4xl uppercase text-navy text-balance">
              Was suchen Sie?
            </h2>
            <p className="text-muted-foreground mt-2">
              Wählen Sie die Produktkategorie, die Sie benötigen.
            </p>
          </div>
          <CategoryGrid categories={CATEGORIES} />
        </div>
      </section>

      {/* SEO Content Block */}
      <section className="bg-white font-body py-16 px-4">
        <div className="max-w-3xl mx-auto prose prose-navy">
          <h2 className="font-display font-bold text-2xl text-navy mb-4">
            Finden Sie das richtige Hygienepapier für Ihren Betrieb — in nur 3 Klicks
          </h2>
          <p className="text-steel leading-relaxed">
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
                  text: 'Die Falzung entscheidet: Z-Falz ist der Standard für die meisten Spender. C-Falz-Tücher passen in ältere C-Falz-Spender, und Interfold-Tücher sind für Interfold-Spendersysteme konzipiert. Prüfen Sie die Spenderbezeichnung oder fragen Sie uns.',
                },
              },
              {
                '@type': 'Question',
                name: 'Was ist der Unterschied zwischen Recycling- und Zellstoff-Papier?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Recycling-Papier wird aus 100% Altpapier hergestellt, ist nachhaltig und kostengünstig. Zellstoff-Papier besteht aus Frischfasern und ist weicher, weißer und saugstärker. Für repräsentative Bereiche empfehlen wir Zellstoff, für Hochfrequenzbereiche Recycling.',
                },
              },
              {
                '@type': 'Question',
                name: 'Ab welcher Menge lohnt sich eine Palette?',
                acceptedAnswer: {
                  '@type': 'Answer',
                  text: 'Eine Palette bietet den besten Preis pro Einheit und lohnt sich bereits ab mittlerem Verbrauch. Hotels, Gastronomie und Industriebetriebe bestellen in der Regel palettenweise. Für kleinere Bestellungen oder Erstbestellungen bieten wir Kartonversand an.',
                },
              },
            ],
          }),
        }}
      />
    </>
  )
}
