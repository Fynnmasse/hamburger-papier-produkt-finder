import { Truck, PackageOpen, Headset } from 'lucide-react'
import { FinderHeader } from '@/components/finder-header'
import { FinderFooter } from '@/components/finder-footer'
import { CategoryGrid } from '@/components/category-grid'

import { AnimatedCounter } from '@/components/ui/animated-counter'
import { CATEGORIES } from '@/lib/finder-config'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative">
      <FinderHeader />

      <main className="flex-1 relative z-10">
        <div className="bg-sand py-14 md:py-20 px-4">
          <div className="max-w-4xl mx-auto relative z-10">
            {/* Titel-Block */}
            <div className="text-center mb-12">
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

            {/* Trust-Leiste */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10">
              <div className="flex items-center gap-2 text-steel text-[13px]">
                <Truck size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                Kostenloser Versand
              </div>
<div className="flex items-center gap-2 text-steel text-[13px]">
                <PackageOpen size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                Kostenlose Muster
              </div>
              <div className="flex items-center gap-2 text-steel text-[13px]">
                <Headset size={18} className="text-primary flex-shrink-0" aria-hidden="true" />
                Persönlicher Service
              </div>
            </div>

            {/* Category Grid — 8 Kacheln in 2 Reihen */}
            <CategoryGrid categories={[
              // Reihe 1
              ...(['papierhandtuecher', 'toilettenpapier', 'handtuchrollen', 'putzpapier'] as const).map(
                slug => { const c = CATEGORIES.find(c => c.slug === slug)!; return { slug: c.slug, label: c.label, icon: c.icon } }
              ),
              // Reihe 2
              ...(['kuechenrollen', 'waschraum', 'reinigung'] as const).map(
                slug => { const c = CATEGORIES.find(c => c.slug === slug)!; return { slug: c.slug, label: c.label, icon: c.icon } }
              ),
              { slug: 'vergleich', label: 'Preisvergleich', icon: 'preisvergleich-icon-white.svg', href: '/vergleich', variant: 'highlight' as const, subtitle: 'Günstigster Preis pro Rolle' },
            ]} />

            {/* Zahlen-Leiste */}
            <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 mt-10">
              <div className="text-center">
                <span className="block font-bold text-[22px] sm:text-[28px] text-navy tabular-nums"><AnimatedCounter target={179} /></span>
                <span className="block text-steel text-[13px]">Produkte</span>
              </div>
              <span className="hidden sm:block w-px h-10 bg-black/10" aria-hidden="true" />
              <div className="text-center">
                <span className="block font-bold text-[22px] sm:text-[28px] text-navy tabular-nums"><AnimatedCounter target={6800} suffix="+" separator="." /></span>
                <span className="block text-steel text-[13px]">Zufriedene Kunden</span>
              </div>
              <span className="hidden sm:block w-px h-10 bg-black/10" aria-hidden="true" />
              <div className="text-center">
                <span className="block font-bold text-[22px] sm:text-[28px] text-navy tabular-nums"><AnimatedCounter target={100} suffix="%" /></span>
                <span className="block text-steel text-[13px]">Versandkostenfrei</span>
              </div>
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

      <FinderFooter />

      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'WebApplication',
            name: 'Hamburgpapier Produktberater',
            description:
              'B2B-Produktberater für Hygienepapier. Finden Sie Toilettenpapier, Papierhandtücher, Putzpapier und Spender für Ihren Betrieb.',
            url: 'https://produktfinder.hamburgpapier-shop.de',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'Web',
            offers: {
              '@type': 'AggregateOffer',
              itemCount: 179,
              priceCurrency: 'EUR',
            },
            provider: {
              '@type': 'Organization',
              name: 'Hamburgpapier',
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
