'use client'

import Link from 'next/link'
import Image from 'next/image'

interface CategoryGridItem {
  slug: string
  label: string
  icon: string
  href?: string
  variant?: 'default' | 'highlight'
  subtitle?: string
}

export function CategoryGrid({ categories }: { categories: CategoryGridItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map(({ slug, label, icon, href, variant, subtitle }, i) => (
        <Link
          key={slug}
          href={href ?? `/${slug}`}
          className={`border-2 rounded-xl p-6 text-center flex flex-col items-center gap-3 min-h-[170px] hover:-translate-y-0.5 active:scale-95 transition-[border-color,box-shadow,transform,color] animate-card-entrance focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            variant === 'highlight'
              ? 'bg-navy border-navy hover:shadow-lg'
              : 'bg-white border-border text-steel hover:border-primary hover:text-primary hover:shadow-md'
          }`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          {variant === 'highlight' ? (
            <div className="bg-[rgba(42,157,143,0.25)] rounded-xl p-3 inline-flex">
              <Image src={`/${icon}`} alt={label} width={48} height={48} className="h-12 w-auto" />
            </div>
          ) : (
            <Image src={`/${icon}`} alt={label} width={56} height={56} className="h-14 w-auto" />
          )}
          <div>
            <span className={`font-semibold text-base leading-tight ${variant === 'highlight' ? 'text-white' : 'text-navy'}`}>{label}</span>
            {subtitle && <p className="text-xs text-white/50 mt-1">{subtitle}</p>}
          </div>
        </Link>
      ))}
    </div>
  )
}
