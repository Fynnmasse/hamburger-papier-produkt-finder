import { PRODUCTS } from './products';
import { getReferencedId } from './sample-products';

const SHOPWARE_API_URL = process.env.SHOPWARE_API_URL;
const SHOPWARE_ACCESS_KEY = process.env.SHOPWARE_ACCESS_KEY;

export async function fetchProductPrices(): Promise<Record<string, number>> {
  if (!SHOPWARE_API_URL || !SHOPWARE_ACCESS_KEY) {
    return loadFallbackPrices();
  }

  // Alle einzigartigen Shopware-IDs aus Produkt-URLs extrahieren
  const productIds = Array.from(
    new Set(
      PRODUCTS
        .map(p => p.url ? getReferencedId(p.url) : null)
        .filter((id): id is string => id !== null)
    )
  );

  try {
    const response = await fetch(`${SHOPWARE_API_URL}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sw-access-key': SHOPWARE_ACCESS_KEY,
      },
      body: JSON.stringify({
        ids: productIds,
        includes: {
          product: ['id', 'calculatedPrice', 'calculatedPrices'],
        },
        limit: 500,
      }),
      next: { revalidate: 30 }, // Preise alle 30 Sekunden automatisch neu laden
    });

    if (!response.ok) {
      console.error('Shopware API Fehler:', response.status);
      return loadFallbackPrices();
    }

    const data = await response.json();
    const prices: Record<string, number> = {};

    for (const product of data.elements ?? []) {
      // Günstigsten Staffelpreis finden (= "ab Preis")
      let cheapestPrice: number = product.calculatedPrice?.unitPrice ?? 0;
      if (product.calculatedPrices?.length > 0) {
        const staffelPreise = product.calculatedPrices.map(
          (p: { unitPrice: number }) => p.unitPrice
        );
        cheapestPrice = Math.min(...staffelPreise);
      }
      prices[product.id] = cheapestPrice;
    }

    return prices;
  } catch (error) {
    console.error('Shopware API Verbindungsfehler:', error);
    return loadFallbackPrices();
  }
}

async function loadFallbackPrices(): Promise<Record<string, number>> {
  try {
    const { fallbackPrices } = await import('./fallback-prices');
    return fallbackPrices;
  } catch {
    return {};
  }
}
