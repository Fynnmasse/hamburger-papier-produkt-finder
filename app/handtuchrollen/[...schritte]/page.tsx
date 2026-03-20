import { CategoryPage } from '@/components/category-page'
import { generateCategoryMetadata, generateCategoryStaticParams } from '@/lib/category-route-helpers'

export function generateStaticParams() {
  return generateCategoryStaticParams('handtuchrollen')
}

export function generateMetadata({ params }: { params: Promise<{ schritte: string[] }> }) {
  return params.then(p => generateCategoryMetadata('handtuchrollen', p.schritte))
}

export default async function Page({ params }: { params: Promise<{ schritte: string[] }> }) {
  const { schritte } = await params
  return <CategoryPage kategorie="handtuchrollen" segments={schritte} />
}
