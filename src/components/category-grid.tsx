'use client'

import Link from 'next/link'
import Image from 'next/image'

interface CategoryGridItem {
  slug: string
  label: string
  icon: string
}

export function CategoryGrid({ categories }: { categories: CategoryGridItem[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
      {categories.map(({ slug, label, icon }, i) => (
        <Link
          key={slug}
          href={`/${slug}`}
          className="bg-white border-2 border-border rounded-xl p-6 text-center flex flex-col items-center gap-3 min-h-[170px] hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-[border-color,box-shadow,transform,color] animate-card-entrance text-steel hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          style={{ animationDelay: `${i * 60}ms` }}
        >
          <Image src={`/${icon}`} alt={label} width={56} height={56} className="h-14 w-auto" />
          <span className="font-semibold text-base text-navy leading-tight">{label}</span>
        </Link>
      ))}
    </div>
  )
}
