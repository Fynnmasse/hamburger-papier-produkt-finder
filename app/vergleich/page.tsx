import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { FinderHeader } from '@/components/finder-header'
import { FinderFooter } from '@/components/finder-footer'
import { Breadcrumbs, breadcrumbJsonLd, type BreadcrumbItem } from '@/components/breadcrumbs'
export const metadata: Metadata = {
  title: 'Preisvergleich nach Grundpreis | Hamburgpapier Produktfinder',
  description: 'Vergleichen Sie alle Hygienepapier-Produkte nach dem günstigsten Grundpreis pro Rolle. B2B Großhandelspreise, versandkostenfrei.',
}

const VERGLEICH_KATEGORIEN: { slug: string; label: string; icon: string }[] = [
  { slug: 'toilettenpapier-kleinrollen', label: 'Toilettenpapier Kleinrollen', icon: 'Toilettenpapier.svg' },
  { slug: 'jumbotoilettenpapier', label: 'Jumbotoilettenpapier', icon: 'Jumbotoilettenpapier.svg' },
  { slug: 'papierhandtuecher', label: 'Papierhandtücher', icon: 'Papierhandtücher.svg' },
  { slug: 'handtuchrollen', label: 'Handtuchrollen', icon: 'Handtuchrollen.svg' },
  { slug: 'putzpapier-rollen', label: 'Putzpapier-Rollen', icon: 'Putzpapier.svg' },
  { slug: 'putzpapier-aerzte', label: 'Ärzte- & Liegenrollen', icon: 'Ärzte und Liegerollen.svg' },
  { slug: 'putzpapier-mikrofaser', label: 'Mikrofaser & Wischmop', icon: 'Wischmopp und Mikrofasertücher.svg' },
  { slug: 'kuechenrollen', label: 'Küchenrollen', icon: 'Küchenrollen.svg' },
  { slug: 'servietten', label: 'Servietten', icon: 'Servietten.svg' },
  { slug: 'kosmetiktuecher', label: 'Kosmetiktücher', icon: 'Kosmetiktücher.svg' },
  { slug: 'spender', label: 'Spender & Zubehör', icon: 'Spender.svg' },
]

export default function VergleichPage() {
  const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Startseite', href: '/' },
    { label: 'Preisvergleich' },
  ]

  return (
    <div className="min-h-screen bg-sand/60 font-body flex flex-col relative z-10">
      <FinderHeader />

      <main className="flex-1">
        <h1 className="sr-only">Preisvergleich nach Grundpreis — Hamburgpapier Produktfinder</h1>

        <div className="py-10 px-4">
          <div className="max-w-4xl mx-auto">
            <Breadcrumbs items={breadcrumbs} />
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 animate-fade-up">
              <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">
                Preisvergleich
              </div>
              <h2 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl uppercase text-navy text-balance">
                Grundpreis vergleichen
              </h2>
              <p className="text-muted-foreground mt-2">
                Vergleichen Sie alle Produkte einer Kategorie nach dem günstigsten Preis pro Rolle.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {VERGLEICH_KATEGORIEN.map(cat => (
                <Link
                  key={cat.slug}
                  href={`/vergleich/${cat.slug}`}
                  className="group bg-white border border-border rounded-xl p-5 flex items-center gap-4 hover:border-primary hover:shadow-md transition-[border-color,box-shadow]"
                >
                  <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center">
                    <Image src={`/${cat.icon}`} alt={cat.label} width={48} height={48} className="w-10 h-10" />
                  </div>
                  <div>
                    <div className="font-display font-bold text-navy group-hover:text-primary transition-colors">
                      {cat.label}
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">
                      Nach Grundpreis sortiert vergleichen
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        <section className="bg-white py-12 px-4 mt-4">
          <div className="max-w-3xl mx-auto">
            <p className="text-steel leading-relaxed text-sm">
              Der Grundpreis pro Rolle oder pro Stück ist der fairste Vergleichswert beim Einkauf von Hygienepapier im B2B-Großhandel. Durch den Kauf größerer Mengen — z.B. im Palettenversand — sinkt der Einzelpreis pro Rolle deutlich. Unsere Vergleichstabellen zeigen Ihnen auf einen Blick die günstigste Option für Ihren Betrieb. Alle Preise verstehen sich netto zzgl. 19% MwSt.
            </p>
          </div>
        </section>
      </main>

      <FinderFooter />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd(breadcrumbs)) }}
      />
    </div>
  )
}
