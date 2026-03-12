import React from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface AuroraHeroProps {
  className?: string
  style?: React.CSSProperties
  children?: React.ReactNode
}

export function AuroraHeroBg({ className, style, children }: AuroraHeroProps) {
  return (
    <section
      className={cn(
        'relative w-full min-h-screen flex items-center justify-center overflow-hidden bg-navy',
        className
      )}
      style={style}
      role="banner"
      aria-label="Hero section"
    >
      {/* Aurora gradient background – Hamburg Papier teal/navy palette */}
      <div className="absolute inset-0 overflow-hidden opacity-50" aria-hidden="true">
        <motion.div
          className="absolute inset-[-100%]"
          style={{
            background: `
              repeating-linear-gradient(100deg,
                #008490 10%,
                #135d84 15%,
                #006d78 20%,
                #4b6b8b 25%,
                #008490 30%)
            `,
            backgroundSize: '300% 100%',
            filter: 'blur(80px)',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
        <motion.div
          className="absolute inset-[-10px]"
          style={{
            background: `
              repeating-linear-gradient(100deg,
                rgba(0, 132, 144, 0.15) 0%,
                rgba(0, 132, 144, 0.15) 7%,
                transparent 10%,
                transparent 12%,
                rgba(0, 132, 144, 0.15) 16%),
              repeating-linear-gradient(100deg,
                #008490 10%,
                #135d84 15%,
                #006d78 20%,
                #4b6b8b 25%,
                #008490 30%)
            `,
            backgroundSize: '200%, 100%',
            backgroundPosition: '50% 50%, 50% 50%',
            mixBlendMode: 'difference',
          }}
          animate={{
            backgroundPosition: [
              '50% 50%, 50% 50%',
              '100% 50%, 150% 50%',
              '50% 50%, 50% 50%',
            ],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      </div>

      {/* Vignette overlay for depth */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 20%, rgba(10, 22, 40, 0.85) 100%)',
        }}
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 w-full">{children}</div>
    </section>
  )
}
