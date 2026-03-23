# Prompt: Automatische Preis-Synchronisation von Shopware 6 zum Produktfinder

## Ziel

Die Preise im Produktfinder sollen sich automatisch aktualisieren wenn sie in Shopware 6 geändert werden (über Sage 50 → Shopware). Der Ablauf:

```
Sage 50 ändert Preis → Shopware 6 wird aktualisiert → 
Produktfinder prüft automatisch alle 30 Sekunden → zeigt neuen Preis
```

Kein Webhook nötig. Der Produktfinder holt sich die Preise selbstständig über die Shopware Store API und cached sie mit Next.js ISR (Incremental Static Regeneration).

---

## Teil 1: Preise über die Shopware Store API laden

### API-Konfiguration

Erstelle eine Datei `lib/shopware-api.ts`:

```typescript
const SHOPWARE_API_URL = process.env.SHOPWARE_API_URL; // z.B. https://www.hamburgpapier-shop.de/store-api
const SHOPWARE_ACCESS_KEY = process.env.SHOPWARE_ACCESS_KEY; // Sales Channel Access Key

import { sampleProducts } from './sample-products';

interface ShopwareProduct {
  id: string;
  calculatedPrice: {
    unitPrice: number;
    totalPrice: number;
  };
  calculatedPrices: Array<{
    unitPrice: number;
    quantity: number;
  }>;
}

export async function fetchProductPrices(): Promise<Record<string, number>> {
  // Sammle alle referencedIds
  const productIds = Object.values(sampleProducts).map(p => p.referencedId);
  
  // Shopware Store API: Produkte mit Preisen laden
  const response = await fetch(`${SHOPWARE_API_URL}/product`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'sw-access-key': SHOPWARE_ACCESS_KEY!,
    },
    body: JSON.stringify({
      ids: productIds,
      includes: {
        product: ['id', 'calculatedPrice', 'calculatedPrices', 'productNumber']
      },
      limit: 200
    }),
    next: { revalidate: 30 } // Preise alle 30 Sekunden automatisch neu laden
  });

  if (!response.ok) {
    console.error('Shopware API Error:', response.status);
    // Fallback-Preise laden wenn API nicht erreichbar
    try {
      const { fallbackPrices } = await import('./fallback-prices');
      return fallbackPrices;
    } catch {
      return {};
    }
  }

  const data = await response.json();
  const prices: Record<string, number> = {};

  for (const product of data.elements || []) {
    // Günstigsten Staffelpreis finden (= "ab Preis")
    let cheapestPrice = product.calculatedPrice?.unitPrice || 0;
    
    if (product.calculatedPrices?.length > 0) {
      // calculatedPrices enthält Staffelpreise — der letzte ist meist der günstigste
      const staffelPreise = product.calculatedPrices.map((p: any) => p.unitPrice);
      cheapestPrice = Math.min(...staffelPreise);
    }
    
    prices[product.id] = cheapestPrice;
  }

  return prices;
}
```

### Zentrale Einstellung: Aktualisierungs-Intervall

Der Wert `revalidate: 30` bedeutet: Preise werden maximal alle 30 Sekunden neu geladen. Wenn sich Preise häufiger ändern, kann der Wert angepasst werden:
- `30` = alle 30 Sekunden (aktuelle Einstellung — nahezu Echtzeit)
- `60` = jede Minute
- `300` = alle 5 Minuten
- `3600` = alle 60 Minuten (falls API-Last reduziert werden soll)

### Environment Variables in Vercel einrichten

Der Nutzer muss folgende Environment Variables in Vercel setzen (Project Settings → Environment Variables):

- `SHOPWARE_API_URL` = `https://www.hamburgpapier-shop.de/store-api`
- `SHOPWARE_ACCESS_KEY` = Der Sales Channel Access Key aus dem Shopware Admin
- `REVALIDATION_SECRET` = Ein beliebiger geheimer String für den manuellen Refresh-Button (z.B. `mein-geheimer-refresh-key-2026`)

---

## Teil 2: Preise in den Ergebnis-Seiten verwenden

Auf jeder Ergebnis-Seite (wo ein Produkt mit Preis angezeigt wird) sollen die Preise dynamisch aus der API geladen werden statt hardcoded zu sein.

```typescript
// In jeder Ergebnis-page.tsx:
import { fetchProductPrices } from '@/lib/shopware-api';
import { sampleProducts } from '@/lib/sample-products';

export default async function ErgebnisPage({ params }: { params: { ... } }) {
  // Preise von Shopware laden (gecacht, automatisch alle 30 Sek aktualisiert)
  const prices = await fetchProductPrices();
  
  // Produkt bestimmen (basierend auf Finder-Pfad)
  const product = sampleProducts['produkt-key'];
  const preis = prices[product.referencedId];
  
  return (
    <div>
      <h2>{product.name}</h2>
      {preis ? (
        <p className="text-2xl font-bold">
          ab {preis.toFixed(2).replace('.', ',')} €
          <span className="text-sm text-gray-500 ml-1">zzgl. 19% MwSt.</span>
        </p>
      ) : (
        <p className="text-gray-500">Preis auf Anfrage</p>
      )}
    </div>
  );
}
```

---

## Teil 3: Manueller Refresh-Button (sofortige Aktualisierung)

Falls der Nutzer einen Preis ändert und ihn sofort im Produktfinder sehen will, ohne 30 Sekunden zu warten.

### API Route erstellen

Erstelle `app/api/revalidate/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function GET(request: NextRequest) {
  // Secret prüfen um unbefugte Aufrufe zu verhindern
  const secret = request.nextUrl.searchParams.get('secret');
  
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // Alle Seiten neu generieren
    revalidatePath('/', 'layout');
    
    return NextResponse.json({ 
      revalidated: true, 
      message: 'Alle Preise werden jetzt aktualisiert.',
      timestamp: new Date().toISOString() 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Revalidation failed' }, { status: 500 });
  }
}
```

### Nutzung

Nach dem Deployment kann der Nutzer jederzeit alle Preise sofort aktualisieren, indem er diese URL im Browser aufruft:

```
https://hamburger-papier-produkt-finder.vercel.app/api/revalidate?secret=EUER_SECRET
```

Antwort bei Erfolg:
```json
{ "revalidated": true, "message": "Alle Preise werden jetzt aktualisiert." }
```

---

## Teil 4: Fallback-Preise (Backup falls API down)

### Fallback-Preise beim Build generieren

Erstelle ein Build-Script das bei jedem Deployment die aktuellen Preise als Fallback speichert.

In `package.json` den build-Befehl anpassen:
```json
{
  "scripts": {
    "prebuild": "node scripts/fetch-fallback-prices.mjs",
    "build": "next build"
  }
}
```

Erstelle `scripts/fetch-fallback-prices.mjs`:
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
        includes: { product: ['id', 'calculatedPrice', 'calculatedPrices'] },
        limit: 200
      })
    });

    const data = await response.json();
    const prices = {};

    for (const product of data.elements || []) {
      let cheapestPrice = product.calculatedPrice?.unitPrice || 0;
      if (product.calculatedPrices?.length > 0) {
        const staffel = product.calculatedPrices.map(p => p.unitPrice);
        cheapestPrice = Math.min(...staffel);
      }
      prices[product.id] = cheapestPrice;
    }

    fs.writeFileSync(
      'lib/fallback-prices.ts',
      `export const fallbackPrices: Record<string, number> = ${JSON.stringify(prices, null, 2)};`
    );

    console.log(`Fallback-Preise gespeichert: ${Object.keys(prices).length} Produkte`);
  } catch (error) {
    console.error('Fehler beim Laden der Fallback-Preise:', error);
  }
}

main();
```

---

## Teil 5: Preis-Anzeige Formatierung

### Immer den günstigsten "ab"-Preis anzeigen (Netto)

Da der Shop B2B ist und Nettopreise zeigt:

```typescript
function formatPrice(price: number): string {
  return `ab ${price.toFixed(2).replace('.', ',')} €`;
}
```

### Prüfe ob die API Netto- oder Brutto-Preise liefert

Die Shopware Store API liefert standardmäßig Brutto-Preise. Wenn der Sales Channel auf Netto konfiguriert ist, kommen Netto-Preise.

Prüfe beim ersten API-Call welche Preise kommen und stelle sicher dass die Anzeige konsistent mit dem Shop ist. Falls die API Brutto-Preise liefert aber Netto angezeigt werden soll:

```typescript
const nettoPreis = bruttoPreis / 1.19;
```

---

## Zusammenfassung der zu erstellenden Dateien

1. `lib/shopware-api.ts` — API-Client für Shopware Store API mit ISR-Caching
2. `lib/fallback-prices.ts` — Wird automatisch beim Build generiert als Backup
3. `app/api/revalidate/route.ts` — Manueller Refresh-Endpoint
4. `scripts/fetch-fallback-prices.mjs` — Build-Script für Fallback-Preise
5. Alle Ergebnis-Seiten anpassen — Preise dynamisch laden statt hardcoded

## Environment Variables (in Vercel einrichten)

- `SHOPWARE_API_URL` = `https://www.hamburgpapier-shop.de/store-api`
- `SHOPWARE_ACCESS_KEY` = [Sales Channel Access Key aus Shopware Admin]
- `REVALIDATION_SECRET` = [beliebiger geheimer String für manuellen Refresh]

## Keine Shopware-Konfiguration nötig

Es muss NICHTS in Shopware eingerichtet werden — kein Webhook, kein Plugin, keine App. Der Produktfinder holt sich die Preise selbstständig über die Store API.

---

## Wichtig
- Die API-Calls passieren serverseitig (in Server Components) — der Access Key wird nie an den Browser geschickt
- Bei API-Fehlern werden Fallback-Preise aus dem letzten erfolgreichen Build angezeigt — die Seite geht nie kaputt
- Der manuelle Refresh-Endpoint ist durch ein Secret geschützt
- Teste nach der Implementierung: Ändere einen Preis in Shopware, warte 30 Sekunden, und prüfe ob der neue Preis im Produktfinder erscheint
