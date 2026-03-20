'use client'

import { useState, useEffect } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { AuroraHeroBg } from '@/components/ui/aurora-hero-bg-1'
import { cn } from '@/lib/utils'
import LoadingLines from '@/components/ui/loading-lines'

const NAV_ITEMS = [
  { name: 'Produkte', href: 'https://www.hamburgpapier-shop.de' },
  { name: 'Kontakt', href: 'https://www.hamburgpapier-shop.de/kontakt' },
]

export function HeroSection() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [ready, setReady] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 1400)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileMenuOpen])

  return (
    <>
      <LoadingLines />
      <AuroraHeroBg>
        {/* Header / Nav */}
        <header className="absolute inset-x-0 top-0 z-10">
          <nav aria-label="Global" className="flex items-center justify-between p-4 sm:p-6 lg:px-8">
            <div className="flex lg:flex-1">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">Hamburg Papier</span>
                <img alt="Hamburg Papier Logo" src="/Logo.svg" width="200" height="53" className="h-8 sm:h-10 w-auto" />
              </a>
            </div>

            <div className="flex lg:hidden">
              <button type="button" onClick={() => setMobileMenuOpen(true)} className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white/70 hover:text-white transition-colors">
                <span className="sr-only">Menü öffnen</span>
                <Menu aria-hidden="true" className="size-6" />
              </button>
            </div>

            <div className="hidden lg:flex lg:gap-x-8 xl:gap-x-12">
              {NAV_ITEMS.map((item) => (
                <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white/80 hover:text-white transition-colors rounded">
                  {item.name}
                </a>
              ))}
            </div>

            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <a href="https://www.hamburgpapier-shop.de" className="text-sm/6 font-semibold text-white/80 hover:text-white transition-colors rounded">
                Zum Shop <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </nav>

          {/* Mobile menu — Backdrop */}
          <div
            className={cn(
              'fixed inset-0 z-40 bg-black/60 lg:hidden transition-opacity duration-300',
              mobileMenuOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
            )}
            aria-hidden="true"
            onClick={() => setMobileMenuOpen(false)}
          />

          {/* Mobile menu — Slide-in panel */}
          <div
            role="dialog"
            aria-modal="true"
            aria-label="Navigation"
            className={cn(
              'fixed inset-y-0 right-0 z-50 w-full sm:max-w-sm bg-[#0f2035] px-4 py-4 sm:px-6 sm:py-6 overflow-y-auto sm:ring-1 sm:ring-white/10 lg:hidden transition-transform duration-300 ease-in-out',
              mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            )}
          >
            <div className="flex items-center justify-between">
              <span className="font-display font-extrabold text-lg tracking-widest uppercase text-white">Hamburg Papier</span>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-white/70 hover:text-white transition-colors">
                <span className="sr-only">Menü schließen</span>
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-2 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                <div className="space-y-2 py-6">
                  {NAV_ITEMS.map((item) => (
                    <a key={item.name} href={item.href} onClick={() => setMobileMenuOpen(false)} className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                      {item.name}
                    </a>
                  ))}
                </div>
                <div className="py-6">
                  <a href="https://www.hamburgpapier-shop.de" className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                    Zum Shop
                  </a>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Hero content */}
        <div className="relative px-6 pt-4 min-h-screen flex flex-col justify-center">
          <div className="mx-auto max-w-4xl pt-20 sm:pt-24 text-center">
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 })}
              transition={{ duration: 0.6 }}
              className="hidden sm:mb-6 sm:flex sm:justify-center"
            >
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-white/60 ring-1 ring-white/20 hover:ring-white/40 transition-all">
                B2B Hygienepapier Großhandel —{' '}
                <a href="https://www.hamburgpapier-shop.de" className="font-semibold text-teal-300 hover:text-teal-200 transition-colors">
                  <span aria-hidden="true" className="absolute inset-0" />
                  179 Produkte im Shop entdecken <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </motion.div>

            <motion.h1
              initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
              animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 })}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
              className="text-3xl sm:text-5xl md:text-7xl font-display font-bold tracking-tight text-balance text-white"
            >
              Den richtigen <span className="text-primary">Artikel</span> finden
            </motion.h1>

            <motion.p
              initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
              animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 })}
              transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
              className="mt-6 sm:mt-8 text-base sm:text-lg font-medium text-pretty text-white/65 sm:text-xl/8 max-w-2xl mx-auto"
            >
              Beantworten Sie ein paar kurze Fragen und wir empfehlen Ihnen sofort die passenden Produkte für Ihren Betrieb — ohne langes Suchen.
            </motion.p>

            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 })}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.55 }}
              className="mt-8 sm:mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6"
            >
              <a
                href="#finder"
                className="rounded-lg bg-primary px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 transition-colors"
              >
                Jetzt starten
              </a>
              <a
                href="https://www.hamburgpapier-shop.de"
                className="text-sm font-semibold text-white/80 hover:text-white transition-colors group rounded"
              >
                Alle Produkte anzeigen <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </a>
            </motion.div>
          </div>
        </div>
      </AuroraHeroBg>
    </>
  )
}
