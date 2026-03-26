'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowUpRight, Menu, X, Phone } from 'lucide-react'

export function FinderHeader() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-navy border-b-2 border-teal">
      <div className="max-w-6xl mx-auto px-5 h-14 flex items-center justify-between">
        <Link href="/" className="hover:opacity-80 transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
          <Image src="/Logo.svg" alt="Hamburgpapier" width={160} height={42} className="h-8 w-auto" priority />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden sm:flex items-center gap-3">
          <a href="tel:+494056194820" className="text-xs text-white/60 hover:text-white transition-colors flex items-center gap-1.5 whitespace-nowrap">
            <Phone size={13} aria-hidden="true" />
            040 56 194 82 20
          </a>
          <span className="w-px h-4 bg-white/15" aria-hidden="true" />
          <Link
            href="/vergleich"
            className="text-xs font-semibold text-white/70 border border-white/20 rounded-full h-9 px-3.5 flex items-center hover:text-white hover:border-white/50 transition-colors whitespace-nowrap"
          >
            Preisvergleich
          </Link>
          <a
            href="https://www.hamburgpapier-shop.de"
            className="group relative text-xs font-semibold text-white/70 border border-white/20 rounded-full h-9 p-0.5 ps-3.5 pe-10 flex items-center overflow-hidden hover:text-white hover:border-white/50 hover:ps-10 hover:pe-3.5 transition-all duration-500 whitespace-nowrap"
          >
            <span className="relative z-10 transition-all duration-500">Zum Shop</span>
            <div className="absolute right-0.5 w-8 h-8 bg-white/15 text-white rounded-full flex items-center justify-center transition-all duration-500 group-hover:right-[calc(100%-34px)] group-hover:rotate-45">
              <ArrowUpRight size={14} aria-hidden="true" />
            </div>
          </a>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setOpen(!open)}
          aria-label={open ? 'Menü schließen' : 'Menü öffnen'}
          aria-expanded={open}
          className="sm:hidden w-10 h-10 flex items-center justify-center text-white/70 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <nav className="sm:hidden bg-navy border-t border-white/10 px-5 py-4 flex flex-col gap-3 animate-fade-up">
          <a
            href="tel:+494056194820"
            className="text-sm text-white/60 hover:text-white transition-colors py-2 flex items-center gap-2"
          >
            <Phone size={15} aria-hidden="true" />
            040 56 194 82 20
          </a>
          <Link
            href="/vergleich"
            onClick={() => setOpen(false)}
            className="text-sm font-semibold text-white/80 hover:text-white transition-colors py-2"
          >
            Preisvergleich
          </Link>
          <a
            href="https://www.hamburgpapier-shop.de"
            onClick={() => setOpen(false)}
            className="text-sm font-semibold text-white/80 hover:text-white transition-colors py-2 flex items-center gap-1.5"
          >
            Zum Shop <ArrowUpRight size={14} aria-hidden="true" />
          </a>
        </nav>
      )}
    </header>
  )
}
