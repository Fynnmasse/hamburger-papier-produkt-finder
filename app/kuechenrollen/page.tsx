import { CategoryPage } from '@/components/category-page'
import { generateCategoryMetadata } from '@/lib/category-route-helpers'

export function generateMetadata() {
  return generateCategoryMetadata('kuechenrollen')
}

export default function Page() {
  return <CategoryPage kategorie="kuechenrollen" segments={[]} />
}
