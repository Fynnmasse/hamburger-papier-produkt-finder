# Prompt: "Kostenlos testen"-Button im Produktfinder einbauen

## Was gebaut werden soll

Auf jeder **Ergebnis-Seite** des Produktfinders soll neben dem bestehenden "Jetzt bestellen"-Button ein zweiter Button erscheinen: **"Kostenlos testen"**. Dieser Button legt das Muster des empfohlenen Produkts direkt in den Warenkorb des Shops (hamburgpapier-shop.de) — ohne dass der Kunde die Produktseite im Shop besuchen muss.

---

## Technische Umsetzung

### So funktioniert der Muster-Warenkorb

Der Shop nutzt das ACRIS Muster-Plugin. Ein Muster wird über einen POST-Request an den Shop hinzugefügt:

**Endpunkt:** `https://www.hamburgpapier-shop.de/checkout/sample-line-item/add`
**Methode:** POST
**Content-Type:** `application/x-www-form-urlencoded`

**Payload-Felder** (die ID in den eckigen Klammern ist die referencedId des Produkts):
```
redirectTo=frontend.checkout.cart.page
lineItems[{referencedId}][id]={referencedId}
lineItems[{referencedId}][type]=sample
lineItems[{referencedId}][referencedId]={referencedId}
lineItems[{referencedId}][sampleId]=0193f361b61e705c91ad45e3c5570185
lineItems[{referencedId}][stackable]=0
lineItems[{referencedId}][removable]=1
lineItems[{referencedId}][quantity]=1
lineItems[{referencedId}][orderSampleMaxAmount]=1
lineItems[{referencedId}][orderSampleVariationAmount]=10
lineItems[{referencedId}][orderMixedAllowed]=isAllowed
```

**WICHTIG:** Die `sampleId` ist für ALLE Produkte identisch: `0193f361b61e705c91ad45e3c5570185`

### Umsetzung als HTML-Formular

Der "Kostenlos testen"-Button soll ein unsichtbares Formular absenden, das direkt an den Shop POSTet. Da der Produktfinder auf einer anderen Domain liegt (Vercel), muss das Formular als normaler Form-Submit (nicht AJAX) funktionieren — der Kunde wird nach dem Klick zum Shop weitergeleitet und sieht dort seinen Warenkorb mit dem Muster drin.

```tsx
// Beispiel-Komponente für den Muster-Button
function MusterButton({ referencedId, produktName }: { referencedId: string; produktName: string }) {
  return (
    <form
      method="POST"
      action="https://www.hamburgpapier-shop.de/checkout/sample-line-item/add"
      target="_blank"
    >
      <input type="hidden" name="redirectTo" value="frontend.checkout.cart.page" />
      <input type="hidden" name={`lineItems[${referencedId}][id]`} value={referencedId} />
      <input type="hidden" name={`lineItems[${referencedId}][type]`} value="sample" />
      <input type="hidden" name={`lineItems[${referencedId}][referencedId]`} value={referencedId} />
      <input type="hidden" name={`lineItems[${referencedId}][sampleId]`} value="0193f361b61e705c91ad45e3c5570185" />
      <input type="hidden" name={`lineItems[${referencedId}][stackable]`} value="0" />
      <input type="hidden" name={`lineItems[${referencedId}][removable]`} value="1" />
      <input type="hidden" name={`lineItems[${referencedId}][quantity]`} value="1" />
      <input type="hidden" name={`lineItems[${referencedId}][orderSampleMaxAmount]`} value="1" />
      <input type="hidden" name={`lineItems[${referencedId}][orderSampleVariationAmount]`} value="10" />
      <input type="hidden" name={`lineItems[${referencedId}][orderMixedAllowed]`} value="isAllowed" />
      <button type="submit" className="btn-secondary">
        Kostenlos testen
      </button>
    </form>
  );
}
```

---

## Produkt-Daten (referencedId + Shop-URL pro Produkt)

Erstelle eine zentrale Datei `lib/sample-products.ts` mit allen Produkten und ihren IDs. Hier sind ALLE Produkte mit Muster-Funktion:

```typescript
export const SAMPLE_ID = "0193f361b61e705c91ad45e3c5570185";

export interface SampleProduct {
  name: string;
  referencedId: string;
  shopUrl: string;
}

export const sampleProducts: Record<string, SampleProduct> = {
  // === PAPIERHANDTÜCHER 1-LAGIG ===
  
  // ECO LINE Grau 24x21cm
  "papierhandtuecher-grau-ecoline-1-lagig-karton": {
    name: "Papierhandtücher 1 lagig GRAU ECO LINE Z Falzung 24x21cm Karton",
    referencedId: "00000000000000000000000000001027",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-grau-ecoline-1-lagig-karton"
  },
  "papierhandtuecher-1-lagig-grau-ecoline-palette": {
    name: "Papierhandtücher 1 lagig GRAU ECO LINE Z Falzung 24x21cm Palette",
    referencedId: "0000000000000000000000000000102a",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-1-lagig-grau-ecoline-palette"
  },
  
  // ECO LINE Grün 24x21cm
  "papierhandtuecher-gruen-ecoline-1-lagig-karton": {
    name: "Papierhandtücher 1 lagig GRÜN ECO LINE Z Falzung 24x21cm Karton",
    referencedId: "00000000000000000000000000001026",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-gruen-ecoline-1-lagig-karton"
  },
  "papierhandtuecher-gruen-ecoline-1-lagig-palette": {
    name: "Papierhandtücher 1 lagig GRÜN ECO LINE Z Falzung 24x21cm Palette",
    referencedId: "00000000000000000000000000001023",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-gruen-ecoline-1-lagig-palette"
  },
  
  // ECO Grau 25x23cm
  "papierhandtuecher-1-lagig-eco-kartonversand": {
    name: "Papierhandtücher 1 lagig GRAU ECO Z Falzung 25x23cm Karton",
    referencedId: "00000000000000000000000000000e1b",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-1-lagig-eco-kartonversand"
  },
  "papierhandtuecher-1-lagig-eco-palette": {
    name: "Papierhandtücher 1 lagig GRAU ECO Z Falzung 25x23cm Palette",
    referencedId: "00000000000000000000000000000d9d",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-1-lagig-eco-palette"
  },
  
  // Ohne Plastik 25x23cm
  "papierhandtuecher-kaufen-ohne-plastik-verpackung": {
    name: "Papierhandtücher 1 lagig GRAU Z Falzung ohne Plastik 25x23cm Karton",
    referencedId: "00000000000000000000000000001069",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-kaufen-ohne-plastik-verpackung"
  },
  "papierhandtuecher-kaufen-1-lagig-palettenversand": {
    name: "Papierhandtücher 1 lagig GRAU Z Falzung ohne Plastik 25x23cm Palette",
    referencedId: "000000000000000000000000000009b7",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-kaufen-1-lagig-palettenversand"
  },
  
  // PREMIUM hellgrau 24x21cm
  "papierhandtuecher-recycling-1-lagig-kartonversand": {
    name: "Papierhandtücher 1 lagig hellgrau PREMIUM Z Falzung 24x21cm Karton",
    referencedId: "00000000000000000000000000000e67",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-recycling-1-lagig-kartonversand"
  },
  "papierhandtuecher-1-lagig-hellgrau-premium": {
    name: "Papierhandtücher 1 lagig hellgrau PREMIUM Z Falzung 24x21cm Palette",
    referencedId: "00000000000000000000000000000d4b",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-1-lagig-hellgrau-premium"
  },
  
  // Handtuchpapier weiß 24x21cm
  "handtuchpapier-weiss-kartonversand": {
    name: "Handtuchpapier 1 lagig weiß Z Falzung 24x21cm Karton",
    referencedId: "00000000000000000000000000000e6b",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchpapier-weiss-kartonversand"
  },
  "handtuchpapier-weiss-palettenversand": {
    name: "Handtuchpapier 1 lagig weiß Z Falzung 24x21cm Palette",
    referencedId: "00000000000000000000000000000d4c",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchpapier-weiss-palettenversand"
  },
  
  // Falthandtücher grün 24x21cm
  "falthandtuecher-gruen-kartonversand": {
    name: "Falthandtücher 1 lagig GRÜN Z Falzung 24x21cm Karton",
    referencedId: "00000000000000000000000000000e6c",
    shopUrl: "https://www.hamburgpapier-shop.de/falthandtuecher-gruen-kartonversand"
  },
  "falthandtuecher-gruen-palettenversand": {
    name: "Falthandtücher 1 lagig GRÜN Z Falzung 24x21cm Palette",
    referencedId: "00000000000000000000000000000a51",
    shopUrl: "https://www.hamburgpapier-shop.de/falthandtuecher-gruen-palettenversand"
  },
  
  // Interfold 1 lagig
  "papierhandtuecher-interfold-1-lagig-kartonversand": {
    name: "Papierhandtücher 1 lagig Interfold recycling Havanna 21x24cm Karton",
    referencedId: "00000000000000000000000000000e99",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-interfold-1-lagig-kartonversand"
  },
  "papierhandtuecher-interfold-1-lagig-recycling": {
    name: "Papierhandtücher 1 lagig Interfold recycling Havanna 21x24cm Palette",
    referencedId: "00000000000000000000000000000e97",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-interfold-1-lagig-recycling"
  },

  // === PAPIERHANDTÜCHER 2-LAGIG ===
  
  // ECOLINE Zellstoff 25x21cm
  "papierhandtuecher-2-lagig-ecoline": {
    name: "Papierhandtücher 2 lagig hochweiß ECOLINE Zellstoff Z Falzung 25x21cm Karton",
    referencedId: "00000000000000000000000000000f16",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-ecoline"
  },
  "papierhandtuecher-2-lagig-zellstoff-ecoline": {
    name: "Papierhandtücher 2 lagig hochweiß ECOLINE Zellstoff Z Falzung 25x21cm Palette",
    referencedId: "00000000000000000000000000000f54",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-zellstoff-ecoline"
  },
  
  // ECOLINE recycling 25x21cm
  "papierhandtuecher-2-lagig-ecoline-karton": {
    name: "Papierhandtücher 2 lagig weiß ECOLINE recycling Z Falzung 25x21cm Karton",
    referencedId: "00000000000000000000000000000f1c",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-ecoline-karton"
  },
  "papierhandtuecher-2-lagig-weiss-ecoline": {
    name: "Papierhandtücher 2 lagig weiß ECOLINE recycling Z Falzung 25x21cm Palette",
    referencedId: "00000000000000000000000000000ef0",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-weiss-ecoline"
  },
  
  // Weiß recycling 25x21cm
  "papierhandtuecher-2-lagig-weiss-kaufen": {
    name: "Papierhandtücher 2 lagig weiß recycling Z Falzung 25x21cm Karton",
    referencedId: "00000000000000000000000000000e6d",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-weiss-kaufen"
  },
  "papierhandtuecher-2-lagig-weiss-grosshandel": {
    name: "Papierhandtücher 2 lagig weiß recycling Z Falzung 25x21cm Palette",
    referencedId: "00000000000000000000000000000a78",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-weiss-grosshandel"
  },
  
  // Zellstoff hochweiß 25x21cm
  "papierhandtuecher-2-lagig-zellstoff-guenstig": {
    name: "Papierhandtücher 2 lagig hochweiß Zellstoff Z Falzung 25x21cm Karton",
    referencedId: "00000000000000000000000000000e6e",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-zellstoff-guenstig"
  },
  "papierhandtuecher-2-lagig-zellstoff-grosshandel": {
    name: "Papierhandtücher 2 lagig hochweiß Zellstoff Z Falzung 25x21cm Palette",
    referencedId: "000000000000000000000000000009b8",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-zellstoff-grosshandel"
  },
  
  // Grün recycling 24x21cm
  "papierhandtuecher-2-lagig-gruen-online-bestellen": {
    name: "Papierhandtücher 2 lagig grün recycling Z Falzung 24x21cm Karton",
    referencedId: "00000000000000000000000000000e73",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-gruen-online-bestellen"
  },
  "papierhandtuecher-2-lagig-gruen-palettenversand": {
    name: "Papierhandtücher 2 lagig grün recycling Z Falzung 24x21cm Palette",
    referencedId: "00000000000000000000000000000d3b",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-gruen-palettenversand"
  },
  
  // Schwarz Zellstoff 22x21cm
  "papierhandtuecher-2-lagig-schwarz-kartonversand": {
    name: "Papierhandtücher 2 lagig schwarz Zellstoff Z Falzung 22x21cm Karton",
    referencedId: "00000000000000000000000000000e70",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-schwarz-kartonversand"
  },
  "papierhandtuecher-2-lagig-schwarz-palettenversand": {
    name: "Papierhandtücher 2 lagig schwarz Zellstoff Z Falzung 22x21cm Palette",
    referencedId: "00000000000000000000000000000dd0",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-2-lagig-schwarz-palettenversand"
  },

  // === PAPIERHANDTÜCHER 3-LAGIG ===
  
  "papierhandtuecher-3-lagig-gold-karton": {
    name: "Papierhandtücher 3 lagig hochweiß Zellstoff GOLD Z Falzung 24x21cm Karton",
    referencedId: "00000000000000000000000000000f24",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-3-lagig-gold-karton"
  },
  "papierhandtuecher-3-lagig-gold": {
    name: "Papierhandtücher 3 lagig hochweiß Zellstoff GOLD Z Falzung 24x21cm Palette",
    referencedId: "00000000000000000000000000000f23",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuecher-3-lagig-gold"
  },

  // === TOILETTENPAPIER 2-LAGIG ===
  
  "toilettenpapier-2-lagig-weiss-recycling-grosshandel": {
    name: "Toilettenpapier 2 lagig weiß recycling 250 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000000b9a",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-2-lagig-weiss-recycling-grosshandel"
  },
  "toilettenpapier-2-lagig-recycling-250": {
    name: "Toilettenpapier 2 lagig weiß recycling 250 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000cf7",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-2-lagig-recycling-250"
  },
  "toilettenpapier-2-lagig-recycling-400-blatt-128-rollen": {
    name: "Toilettenpapier 2 lagig recycling weiß 400 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000000e74",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-2-lagig-recycling-400-blatt-128-rollen"
  },
  "toilettenpapier-2-lagig-recycling-400-blatt-2112-rollen": {
    name: "Toilettenpapier 2 lagig recycling weiß 400 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000d0f",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-2-lagig-recycling-400-blatt-2112-rollen"
  },
  "toilettenpapier-2-lagig-zellstoff-200-blatt": {
    name: "Toilettenpapier 2 lagig Zellstoff Super Soft 200 Blatt Palette",
    referencedId: "00000000000000000000000000000d56",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-2-lagig-zellstoff-200-blatt"
  },

  // === TOILETTENPAPIER 3-LAGIG ===
  
  "toilettenpapier-3-lagig-zellstoff-150-blatt-ab-128-rollen": {
    name: "Toilettenpapier 3 lagig Zellstoff 150 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000001057",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-zellstoff-150-blatt-ab-128-rollen"
  },
  "toilettenpapier-3-lagig-zellstoff-150-blatt-kaufen": {
    name: "Toilettenpapier 3 lagig Zellstoff 150 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000c62",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-zellstoff-150-blatt-kaufen"
  },
  "toilettenpapier-kaufen-3-lagig-200-blatt": {
    name: "Toilettenpapier 3 lagig Zellstoff 200 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000000ca6",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-kaufen-3-lagig-200-blatt"
  },
  "toilettenpapier-3-lagig-200-blatt-betriebsbedarf": {
    name: "Toilettenpapier 3 lagig Zellstoff 200 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000c50",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-200-blatt-betriebsbedarf"
  },
  "toilettenpapier-3-lagig-zellstoff-soft-250-blatt-128-rollen": {
    name: "Toilettenpapier 3 lagig Zellstoff SOFT 250 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000001059",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-zellstoff-soft-250-blatt-128-rollen"
  },
  "toilettenpapier-3-lagig-zellstoff-soft-250-blatt": {
    name: "Toilettenpapier 3 lagig Zellstoff SOFT 250 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000c3e",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-zellstoff-soft-250-blatt"
  },
  "toilettenpapier-3-lagig-128-rollen-kaufen": {
    name: "Toilettenpapier 3 lagig Zellstoff SUPER SOFT 250 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000000e76",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-128-rollen-kaufen"
  },
  "toilettenpapier-3-lagig-super-soft-kaufen": {
    name: "Toilettenpapier 3 lagig Zellstoff SUPER SOFT 250 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000d48",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-super-soft-kaufen"
  },
  "toilettenpapier-3-lagig-gold-ultra-soft-112-rollen": {
    name: "Toilettenpapier 3 lagig Zellstoff Ultra Soft 250 Blatt 112 Rollen Karton",
    referencedId: "00000000000000000000000000000f65",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-gold-ultra-soft-112-rollen"
  },
  "toilettenpapier-3-lagig-zellstoff-ultra-soft": {
    name: "Toilettenpapier 3 lagig Zellstoff ULTRA SOFT 250 Blatt 1848 Rollen Palette",
    referencedId: "00000000000000000000000000000f56",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-zellstoff-ultra-soft"
  },
  "toilettenpapier-3-lagig-recycling-250": {
    name: "Toilettenpapier 3 lagig recycling 250 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000000eae",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-recycling-250"
  },
  "toilettenpapier-3-lagig-recycling-palettenversand": {
    name: "Toilettenpapier 3 lagig recycling 250 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000eee",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-3-lagig-recycling-palettenversand"
  },

  // === TOILETTENPAPIER 4-LAGIG ===
  
  "toilettenpapier-4-lagig-guenstig-128-rollen": {
    name: "Toilettenpapier 4 lagig Zellstoff Super Soft 165 Blatt 128 Rollen Karton",
    referencedId: "00000000000000000000000000000cd4",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-4-lagig-guenstig-128-rollen"
  },
  "toilettenpapier-4-lagig-kaufen": {
    name: "Toilettenpapier 4 lagig Zellstoff Super Soft 165 Blatt 2112 Rollen Palette",
    referencedId: "00000000000000000000000000000d4a",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-4-lagig-kaufen"
  },

  // === TOILETTENPAPIER EINZELBLATT ===
  
  "toilettenpapier-einzelblatt-2-lagig-9000-stueck": {
    name: "Toilettenpapier Einzelblatt 2 lagig Zellstoff 9000 Blatt Karton",
    referencedId: "00000000000000000000000000000e79",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-einzelblatt-2-lagig-9000-stueck"
  },
  "toilettenpapier-einzelblatt-grosshandel": {
    name: "Toilettenpapier Einzelblatt 2 lagig Zellstoff 9000 Blatt Palette",
    referencedId: "00000000000000000000000000000d67",
    shopUrl: "https://www.hamburgpapier-shop.de/toilettenpapier-einzelblatt-grosshandel"
  },

  // === TOILETTENPAPIER OHNE PLASTIK ===
  
  // (Hinweis: Falls im Finder vorhanden, hier die IDs aus dem CSV-Export ergänzen)

  // === JUMBOTOILETTENPAPIER ===
  
  "jumbotoilettenpapier-1-lagig-recyling-570-m-kartonversand": {
    name: "Jumbotoilettenpapier 1 lagig recycling 570m Karton",
    referencedId: "00000000000000000000000000000ea5",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-1-lagig-recyling-570-m-kartonversand"
  },
  "jumbotoilettenpapier-1-lagig-recycling-grosshandel": {
    name: "Jumbotoilettenpapier 1 lagig recycling 570m 252 Rollen Palette",
    referencedId: "00000000000000000000000000000d62",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-1-lagig-recycling-grosshandel"
  },
  "jumbotoilettenpapier-2-lagig-recycling-330m-18-rollen": {
    name: "Jumbotoilettenpapier 2 lagig recycling 330m Karton",
    referencedId: "00000000000000000000000000000e78",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-2-lagig-recycling-330m-18-rollen"
  },
  "jumbotoilettenpapier-2-lagig-recycling-grosshandel": {
    name: "Jumbotoilettenpapier 2 lagig recycling 330m 294 Rollen Palette",
    referencedId: "00000000000000000000000000000fdc",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-2-lagig-recycling-grosshandel"
  },
  "jumbotoilettenpapier-2-lagig-zellstoff-ab-18-rollen": {
    name: "Jumbotoilettenpapier 2 lagig Zellstoff 330m Karton",
    referencedId: "00000000000000000000000000000e77",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-2-lagig-zellstoff-ab-18-rollen"
  },
  "jumbotoilettenpapier-2-lagig-zellstoff-palettenversand": {
    name: "Jumbotoilettenpapier 2 lagig Zellstoff 330m 294 Rollen Palette",
    referencedId: "00000000000000000000000000000f57",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-2-lagig-zellstoff-palettenversand"
  },
  "48-rollen-jumbotoilettenpapier-mini-zellstoff-175-meter": {
    name: "Jumbotoilettenpapier MINI 2 lagig Zellstoff 175m Karton",
    referencedId: "00000000000000000000000000000fc1",
    shopUrl: "https://www.hamburgpapier-shop.de/48-rollen-jumbotoilettenpapier-mini-zellstoff-175-meter"
  },
  "jumbotoilettenpapier-mini-zellstoff-175-meter": {
    name: "Jumbotoilettenpapier MINI 2 lagig Zellstoff 175m 528 Rollen Palette",
    referencedId: "00000000000000000000000000000fbf",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-mini-zellstoff-175-meter"
  },
  "jumbotoilettenpapier-2-lagig-mini-130-meter": {
    name: "Jumbotoilettenpapier MINI 2 lagig Zellstoff 130m 528 Rollen Palette",
    referencedId: "00000000000000000000000000000d61",
    shopUrl: "https://www.hamburgpapier-shop.de/jumbotoilettenpapier-2-lagig-mini-130-meter"
  },

  // === PUTZPAPIER BLAU ===
  
  // Zellstoff
  "putztuchrolle-2-lagig-blau-ab-4-rollen": {
    name: "Putztuchrolle 2 lagig BLAU Zellstoff 35,5cm 1000 Abrisse Karton",
    referencedId: "00000000000000000000000000000e9b",
    shopUrl: "https://www.hamburgpapier-shop.de/putztuchrolle-2-lagig-blau-ab-4-rollen"
  },
  "putzrolle": {
    name: "Putzrolle 2 lagig BLAU Zellstoff 35,5cm 1000 Abrisse Palette",
    referencedId: "00000000000000000000000000000d9f",
    shopUrl: "https://www.hamburgpapier-shop.de/putzrolle"
  },
  "putzpapier-blau-3-lagig-zellstoff-kartonversand-ab-2-rollen": {
    name: "Putzpapier 3 lagig BLAU Zellstoff 35,5cm 1000 Abrisse Karton",
    referencedId: "00000000000000000000000000000ea6",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapier-blau-3-lagig-zellstoff-kartonversand-ab-2-rollen"
  },
  "putzpapier-blau-3-lagig-zellstoff-fachhandel": {
    name: "Putzpapier 3 lagig BLAU Zellstoff 35,5cm 1000 Abrisse Palette",
    referencedId: "00000000000000000000000000000da8",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapier-blau-3-lagig-zellstoff-fachhandel"
  },
  
  // Recycling
  "papierrolle-2-lagig-blau-recycling-werkstatt": {
    name: "Papierrollen Werkstatt 2 lagig BLAU recycling 22cm Karton",
    referencedId: "00000000000000000000000000000e7a",
    shopUrl: "https://www.hamburgpapier-shop.de/papierrolle-2-lagig-blau-recycling-werkstatt"
  },
  "papierrolle-werkstatt-2-lagig-blau-ab-108-rollen": {
    name: "Papierrolle Werkstatt 2 lagig BLAU recycling 22cm Palette",
    referencedId: "00000000000000000000000000000d4e",
    shopUrl: "https://www.hamburgpapier-shop.de/papierrolle-werkstatt-2-lagig-blau-ab-108-rollen"
  },
  "putzpapier-blau-2-lagig-recycling-34-cm-breite-ab-4-rollen": {
    name: "Putzpapier BLAU 2 lagig recycling 34cm 1000 Abrisse Karton",
    referencedId: "00000000000000000000000000000e7b",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapier-blau-2-lagig-recycling-34-cm-breite-ab-4-rollen"
  },
  "putzpapier-blau-2-lagig-recycling-34-cm-breite": {
    name: "Putzpapier BLAU 2 lagig recycling 34cm 1000 Abrisse Palette",
    referencedId: "00000000000000000000000000000d37",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapier-blau-2-lagig-recycling-34-cm-breite"
  },
  "putzpapierrollen-blau-3-lagig-ab-2-rollen": {
    name: "Putzpapierrolle 3 lagig BLAU recycling 34cm 1000 Abrisse Karton",
    referencedId: "00000000000000000000000000000e7c",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapierrollen-blau-3-lagig-ab-2-rollen"
  },
  "putzpapierrollen-blau-3-lagig-ab-35-rollen": {
    name: "Putzpapierrolle 3 lagig BLAU recycling 34cm 1000 Abrisse Palette",
    referencedId: "00000000000000000000000000000d36",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapierrollen-blau-3-lagig-ab-35-rollen"
  },
  "putzpapier-3-lagig-blau-recycling-ab-2-rollen": {
    name: "Putzpapier BLAU 3 lagig recycling 37cm 1000 Abrisse Karton",
    referencedId: "00000000000000000000000000001067",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapier-3-lagig-blau-recycling-ab-2-rollen"
  },
  "putzpapier-3-lagig-blau-recycling-ab-40-rollen": {
    name: "Putzpapier 3 lagig BLAU recycling 37cm 1000 Abrisse Palette",
    referencedId: "00000000000000000000000000000d4f",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapier-3-lagig-blau-recycling-ab-40-rollen"
  },
  "putzpapier-2-lagig-weiss-22-cm-breite-1500-abrisse": {
    name: "Putzpapier WEIß 2 lagig recycling 22cm 1500 Abrisse Palette",
    referencedId: "00000000000000000000000000000d5c",
    shopUrl: "https://www.hamburgpapier-shop.de/putzpapier-2-lagig-weiss-22-cm-breite-1500-abrisse"
  },

  // === HANDTUCHROLLEN ===
  
  // Außenabwicklung 20cm
  "handtuchrollen-2-lagig-zellstoff-kartonversand-ab-12-rollen": {
    name: "Handtuchrollen 2 lagig Zellstoff 130m 20cm Karton",
    referencedId: "00000000000000000000000000000c07",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-zellstoff-kartonversand-ab-12-rollen"
  },
  "handtuchrollen-2-lagig-zellstoff-palettenversand": {
    name: "Handtuchrollen 2 lagig Zellstoff 130m 20cm 240 Rollen Palette",
    referencedId: "00000000000000000000000000000d42",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-zellstoff-palettenversand"
  },
  "handtuchrollen-2-lagig-120-meter-strong-ab-12-rollen": {
    name: "Handtuchrollen 2 lagig Zellstoff STRONG 120m 20cm Karton",
    referencedId: "00000000000000000000000000000e87",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-120-meter-strong-ab-12-rollen"
  },
  "handtuchrollen-2-lagig-120-meter-strong-ab-240-rollen": {
    name: "Handtuchrollen 2 lagig Zellstoff STRONG 120m 20cm Palette",
    referencedId: "00000000000000000000000000000d43",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-120-meter-strong-ab-240-rollen"
  },
  "handtuchrollen-2-lagig-natural-200-m-ab-18-rollen": {
    name: "Handtuchrollen 2 lagig NATURAL 200m 20cm Karton",
    referencedId: "00000000000000000000000000001032",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-natural-200-m-ab-18-rollen"
  },
  "handtuchrollen-2-lagig-natural-200-m-ab-240-rollen": {
    name: "Handtuchrollen 2 lagig NATURAL 200m 20cm 240 Rollen Palette",
    referencedId: "0000000000000000000000000000102f",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-natural-200-m-ab-240-rollen"
  },
  
  // Außenabwicklung 20,5cm
  "12-handtuchrollen-2-lagig-20-5-cm-breite-kartonversand": {
    name: "Handtuchrollen 2 lagig Zellstoff 130m 20,5cm Karton",
    referencedId: "00000000000000000000000000000e8e",
    shopUrl: "https://www.hamburgpapier-shop.de/12-handtuchrollen-2-lagig-20-5-cm-breite-kartonversand"
  },
  "handtuchrollen-2-lagig-20-5-cm-breite-palettenversand": {
    name: "Handtuchrollen 2 lagig Zellstoff 130m 20,5cm Palette",
    referencedId: "00000000000000000000000000000d59",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-20-5-cm-breite-palettenversand"
  },
  
  // Außenabwicklung 21,3cm
  "handtuchrollen-2-lagig-21-3-cm-breite-ab-18-rollen": {
    name: "Handtuchrollen 2 lagig Zellstoff 120m 21,3cm Karton",
    referencedId: "00000000000000000000000000000e88",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-21-3-cm-breite-ab-18-rollen"
  },
  "handtuchrollen-2-lagig-21-3-cm-breite-palettenversand": {
    name: "Handtuchrollen 2 lagig Zellstoff 120m 21,3cm 240 Rollen Palette",
    referencedId: "00000000000000000000000000000d44",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-21-3-cm-breite-palettenversand"
  },
  
  // 3 lagig
  "handtuchpapierrollen": {
    name: "Handtuchpapierrollen 3 lagig Zellstoff 100m 20cm Karton",
    referencedId: "00000000000000000000000000000e8f",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchpapierrollen"
  },
  "papierhandtuchrollen": {
    name: "Papierhandtuchrollen 3 lagig Zellstoff 100m 20cm Palette",
    referencedId: "00000000000000000000000000000d5a",
    shopUrl: "https://www.hamburgpapier-shop.de/papierhandtuchrollen"
  },
  
  // Innenauszug + Außenabwicklung
  "12-Handtuchrollen-2-lagig-Zellstoff-143m-innenauszug-aussenabwicklung": {
    name: "Handtuchrollen 2 lagig Zellstoff 143m 595 Blatt Karton",
    referencedId: "00000000000000000000000000000e83",
    shopUrl: "https://www.hamburgpapier-shop.de/12-Handtuchrollen-2-lagig-Zellstoff-143m-innenauszug-aussenabwicklung"
  },
  "handtuchrollen-2-lagig-zellstoff-143m-innenauszug-und-aussenabwicklung": {
    name: "Handtuchrollen 2 lagig Zellstoff 143m 595 Blatt Palette",
    referencedId: "00000000000000000000000000000d39",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-zellstoff-143m-innenauszug-und-aussenabwicklung"
  },
  "handtuchrollen-2-lagig-zellstoff-100-m-innenauszug-aussenabwicklung-ab-12-rollen": {
    name: "Handtuchrollen 2 lagig Zellstoff 100m 475 Blatt Karton",
    referencedId: "00000000000000000000000000000e82",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-zellstoff-100-m-innenauszug-aussenabwicklung-ab-12-rollen"
  },
  "handtuchrollen-2-lagig-Zellstoff-100-m-innenauszug-und-aussenabwicklung": {
    name: "Handtuchrollen 2 lagig Zellstoff 100m 475 Blatt Palette",
    referencedId: "00000000000000000000000000000d2d",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-Zellstoff-100-m-innenauszug-und-aussenabwicklung"
  },
  "handtuchrollen-2-lagig-recycling-143-m-650-blatt-ab-12-rollen": {
    name: "Handtuchrollen 2 lagig recycling 143m 650 Blatt Karton",
    referencedId: "00000000000000000000000000000e80",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-recycling-143-m-650-blatt-ab-12-rollen"
  },
  "handtuchrollen-2-lagig-recycling-innenauszug": {
    name: "Handtuchrollen 2 lagig recycling 143m 650 Blatt Palette",
    referencedId: "00000000000000000000000000000ca2",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-recycling-innenauszug"
  },
  
  // Innenauszug
  "handtuchrollen-1-lagig-kartonversand": {
    name: "Handtuchrollen 1 lagig Zellstoff 275m 19cm Karton",
    referencedId: "00000000000000000000000000000e81",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-1-lagig-kartonversand"
  },
  "handtuchrollen-1-lagig-palettenversand": {
    name: "Handtuchrollen 1 lagig Zellstoff 275m 19cm Palette",
    referencedId: "00000000000000000000000000000c85",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-1-lagig-palettenversand"
  },
  "handtuchrollen-2-lagig-blau-innenauszug-kartonversand": {
    name: "Handtuchrollen 2 lagig Zellstoff blau 143m 600 Abrisse Karton",
    referencedId: "00000000000000000000000000000e8b",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-blau-innenauszug-kartonversand"
  },
  "handtuchrollen-2-lagig-blau-innenauszug-palettenversand": {
    name: "Handtuchrollen 2 lagig Zellstoff blau 143m 600 Abrisse Palette",
    referencedId: "00000000000000000000000000000c87",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-2-lagig-blau-innenauszug-palettenversand"
  },
  "handtuchrollen-1-lagig-zellstoff-innenauszug-ab-12-rollen": {
    name: "Handtuchrollen 1 lagig Zellstoff 300m 1070 Blatt Karton",
    referencedId: "00000000000000000000000000000e89",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-1-lagig-zellstoff-innenauszug-ab-12-rollen"
  },
  "handtuchrollen-1-lagig-zellstoff-innenauszug-ab-216-rollen": {
    name: "Handtuchrollen 1 lagig Zellstoff 300m 1070 Blatt Palette",
    referencedId: "00000000000000000000000000000d57",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-1-lagig-zellstoff-innenauszug-ab-216-rollen"
  },
  "handtuchrollen-1-lagig-zellstoff-innenauszug-ab-24-rollen": {
    name: "Handtuchrollen 1 lagig Zellstoff 120m 428 Blatt Karton",
    referencedId: "00000000000000000000000000000e8a",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-1-lagig-zellstoff-innenauszug-ab-24-rollen"
  },
  "handtuchrollen-1-lagig-zellstoff-innenauszug-ab-432-rollen": {
    name: "Handtuchrollen 1 lagig Zellstoff 120m 428 Blatt Palette",
    referencedId: "00000000000000000000000000000d58",
    shopUrl: "https://www.hamburgpapier-shop.de/handtuchrollen-1-lagig-zellstoff-innenauszug-ab-432-rollen"
  },

  // === KÜCHENROLLEN ===
  
  "kuechenrollen-kaufen": {
    name: "Küchenrollen 3 lagig Zellstoff 51 Blatt 26cm Karton",
    referencedId: "00000000000000000000000000000e9f",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-kaufen"
  },
  "kuechenrollen-3-lagig-zellstoff": {
    name: "Küchenrollen 3 lagig Zellstoff 51 Blatt 26cm Palette",
    referencedId: "00000000000000000000000000000c79",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-3-lagig-zellstoff"
  },
  "kuechenrollen-3-lagig-ecoline-ab-64-rollen": {
    name: "Küchenrollen 3 lagig ECOLINE Multi Size 90 Blatt Karton",
    referencedId: "00000000000000000000000000001020",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-3-lagig-ecoline-ab-64-rollen"
  },
  "kuechenrollen-3-lagig-ecoline-768-rollen": {
    name: "Küchenrollen 3 lagig ECOLINE Multi Size 90 Blatt Palette",
    referencedId: "00000000000000000000000000000e40",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-3-lagig-ecoline-768-rollen"
  },
  "kuechenrollen-xxl-400-blatt-18-rollen": {
    name: "Küchenrollen XXL 3 lagig Zellstoff 400 Blatt 22cm Karton",
    referencedId: "00000000000000000000000000000e51",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-xxl-400-blatt-18-rollen"
  },
  "kuechenrollen-xxl-400-blatt-216-rollen": {
    name: "Küchenrollen XXL 3 lagig Zellstoff 400 Blatt 22cm Palette",
    referencedId: "00000000000000000000000000000e46",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-xxl-400-blatt-216-rollen"
  },
  "kuechenrollen-2-lagig-64-rollen-kaufen": {
    name: "Küchenrollen 2 lagig Zellstoff 64 Blatt 26cm Karton",
    referencedId: "00000000000000000000000000000cab",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-2-lagig-64-rollen-kaufen"
  },
  "kuechenrollen-2-lagig-768-rollen": {
    name: "Küchenrollen 2 lagig Zellstoff 64 Blatt 26cm Palette",
    referencedId: "00000000000000000000000000000c5d",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenrollen-2-lagig-768-rollen"
  },
  "kuechenkrepp-2-lagig": {
    name: "Küchenkrepp 2 lagig Zellstoff 51 Blatt 23cm Palette",
    referencedId: "00000000000000000000000000000c66",
    shopUrl: "https://www.hamburgpapier-shop.de/kuechenkrepp-2-lagig"
  },

  // === ÄRZTEKREPP ===
  
  "aerztekrepp-39-cm-ab-9-rollen": {
    name: "Ärztekrepp 2 lagig Zellstoff hochweiß 39cm Karton",
    referencedId: "0000000000000000000000000000105f",
    shopUrl: "https://www.hamburgpapier-shop.de/aerztekrepp-39-cm-ab-9-rollen"
  },
  "aerztekrepp-39-cm-ab-216-rollen": {
    name: "Ärztekrepp 2 lagig Zellstoff hochweiß 39cm 216 Rollen Palette",
    referencedId: "00000000000000000000000000000d7c",
    shopUrl: "https://www.hamburgpapier-shop.de/aerztekrepp-39-cm-ab-216-rollen"
  },
  "aerztekrepp-50-cm-ab-9-rollen": {
    name: "Ärztekrepp 2 lagig Zellstoff hochweiß 50cm Karton",
    referencedId: "00000000000000000000000000000aaa",
    shopUrl: "https://www.hamburgpapier-shop.de/aerztekrepp-50-cm-ab-9-rollen"
  },
  "aerztekrepp-50-cm-ab-216-rollen": {
    name: "Ärztekrepp 2 lagig Zellstoff hochweiß 50cm 216 Rollen Palette",
    referencedId: "00000000000000000000000000000d7d",
    shopUrl: "https://www.hamburgpapier-shop.de/aerztekrepp-50-cm-ab-216-rollen"
  },
  "aerztekrepp-55-cm-ab-9-rollen": {
    name: "Ärztekrepp 2 lagig Zellstoff hochweiß 55cm Karton",
    referencedId: "00000000000000000000000000001061",
    shopUrl: "https://www.hamburgpapier-shop.de/aerztekrepp-55-cm-ab-9-rollen"
  },
  "aerztekrepp-55-cm-ab-162-rollen": {
    name: "Ärztekrepp 2 lagig Zellstoff hochweiß 55cm 162 Rollen Palette",
    referencedId: "00000000000000000000000000000d7e",
    shopUrl: "https://www.hamburgpapier-shop.de/aerztekrepp-55-cm-ab-162-rollen"
  },
  "aerzterolle-ab-9-rollen": {
    name: "Ärzterolle 2 lagig Zellstoff hochweiß 60cm Karton",
    referencedId: "0000000000000000000000000000105e",
    shopUrl: "https://www.hamburgpapier-shop.de/aerzterolle-ab-9-rollen"
  },
  "aerzterolle-2-lagig": {
    name: "Ärzterolle 2 lagig Zellstoff hochweiß 60cm Palette",
    referencedId: "00000000000000000000000000000d7f",
    shopUrl: "https://www.hamburgpapier-shop.de/aerzterolle-2-lagig"
  },

  // === SERVIETTEN ===
  
  "servietten-1-lagig-ab-2-kartons": {
    name: "Servietten 1 lagig 33x33cm 1/4 Falz Karton",
    referencedId: "00000000000000000000000000000ea4",
    shopUrl: "https://www.hamburgpapier-shop.de/servietten-1-lagig-ab-2-kartons"
  },
  "servietten-1-lagig-palettenversand": {
    name: "Servietten 1 lagig 33x33cm 1/4 Falz Palette",
    referencedId: "00000000000000000000000000000d54",
    shopUrl: "https://www.hamburgpapier-shop.de/servietten-1-lagig-palettenversand"
  },
  "servietten-2-lagig-kartonversand": {
    name: "Servietten 2 lagig Zellstoff 11x16,5cm 9000 Stück Karton",
    referencedId: "00000000000000000000000000000ec2",
    shopUrl: "https://www.hamburgpapier-shop.de/servietten-2-lagig-kartonversand"
  },
  "servietten-2-lagig-zellstoff": {
    name: "Servietten 2 lagig Zellstoff 11x16,5cm 9000 Stück Palette",
    referencedId: "00000000000000000000000000000d64",
    shopUrl: "https://www.hamburgpapier-shop.de/servietten-2-lagig-zellstoff"
  },
  "servietten-2-lagig-recycling-ab-2-kartons": {
    name: "Servietten 2 lagig recycling 11x16,5cm 9000 Stück Karton",
    referencedId: "00000000000000000000000000000f7e",
    shopUrl: "https://www.hamburgpapier-shop.de/servietten-2-lagig-recycling-ab-2-kartons"
  },
  "servietten-2-lagig-recycling": {
    name: "Servietten 2 lagig recycling 11x16,5cm 9000 Stück Palette",
    referencedId: "00000000000000000000000000000f7b",
    shopUrl: "https://www.hamburgpapier-shop.de/servietten-2-lagig-recycling"
  },

  // === MIKROFASERTÜCHER ===
  
  "mikrofasertuecher-40-40-cm": {
    name: "Mikrofasertücher Rot Standard 40x40cm 200 Stück Karton",
    referencedId: "00000000000000000000000000000f8b",
    shopUrl: "https://www.hamburgpapier-shop.de/mikrofasertuecher-40-40-cm"
  },
  "mikrofasertuch-stueck": {
    name: "Mikrofasertücher Grün Standard 40x40cm Stück",
    referencedId: "0000000000000000000000000000100c",
    shopUrl: "https://www.hamburgpapier-shop.de/mikrofasertuch-stueck"
  },

  // === KOSMETIKTÜCHER ===
  
  "kosmektiktuecher-2-lagig": {
    name: "Kosmetiktücher 2 lagig 100 Blatt Box Karton",
    referencedId: "00000000000000000000000000000ea3",
    shopUrl: "https://www.hamburgpapier-shop.de/kosmektiktuecher-2-lagig"
  },
  "kosmetiktuecher-100-blatt": {
    name: "Kosmetiktücher 2 lagig 100 Blatt Box Palette",
    referencedId: "00000000000000000000000000000d65",
    shopUrl: "https://www.hamburgpapier-shop.de/kosmetiktuecher-100-blatt"
  },
  "kosmetiktuecher-3-lagig-70-blatt": {
    name: "Kosmetiktücher 3 lagig 70 Blatt Box Karton",
    referencedId: "0000000000000000000000000000105c",
    shopUrl: "https://www.hamburgpapier-shop.de/kosmetiktuecher-3-lagig-70-blatt"
  },
  "kosmetiktuecher-3-lagig-ab-30-kartons": {
    name: "Kosmetiktücher 3 lagig 70 Blatt Box Palette",
    referencedId: "0000000000000000000000000000104d",
    shopUrl: "https://www.hamburgpapier-shop.de/kosmetiktuecher-3-lagig-ab-30-kartons"
  },
  "kosmetiktuecher-3-lagig-wuerfelbox": {
    name: "Kosmetiktücher 3 lagig Würfelbox 60 Blatt Karton",
    referencedId: "0000000000000000000000000000105a",
    shopUrl: "https://www.hamburgpapier-shop.de/kosmetiktuecher-3-lagig-wuerfelbox"
  },
  "kosmetiktuecher-wuerfel-3-lagig": {
    name: "Kosmetiktücher 3 lagig Würfel 60 Blatt Palette",
    referencedId: "00000000000000000000000000001056",
    shopUrl: "https://www.hamburgpapier-shop.de/kosmetiktuecher-wuerfel-3-lagig"
  },
};
```

---

## Aufgaben für Claude Code

1. **Erstelle `lib/sample-products.ts`** mit den obigen Daten
2. **Erstelle eine `MusterButton`-Komponente** die ein HTML-Formular mit POST an den Shop rendert (siehe Beispiel oben)
3. **Baue auf jeder Ergebnis-Seite zwei Buttons nebeneinander ein:**
   - "Jetzt bestellen" → `<a href="{shopUrl}?utm_source=produktfinder&utm_medium=bestellen&utm_campaign={kategorie}" target="_blank">`
   - "Kostenlos testen" → `<MusterButton referencedId="{referencedId}" />`
4. **Stelle sicher**, dass die `referencedId` korrekt aus den Finder-Ergebnissen an die Buttons übergeben wird. Matche das empfohlene Produkt aus dem Finder mit dem passenden Eintrag in `sampleProducts`.
5. **Styling:** Beide Buttons sollen gleich groß und nebeneinander sein. "Jetzt bestellen" = primärer Button (eure Hauptfarbe). "Kostenlos testen" = sekundärer Button (Outline/heller).
6. **UTM-Parameter** auf allen Shop-Links: `utm_source=produktfinder`, `utm_medium=bestellen` oder `utm_medium=muster`, `utm_campaign={kategorie-slug}`

---

## Wichtig
- Ändere NICHTS am Shopware-Shop oder am ACRIS-Plugin
- Der POST geht an eine externe Domain (hamburgpapier-shop.de) — das Formular muss als normaler Form-Submit funktionieren, nicht als AJAX/fetch
- Nutze `target="_blank"` damit der Produktfinder im Hintergrund offen bleibt
- Teste mit `npm run dev` und prüfe ob der Muster-Button funktioniert
