import type { Product } from './products'

/** Preis als deutsches Format (Komma als Dezimaltrennzeichen) */
export function formatPreis(preis: number): string {
  return preis.toFixed(2).replace('.', ',')
}

/** Grundpreis formatiert mit Einheit, z.B. "0,28 € / Rolle(n)" */
export function formatGrundpreis(preisProEinheit: number, einheit: string): string {
  return `${formatPreis(preisProEinheit)} € / ${einheit}`
}

/** Günstigsten Grundpreis aus Staffelpreisen (letzter Tier = höchste Menge = günstigster) */
export function getGuenstigsterGrundpreis(product: Product): number | null {
  if (!product.staffelpreise || product.staffelpreise.length === 0) return null
  const letzter = product.staffelpreise[product.staffelpreise.length - 1]
  return letzter.referencePrice?.price ?? null
}

/** Einheit aus Staffelpreisen (z.B. "Rolle(n)") */
export function getGrundpreisEinheit(product: Product): string {
  if (!product.staffelpreise || product.staffelpreise.length === 0) return 'Rolle(n)'
  for (const tier of product.staffelpreise) {
    if (tier.referencePrice?.unitName) return tier.referencePrice.unitName
  }
  return 'Rolle(n)'
}

/** Produkt mit günstigstem Grundpreis finden (nur wenn ≥2 Produkte mit Grundpreis) */
export function findGuenstigsteOption(products: Product[]): Product | null {
  const mitGrundpreis = products
    .map(p => ({ product: p, grundpreis: getGuenstigsterGrundpreis(p) }))
    .filter((item): item is { product: Product; grundpreis: number } => item.grundpreis !== null)

  if (mitGrundpreis.length < 2) return null
  mitGrundpreis.sort((a, b) => a.grundpreis - b.grundpreis)
  return mitGrundpreis[0].product
}
