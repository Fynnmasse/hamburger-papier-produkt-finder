# CLAUDE.md — Hamburg Papier Produkt-Finder

> **Self-Maintenance:** Diese Datei muss nach jeder Änderung am Projekt automatisch aktualisiert werden.
> Wenn neue Dateien, Komponenten, Abhängigkeiten, Farben, Befehle oder Architekturänderungen hinzukommen,
> passe die betroffenen Abschnitte dieser CLAUDE.md sofort mit an — ohne dass der Nutzer danach fragen muss.

---

## Project Overview

B2B-Produktberater für **Hamburg Papier** (Hygienepapier-Großhandel).
Next.js App Router mit SSR/SSG, SEO-optimierter URL-Struktur und mehrstufigem Produkt-Finder.
Jede Kategorie und jeder Wizard-Schritt hat eine eigene, crawlbare URL.

- **Live-Shop:** https://www.hamburgpapier-shop.de
- **Zielgruppe:** B2B-Kunden (Gastronomie, Hotels, Facility Management, Arztpraxen)
- **Sprache:** Deutsch (UI-Texte, Commits, Kommentare)
- **Deploy:** Vercel (automatisch bei git push)

---

## Tech-Stack

| Bereich       | Technologie                                        |
|---------------|----------------------------------------------------|
| Framework     | Next.js 16 (App Router) + React 19 + TypeScript 5.9|
| Rendering     | SSG (Static Site Generation) für alle Seiten       |
| Styling       | Tailwind CSS 3.4 + Custom CSS Keyframes            |
| Animationen   | Framer Motion 12                                   |
| Icons         | Lucide React                                       |
| Utilities     | clsx + tailwind-merge (`cn()` Helper)              |
| Fonts         | next/font: DM Sans (Body), Comfortaa (Display)     |
| SEO           | generateMetadata, generateStaticParams, JSON-LD    |
| Background    | WebGL Fragment Shader (GPU-beschleunigt)            |

---

## Core Rules

1. **TypeScript strict** — Keine `any`-Types. Interfaces für Props und Datenstrukturen verwenden.
2. **Kein Inline-Styling** — Ausschließlich Tailwind-Klassen nutzen. CSS-Keyframes nur in `index.css`.
3. **Tailwind-Merge** — Immer `cn()` aus `@/lib/utils` verwenden, wenn Klassen dynamisch zusammengesetzt werden.
4. **Deutsche UI-Texte** — Alle sichtbaren Texte auf Deutsch. Keine englischen Strings in der UI.
5. **Keine neuen Abhängigkeiten** ohne explizite Zustimmung. Das Projekt soll schlank bleiben.
6. **Kein Over-Engineering** — Keine Abstraktion für einmalige Operationen. Einfachste Lösung bevorzugen.
7. **Server Components bevorzugen** — `'use client'` nur wenn nötig (Interaktivität, Hooks, Browser-APIs).

---

## File Structure

```
├── app/                        # Next.js App Router
│   ├── layout.tsx              # Root-Layout (next/font, Tailwind, Metadata)
│   ├── page.tsx                # Startseite: Hero + Kategorie-Grid + SEO-Content
│   ├── sitemap.ts              # Dynamische XML-Sitemap (alle Finder-URLs)
│   ├── robots.ts               # robots.txt
│   ├── toilettenpapier/        # Kategorie-Route
│   │   ├── page.tsx            # Erster Schritt (Typ-Auswahl)
│   │   └── [...schritte]/page.tsx  # Weitere Schritte + Ergebnisse (SSG)
│   ├── papierhandtuecher/      # Analog
│   ├── handtuchrollen/
│   ├── putzpapier/
│   ├── kuechenrollen/
│   ├── spender/
│   └── seife/                  # Direkt Ergebnisse (keine Steps)
├── public/                     # Statische Assets (SVG-Icons, Logo, Favicon)
├── src/
│   ├── index.css               # Tailwind-Setup, CSS-Variablen, Keyframe-Animationen
│   ├── components/
│   │   ├── hero-section.tsx    # Client: Hero-Landingpage mit Framer-Motion
│   │   ├── category-grid.tsx   # Client: Kategorie-Kacheln (Link-basiert)
│   │   ├── category-page.tsx   # Server: Shared Layout für alle Kategorie-Seiten
│   │   ├── step-selection.tsx  # Client: Step-Optionen als Links
│   │   ├── product-card.tsx    # Server: Produktkarte mit UTM-Links
│   │   ├── product-results.tsx # Server: Ergebnis-Grid mit Produktkarten
│   │   ├── finder-header.tsx   # Client: Sticky Header im Finder
│   │   ├── breadcrumbs.tsx     # Server: Breadcrumb-Nav + JSON-LD Schema
│   │   └── ui/
│   │       ├── loading-lines.tsx           # Loading-Splash-Screen
│   │       ├── aurora-hero-bg-1.tsx        # Hero-Hintergrund-Wrapper
│   │       └── dynamic-wave-background.tsx # WebGL Shader (GPU)
│   └── lib/
│       ├── products.ts              # ⭐ Produktdaten (179 Produkte) + Product-Interface
│       ├── finder-config.ts         # ⭐ Kategorie-Definitionen, Steps, Filter-Logik
│       ├── category-route-helpers.ts # generateMetadata + generateStaticParams Helpers
│       └── utils.ts                 # cn() Helper (clsx + tailwind-merge)
├── next.config.ts              # Next.js Config (Images remote patterns)
├── tailwind.config.js          # Brand-Farben, Custom-Fonts, Keyframes
└── tsconfig.json               # TypeScript Config
```

---

## URL-Struktur (SEO-optimiert)

```
/                                    → Hero + Kategorie-Auswahl
/toilettenpapier                     → Typ-Auswahl (Kleinrollen/Jumborollen/Spender)
/toilettenpapier/kleinrollen         → Menge-Auswahl
/toilettenpapier/kleinrollen/karton  → Qualitäts-Auswahl
/toilettenpapier/kleinrollen/karton/recycling → Ergebnis-Seite
/papierhandtuecher                   → Falzung-Auswahl
/papierhandtuecher/z-falz/palette/zellstoff → Ergebnis-Seite
... (analog für alle Kategorien)
/sitemap.xml                         → Dynamische Sitemap
/robots.txt                          → robots.txt
```

Alle Seiten werden bei `npm run build` statisch vorgerendert (SSG).

---

## Key Commands

```bash
npm run dev       # Next.js Dev-Server starten (Turbopack)
npm run build     # Next.js Production-Build (SSG)
npm run start     # Production-Build lokal starten
npm run lint      # Next.js Lint
```

**Vor jedem Commit:** `npm run build` muss fehlerfrei durchlaufen.

---

## Routing & Data Flow

- **File-Based Routing:** Next.js App Router. Jede Kategorie hat eigene Route.
- **Catch-All Routes:** `[...schritte]` fängt alle Step-Kombinationen ab.
- **`finder-config.ts`:** Zentrale Konfiguration aller Kategorien, Steps, Labels.
- **`parseStepParams()`:** URL-Segmente → FilterParams-Objekt.
- **`filterProducts()`:** Filtert 179 Produkte basierend auf Params.
- **`getCurrentStep()`:** Bestimmt den aktuellen Wizard-Schritt oder ob Ergebnisse gezeigt werden.
- **`getAllStaticPaths()`:** Generiert alle Kombinationen für `generateStaticParams()`.
- **Produktdaten:** Statisch in `src/lib/products.ts`. Kein API-Call.

---

## SEO Features

- **Eigene URL pro Schritt:** Jede Auswahl hat eine crawlbare URL.
- **`generateMetadata()`:** Title + Description pro Seite.
- **`generateStaticParams()`:** Alle ~200 Seiten werden statisch vorgerendert.
- **Breadcrumbs:** Navigation + `BreadcrumbList` JSON-LD Schema.
- **Structured Data:** `WebApplication`, `FAQPage`, `ItemList` JSON-LD.
- **Sitemap:** Dynamisch generiert mit allen Finder-URLs.
- **SEO-Content-Blöcke:** Informativer Text pro Kategorie (200–400 Wörter).
- **UTM-Parameter:** Alle Shop-Links enthalten `utm_source=produktfinder`.

---

## Style & UI

### Brand-Farben (Tailwind-Config)
| Name     | Hex       | Tailwind-Klasse |
|----------|-----------|-----------------|
| Teal     | `#008490` | `text-primary`, `bg-teal` |
| Navy     | `#1a2b3d` | `text-navy`, `bg-navy`    |
| Steel    | `#4b6b8b` | `text-steel`              |
| Sand     | `#f0f6fb` | `bg-sand`                 |
| Lt. Teal | `#00c4d0` | (CSS-Keyframes)           |

### Fonts (next/font)
- **Display:** `font-display` → Comfortaa (Überschriften, Buttons)
- **Body:** `font-body` → DM Sans (Fließtext, UI-Elemente)

### Regeln
- Tags/Badges nutzen vordefinierte `.tag-*` Klassen aus `index.css`
- Animationen: Framer Motion für Hero, CSS-Keyframes für Loading-Screen
- Responsive: Mobile-first mit Tailwind-Breakpoints (`sm:`, `md:`, `lg:`)
- Hero-Hintergrund: WebGL Fragment Shader (GPU-beschleunigt, 60fps)

---

## Path Aliases

```
@/ → ./src/
```

Immer `@/components/...`, `@/lib/...` statt relative Pfade verwenden.

---

## Product Data Schema

```typescript
interface Product {
  name: string       // Produktname (deutsch, enthält Details wie Falz-Typ, Lagenzahl)
  num: string        // Artikelnummer
  price: number      // Bruttopreis inkl. MwSt.
  img: string        // Bild-URL (Hamburg Papier CDN)
  url: string        // Link zum Shop-Produkt
  category: string   // Hauptkategorie (lowercase)
  quantity: string   // Mengeneinheit: 'palette', 'karton', 'stueck'
  material: string   // 'zellstoff', 'recycling', 'mischung'
  layers: number     // Lagenzahl (2, 3, etc.)
  eco: string[]      // Öko-Labels: ['blauer-engel', 'eu-ecolabel', etc.]
}
```

**Kategorien:** toilettenpapier, papierhandtuecher, handtuchrollen, putzpapier, spender, kuechenrollen, seife

---

## Git & Workflow

### Commit-Messages
- Kurz und beschreibend, auf **Deutsch oder Englisch** (konsistent innerhalb eines Commits)
- Format: `<was geändert wurde>` — z.B. `Loading Animation kürzen`, `ProductFinder Bugs beheben`
- Kein Conventional-Commits-Prefix erforderlich

### Branching
- `master` ist der Hauptbranch
- Für größere Features: Feature-Branch erstellen, dann PR

### Vor dem Commit
1. `npm run build` — muss fehlerfrei sein
2. Keine Dateien mit Secrets committen (`.env`, API-Keys)
3. Keine leeren/unbenutzen Imports oder Variablen
