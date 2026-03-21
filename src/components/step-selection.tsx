'use client'

import Link from 'next/link'
import Image from 'next/image'
import type { StepDef } from '@/lib/finder-config'

interface StepSelectionProps {
  step: StepDef
  basePath: string
}

export function StepSelection({ step, basePath }: StepSelectionProps) {
  const gridCols = step.options.length <= 3
    ? 'grid-cols-1 sm:grid-cols-3'
    : 'grid-cols-1 sm:grid-cols-2'

  return (
    <div className={`grid ${gridCols} gap-4`}>
      {step.options.map(({ value, label, desc, tag, tagStyle, image }, i) => (
        <Link
          key={value}
          href={`${basePath}/${value}`}
          className="bg-white border-2 border-border rounded-xl p-6 text-left flex flex-col gap-2 hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-[.98] transition-[border-color,box-shadow,transform] animate-card-entrance focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ animationDelay: `${(i + 1) * 70}ms` }}
        >
          {image && (
            <div className="w-full aspect-[3/2] mb-2 overflow-hidden rounded-lg bg-navy/5">
              <Image src={`/${image}`} alt={label} width={400} height={267} className="w-full h-full object-contain" />
            </div>
          )}
          <div className="font-display font-bold text-xl uppercase text-navy">{label}</div>
          <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
          {tag && <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded w-fit mt-1 ${tagStyle}`}>{tag}</span>}
        </Link>
      ))}
    </div>
  )
}
