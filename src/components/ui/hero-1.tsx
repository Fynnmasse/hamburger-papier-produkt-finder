'use client'

import React, { useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Menu, X } from 'lucide-react'
import { AuroraHeroBg } from '@/components/ui/aurora-hero-bg-1'

interface NavigationItem {
  name: string
  href: string
}

interface AnnouncementBanner {
  text: string
  linkText: string
  linkHref: string
}

interface CallToAction {
  text: string
  href?: string
  onClick?: () => void
  variant: 'primary' | 'secondary'
}

interface HeroLandingProps {
  logo?: {
    src: string
    alt: string
    companyName: string
  }
  navigation?: NavigationItem[]
  loginText?: string
  loginHref?: string
  title: string | React.ReactNode
  description: string
  announcementBanner?: AnnouncementBanner
  callToActions?: CallToAction[]
  titleSize?: 'small' | 'medium' | 'large'
  gradientColors?: { from: string; to: string }
  className?: string
  style?: React.CSSProperties
  ready?: boolean
}

const defaultProps: Partial<HeroLandingProps> = {
  titleSize: 'large',
}

export function HeroLanding(props: HeroLandingProps) {
  const {
    logo, navigation, loginText, loginHref,
    title, description, announcementBanner, callToActions,
    titleSize, className, style, ready,
  } = { ...defaultProps, ...props }

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const shouldReduceMotion = useReducedMotion()

  const titleSizeClass =
    titleSize === 'small'  ? 'text-2xl sm:text-3xl md:text-5xl' :
    titleSize === 'medium' ? 'text-2xl sm:text-4xl md:text-6xl' :
                             'text-3xl sm:text-5xl md:text-7xl'

  const renderCallToAction = (cta: CallToAction, index: number) => {
    const handleClick = cta.onClick
      ? (e: React.MouseEvent) => { e.preventDefault(); cta.onClick!() }
      : undefined

    if (cta.variant === 'primary') {
      return (
        <motion.a
          key={index}
          href={cta.href ?? '#'}
          onClick={handleClick}
          whileHover={shouldReduceMotion ? {} : { y: -2 }}
          whileTap={shouldReduceMotion ? {} : { y: 0 }}
          className="rounded-lg bg-primary px-5 py-2.5 sm:px-6 sm:py-3 text-sm font-semibold text-primary-foreground shadow-lg hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 transition-colors"
        >
          {cta.text}
        </motion.a>
      )
    }
    return (
      <a
        key={index}
        href={cta.href ?? '#'}
        onClick={handleClick}
        className="text-sm font-semibold text-white/80 hover:text-white transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded"
      >
        {cta.text} <span aria-hidden="true" className="inline-block transition-transform group-hover:translate-x-1">→</span>
      </a>
    )
  }

  return (
    <AuroraHeroBg className={className} style={style}>
      {/* Header / Nav */}
      <header className="absolute inset-x-0 top-0 z-10">
        <nav aria-label="Global" className="flex items-center justify-between p-4 sm:p-6 lg:px-8">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="sr-only">{logo?.companyName}</span>
              {logo?.src
                ? <img alt={logo.alt} src={logo.src} width="200" height="53" className="h-8 sm:h-10 w-auto" fetchPriority="high" />
                : logo?.companyName && (
                  <span className="font-display font-bold text-xl tracking-widest uppercase text-white">
                    {logo.companyName}
                  </span>
                )
              }
            </a>
          </div>

          <div className="flex lg:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="-m-2.5 inline-flex items-center justify-center rounded-md p-2.5 text-white/70 hover:text-white transition-colors"
            >
              <span className="sr-only">Menü öffnen</span>
              <Menu aria-hidden="true" className="size-6" />
            </button>
          </div>

          {navigation && navigation.length > 0 && (
            <div className="hidden lg:flex lg:gap-x-8 xl:gap-x-12">
              {navigation.map((item) => (
                <a key={item.name} href={item.href} className="text-sm/6 font-semibold text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded">
                  {item.name}
                </a>
              ))}
            </div>
          )}

          {loginText && loginHref && (
            <div className="hidden lg:flex lg:flex-1 lg:justify-end">
              <a href={loginHref} className="text-sm/6 font-semibold text-white/80 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-navy rounded">
                {loginText} <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          )}
        </nav>

        {/* Mobile menu dialog */}
        <Dialog open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <DialogContent className="fixed inset-y-0 right-0 z-50 w-full overflow-y-auto bg-[#0f2035] px-4 py-4 sm:px-6 sm:py-6 sm:max-w-sm sm:ring-1 sm:ring-white/10 lg:hidden">
            <div className="flex items-center justify-between">
              <a href="#" className="-m-1.5 p-1.5">
                <span className="sr-only">{logo?.companyName}</span>
                {logo?.companyName && (
                  <span className="font-display font-extrabold text-lg tracking-widest uppercase text-white">
                    {logo.companyName}
                  </span>
                )}
              </a>
              <button type="button" onClick={() => setMobileMenuOpen(false)} className="-m-2.5 rounded-md p-2.5 text-white/70 hover:text-white transition-colors">
                <span className="sr-only">Menü schließen</span>
                <X aria-hidden="true" className="size-6" />
              </button>
            </div>
            <div className="mt-2 flow-root">
              <div className="-my-6 divide-y divide-white/10">
                {navigation && navigation.length > 0 && (
                  <div className="space-y-2 py-6">
                    {navigation.map((item) => (
                      <a key={item.name} href={item.href} className="-mx-3 block rounded-lg px-3 py-2 text-base/7 font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                        {item.name}
                      </a>
                    ))}
                  </div>
                )}
                {loginText && loginHref && (
                  <div className="py-6">
                    <a href={loginHref} className="-mx-3 block rounded-lg px-3 py-2.5 text-base/7 font-semibold text-white/80 hover:bg-white/10 hover:text-white transition-colors">
                      {loginText}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </header>

      {/* Hero content */}
      <div className="relative px-6 pt-4 min-h-screen flex flex-col justify-center">
        <div className="mx-auto max-w-4xl pt-20 sm:pt-24 text-center">
          {/* Announcement banner */}
          {announcementBanner && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: -10 }}
              animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: -10 })}
              transition={{ duration: 0.6 }}
              className="hidden sm:mb-6 sm:flex sm:justify-center"
            >
              <div className="relative rounded-full px-3 py-1 text-sm/6 text-white/60 ring-1 ring-white/20 hover:ring-white/40 transition-all">
                {announcementBanner.text}{' '}
                <a href={announcementBanner.linkHref} className="font-semibold text-teal-300 hover:text-teal-200 transition-colors">
                  <span aria-hidden="true" className="absolute inset-0" />
                  {announcementBanner.linkText} <span aria-hidden="true">&rarr;</span>
                </a>
              </div>
            </motion.div>
          )}

          <motion.h1
            initial={shouldReduceMotion ? false : { opacity: 0, y: 30 }}
            animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 })}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.1 }}
            className={`${titleSizeClass} font-display font-bold tracking-tight text-balance text-white`}
          >
            {title}
          </motion.h1>

          <motion.p
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 })}
            transition={{ duration: 0.9, ease: 'easeOut', delay: 0.3 }}
            className="mt-6 sm:mt-8 text-base sm:text-lg font-medium text-pretty text-white/65 sm:text-xl/8 max-w-2xl mx-auto"
          >
            {description}
          </motion.p>

          {callToActions && callToActions.length > 0 && (
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 15 }}
              animate={shouldReduceMotion ? undefined : (ready ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 })}
              transition={{ duration: 0.8, ease: 'easeOut', delay: 0.55 }}
              className="mt-8 sm:mt-10 flex items-center justify-center gap-x-4 sm:gap-x-6"
            >
              {callToActions.map((cta, i) => renderCallToAction(cta, i))}
            </motion.div>
          )}
        </div>
      </div>
    </AuroraHeroBg>
  )
}

export type { HeroLandingProps, NavigationItem, AnnouncementBanner, CallToAction }
