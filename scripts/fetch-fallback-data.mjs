import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const apiUrl = process.env.SHOPWARE_API_URL;
  const accessKey = process.env.SHOPWARE_ACCESS_KEY;

  if (!apiUrl || !accessKey) {
    console.log('SHOPWARE_API_URL oder SHOPWARE_ACCESS_KEY nicht gesetzt — überspringe Fallback-Generierung.');
    return;
  }

  try {
    const allProducts = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
      const response = await fetch(`${apiUrl}/product`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'sw-access-key': accessKey,
        },
        body: JSON.stringify({
          limit: 100,
          page,
          filter: [{ type: 'equals', field: 'active', value: true }],
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
      });

      if (!response.ok) {
        console.error('Shopware API Fehler beim Build:', response.status);
        return;
      }

      const data = await response.json();
      const products = data.elements ?? [];
      allProducts.push(...products);

      hasMore = products.length >= 100;
      page++;
    }

    const outputPath = path.join(__dirname, '..', 'src', 'lib', 'fallback-products.ts');
    fs.writeFileSync(
      outputPath,
      `// Automatisch generiert durch scripts/fetch-fallback-data.mjs beim Build\n` +
      `// Generiert: ${new Date().toISOString()}\n` +
      `// Manuelle Bearbeitung nicht nötig\n` +
      `export const fallbackProducts: unknown[] = ${JSON.stringify(allProducts, null, 2)};\n`
    );

    console.log(`Fallback-Daten gespeichert: ${allProducts.length} Produkte`);
  } catch (error) {
    console.error('Fehler beim Laden der Fallback-Daten:', error);
  }
}

main();
