import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function main() {
  const apiUrl = process.env.SHOPWARE_API_URL;
  const accessKey = process.env.SHOPWARE_ACCESS_KEY;

  if (!apiUrl || !accessKey) {
    console.log('SHOPWARE_API_URL oder SHOPWARE_ACCESS_KEY nicht gesetzt — überspringe Fallback-Preis-Generierung.');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sw-access-key': accessKey,
      },
      body: JSON.stringify({
        includes: { product: ['id', 'calculatedPrice', 'calculatedPrices'] },
        limit: 500,
      }),
    });

    if (!response.ok) {
      console.error('Shopware API Fehler beim Build:', response.status);
      return;
    }

    const data = await response.json();
    const prices = {};

    for (const product of data.elements ?? []) {
      let cheapestPrice = product.calculatedPrice?.unitPrice ?? 0;
      if (product.calculatedPrices?.length > 0) {
        const staffel = product.calculatedPrices.map(p => p.unitPrice);
        cheapestPrice = Math.min(...staffel);
      }
      prices[product.id] = cheapestPrice;
    }

    const outputPath = path.join(__dirname, '..', 'src', 'lib', 'fallback-prices.ts');
    fs.writeFileSync(
      outputPath,
      `// Automatisch generiert durch scripts/fetch-fallback-prices.mjs beim Build\n// Manuelle Bearbeitung nicht nötig\nexport const fallbackPrices: Record<string, number> = ${JSON.stringify(prices, null, 2)};\n`
    );

    console.log(`Fallback-Preise gespeichert: ${Object.keys(prices).length} Produkte`);
  } catch (error) {
    console.error('Fehler beim Laden der Fallback-Preise:', error);
  }
}

main();
