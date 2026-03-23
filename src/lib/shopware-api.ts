const SHOPWARE_API_URL = process.env.SHOPWARE_API_URL;
const SHOPWARE_ACCESS_KEY = process.env.SHOPWARE_ACCESS_KEY;

export interface ShopwareProduct {
  id: string;
  productNumber: string;
  name: string;
  active: boolean;
  available: boolean;
  cover: {
    media: {
      url: string;
      alt: string | null;
      title: string | null;
    };
  } | null;
  calculatedPrice: {
    unitPrice: number;
    totalPrice: number;
  };
  calculatedPrices: Array<{
    unitPrice: number;
    quantity: number;
  }>;
  categories: Array<{
    id: string;
    name: string;
  }>;
  properties: Array<{
    id: string;
    name: string;
    group: {
      id: string;
      name: string;
    };
  }>;
  seoUrls: Array<{
    seoPathInfo: string;
  }>;
}

/** Alle aktiven Produkte aus der Shopware Store API laden (paginiert, alle 30s gecacht) */
export async function fetchAllProducts(): Promise<ShopwareProduct[]> {
  if (!SHOPWARE_API_URL || !SHOPWARE_ACCESS_KEY) {
    return loadFallbackProducts();
  }

  try {
    const allProducts: ShopwareProduct[] = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${SHOPWARE_API_URL}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sw-access-key': SHOPWARE_ACCESS_KEY,
        },
        body: JSON.stringify({
          limit: 100,
          page,
          filter: [
            { type: 'equals', field: 'active', value: true },
          ],
          associations: {
            cover: { associations: { media: {} } },
            categories: {},
            properties: { associations: { group: {} } },
            seoUrls: {},
          },
          includes: {
            product: [
              'id', 'productNumber', 'name', 'active', 'available',
              'cover', 'calculatedPrice', 'calculatedPrices',
              'categories', 'properties', 'seoUrls',
            ],
            product_media: ['media'],
            media: ['url', 'alt', 'title'],
            category: ['id', 'name'],
            property_group_option: ['id', 'name', 'group'],
            property_group: ['id', 'name'],
            seo_url: ['seoPathInfo'],
          },
        }),
        next: { revalidate: 30 },
      });

      if (!response.ok) {
        console.error('Shopware API Fehler:', response.status);
        return loadFallbackProducts();
      }

      const data = await response.json();
      const products: ShopwareProduct[] = data.elements ?? [];
      allProducts.push(...products);

      hasMore = products.length >= 100;
      page++;
    }

    return allProducts;
  } catch (error) {
    console.error('Shopware API Verbindungsfehler:', error);
    return loadFallbackProducts();
  }
}

/** Günstigsten Staffelpreis finden (= "ab Preis") */
export function getCheapestPrice(product: ShopwareProduct): number {
  let cheapestPrice = product.calculatedPrice?.unitPrice ?? 0;
  if (product.calculatedPrices?.length > 0) {
    const staffelPreise = product.calculatedPrices.map(
      (p: { unitPrice: number }) => p.unitPrice
    );
    cheapestPrice = Math.min(...staffelPreise);
  }
  return cheapestPrice;
}

/** Shop-URL aus SEO-URLs oder Detail-Link */
export function getShopUrl(product: ShopwareProduct): string {
  const seoUrl = product.seoUrls?.[0]?.seoPathInfo;
  if (seoUrl) {
    return `https://www.hamburgpapier-shop.de/${seoUrl}`;
  }
  return `https://www.hamburgpapier-shop.de/detail/${product.id}`;
}

/** Cover-Bild URL */
export function getCoverImage(product: ShopwareProduct): string {
  return product.cover?.media?.url ?? '';
}

async function loadFallbackProducts(): Promise<ShopwareProduct[]> {
  try {
    const { fallbackProducts } = await import('./fallback-products');
    return fallbackProducts as unknown as ShopwareProduct[];
  } catch {
    return [];
  }
}
