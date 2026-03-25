# Prompt: Subdomain produktfinder.hamburgpapier-shop.de konfigurieren

## Was passiert ist

Die Produktfinder-Website ist jetzt unter einer eigenen Subdomain erreichbar:
`https://produktfinder.hamburgpapier-shop.de`

Die alte Vercel-URL (`hamburger-papier-produkt-finder.vercel.app`) funktioniert weiterhin, leitet aber automatisch auf die neue Domain um.

## Änderungen die gemacht werden müssen

### 1. Canonical URLs aktualisieren

In allen `generateMetadata()` Funktionen die Canonical-URL auf die neue Domain setzen:

```typescript
// VORHER:
alternates: {
  canonical: `https://hamburger-papier-produkt-finder.vercel.app/${path}`
}

// NACHHER:
alternates: {
  canonical: `https://produktfinder.hamburgpapier-shop.de/${path}`
}
```

Am besten eine zentrale Konstante erstellen:
```typescript
// lib/constants.ts
export const SITE_URL = 'https://produktfinder.hamburgpapier-shop.de';
export const SHOP_URL = 'https://www.hamburgpapier-shop.de';
```

Und überall `SITE_URL` verwenden statt hardcoded URLs.

### 2. Sitemap URLs aktualisieren

In `app/sitemap.ts` die Base-URL ändern:
```typescript
// Alle URLs in der Sitemap müssen die neue Domain verwenden
const baseUrl = 'https://produktfinder.hamburgpapier-shop.de';
```

### 3. Structured Data (JSON-LD) URLs aktualisieren

In allen JSON-LD Blöcken die URLs auf die neue Domain ändern:
```json
{
  "@context": "https://schema.org",
  "url": "https://produktfinder.hamburgpapier-shop.de/..."
}
```

### 4. Open Graph / Social Media Meta-Tags

Falls vorhanden, OG-Tags aktualisieren:
```typescript
openGraph: {
  url: `https://produktfinder.hamburgpapier-shop.de/${path}`,
  siteName: 'Hamburgpapier Produktfinder',
}
```

### 5. Revalidation Endpoint URL dokumentieren

Der manuelle Preis-Refresh ist jetzt erreichbar unter:
```
https://produktfinder.hamburgpapier-shop.de/api/revalidate?secret=EUER_SECRET
```

### 6. Interne Links prüfen

Suche nach allen Referenzen zur alten Vercel-URL und ersetze sie:
```bash
grep -rn "hamburger-papier-produkt-finder.vercel.app" app/ lib/ components/ --include="*.tsx" --include="*.ts"
```
Alle Treffer durch `produktfinder.hamburgpapier-shop.de` ersetzen.

### 7. robots.ts aktualisieren

```typescript
export default function robots() {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
    },
    sitemap: 'https://produktfinder.hamburgpapier-shop.de/sitemap.xml',
  }
}
```

## Wichtig
- Die Shop-Links (zu hamburgpapier-shop.de) bleiben UNVERÄNDERT
- Die Shopware API URL bleibt UNVERÄNDERT (store-api)
- Der MusterButton POST-Ziel bleibt UNVERÄNDERT (hamburgpapier-shop.de/checkout/...)
- Nur die eigenen URLs des Produktfinders ändern sich
- Nach allen Änderungen: commiten und pushen → Vercel deployt automatisch auf der neuen Domain
