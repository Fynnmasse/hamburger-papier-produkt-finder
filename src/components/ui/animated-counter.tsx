'use client'

import { useRef, useEffect, useState } from 'react'
import { useInView, useMotionValue, animate } from 'framer-motion'

interface AnimatedCounterProps {
  target: number
  suffix?: string
  separator?: string
  duration?: number
}

function formatNumber(value: number, separator?: string): string {
  const rounded = Math.round(value)
  if (!separator) return rounded.toString()
  return rounded.toLocaleString('de-DE')
}

export function AnimatedCounter({ target, suffix = '', separator, duration = 2 }: AnimatedCounterProps) {
  const ref = useRef<HTMLSpanElement>(null)
  const isInView = useInView(ref, { once: true, margin: '-50px' })
  const motionValue = useMotionValue(0)
  const [display, setDisplay] = useState(formatNumber(target, separator) + suffix)

  useEffect(() => {
    if (!isInView) {
      setDisplay('0' + suffix)
      return
    }

    const controls = animate(motionValue, target, {
      duration,
      ease: 'easeOut',
      onUpdate: (v) => {
        setDisplay(formatNumber(v, separator) + suffix)
      },
    })

    return () => controls.stop()
  }, [isInView, target, suffix, separator, duration, motionValue])

  return <span ref={ref}>{display}</span>
}
