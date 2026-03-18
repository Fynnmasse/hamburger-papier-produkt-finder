import { lazy, Suspense, useEffect, useState } from 'react'
import { HeroLanding } from '@/components/ui/hero-1'
import LoadingLines from '@/components/ui/loading-lines'

const ProductFinder = lazy(() => import('@/components/ProductFinder'))

type View = 'hero' | 'finder'

export default function App() {
  const [view, setView] = useState<View>('hero')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400)
    return () => clearTimeout(t)
  }, [])

  return (
    <>
      <LoadingLines />
      <AppContent view={view} setView={setView} ready={ready} />
    </>
  )
}

function AppContent({ view, setView, ready }: { view: View; setView: (v: View) => void; ready: boolean }) {

  if (view === 'finder') {
    return (
      <div className="min-h-screen bg-sand font-body flex flex-col">
        {/* Sticky header */}
        <header className="sticky top-0 z-50 bg-navy border-b-2 border-teal">
          <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
            <button onClick={() => setView('hero')} className="hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
              <img src="/Logo.svg" alt="Hamburg Papier" width="160" height="42" className="h-8 w-auto" />
            </button>
            <a
              href="https://www.hamburgpapier-shop.de"
              target="_blank" rel="noopener"
              className="text-xs font-semibold text-white/70 border border-white/20 px-3 py-1.5 rounded hover:text-white hover:border-white/50 transition-colors"
            >
              Zum Shop ↗
            </a>
          </div>
        </header>

        <main className="flex-1">
          <h1 className="sr-only">Hamburg Papier Produktberater</h1>
          <Suspense fallback={<div className="min-h-screen bg-sand" />}>
            <ProductFinder onBack={() => setView('hero')} />
          </Suspense>
        </main>

        <footer className="bg-navy border-t border-white/5 py-4 text-center text-xs text-white/35">
          © {new Date().getFullYear()} Hamburg Papier ·{' '}
          <a href="https://www.hamburgpapier-shop.de" target="_blank" rel="noopener" className="hover:text-white/60 transition-colors">
            hamburgpapier-shop.de
          </a>
          {' '}· Alle Preise inkl. 19% MwSt.
        </footer>
      </div>
    )
  }

  return (
    <HeroLanding
      ready={ready}
      logo={{ src: '/Logo.svg', alt: 'Hamburg Papier Logo', companyName: '' }}
      navigation={[
        { name: 'Produkte',   href: 'https://www.hamburgpapier-shop.de' },
        { name: 'Kontakt',    href: 'https://www.hamburgpapier-shop.de/kontakt' },
      ]}
      loginText="Zum Shop"
      loginHref="https://www.hamburgpapier-shop.de"
      title={<>Den richtigen <span className="text-primary">Artikel</span> finden</> as unknown as string}
      description="Beantworten Sie ein paar kurze Fragen und wir empfehlen Ihnen sofort die passenden Produkte für Ihren Betrieb — ohne langes Suchen."
      announcementBanner={{
        text: 'B2B Hygienepapier Großhandel —',
        linkText: '179 Produkte im Shop entdecken',
        linkHref: 'https://www.hamburgpapier-shop.de',
      }}
      callToActions={[
        { text: 'Jetzt starten',          variant: 'primary',   onClick: () => setView('finder') },
        { text: 'Alle Produkte anzeigen', variant: 'secondary', onClick: () => setView('finder') },
      ]}
      titleSize="large"
    />
  )
}
