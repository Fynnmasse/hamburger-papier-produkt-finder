import type { Metadata } from 'next'
import Script from 'next/script'
import { SITE_URL } from '@/lib/constants'
import { DM_Sans, Comfortaa } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import '@/index.css'

const GA_ID = 'G-8WYQHX3TB5'

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
    default: 'Produktberater — Hamburgpapier | Hygienepapier B2B Großhandel',
    template: '%s | Hamburgpapier Produktfinder',
  },
  description:
    'Finden Sie das passende Hygienepapier für Ihren Betrieb. Toilettenpapier, Papierhandtücher, Putzpapier und Spender — 179 Produkte im B2B Großhandel von Hamburgpapier.',
  metadataBase: new URL(SITE_URL),
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Hamburgpapier',
    title: 'Produktberater — Hamburgpapier | Hygienepapier B2B Großhandel',
    description:
      'Finden Sie das passende Hygienepapier für Ihren Betrieb. 179 Produkte im B2B Großhandel.',
  },
  twitter: {
    card: 'summary',
    title: 'Produktberater — Hamburgpapier',
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
        <main id="main-content">{children}</main>
        <Analytics />
        <Script id="Cookiebot" src="https://consent.cookiebot.com/uc.js" data-cbid="ba573d32-3648-4edd-a327-1719d85bf242" data-blockingmode="auto" strategy="afterInteractive" />
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${GA_ID}');
          `}
        </Script>
        <Script id="shop-click-tracking" strategy="afterInteractive">
          {`
            document.addEventListener('click', function(e) {
              var link = e.target.closest ? e.target.closest('a[href*="hamburgpapier-shop.de"]') : null;
              if (!link) return;
              if (typeof gtag === 'function') {
                gtag('event', 'produktfinder_to_shop', {
                  event_category: 'produktfinder',
                  event_label: link.href
                });
              }
            });
            document.addEventListener('submit', function(e) {
              var form = e.target.closest ? e.target.closest('form[action*="hamburgpapier-shop.de"]') : null;
              if (!form) return;
              if (typeof gtag === 'function') {
                gtag('event', 'produktfinder_to_shop', {
                  event_category: 'produktfinder',
                  event_label: form.action
                });
              }
            });
          `}
        </Script>
        <Script id="smartlook" strategy="afterInteractive">
          {`
            function loadSmartlook() {
              if (window.smartlookLoaded) return;
              window.smartlookLoaded = true;
              var o = window.smartlook = function(){ o.api.push(arguments) };
              o.api = [];
              var c = document.createElement('script');
              c.async = true;c.type = 'text/javascript';c.charset = 'utf-8';
              c.src = 'https://web-sdk.smartlook.com/recorder.js';
              document.getElementsByTagName('head')[0].appendChild(c);
              window.smartlook('init', '5ca38c734765fc0cad5a810f546763571a8ef325', { region: 'eu' });
            }
            window.addEventListener('CookiebotOnAccept', function() {
              if (Cookiebot.consent.statistics) loadSmartlook();
            });
            if (window.Cookiebot && window.Cookiebot.consent && window.Cookiebot.consent.statistics) loadSmartlook();
          `}
        </Script>
      </body>
    </html>
  )
}
