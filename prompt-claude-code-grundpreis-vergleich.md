# Prompt: Grundpreis-Vergleich (Preis pro Rolle) im Produktfinder

## Ziel

Auf jeder Ergebnis-Seite und auf einer eigenen Vergleichsseite soll der **Preis pro Rolle** berechnet und angezeigt werden. B2B-Einkäufer vergleichen nach Stückkosten, nicht nach Kartonpreis — dieser Grundpreis hilft ihnen die günstigste Option sofort zu erkennen.

---

## Teil 1: Grundpreis berechnen

### Rollenanzahl aus dem Produktnamen extrahieren

Die Rollenanzahl steht im Produktnamen, z.B.:
- "Toilettenpapier 3 lagig Zellstoff • 200 Blatt • **128 Rollen** Karton" → 128 Rollen
- "Toilettenpapier 3 lagig Zellstoff • 200 Blatt • **2112 Rollen** Palette" → 2112 Rollen
- "Handtuchrollen 2 lagig Zellstoff • 130m 20cm Breite • **6 Rollen** Karton" → 6 Rollen
- "Papierhandtücher 1 lagig GRAU • Z Falzung 25x23 cm" → Keine Rollen (Papierhandtücher werden in Blatt verkauft)

Erstelle eine Hilfsfunktion in `lib/price-utils.ts`:

```typescript
export interface GrundpreisInfo {
  preisProRolle: number | null;
  rollenAnzahl: number | null;
  gesamtPreis: number;
  einheit: string;
}

// Rollenanzahl aus Produktnamen extrahieren
export function extractRollenAnzahl(productName: string): number | null {
  // Muster: "128 Rollen", "2112 Rollen", "6 Rollen"
  const match = productName.match(/(\d+)\s*Rollen/i);
  if (match) return parseInt(match[1]);
  
  // Muster: "6 Rolle" (Singular)
  const matchSingular = productName.match(/(\d+)\s*Rolle\b/i);
  if (matchSingular) return parseInt(matchSingular[1]);
  
  return null;
}

// Stückzahl aus Produktnamen extrahieren (für Servietten, Kosmetiktücher etc.)
export function extractStueckzahl(productName: string): number | null {
  // Muster: "9000 Stück", "200 Stück", "4000 Blatt" (bei Servietten = Stück)
  const matchStueck = productName.match(/(\d+)\s*Stück/i);
  if (matchStueck) return parseInt(matchStueck[1]);
  
  return null;
}

// Grundpreis berechnen
export function berechneGrundpreis(productName: string, gesamtPreis: number): GrundpreisInfo {
  const rollenAnzahl = extractRollenAnzahl(productName);
  
  if (rollenAnzahl && rollenAnzahl > 0) {
    return {
      preisProRolle: gesamtPreis / rollenAnzahl,
      rollenAnzahl,
      gesamtPreis,
      einheit: 'Rolle'
    };
  }
  
  return {
    preisProRolle: null,
    rollenAnzahl: null,
    gesamtPreis,
    einheit: 'Rolle'
  };
}

// Grundpreis formatieren
export function formatGrundpreis(preisProRolle: number): string {
  if (preisProRolle < 0.01) {
    return `${(preisProRolle * 100).toFixed(2).replace('.', ',')} ct`;
  }
  return `${preisProRolle.toFixed(2).replace('.', ',')} €`;
}
```

---

## Teil 2: Grundpreis auf Ergebnis-Seiten anzeigen

### Auf jeder Produktkarte

Unter dem Gesamtpreis soll der Grundpreis angezeigt werden:

```tsx
import { berechneGrundpreis, formatGrundpreis } from '@/lib/price-utils';

// In der Produktkarte:
const grundpreis = berechneGrundpreis(product.name, getCheapestPrice(product));

<div>
  {/* Gesamtpreis */}
  <p className="text-2xl font-bold">
    ab {getCheapestPrice(product).toFixed(2).replace('.', ',')} €
    <span className="text-sm text-gray-500 ml-1">zzgl. 19% MwSt.</span>
  </p>
  
  {/* Grundpreis pro Rolle */}
  {grundpreis.preisProRolle !== null && (
    <p className="text-sm text-gray-600 mt-1">
      = {formatGrundpreis(grundpreis.preisProRolle)} pro Rolle
      <span className="text-gray-400 ml-1">({grundpreis.rollenAnzahl} Rollen)</span>
    </p>
  )}
</div>
```

### Günstigste Option hervorheben

Wenn auf einer Ergebnis-Seite mehrere Varianten angezeigt werden (z.B. Karton mit 128 Rollen und Palette mit 2112 Rollen), soll die Variante mit dem niedrigsten Preis pro Rolle ein Badge bekommen:

```tsx
// Alle Varianten mit Grundpreis
const varianten = filtered.map(product => ({
  product,
  grundpreis: berechneGrundpreis(product.name, getCheapestPrice(product))
}));

// Günstigste finden
const guenstigsteProRolle = varianten
  .filter(v => v.grundpreis.preisProRolle !== null)
  .sort((a, b) => a.grundpreis.preisProRolle! - b.grundpreis.preisProRolle!)[0];

// In der Produktkarte:
{product.id === guenstigsteProRolle?.product.id && varianten.length > 1 && (
  <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded">
    Bester Preis pro Rolle
  </span>
)}
```

---

## Teil 3: Eigene Vergleichsseite

### Route: `/vergleich` oder `/preisvergleich`

Erstelle eine eigene Seite auf der Kunden Produkte innerhalb einer Kategorie nach Grundpreis vergleichen können.

### URL-Struktur:
```
/vergleich                          → Kategorie-Auswahl
/vergleich/toilettenpapier          → Alle Toilettenpapiere nach Preis/Rolle sortiert
/vergleich/papierhandtuecher        → Alle Papierhandtücher (Preis/Rolle wo möglich)
/vergleich/handtuchrollen           → Alle Handtuchrollen nach Preis/Rolle sortiert
/vergleich/putzpapier               → Alle Putzpapiere nach Preis/Rolle sortiert
/vergleich/kuechenrollen            → Alle Küchenrollen nach Preis/Rolle sortiert
```

### Vergleichsseite Aufbau:

```tsx
import { fetchAllProducts, getCheapestPrice, getShopUrl, getCoverImage, hasSample } from '@/lib/shopware-api';
import { getProductsByCategory } from '@/lib/product-filters';
import { berechneGrundpreis, formatGrundpreis } from '@/lib/price-utils';

export default async function VergleichPage({ params }) {
  const allProducts = await fetchAllProducts();
  const categoryProducts = getProductsByCategory(allProducts, params.kategorie);
  
  // Grundpreise berechnen und sortieren
  const mitGrundpreis = categoryProducts
    .map(product => ({
      product,
      grundpreis: berechneGrundpreis(product.name, getCheapestPrice(product))
    }))
    .filter(item => item.grundpreis.preisProRolle !== null)
    .sort((a, b) => a.grundpreis.preisProRolle! - b.grundpreis.preisProRolle!);

  return (
    <div>
      <h1>Preisvergleich: {params.kategorie} — Preis pro Rolle</h1>
      <p className="text-gray-600 mb-6">
        Sortiert nach günstigstem Preis pro Rolle. Alle Preise netto zzgl. 19% MwSt.
      </p>
      
      {/* Vergleichstabelle */}
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-left">Produkt</th>
            <th className="text-right">Rollen</th>
            <th className="text-right">Gesamtpreis</th>
            <th className="text-right">Pro Rolle</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {mitGrundpreis.map((item, index) => (
            <tr key={item.product.id} className={index === 0 ? 'bg-green-50' : ''}>
              <td>
                <div className="flex items-center gap-3">
                  {getCoverImage(item.product) && (
                    <img 
                      src={getCoverImage(item.product)!} 
                      alt={item.product.name}
                      className="w-12 h-12 object-contain"
                    />
                  )}
                  <div>
                    <p className="font-medium text-sm">{item.product.name}</p>
                    {index === 0 && (
                      <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
                        Günstigste Option
                      </span>
                    )}
                  </div>
                </div>
              </td>
              <td className="text-right">{item.grundpreis.rollenAnzahl}</td>
              <td className="text-right">
                {getCheapestPrice(item.product).toFixed(2).replace('.', ',')} €
              </td>
              <td className="text-right font-bold">
                {formatGrundpreis(item.grundpreis.preisProRolle!)}
              </td>
              <td className="text-right">
                <a 
                  href={`${getShopUrl(item.product)}?utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${params.kategorie}`}
                  target="hamburgpapier-shop"
                  className="text-sm btn-primary"
                >
                  Bestellen
                </a>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### Vergleichs-Startseite (`/vergleich`)

```tsx
export default function VergleichStartseite() {
  const kategorien = [
    { slug: 'toilettenpapier', name: 'Toilettenpapier', icon: '...' },
    { slug: 'handtuchrollen', name: 'Handtuchrollen', icon: '...' },
    { slug: 'putzpapier', name: 'Putzpapier', icon: '...' },
    { slug: 'kuechenrollen', name: 'Küchenrollen', icon: '...' },
    { slug: 'jumbotoilettenpapier', name: 'Jumbotoilettenpapier', icon: '...' },
    { slug: 'aerztekrepp', name: 'Ärztekrepp', icon: '...' },
  ];
  
  return (
    <div>
      <h1>Preisvergleich nach Grundpreis pro Rolle</h1>
      <p>Vergleichen Sie alle Produkte einer Kategorie nach dem günstigsten Preis pro Rolle.</p>
      {kategorien.map(kat => (
        <a key={kat.slug} href={`/vergleich/${kat.slug}`}>
          {kat.name}
        </a>
      ))}
    </div>
  );
}
```

---

## Teil 4: Filter auf der Vergleichsseite

Die Vergleichsseite soll Filter haben, damit der Kunde die Ergebnisse eingrenzen kann:

```tsx
// Filter-Optionen dynamisch aus den verfügbaren Produkten generieren
const verfuegbareLagen = getAvailableOptions(categoryProducts, 'lagen');
const verfuegbareMaterialien = getAvailableOptions(categoryProducts, 'material');

// Filter-UI
<div className="flex gap-4 mb-6">
  <select onChange={...}>
    <option value="">Alle Lagen</option>
    {verfuegbareLagen.map(l => <option key={l} value={l}>{l}-lagig</option>)}
  </select>
  
  <select onChange={...}>
    <option value="">Alle Materialien</option>
    {verfuegbareMaterialien.map(m => <option key={m} value={m}>{m}</option>)}
  </select>
  
  <select onChange={...}>
    <option value="">Alle Versandarten</option>
    <option value="Karton">Karton</option>
    <option value="Palette">Palette</option>
  </select>
</div>
```

Da die Seite serverseitig gerendert wird, können die Filter als URL-Parameter funktionieren:
```
/vergleich/toilettenpapier?lagen=3&material=zellstoff
```

---

## Teil 5: Verlinkung zum Vergleich

### Vom Finder-Ergebnis zur Vergleichsseite

Auf jeder Ergebnis-Seite einen dezenten Link einbauen:

```tsx
<p className="text-sm text-gray-500 mt-4">
  <a href={`/vergleich/${kategorie}`} className="underline">
    Alle {kategorieName} nach Grundpreis vergleichen →
  </a>
</p>
```

### Von der Startseite

Auf der Produktfinder-Startseite einen Einstieg zum Preisvergleich einbauen — z.B. als zusätzliche Kachel oder als Link unter den Kategorien:

```tsx
<a href="/vergleich" className="...">
  Preisvergleich — Finden Sie den günstigsten Preis pro Rolle
</a>
```

### In der Navigation

Einen Link "Preisvergleich" in die Header-Navigation aufnehmen.

---

## Teil 6: SEO für die Vergleichsseiten

### Metadaten pro Vergleichsseite

```typescript
export async function generateMetadata({ params }) {
  return {
    title: `${params.kategorie} Preisvergleich — Preis pro Rolle | Hamburgpapier`,
    description: `Vergleichen Sie alle ${params.kategorie} nach dem günstigsten Preis pro Rolle. B2B Großhandelspreise, versandkostenfrei, EU Ecolabel.`,
    alternates: {
      canonical: `https://www.hamburgpapier-shop.de/produkt-finder/vergleich/${params.kategorie}`
    }
  }
}
```

### SEO-Text unter der Tabelle

Auf jeder Vergleichsseite einen kurzen Text:

Für Toilettenpapier z.B.:
"Der Preis pro Rolle ist der fairste Vergleichswert beim Kauf von Toilettenpapier im Großhandel. Durch den Kauf größerer Mengen (Palettenversand) sinkt der Rollenpreis deutlich. Alle unsere Produkte sind EU Ecolabel zertifiziert und werden versandkostenfrei geliefert."

### Structured Data

Auf der Vergleichsseite ein `ItemList`-Schema (JSON-LD) einfügen mit den Produkten sortiert nach Grundpreis.

---

## Teil 7: Responsive Design

### Desktop: Tabelle
Vollständige Tabelle wie oben beschrieben.

### Mobile: Karten
Auf mobilen Geräten statt Tabelle einzelne Karten:

```tsx
<div className="md:hidden">
  {mitGrundpreis.map((item, index) => (
    <div key={item.product.id} className="border rounded-lg p-4 mb-3">
      {index === 0 && (
        <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded">
          Günstigste Option
        </span>
      )}
      <p className="font-medium mt-2">{item.product.name}</p>
      <div className="flex justify-between mt-2">
        <span className="text-gray-500">{item.grundpreis.rollenAnzahl} Rollen</span>
        <span className="font-bold">{formatGrundpreis(item.grundpreis.preisProRolle!)} / Rolle</span>
      </div>
      <p className="text-gray-500 text-sm">{getCheapestPrice(item.product).toFixed(2).replace('.', ',')} € gesamt</p>
    </div>
  ))}
</div>
```

---

## Zusammenfassung

### Neue Dateien:
1. `lib/price-utils.ts` — Grundpreis-Berechnung und Formatierung
2. `app/vergleich/page.tsx` — Vergleichs-Startseite
3. `app/vergleich/[kategorie]/page.tsx` — Vergleichsseite pro Kategorie

### Geänderte Dateien:
4. Alle Ergebnis-Seiten — Grundpreis unter dem Gesamtpreis anzeigen + "Bester Preis pro Rolle" Badge
5. Startseite — Link zum Preisvergleich
6. Navigation/Header — Link "Preisvergleich"

### Wichtig:
- Die Rollenanzahl wird aus dem Produktnamen extrahiert — funktioniert nur wenn "X Rollen" im Namen steht
- Bei Papierhandtüchern wird keine Rollenanzahl gefunden (werden in Blatt/Stück verkauft) — dort keinen Grundpreis anzeigen
- Preise sind netto (konsistent mit dem Shop)
- Die Vergleichsseite nutzt die gleiche API wie der restliche Finder (alle 30 Sek aktualisiert)
- Der "Günstigste Option"-Badge soll nur erscheinen wenn es mindestens 2 Produkte zum Vergleichen gibt
