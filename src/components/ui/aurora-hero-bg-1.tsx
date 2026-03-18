import React from 'react'
import { cn } from '@/lib/utils'
import DynamicWaveBackground from '@/components/ui/dynamic-wave-background'

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
      {/* Dynamic wave canvas background */}
      <DynamicWaveBackground />

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
