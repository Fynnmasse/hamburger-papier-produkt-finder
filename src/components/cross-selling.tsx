import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product-card'
import type { Product } from '@/lib/products'

interface CrossSellingLink {
  href: string
  label: string
}

interface CrossSellingProps {
  title: string
  description: string
  linkHref: string
  linkLabel: string
  links?: CrossSellingLink[]
  products: Product[]
  utmCampaign: string
}

function LinkButton({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="group relative overflow-hidden inline-flex items-center justify-center bg-white border border-border rounded-lg px-5 py-3 text-sm font-medium text-navy hover:border-primary hover:shadow-md transition-[border-color,box-shadow]"
    >
      <span className="mr-6">{label}</span>
      <span className="absolute right-1 top-1 bottom-1 rounded z-10 grid w-8 place-items-center transition-all duration-500 bg-primary/10 group-hover:w-[calc(100%-0.5rem)] group-hover:bg-primary/15">
        <ChevronRight size={16} strokeWidth={2} className="text-primary" aria-hidden="true" />
      </span>
    </Link>
  )
}

export function CrossSelling({
  title,
  description,
  linkHref,
  linkLabel,
  links,
  products,
  utmCampaign,
}: CrossSellingProps) {
  return (
    <div className="max-w-6xl mx-auto mt-10 pt-8 border-t border-border animate-fade-up">
      <h3 className="font-display font-bold text-xl uppercase text-navy mb-1">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground mb-5">{description}</p>

      {products.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
          {products.map((p, i) => (
            <ProductCard
              key={p.num}
              p={p}
              index={i}
              kategorie={utmCampaign}
              utmMedium="cross-selling"
            />
          ))}
        </div>
      )}

      {links && links.length > 1 ? (
        <div className="flex flex-wrap gap-3">
          {links.map((link) => (
            <LinkButton key={link.href} href={link.href} label={link.label} />
          ))}
        </div>
      ) : (
        <LinkButton href={linkHref} label={linkLabel} />
      )}
    </div>
  )
}
