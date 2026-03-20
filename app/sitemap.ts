import type { MetadataRoute } from 'next'
import { CATEGORIES, getAllStaticPaths } from '@/lib/finder-config'

const BASE = 'https://www.hamburgpapier-shop.de/produktberater'

export default function sitemap(): MetadataRoute.Sitemap {
  const urls: MetadataRoute.Sitemap = [
    {
      url: BASE,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1.0,
    },
  ]

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
