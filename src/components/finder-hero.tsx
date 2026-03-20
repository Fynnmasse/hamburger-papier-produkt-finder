'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion, useReducedMotion } from 'framer-motion'
import type { CategoryDef } from '@/lib/finder-config'
import DynamicWaveBackground from '@/components/ui/dynamic-wave-background'

// ── Animation Variants ──

const EASE_OUT: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fadeUpVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: EASE_OUT },
  },
}

const fadeDownVariants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: EASE_OUT },
  },
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.25,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.95 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring' as const,
      stiffness: 300,
      damping: 24,
    },
  },
}

// ── Component ──

export function FinderHero({ categories }: { categories: CategoryDef[] }) {
  const shouldReduceMotion = useReducedMotion()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setReady(true), 250)
    return () => clearTimeout(t)
  }, [])

  const animate = shouldReduceMotion ? 'visible' : (ready ? 'visible' : 'hidden')

  return (
    <section className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-navy">
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
        <motion.header
          initial={shouldReduceMotion ? false : 'hidden'}
          animate={animate}
          variants={fadeDownVariants}
          className="flex items-center justify-between px-4 sm:px-6 lg:px-8 pt-4 pb-2"
        >
          <a
            href="https://www.hamburgpapier-shop.de"
            className="-m-1.5 p-1.5 min-h-[44px] inline-flex items-center rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            <Image src="/Logo.svg" alt="Hamburg Papier" width={200} height={53} className="h-8 sm:h-10 w-auto" priority />
          </a>
          <a
            href="https://www.hamburgpapier-shop.de"
            className="min-h-[44px] inline-flex items-center text-xs sm:text-sm font-semibold text-white/80 hover:text-white transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
          >
            Zum Shop <span aria-hidden="true" className="ml-1">&rarr;</span>
          </a>
        </motion.header>

        {/* Main: Headline + Trust Bar + Grid — vertically centered */}
        <div className="flex-1 flex flex-col justify-center px-4 sm:px-6 lg:px-8 pb-4 sm:pb-8">
          <div className="max-w-5xl mx-auto w-full">

            {/* Headline */}
            <motion.div
              initial={shouldReduceMotion ? false : 'hidden'}
              animate={animate}
              variants={fadeUpVariants}
              className="text-center mb-2 sm:mb-3"
            >
              <h1 className="font-display font-bold text-3xl sm:text-4xl lg:text-5xl tracking-tight leading-tight text-white text-balance">
                Finden Sie das richtige Hygienepapier — in{' '}
                <span className="text-teal">3 Klicks</span>
              </h1>
            </motion.div>

            {/* Subtitle */}
            <motion.p
              initial={shouldReduceMotion ? false : 'hidden'}
              animate={animate}
              variants={fadeUpVariants}
              className="text-center text-white/70 text-sm sm:text-base mb-3 sm:mb-4"
            >
              Wählen Sie eine Kategorie um zu starten
            </motion.p>

            {/* Trust Badges */}
            <motion.div
              initial={shouldReduceMotion ? false : 'hidden'}
              animate={animate}
              variants={fadeUpVariants}
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-white/60 text-xs sm:text-sm mb-6 sm:mb-8"
            >
              <span>179 Produkte</span>
              <span aria-hidden="true" className="text-white/30">·</span>
              <span>Kostenloser Versand ab Palette</span>
              <span aria-hidden="true" className="text-white/30">·</span>
              <span>B2B Großhandelspreise</span>
            </motion.div>

            {/* Category Grid */}
            <motion.div
              initial={shouldReduceMotion ? false : 'hidden'}
              animate={animate}
              variants={containerVariants}
              className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 sm:gap-3.5 lg:gap-5"
            >
              {categories.map(({ slug, label, icon }) => (
                <motion.div
                  key={slug}
                  variants={cardVariants}
                  whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
                  whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                >
                  <Link
                    href={`/${slug}`}
                    className="group relative bg-white/[0.09] backdrop-blur-md border border-white/[0.15] rounded-xl p-3.5 sm:p-5 lg:p-6 text-center flex flex-col items-center gap-2 sm:gap-3 overflow-hidden hover:bg-white/[0.16] hover:border-white/30 hover:shadow-lg hover:shadow-teal/5 transition-[background-color,border-color,box-shadow] duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-gradient-to-r after:from-transparent after:via-white/20 after:to-transparent"
                  >
                    <Image
                      src={`/${icon}`}
                      alt={label}
                      width={64}
                      height={64}
                      className="h-9 sm:h-12 lg:h-16 w-auto opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                    <span className="font-semibold text-sm sm:text-base text-white/85 group-hover:text-white leading-tight transition-colors">
                      {label}
                    </span>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {/* Shop link */}
            <motion.div
              initial={shouldReduceMotion ? false : 'hidden'}
              animate={animate}
              variants={fadeUpVariants}
              className="text-center mt-5 sm:mt-6"
            >
              <a
                href="https://www.hamburgpapier-shop.de"
                target="_blank"
                rel="noopener"
                className="group inline-flex items-center gap-1 text-sm text-white/70 hover:text-white/90 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-navy"
              >
                oder alle 179 Produkte im Shop ansehen
                <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
              </a>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
