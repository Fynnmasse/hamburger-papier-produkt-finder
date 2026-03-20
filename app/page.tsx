import { FinderHero } from '@/components/finder-hero'
import { CATEGORIES } from '@/lib/finder-config'

export default function HomePage() {
  return (
    <>
      <FinderHero categories={CATEGORIES} />

      {/* SEO Content Block — unter den Kacheln */}
      <section className="bg-white font-body py-16 px-4">
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
    </>
  )
}
