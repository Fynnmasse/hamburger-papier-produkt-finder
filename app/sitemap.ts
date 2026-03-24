import type { MetadataRoute } from 'next'
import { CATEGORIES, getAllStaticPaths } from '@/lib/finder-config'
import { SITE_URL } from '@/lib/constants'

const BASE = SITE_URL

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

  // Vergleichsseiten
  urls.push({
    url: `${BASE}/vergleich`,
    lastModified: new Date(),
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
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    })
  }

  for (const cat of CATEGORIES) {
    // Category root page
    urls.push({
      url: `${BASE}/${cat.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    })

    // All step combinations
    const paths = getAllStaticPaths(cat.slug)
    for (const segments of paths) {
      urls.push({
        url: `${BASE}/${cat.slug}/${segments.join('/')}`,
        lastModified: new Date(),
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  }

  return urls
}
