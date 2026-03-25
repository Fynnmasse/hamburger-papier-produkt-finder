import { CategoryPage } from '@/components/category-page'
import { generateCategoryMetadata, generateCategoryStaticParams } from '@/lib/category-route-helpers'

export function generateStaticParams() {
  return generateCategoryStaticParams('waschraum')
}

export function generateMetadata({ params }: { params: Promise<{ schritte: string[] }> }) {
  return params.then(p => generateCategoryMetadata('waschraum', p.schritte))
}

export default async function Page({ params }: { params: Promise<{ schritte: string[] }> }) {
  const { schritte } = await params
  return <CategoryPage kategorie="waschraum" segments={schritte} />
}
