import type { MetadataRoute } from 'next'
import { CATEGORIES, getLeafStaticPaths } from '@/lib/finder-config'
import { SITE_URL } from '@/lib/constants'

const BASE = SITE_URL
// Festes Build-Datum damit lastmod sich nur bei echtem Deploy ändert
const BUILD_DATE = new Date()

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: BUILD_DATE,
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  // Vergleichsseiten
  urls.push({
    url: `${BASE}/vergleich`,
    lastModified: BUILD_DATE,
    changeFrequency: 'weekly',
    priority: 0.8,
  })
  const vergleichSlugs = [
    'toilettenpapier-kleinrollen', 'jumbotoilettenpapier',
    'papierhandtuecher', 'handtuchrollen',
    'putzpapier-rollen', 'putzpapier-aerzte', 'putzpapier-mikrofaser',
    'kuechenrollen', 'servietten', 'kosmetiktuecher',
    'spender',
  ]
  for (const slug of vergleichSlugs) {
    urls.push({
      url: `${BASE}/vergleich/${slug}`,
      lastModified: BUILD_DATE,
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  for (const cat of CATEGORIES) {
    // Category root page
    urls.push({
      url: `${BASE}/${cat.slug}`,
      lastModified: BUILD_DATE,
      changeFrequency: 'weekly',
      priority: 0.9,
    })

    // Nur Blatt-Knoten (Ergebnis-Seiten) in die Sitemap — Wizard-Zwischenschritte
    // haben kaum einzigartigen Content und werden von Google ohnehin als Duplikate/Thin Content verworfen.
    const paths = getLeafStaticPaths(cat.slug)
    for (const segments of paths) {
      urls.push({
        url: `${BASE}/${cat.slug}/${segments.join('/')}`,
        lastModified: BUILD_DATE,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return urls
}
