import { CategoryPage } from '@/components/category-page'
import { generateCategoryMetadata } from '@/lib/category-route-helpers'

export function generateMetadata() {
  return generateCategoryMetadata('toilettenpapier')
}

export default function Page() {
  return <CategoryPage kategorie="toilettenpapier" segments={[]} />
}
