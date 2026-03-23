# Prompt: Staffelpreise und Grundpreis aus Shopware API nutzen

## Änderung

Statt den Grundpreis (Preis pro Rolle) selbst aus dem Produktnamen zu berechnen, sollen die **Staffelpreise und der Grundpreis direkt aus der Shopware Store API** geladen werden. Shopware berechnet den Grundpreis bereits korrekt.

## API-Daten erweitern

In `lib/shopware-api.ts` bei den `includes` für das Product zusätzlich laden:

```typescript
includes: {
  product: [
    // ... bestehende Felder ...
    'calculatedPrices',    // Staffelpreise (ab 2, ab 4, ab 16 etc.)
    'calculatedPrice',     // Standard-Einzelpreis
    'price',               // Basis-Preisinformationen
    'purchaseUnit',        // z.B. 64 (Rollen pro VE)
    'referenceUnit',       // z.B. 1 (1 Rolle)
    'unitId',              // Einheit-ID
    'unit',                // Einheit (z.B. "Rolle(n)")
  ],
  // ... und die Unit-Association laden:
}
```

Bei den `associations` ergänzen:

```typescript
associations: {
  // ... bestehende Associations ...
  unit: {},   // Einheit laden (Rolle, Stück, Meter etc.)
}
```

## Staffelpreis-Tabelle auf der Ergebnis-Seite anzeigen

Zeige auf jeder Produktkarte die komplette Staffelpreis-Tabelle:

```tsx
interface Staffelpreis {
  quantity: number;    // Ab-Menge (z.B. 2, 4, 16)
  unitPrice: number;   // Stückpreis bei dieser Menge
  referencePrice?: {
    price: number;     // Grundpreis (z.B. 0.28 pro Rolle)
    purchaseUnit: number;  // VE-Größe (z.B. 64)
    referenceUnit: number; // Bezugseinheit (z.B. 1)
    unitName: string;      // Einheit (z.B. "Rolle(n)")
  };
}

// Auf der Produktkarte:
{product.calculatedPrices?.length > 0 && (
  <table className="w-full text-sm mt-3">
    <thead>
      <tr className="bg-gray-100">
        <th className="text-left py-2 px-3">Anzahl</th>
        <th className="text-left py-2 px-3">Stückpreis</th>
        <th className="text-left py-2 px-3">Grundpreis</th>
      </tr>
    </thead>
    <tbody>
      {product.calculatedPrices.map((staffel, i) => (
        <tr key={i} className={i === product.calculatedPrices.length - 1 ? 'font-bold' : ''}>
          <td className="py-2 px-3">ab {staffel.quantity}</td>
          <td className="py-2 px-3">
            {staffel.unitPrice.toFixed(2).replace('.', ',')} €*
          </td>
          <td className="py-2 px-3">
            {staffel.referencePrice 
              ? `${staffel.referencePrice.price.toFixed(2).replace('.', ',')} €* / 1 ${staffel.referencePrice.unitName}`
              : '—'
            }
          </td>
        </tr>
      ))}
    </tbody>
    <tfoot>
      <tr>
        <td colSpan={3} className="text-xs text-gray-500 pt-1 px-3">
          Preise exkl. MwSt.
        </td>
      </tr>
    </tfoot>
  </table>
)}
```

## Günstigsten Grundpreis für den Vergleich verwenden

Auf der Vergleichsseite (`/vergleich`) und beim "Bester Preis pro Rolle"-Badge: Verwende den **günstigsten Staffelpreis-Grundpreis** (= letzte Staffel, höchste Menge):

```typescript
export function getGuenstigsterGrundpreis(product: ShopwareProduct): number | null {
  const staffelPreise = product.calculatedPrices;
  if (!staffelPreise || staffelPreise.length === 0) return null;
  
  // Letzter Staffelpreis = günstigster (höchste Menge)
  const guenstigste = staffelPreise[staffelPreise.length - 1];
  return guenstigste.referencePrice?.price || null;
}

export function getGrundpreisEinheit(product: ShopwareProduct): string {
  const staffelPreise = product.calculatedPrices;
  if (!staffelPreise || staffelPreise.length === 0) return 'Rolle(n)';
  
  return staffelPreise[0].referencePrice?.unitName || 'Rolle(n)';
}
```

## "Ab-Preis" Anzeige anpassen

Der angezeigte Hauptpreis soll der günstigste Staffelpreis sein (nicht der teuerste):

```tsx
// Günstigster Staffelpreis = letzter in der Liste
const guenstigsterPreis = product.calculatedPrices?.length > 0
  ? product.calculatedPrices[product.calculatedPrices.length - 1].unitPrice
  : product.calculatedPrice?.unitPrice || 0;

<p className="text-2xl font-bold">
  ab {guenstigsterPreis.toFixed(2).replace('.', ',')} €
  <span className="text-sm text-gray-500 ml-1">zzgl. 19% MwSt.</span>
</p>
```

## Auf der Vergleichsseite

Die Vergleichstabelle zeigt jetzt den echten Grundpreis aus Shopware statt einen berechneten:

```tsx
// Statt:  preisProRolle = gesamtPreis / rollenAnzahl  (unzuverlässig)
// Jetzt:  preisProRolle = product.calculatedPrices[last].referencePrice.price  (exakt)
```

Sortiere die Vergleichstabelle nach dem günstigsten Grundpreis (aus der letzten Staffel).

## Wichtig

- Lösche die Funktion `extractRollenAnzahl()` aus `price-utils.ts` — wird nicht mehr gebraucht
- Lösche die Funktion `berechneGrundpreis()` — wird ersetzt durch die API-Daten
- Behalte `formatGrundpreis()` für die Formatierung
- Der Grundpreis kommt jetzt zu 100% aus Shopware — keine eigene Berechnung mehr
- Wenn ein Produkt keine Staffelpreise hat (nur einen Einzelpreis), zeige keine Tabelle sondern nur den Einzelpreis
- Wenn ein Produkt keinen Grundpreis hat (kein `referencePrice`), zeige in der Grundpreis-Spalte einen Strich "—"
- Preise sind netto (exkl. MwSt.) — konsistent mit dem Shop
