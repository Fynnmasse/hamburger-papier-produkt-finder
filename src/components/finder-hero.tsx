'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { CategoryDef } from '@/lib/finder-config'
import DynamicWaveBackground from '@/components/ui/dynamic-wave-background'

export function FinderHero({ categories }: { categories: CategoryDef[] }) {
  return (
    <section className="relative min-h-screen flex flex-col overflow-hidden bg-navy">
      {/* WebGL Background */}
      <DynamicWaveBackground />

      {/* Vignette overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(10, 22, 40, 0.85) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col flex-1">
        {/* Header */}
        <header className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 pb-2">
          <a href="https://www.hamburgpapier-shop.de" className="-m-1.5 p-1.5">
            <Image src="/Logo.svg" alt="Hamburg Papier" width={200} height={53} className="h-8 sm:h-10 w-auto" priority />
          </a>
          <a
            href="https://www.hamburgpapier-shop.de"
            className="text-xs sm:text-sm font-semibold text-white/60 hover:text-white transition-colors"
          >
            Zum Shop <span aria-hidden="true">&rarr;</span>
          </a>
        </header>

        {/* Main: Headline + Grid — vertically centered */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 pb-8">
          <div className="max-w-5xl mx-auto w-full">
            {/* Headline */}
            <div className="text-center mb-6 sm:mb-8">
              <h1 className="font-display font-bold text-2xl sm:text-3xl md:text-4xl tracking-tight text-white text-balance">
                Finden Sie das richtige Hygienepapier — in 3 Klicks
              </h1>
              <p className="text-white/50 mt-2 text-sm sm:text-base">
                Wählen Sie eine Kategorie um zu starten
              </p>
            </div>

            {/* Category Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {categories.map(({ slug, label, icon }, i) => (
                <Link
                  key={slug}
                  href={`/${slug}`}
                  className="group bg-white/[0.07] backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-5 text-center flex flex-col items-center gap-2 sm:gap-3 hover:bg-white/[0.14] hover:border-white/25 hover:-translate-y-0.5 active:scale-95 transition-all duration-200 animate-card-entrance focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
                  style={{ animationDelay: `${i * 60}ms` }}
                >
                  <Image
                    src={`/${icon}`}
                    alt={label}
                    width={56}
                    height={56}
                    className="h-10 sm:h-14 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                  />
                  <span className="font-semibold text-sm sm:text-base text-white/85 group-hover:text-white leading-tight transition-colors">
                    {label}
                  </span>
                </Link>
              ))}
            </div>

            {/* Shop link */}
            <div className="text-center mt-6">
              <a
                href="https://www.hamburgpapier-shop.de"
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-1 text-sm text-white/40 hover:text-white/70 transition-colors"
              >
                oder alle 179 Produkte im Shop ansehen
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
