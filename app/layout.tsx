import type { Metadata } from 'next'
import { AuroraBackground } from '@/components/ui/aurora-background'
import { DM_Sans, Comfortaa } from 'next/font/google'
import '@/index.css'

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
  weight: ['400', '500', '600'],
})

const comfortaa = Comfortaa({
  subsets: ['latin'],
  variable: '--font-comfortaa',
  display: 'swap',
  weight: ['600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'Produktberater — Hamburg Papier | Hygienepapier B2B Großhandel',
    template: '%s | Hamburg Papier Produktfinder',
  },
  description:
    'Finden Sie das passende Hygienepapier für Ihren Betrieb. Toilettenpapier, Papierhandtücher, Putzpapier und Spender — 179 Produkte im B2B Großhandel von Hamburg Papier.',
  metadataBase: new URL('https://www.hamburgpapier-shop.de'),
  alternates: { canonical: '/produktberater' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Hamburg Papier',
    title: 'Produktberater — Hamburg Papier | Hygienepapier B2B Großhandel',
    description:
      'Finden Sie das passende Hygienepapier für Ihren Betrieb. 179 Produkte im B2B Großhandel.',
  },
  twitter: {
    card: 'summary',
    title: 'Produktberater — Hamburg Papier',
    description:
      'B2B Hygienepapier Großhandel — 179 Produkte. Finden Sie den richtigen Artikel für Ihren Betrieb.',
  },
  icons: { icon: '/favicon.svg' },
  other: { 'theme-color': '#1a2b3d' },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${dmSans.variable} ${comfortaa.variable}`}>
      <head>
          <link rel="preconnect" href="https://www.hamburgpapier-shop.de" />
        </head>
        <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-primary focus:text-white focus:rounded-lg focus:text-sm focus:font-semibold"
        >
          Zum Inhalt springen
        </a>
        <div className="fixed inset-0 z-0 opacity-70 pointer-events-none" aria-hidden="true">
          <AuroraBackground showRadialGradient>
            <div />
          </AuroraBackground>
        </div>
        <main id="main-content" className="relative z-10">{children}</main>
      </body>
    </html>
  )
}
