# Prompt: Vollautomatische Produkt-Synchronisation von Shopware 6 zum Produktfinder

## Ziel

Der Produktfinder soll ALLE Produktdaten automatisch aus Shopware 6 laden — nicht mehr aus einer statischen Datei. Wenn in Shopware ein neues Produkt angelegt, ein Bild geändert, ein Preis angepasst oder ein Produkt deaktiviert wird, soll der Produktfinder das automatisch innerhalb von 30 Sekunden übernehmen.

```
Sage 50 / Shopware Admin ändert Produkt →
Shopware 6 wird aktualisiert →
Produktfinder lädt automatisch alle 30 Sekunden neu →
Neues Produkt / Bild / Preis erscheint im Finder
```

---

## Teil 1: Zentrale API-Funktion erweitern

### Bestehende `lib/shopware-api.ts` ersetzen

Ersetze die bestehende API-Funktion durch eine umfassendere Version die ALLE relevanten Produktdaten lädt:

```typescript
const SHOPWARE_API_URL = process.env.SHOPWARE_API_URL;
const SHOPWARE_ACCESS_KEY = process.env.SHOPWARE_ACCESS_KEY;

export interface ShopwareProduct {
  id: string;
  productNumber: string;
  name: string;
  description: string | null;
  active: boolean;
  available: boolean;
  stock: number;
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
    breadcrumb: string[];
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

export async function fetchAllProducts(): Promise<ShopwareProduct[]> {
  const allProducts: ShopwareProduct[] = [];
  let page = 1;
  let hasMore = true;

  while (hasMore) {
    const response = await fetch(`${SHOPWARE_API_URL}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sw-access-key': SHOPWARE_ACCESS_KEY!,
      },
      body: JSON.stringify({
        limit: 100,
        page: page,
        filter: [
          { type: 'equals', field: 'active', value: true }
        ],
        associations: {
          cover: {
            associations: {
              media: {}
            }
          },
          categories: {},
          properties: {
            associations: {
              group: {}
            }
          },
          seoUrls: {}
        },
        includes: {
          product: [
            'id', 'productNumber', 'name', 'description',
            'active', 'available', 'stock',
            'cover', 'calculatedPrice', 'calculatedPrices',
            'categories', 'properties', 'seoUrls'
          ],
          product_media: ['media'],
          media: ['url', 'alt', 'title'],
          category: ['id', 'name', 'breadcrumb'],
          property_group_option: ['id', 'name', 'group'],
          property_group: ['id', 'name'],
          seo_url: ['seoPathInfo']
        }
      }),
      next: { revalidate: 30 }
    });

    if (!response.ok) {
      console.error('Shopware API Error:', response.status);
      break;
    }

    const data = await response.json();
    const products = data.elements || [];
    allProducts.push(...products);

    if (products.length < 100) {
      hasMore = false;
    } else {
      page++;
    }
  }

  return allProducts;
}

// Hilfsfunktion: Günstigsten Preis finden
export function getCheapestPrice(product: ShopwareProduct): number {
  let cheapestPrice = product.calculatedPrice?.unitPrice || 0;
  
  if (product.calculatedPrices?.length > 0) {
    const staffelPreise = product.calculatedPrices.map(p => p.unitPrice);
    cheapestPrice = Math.min(...staffelPreise);
  }
  
  return cheapestPrice;
}

// Hilfsfunktion: Shop-URL aus SEO-URLs extrahieren
export function getShopUrl(product: ShopwareProduct): string {
  const seoUrl = product.seoUrls?.[0]?.seoPathInfo;
  if (seoUrl) {
    return `https://www.hamburgpapier-shop.de/${seoUrl}`;
  }
  return `https://www.hamburgpapier-shop.de/detail/${product.id}`;
}

// Hilfsfunktion: Cover-Bild URL
export function getCoverImage(product: ShopwareProduct): string | null {
  return product.cover?.media?.url || null;
}

// Hilfsfunktion: Produkt hat Muster-Funktion
// Alle Produkte außer Hygienespender und Cremeseife haben Muster
export function hasSample(product: ShopwareProduct): boolean {
  const name = product.name.toLowerCase();
  const excluded = ['spender', 'cremeseife', 'seife', 'desinfektion', 'handdesinfektion'];
  return !excluded.some(term => name.includes(term));
}
```

---

## Teil 2: Produkte nach Kategorien und Eigenschaften filtern

### Neue Datei `lib/product-filters.ts`

Diese Datei enthält die Logik, die aus den Shopware-Produkten die richtigen Produkte für jeden Finder-Pfad filtert:

```typescript
import { ShopwareProduct } from './shopware-api';

// Hauptkategorien im Finder
export type FinderCategory = 
  | 'papierhandtuecher'
  | 'toilettenpapier'
  | 'jumbotoilettenpapier'
  | 'putzpapier'
  | 'handtuchrollen'
  | 'kuechenrollen'
  | 'servietten'
  | 'aerztekrepp'
  | 'kosmetiktuecher'
  | 'mikrofasertuecher';

// Mapping: Shopware-Kategorie-Namen → Finder-Kategorien
const CATEGORY_MAPPING: Record<string, FinderCategory> = {
  'Papierhandtücher': 'papierhandtuecher',
  'Toilettenpapier': 'toilettenpapier',
  'Jumbotoilettenpapier': 'jumbotoilettenpapier',
  'Putzpapier blau': 'putzpapier',
  'Putzpapier': 'putzpapier',
  'Handtuchrollen': 'handtuchrollen',
  'Küchenrollen': 'kuechenrollen',
  'Servietten': 'servietten',
  'Ärztekrepp': 'aerztekrepp',
  'Kosmetiktücher': 'kosmetiktuecher',
  'Mikrofasertücher': 'mikrofasertuecher',
};

// Produkte einer Finder-Kategorie zuordnen
export function getProductsByCategory(
  products: ShopwareProduct[], 
  category: FinderCategory
): ShopwareProduct[] {
  return products.filter(product => {
    // Prüfe ob eine der Produktkategorien zur Finder-Kategorie passt
    return product.categories?.some(cat => {
      const mapped = CATEGORY_MAPPING[cat.name];
      return mapped === category;
    });
  });
}

// Produkte nach Eigenschaften filtern (Lagen, Material, Abmessung etc.)
// Die Eigenschaften werden aus dem Produktnamen extrahiert, da sie dort konsistent stehen
export function filterProducts(
  products: ShopwareProduct[],
  filters: {
    lagen?: string;        // z.B. "1 lagig", "2 lagig", "3 lagig"
    material?: string;     // z.B. "recycling", "zellstoff"
    abmessung?: string;    // z.B. "25x23", "24x21", "21x21"
    falzung?: string;      // z.B. "Z Falzung", "C Falz", "Interfold"
    versandart?: string;   // z.B. "Karton", "Palette"
    blattzahl?: string;    // z.B. "200 Blatt", "250 Blatt"
    breite?: string;       // z.B. "39 cm", "50 cm" (für Ärztekrepp)
  }
): ShopwareProduct[] {
  return products.filter(product => {
    const name = product.name.toLowerCase();
    
    if (filters.lagen && !name.includes(filters.lagen.toLowerCase())) return false;
    if (filters.material && !name.includes(filters.material.toLowerCase())) return false;
    if (filters.abmessung && !name.includes(filters.abmessung.toLowerCase())) return false;
    if (filters.falzung && !name.includes(filters.falzung.toLowerCase())) return false;
    if (filters.versandart && !name.includes(filters.versandart.toLowerCase())) return false;
    if (filters.blattzahl && !name.includes(filters.blattzahl.toLowerCase())) return false;
    if (filters.breite && !name.includes(filters.breite.toLowerCase())) return false;
    
    return true;
  });
}

// Verfügbare Optionen für einen Filter ermitteln
// z.B.: Welche Lagen-Optionen gibt es für Papierhandtücher mit Z-Falzung?
export function getAvailableOptions(
  products: ShopwareProduct[],
  optionType: 'lagen' | 'material' | 'abmessung' | 'versandart' | 'blattzahl' | 'breite'
): string[] {
  const patterns: Record<string, RegExp> = {
    lagen: /(\d+)\s*lagig/i,
    material: /(recycling|zellstoff)/i,
    abmessung: /(\d+(?:,\d+)?\s*x\s*\d+(?:,\d+)?\s*cm)/i,
    versandart: /(Karton|Palette)/i,
    blattzahl: /(\d+)\s*Blatt/i,
    breite: /Breite\s*(\d+(?:,\d+)?\s*cm)/i,
  };

  const regex = patterns[optionType];
  if (!regex) return [];

  const options = new Set<string>();
  for (const product of products) {
    const match = product.name.match(regex);
    if (match) {
      options.add(match[1] || match[0]);
    }
  }

  return Array.from(options).sort();
}
```

---

## Teil 3: Ergebnis-Seiten dynamisch aufbauen

### Beispiel: Ergebnis-Seite für Papierhandtücher

Jede Ergebnis-Seite nutzt jetzt die API statt statische Daten:

```typescript
import { fetchAllProducts, getCheapestPrice, getShopUrl, getCoverImage, hasSample } from '@/lib/shopware-api';
import { getProductsByCategory, filterProducts } from '@/lib/product-filters';
import { MusterButton } from '@/components/MusterButton';

const SAMPLE_ID = "0193f361b61e705c91ad45e3c5570185";

export default async function ErgebnisPage({ params }) {
  // Alle Produkte laden (gecacht, alle 30 Sek aktualisiert)
  const allProducts = await fetchAllProducts();
  
  // Nach Kategorie filtern
  const categoryProducts = getProductsByCategory(allProducts, 'papierhandtuecher');
  
  // Nach den Finder-Kriterien filtern (aus der URL-Parameter)
  const filtered = filterProducts(categoryProducts, {
    lagen: params.lagen,
    material: params.material,
    abmessung: params.abmessung,
  });

  if (filtered.length === 0) {
    return <p>Keine passenden Produkte gefunden.</p>;
  }

  return (
    <div>
      {filtered.map(product => (
        <div key={product.id}>
          {/* Produktbild — automatisch aus Shopware */}
          {getCoverImage(product) && (
            <img src={getCoverImage(product)!} alt={product.name} />
          )}
          
          {/* Produktname */}
          <h2>{product.name}</h2>
          
          {/* Verfügbarkeit */}
          {!product.available && (
            <span className="text-red-500">Aktuell nicht verfügbar</span>
          )}
          
          {/* Preis — automatisch aus Shopware */}
          <p className="text-2xl font-bold">
            ab {getCheapestPrice(product).toFixed(2).replace('.', ',')} €
            <span className="text-sm text-gray-500 ml-1">zzgl. 19% MwSt.</span>
          </p>
          
          {/* Buttons */}
          <div className="flex gap-4">
            <a 
              href={`${getShopUrl(product)}?utm_source=produktfinder&utm_medium=bestellen&utm_campaign=papierhandtuecher`}
              target="hamburgpapier-shop"
              className="btn-primary"
            >
              Jetzt bestellen
            </a>
            
            {hasSample(product) && (
              <MusterButton 
                referencedId={product.id} 
                sampleId={SAMPLE_ID}
              />
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
```

---

## Teil 4: Finder-Fragen dynamisch generieren

### Die Auswahlmöglichkeiten kommen aus den tatsächlichen Produkten

Statt statisch festzulegen welche Optionen es gibt (z.B. "1-lagig, 2-lagig, 3-lagig"), leitet der Finder die Optionen aus den tatsächlich verfügbaren Produkten ab:

```typescript
import { fetchAllProducts } from '@/lib/shopware-api';
import { getProductsByCategory, getAvailableOptions } from '@/lib/product-filters';

export default async function PapierhandtuecherLagenPage() {
  const allProducts = await fetchAllProducts();
  const phProducts = getProductsByCategory(allProducts, 'papierhandtuecher');
  
  // Welche Lagen sind tatsächlich verfügbar?
  const verfuegbareLagen = getAvailableOptions(phProducts, 'lagen');
  // Ergebnis z.B.: ["1", "2", "3"]
  
  return (
    <div>
      <h2>Wie viele Lagen?</h2>
      {verfuegbareLagen.map(lagen => (
        <a key={lagen} href={`/papierhandtuecher/${lagen}-lagig`}>
          {lagen}-lagig
        </a>
      ))}
    </div>
  );
}
```

**Vorteil:** Wenn ihr morgen ein 4-lagiges Papierhandtuch in Shopware anlegt, erscheint es automatisch als Option im Finder — ohne Code-Änderung.

**Wichtig:** Zeige nur Optionen an die zu mindestens einem Produkt führen. Wenn es kein 3-lagiges recycling Papierhandtuch gibt, darf die Kombination "3-lagig → recycling" nicht als Option erscheinen.

---

## Teil 5: Bilder automatisch synchronisieren

### Cover-Bilder direkt aus Shopware laden

Die Produktbilder werden direkt von der Shopware-Media-URL geladen. Der Produktfinder braucht keine eigenen Bilder mehr zu speichern:

```typescript
// Das Cover-Bild kommt direkt aus Shopware
const imageUrl = getCoverImage(product);
// Ergebnis z.B.: "https://www.hamburgpapier-shop.de/media/a7/5d/72/.../produkt.avif"

// Nutzung mit next/image für Optimierung:
import Image from 'next/image';

<Image 
  src={imageUrl} 
  alt={product.cover?.media?.alt || product.name}
  width={400}
  height={400}
  unoptimized // Bilder kommen von externer Domain
/>
```

### next.config.js anpassen für externe Bilder

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.hamburgpapier-shop.de',
        pathname: '/media/**',
      },
    ],
  },
};
```

Damit kann Next.js die Bilder von eurem Shop-Server laden und optimieren.

---

## Teil 6: Fallback für API-Ausfälle

### Fallback-Daten beim Build generieren

Erweitere das bestehende Build-Script `scripts/fetch-fallback-prices.mjs` zu einem vollständigen Produkt-Fallback:

Erstelle `scripts/fetch-fallback-data.mjs`:
```javascript
import fs from 'fs';

async function main() {
  try {
    const response = await fetch(`${process.env.SHOPWARE_API_URL}/product`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'sw-access-key': process.env.SHOPWARE_ACCESS_KEY,
      },
      body: JSON.stringify({
        limit: 500,
        filter: [{ type: 'equals', field: 'active', value: true }],
        associations: {
          cover: { associations: { media: {} } },
          categories: {},
          seoUrls: {}
        },
        includes: {
          product: ['id', 'productNumber', 'name', 'active', 'available',
                    'cover', 'calculatedPrice', 'calculatedPrices',
                    'categories', 'seoUrls'],
          product_media: ['media'],
          media: ['url', 'alt', 'title'],
          category: ['id', 'name'],
          seo_url: ['seoPathInfo']
        }
      })
    });

    const data = await response.json();
    const products = data.elements || [];

    fs.writeFileSync(
      'lib/fallback-products.ts',
      `// Auto-generated at build time - DO NOT EDIT\n` +
      `// Generated: ${new Date().toISOString()}\n` +
      `export const fallbackProducts = ${JSON.stringify(products, null, 2)} as const;\n`
    );

    console.log(`Fallback-Daten gespeichert: ${products.length} Produkte`);
  } catch (error) {
    console.error('Fehler beim Laden der Fallback-Daten:', error);
  }
}

main();
```

In `package.json`:
```json
{
  "scripts": {
    "prebuild": "node scripts/fetch-fallback-data.mjs",
    "build": "next build"
  }
}
```

In `lib/shopware-api.ts` den Fallback einbauen:
```typescript
export async function fetchAllProducts(): Promise<ShopwareProduct[]> {
  try {
    // ... normaler API-Call ...
  } catch (error) {
    console.error('API nicht erreichbar, verwende Fallback:', error);
    const { fallbackProducts } = await import('./fallback-products');
    return fallbackProducts as unknown as ShopwareProduct[];
  }
}
```

---

## Teil 7: Was sich ändert — Zusammenfassung

### VORHER (statisch):
- Produkte in `sample-products.ts` manuell gepflegt
- Preise hardcoded
- Bilder lokal oder hardcoded URLs
- Neues Produkt → Code ändern → pushen → deployen

### NACHHER (automatisch):
- Produkte kommen live aus Shopware Store API
- Preise aktualisieren sich alle 30 Sekunden
- Bilder kommen direkt von Shopware Media
- Neues Produkt in Shopware anlegen → erscheint automatisch im Finder
- Produkt deaktivieren → verschwindet automatisch aus dem Finder
- Bild ändern → neues Bild erscheint automatisch
- Preis ändern → neuer Preis nach 30 Sekunden sichtbar

---

## Teil 8: Migration — was beachtet werden muss

### Die `sample-products.ts` bleibt als Referenz

Lösche `sample-products.ts` NICHT sofort. Sie wird weiterhin gebraucht für:
- Die `sampleId` (`0193f361b61e705c91ad45e3c5570185`) — die kommt nicht aus der API
- Den MusterButton — der braucht die `referencedId` (= Produkt-ID aus der API) und die globale `sampleId`

### Kategorie-Zuordnung prüfen

Nach der Umstellung muss geprüft werden ob die Shopware-Kategorien korrekt auf die Finder-Kategorien gemappt werden. Prüfe im Shopware Admin ob alle Produkte den richtigen Kategorien zugeordnet sind.

### Filter-Logik testen

Die Filter extrahieren Eigenschaften aus dem Produktnamen (z.B. "2 lagig", "Zellstoff", "25x23"). Das funktioniert nur wenn die Produktnamen konsistent formatiert sind. Prüfe ob alle Produktnamen dem gleichen Schema folgen.

Falls die Namens-Extraktion nicht zuverlässig genug ist, können die Eigenschaften alternativ über die Shopware Property Groups (`properties` im API-Response) gefiltert werden — das ist zuverlässiger aber setzt voraus dass die Properties in Shopware korrekt gepflegt sind.

---

## Zu erstellende / ändernde Dateien

1. `lib/shopware-api.ts` — Erweitern: Vollständige Produktdaten laden
2. `lib/product-filters.ts` — NEU: Filter-Logik für Finder-Pfade
3. `scripts/fetch-fallback-data.mjs` — NEU: Vollständiger Fallback beim Build
4. `lib/fallback-products.ts` — Auto-generiert beim Build
5. `next.config.js` — Erweitern: Remote Images erlauben
6. Alle Ergebnis-Seiten (`app/**/page.tsx`) — Umstellen auf dynamische Daten
7. Alle Frage-Seiten — Optionen dynamisch aus API generieren
8. `sample-products.ts` — Behalten nur für sampleId-Referenz

## Environment Variables (bereits eingerichtet)

- `SHOPWARE_API_URL` — bereits in Vercel ✓
- `SHOPWARE_ACCESS_KEY` — bereits in Vercel ✓
- `REVALIDATION_SECRET` — bereits in Vercel ✓

---

## Wichtig
- Die API-Calls passieren serverseitig — keine Shopware-Daten im Browser
- Bei API-Fehlern werden Fallback-Daten vom letzten Build angezeigt
- Zeige NUR Optionen an die zu mindestens einem verfügbaren Produkt führen — keine Sackgassen
- Produkte mit `active: false` oder `available: false` ausblenden
- Die sampleId (`0193f361b61e705c91ad45e3c5570185`) ist weiterhin statisch — die kommt nicht aus der API
- Teste nach der Umstellung JEDEN Finder-Pfad ob die richtigen Produkte erscheinen
- Nutze den QA-Skill (SKILL-QA.md) für eine vollständige Prüfung nach der Umstellung
