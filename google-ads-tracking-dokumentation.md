# Google Ads Conversion Tracking — Shop-Link-Dokumentation

## Übersicht

Alle Links, die Nutzer vom Produktfinder zum Hamburgpapier-Shop weiterleiten, werden über ein globales gtag-Event (`produktfinder_to_shop`) getrackt. Dieses Dokument listet **alle Stellen** auf, an denen Shop-URLs generiert werden.

---

## 1. Globales Tracking-Script

**Datei:** `app/layout.tsx` (Zeile 80–101)

Das Tracking funktioniert über einen globalen Event-Listener, der **automatisch alle Shop-Links** erfasst — es muss kein onClick-Handler in den einzelnen Komponenten hinzugefügt werden.

```js
// Klicks auf <a>-Links zum Shop
document.addEventListener('click', function(e) {
  var link = e.target.closest('a[href*="hamburgpapier-shop.de"]');
  if (!link) return;
  if (typeof gtag === 'function') {
    gtag('event', 'produktfinder_to_shop', {
      event_category: 'produktfinder',
      event_label: link.href
    });
  }
});

// Form-Submits zum Shop (Gratis-Muster-Button)
document.addEventListener('submit', function(e) {
  var form = e.target.closest('form[action*="hamburgpapier-shop.de"]');
  if (!form) return;
  if (typeof gtag === 'function') {
    gtag('event', 'produktfinder_to_shop', {
      event_category: 'produktfinder',
      event_label: form.action
    });
  }
});
```

**Event-Daten, die an Google Ads gesendet werden:**

| Parameter        | Wert                              | Beispiel                                                                 |
|------------------|-----------------------------------|--------------------------------------------------------------------------|
| `event`          | `produktfinder_to_shop`           | Fester Event-Name                                                        |
| `event_category` | `produktfinder`                   | Feste Kategorie                                                          |
| `event_label`    | Vollständige Shop-URL inkl. UTM   | `https://www.hamburgpapier-shop.de/detail/...?utm_source=produktfinder&utm_medium=bestellen&utm_campaign=toilettenpapier` |

---

## 2. Stellen, an denen Shop-URLs generiert werden

### 2.1 ProductCard (`src/components/product-card.tsx`)

**Typ:** Server Component (kein `'use client'`)
**Verwendet in:** Ergebnis-Seiten aller Kategorien + Cross-Selling

**URL-Generierung (Zeile 17–20):**
```tsx
const utmBestellen = `utm_source=produktfinder&utm_medium=${utmMedium || 'bestellen'}&utm_campaign=${kategorie || 'allgemein'}`
const shopUrl = p.url
  ? `${p.url}?${utmBestellen}`
  : `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}&${utmBestellen}`
```

**Zwei klickbare Links pro Karte:**

| Element                          | Zeile    | Beschreibung                                    |
|----------------------------------|----------|-------------------------------------------------|
| Produktbild + Info (ganzer Block) | 43–91   | `<a href={shopUrl}>` — Klick auf Bild oder Text |
| "Jetzt bestellen"-Button          | 95–103  | `<a href={shopUrl}>` — Primärer CTA-Button      |

**UTM-Parameter:**
- `utm_source` = `produktfinder` (immer)
- `utm_medium` = `bestellen` (Standard) oder `cross-selling` (bei Cross-Selling-Sektion)
- `utm_campaign` = Kategorie-Slug (z.B. `toilettenpapier`, `papierhandtuecher`)

---

### 2.2 MusterButton (`src/components/muster-button.tsx`)

**Typ:** Server Component
**Verwendet in:** ProductCard (wenn Gratis-Muster verfügbar)

**URL-Generierung (Zeile 12):**
```tsx
<form
  method="POST"
  action="https://www.hamburgpapier-shop.de/checkout/sample-line-item/add"
  target="hamburgpapier-shop"
>
```

| Element                       | Beschreibung                                                  |
|-------------------------------|---------------------------------------------------------------|
| "Gratis Muster bestellen"    | Form-POST zum Shop-Warenkorb — wird vom `submit`-Listener getrackt |

**UTM-Parameter:** Als Hidden-Field `utm_source=produktfinder&utm_medium=muster&utm_campaign={kategorie}`

---

### 2.3 Preisvergleich (`src/components/vergleich-inhalt.tsx`)

**Typ:** Client Component (`'use client'`)
**Verwendet auf:** `/vergleich/{kategorie}`-Seiten

**URL-Generierung (Zeile 189–191 Desktop, Zeile 260–262 Mobile):**
```tsx
const utmUrl = p.url
  ? `${p.url}?utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${kategorie}`
  : `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}&utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${kategorie}`
```

**Zwei Link-Stellen:**

| Element                   | Zeile     | Beschreibung                         |
|---------------------------|-----------|--------------------------------------|
| Desktop-Tabelle "Bestellen" | 227–235 | `<a href={utmUrl}>` in Tabellenzeile |
| Mobile-Karte "Bestellen"   | 296–304 | `<a href={utmUrl}>` in Karten-Layout |

**UTM-Parameter:** `utm_medium=vergleich`, `utm_campaign={kategorie}`

---

### 2.4 Finder-Header (`src/components/finder-header.tsx`)

**Typ:** Client Component (`'use client'`)
**Verwendet auf:** Allen Seiten (Sticky-Header)

**Zwei "Zum Shop"-Links:**

| Element              | Zeile  | URL                                        |
|----------------------|--------|--------------------------------------------|
| Desktop "Zum Shop"   | 31–39 | `https://www.hamburgpapier-shop.de` (ohne UTM) |
| Mobile "Zum Shop"    | 70–76 | `https://www.hamburgpapier-shop.de` (ohne UTM) |

**Hinweis:** Diese Links haben **keine UTM-Parameter** — im `event_label` des Tracking-Events erscheint nur die nackte Shop-URL.

---

### 2.5 Cross-Selling (`src/components/cross-selling.tsx`)

**Typ:** Server Component
**Verwendet auf:** Ergebnis-Seiten (Spender ↔ Papierprodukte)

Nutzt intern die `ProductCard`-Komponente mit `utmMedium="cross-selling"`.
Die generierten URLs haben daher `utm_medium=cross-selling`.

---

## 3. Zusammenfassung aller UTM-Varianten

| utm_medium       | Herkunft                     | Komponente            |
|------------------|------------------------------|-----------------------|
| `bestellen`      | Produktkarte (Ergebnis-Seite) | ProductCard           |
| `cross-selling`  | Cross-Selling-Sektion        | ProductCard via CrossSelling |
| `vergleich`      | Preisvergleich-Seite         | VergleichInhalt       |
| `muster`         | Gratis-Muster-Button         | MusterButton          |
| *(keiner)*       | Header "Zum Shop"            | FinderHeader          |

---

## 4. So testest du das Tracking

1. Seite im Browser öffnen
2. DevTools → Console → folgenden Code einfügen:
   ```js
   dataLayer.push = new Proxy(dataLayer.push, {
     apply(target, thisArg, args) {
       console.log('gtag:', args[0]);
       return Reflect.apply(target, thisArg, args);
     }
   });
   ```
3. Auf einen Shop-Link klicken (mit Strg gedrückt, damit die Seite nicht wegnavigiert)
4. In der Console erscheint:
   ```
   gtag: Arguments(3)
     0: "event"
     1: "produktfinder_to_shop"
     2: {event_category: 'produktfinder', event_label: 'https://www.hamburgpapier-shop.de/...'}
   ```
