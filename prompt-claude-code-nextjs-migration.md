# Prompt für Claude Code: Vite+React Produktfinder → Next.js (SSR) umstellen

---

## Projektbeschreibung

Ich habe einen **Produktfinder für Hygienepapier** (B2B) als Vite+React-Projekt gebaut. Er ist aktuell live auf Vercel:
**https://hamburger-papier-produkt-finder.vercel.app/**

Das GitHub-Repo ist: **Fynnmasse/hamburger-papier-produkt-finder**

Der Produktfinder führt Neukunden in 3–4 Klicks zum richtigen Produkt. Er hat folgende Pfade:
- **Papierhandtücher** → Abmessung → Lagen → Material → Ergebnis
- **Toilettenpapier** → Lagen → Material → Blattzahl → Ergebnis
- **Putzpapier** → Branche/Anwendung → Verschmutzungsgrad → Qualität → Ergebnis
- **Handtuchrollen** → Abwicklungsart → Breite → Lagen → Ergebnis
- **Branchensuche** → Automobil/Werkstatt, Gastronomie, Fitness/Solarien, Lebensmittelindustrie

---

## Auftrag

Stelle mein Vite+React-Projekt auf **Next.js (App Router)** um, damit es **Server-Side Rendering (SSR)** unterstützt. Das ist notwendig für SEO — Google muss jede Seite crawlen und indexieren können.

### Anforderungen im Detail:

### 1. Migration von Vite+React → Next.js App Router
- Übernimm alle bestehenden Komponenten, Styles, Assets und Logik
- Nutze den **App Router** (Verzeichnis `app/`, nicht `pages/`)
- Behalte das bestehende Design und die Funktionalität 1:1 bei
- Stelle sicher, dass alle Bilder, Fonts und Assets korrekt migriert werden
- Ersetze Vite-spezifische Imports (z.B. `import.meta.env`) durch Next.js-Äquivalente
- Falls React Router verwendet wird: ersetze es durch Next.js File-Based Routing

### 2. SEO-optimierte URL-Struktur mit eigenen Routen
Jeder Pfad und jedes Ergebnis im Produktfinder muss eine eigene, crawlbare URL bekommen. Erstelle die folgende Routenstruktur:

```
app/
├── page.tsx                                          → Startseite (Produktauswahl)
├── papierhandtuecher/
│   ├── page.tsx                                      → Abmessungs-Auswahl
│   ├── [abmessung]/
│   │   ├── page.tsx                                  → Lagen-Auswahl
│   │   ├── [lagen]/
│   │   │   ├── page.tsx                              → Material-Auswahl
│   │   │   ├── [material]/
│   │   │   │   └── page.tsx                          → Ergebnis-Seite
├── toilettenpapier/
│   ├── page.tsx                                      → Lagen-Auswahl
│   ├── [lagen]/
│   │   ├── page.tsx                                  → Material-Auswahl
│   │   ├── [material]/
│   │   │   ├── page.tsx                              → Blattzahl-Auswahl
│   │   │   ├── [blattzahl]/
│   │   │   │   └── page.tsx                          → Ergebnis-Seite
├── putzpapier/
│   ├── page.tsx                                      → Anwendungs-Auswahl
│   ├── [anwendung]/
│   │   ├── page.tsx                                  → Qualitäts-Auswahl
│   │   ├── [qualitaet]/
│   │   │   └── page.tsx                              → Ergebnis-Seite
├── handtuchrollen/
│   ├── page.tsx                                      → Abwicklungsart-Auswahl
│   ├── [abwicklung]/
│   │   ├── page.tsx                                  → Breite/Lagen-Auswahl
│   │   ├── [details]/
│   │   │   └── page.tsx                              → Ergebnis-Seite
├── branche/
│   ├── page.tsx                                      → Branchen-Übersicht
│   ├── [branche]/
│   │   └── page.tsx                                  → Branchenspezifische Empfehlung
├── layout.tsx                                        → Root Layout (Header, Footer, Meta)
├── sitemap.ts                                        → Dynamische XML-Sitemap
└── robots.ts                                         → robots.txt
```

Passe die URL-Slugs so an, dass sie den tatsächlichen Auswahlmöglichkeiten meines Produktfinders entsprechen. Verwende die deutschen Begriffe als Slugs (z.B. `/papierhandtuecher/25x23cm/2-lagig/zellstoff/`).

### 3. SEO-Metadaten pro Seite
Jede Seite braucht eigene, optimierte Metadaten. Nutze Next.js `generateMetadata()`:

```typescript
// Beispiel für eine Ergebnis-Seite
export async function generateMetadata({ params }) {
  return {
    title: `Papierhandtücher ${params.lagen} ${params.material} | Hamburgpapier Produktfinder`,
    description: `Finden Sie ${params.lagen} Papierhandtücher aus ${params.material} mit ${params.abmessung} Abmessung. Kostenloser Versand, EU Ecolabel, kostenlose Muster.`,
    alternates: {
      canonical: `https://www.hamburgpapier-shop.de/produktfinder/papierhandtuecher/${params.abmessung}/${params.lagen}/${params.material}/`
    }
  }
}
```

Erstelle sinnvolle Title-Tags und Meta-Descriptions für JEDE Route. Orientiere dich an diesen Keywords:
- "Papierhandtücher [Lagen] [Material] kaufen"
- "Toilettenpapier [Lagen] [Blattzahl] Großhandel"
- "Putzpapier blau [Qualität] für [Branche]"
- "Handtuchrollen [Abwicklungsart] bestellen"
- "Hygienepapier für [Branche]"

### 4. XML-Sitemap und robots.txt
Erstelle eine dynamische Sitemap (`app/sitemap.ts`) die ALLE möglichen Finder-URLs auflistet. Erstelle auch eine `robots.ts` die den Zugang für Suchmaschinen erlaubt.

### 5. Statische Generierung wo möglich
Nutze `generateStaticParams()` für alle Routen, deren Pfade im Voraus bekannt sind. Da die Auswahlmöglichkeiten im Produktfinder fest definiert sind (nicht dynamisch aus einer Datenbank), können ALLE Seiten statisch vorgerendert werden:

```typescript
export async function generateStaticParams() {
  return [
    { abmessung: '21x21cm', lagen: '1-lagig', material: 'recycling' },
    { abmessung: '21x21cm', lagen: '1-lagig', material: 'zellstoff' },
    { abmessung: '24x21cm', lagen: '2-lagig', material: 'recycling' },
    // ... alle Kombinationen
  ]
}
```

### 6. SEO-Content-Blöcke pro Seite
Füge unter dem interaktiven Finder-Element auf jeder Seite einen kurzen, SEO-relevanten Textblock ein (200–400 Wörter). Beispiele:

- **Startseite:** "Finden Sie das richtige Hygienepapier für Ihren Betrieb — in nur 3 Klicks..."
- **Papierhandtücher-Seite:** "Papierhandtücher unterscheiden sich in Falzung, Lagenzahl und Material..."
- **Branche Lebensmittelindustrie:** "In der Lebensmittelverarbeitung ist gemäß EU-Verordnung 1935/2004 ausschließlich Putzpapier aus 100% Frischzellstoff zulässig..."
- **Ergebnis-Seiten:** Kurze Produktbeschreibung mit Vorteilen und Einsatzbereichen

Generiere diese Texte passend zum jeweiligen Finder-Schritt. Sie sollten informativ sein und die relevanten Keywords natürlich einbinden.

### 7. Shop-Verlinkung auf Ergebnis-Seiten
Auf jeder Ergebnis-Seite (wo ein konkretes Produkt empfohlen wird) zeige zwei Buttons:

```tsx
<a href={`https://www.hamburgpapier-shop.de/${produktSlug}?utm_source=produktfinder&utm_medium=ergebnis&utm_campaign=${kategorie}`}
   className="btn-primary">
  Jetzt bestellen
</a>
<a href={`https://www.hamburgpapier-shop.de/${produktSlug}?utm_source=produktfinder&utm_medium=muster&utm_campaign=${kategorie}`}
   className="btn-secondary">
  Kostenlos testen
</a>
```

### 8. Structured Data (JSON-LD)
Füge auf jeder Ergebnis-Seite Schema.org JSON-LD ein:

```tsx
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Product",
  "name": "Papierhandtücher 2-lagig Zellstoff Z-Falzung",
  "description": "...",
  "brand": { "@type": "Brand", "name": "Hamburgpapier" },
  "offers": {
    "@type": "Offer",
    "url": "https://www.hamburgpapier-shop.de/...",
    "availability": "https://schema.org/InStock"
  }
}
</script>
```

Auf der Startseite füge ein `FAQPage`-Schema ein mit häufigen Fragen wie "Welche Papierhandtücher passen in meinen Spender?" etc.

### 9. Breadcrumb-Navigation
Implementiere eine Breadcrumb-Komponente die den aktuellen Pfad im Finder anzeigt:

```
Startseite > Papierhandtücher > 25x23cm > 2-lagig > Zellstoff
```

Füge auch ein `BreadcrumbList`-Schema (JSON-LD) hinzu.

### 10. Technische Anforderungen
- **Vercel-kompatibel:** Das Projekt muss weiterhin auf Vercel deployen (es deployed automatisch bei git push)
- **Bilder:** Nutze `next/image` für optimierte Bildauslieferung
- **Fonts:** Nutze `next/font` falls Custom Fonts verwendet werden
- **Performance:** Ziel ist ein Lighthouse-Score von 90+ auf allen Seiten
- **TypeScript:** Nutze TypeScript für alle neuen Dateien
- **Bestehende Datenstruktur:** Behalte die bestehende Produktdaten-Struktur bei (ggf. als zentrale Datendatei unter `lib/data.ts`)

---

## Reihenfolge der Umsetzung

1. Neues Next.js-Projekt initialisieren (`npx create-next-app@latest`)
2. Bestehende Komponenten und Assets migrieren
3. Routing-Struktur mit App Router aufsetzen
4. SEO-Metadaten und generateStaticParams implementieren
5. SEO-Content-Blöcke hinzufügen
6. Sitemap und robots.txt erstellen
7. Structured Data (JSON-LD) einfügen
8. Breadcrumb-Navigation einbauen
9. Shop-Links mit UTM-Parametern einbauen
10. Testen: alle Routen, Bilder, Links, Lighthouse-Score prüfen

---

## Wichtig
- Behalte das bestehende Design und die UX 1:1 bei — der Produktfinder soll genau gleich aussehen und funktionieren
- Alle bisherigen Inhalte, Bilder und Texte müssen übernommen werden
- Baue nichts kaputt — teste nach jedem Schritt mit `npm run dev`
- Committe regelmäßig mit aussagekräftigen Commit-Messages
