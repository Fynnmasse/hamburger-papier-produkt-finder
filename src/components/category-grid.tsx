'use client'

import Link from 'next/link'
import Image from 'next/image'

interface CategoryGridItem {
  slug: string
  label: string
  icon: string
  href?: string
  variant?: 'default' | 'highlight'
}

export function CategoryGrid({ categories }: { categories: CategoryGridItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map(({ slug, label, icon, href, variant }, i) => (
        <Link
          key={slug}
          href={href ?? `/${slug}`}
          className={`border-2 rounded-xl p-6 text-center flex flex-col items-center gap-3 min-h-[170px] hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-[border-color,box-shadow,transform,color] animate-card-entrance focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
            variant === 'highlight'
              ? 'bg-primary/5 border-primary/30 text-primary hover:border-primary hover:bg-primary/10'
              : 'bg-white border-border text-steel hover:border-primary hover:text-primary'
          }`}
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Image src={`/${icon}`} alt={label} width={56} height={56} className="h-14 w-auto" />
          <span className="font-semibold text-base text-navy leading-tight">{label}</span>
        </Link>
      ))}
    </div>
  )
}
