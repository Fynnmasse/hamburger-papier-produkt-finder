'use client'

import Link from 'next/link'
import Image from 'next/image'

export function FinderHeader() {
  return (
    <header className="sticky top-0 z-50 bg-navy border-b-2 border-teal">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
          <Image src="/Logo.svg" alt="Hamburg Papier" width={160} height={42} className="h-8 w-auto" priority />
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/vergleich"
            className="text-xs font-semibold text-white/70 border border-white/20 px-3 py-1.5 rounded hover:text-white hover:border-white/50 transition-colors"
          >
            Preisvergleich
          </Link>
          <a
            href="https://www.hamburgpapier-shop.de"
            target="_blank" rel="noopener"
            className="text-xs font-semibold text-white/70 border border-white/20 px-3 py-1.5 rounded hover:text-white hover:border-white/50 transition-colors"
          >
            Zum Shop ↗
          </a>
        </div>
      </div>
    </header>
  )
}
