import type { Metadata } from 'next'
import {
  CATEGORY_MAP,
  STEP_VALUE_LABELS,
  getAllStaticPaths,
  resolveSteps,
  type CategorySlug,
} from './finder-config'

/** Generate metadata for a category page (root or with steps) */
export function generateCategoryMetadata(
  kategorie: CategorySlug,
  segments: string[] = []
): Metadata {
  const catDef = CATEGORY_MAP.get(kategorie)
  if (!catDef) return {}

  if (segments.length === 0) {
    return {
      title: catDef.metaTitle,
      description: catDef.metaDescription,
      alternates: {
        canonical: `/${kategorie}`,
      },
    }
  }

  // Build title from segments
  const steps = resolveSteps(catDef, segments)
  const labels = segments.map((seg, i) => {
    const stepDef = steps[i]
    if (!stepDef) return seg
    const labelMap = STEP_VALUE_LABELS[stepDef.slug]
    return labelMap?.[seg] || seg
  })

  const title = `${catDef.label} ${labels.join(' ')} | Hamburgpapier Produktfinder`
  const desc = `Finden Sie ${catDef.label} — ${labels.join(', ')}. B2B Großhandel von Hamburgpapier. Kostenloser Versand, kostenlose Muster.`
  const canonical = `/${kategorie}/${segments.join('/')}`

  return {
    title,
    description: desc,
    alternates: { canonical },
  }
}

/** Generate static params for [...schritte] catch-all routes */
export function generateCategoryStaticParams(kategorie: CategorySlug) {
  const paths = getAllStaticPaths(kategorie)
  return paths.map(segments => ({ schritte: segments }))
}
