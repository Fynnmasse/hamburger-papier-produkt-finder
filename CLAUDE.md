# CLAUDE.md — Hamburg Papier Produkt-Finder

> **Self-Maintenance:** Diese Datei muss nach jeder Änderung am Projekt automatisch aktualisiert werden.
> Wenn neue Dateien, Komponenten, Abhängigkeiten, Farben, Befehle oder Architekturänderungen hinzukommen,
> passe die betroffenen Abschnitte dieser CLAUDE.md sofort mit an — ohne dass der Nutzer danach fragen muss.

---

## Project Overview

B2B-Produktberater für **Hamburg Papier** (Hygienepapier-Großhandel).
Single-Page-App mit animierter Hero-Landingpage und mehrstufigem Produkt-Finder-Wizard.
Der Wizard führt B2B-Kunden durch kategoriespezifische Fragen und zeigt am Ende 1–4 passende Produkte.

- **Live-Shop:** https://www.hamburgpapier-shop.de
- **Zielgruppe:** B2B-Kunden (Gastronomie, Hotels, Facility Management, Arztpraxen)
- **Sprache:** Deutsch (UI-Texte, Commits, Kommentare)

---

## Tech-Stack

| Bereich       | Technologie                                      |
|---------------|--------------------------------------------------|
| Framework     | React 19 + TypeScript 5.9                        |
| Build         | Vite 8                                           |
| Styling       | Tailwind CSS 3.4 + Custom CSS Keyframes          |
| Animationen   | Framer Motion 12                                 |
| UI-Primitives | Radix UI (Dialog, Slot), Lucide Icons            |
| Utilities     | clsx + tailwind-merge (`cn()` Helper)            |
| Linting       | ESLint 9 + react-hooks + react-refresh           |
| Fonts         | Google Fonts: DM Sans (Body), Comfortaa (Display)|

---

## Core Rules

1. **TypeScript strict** — Keine `any`-Types. Interfaces für Props und Datenstrukturen verwenden.
2. **Kein Inline-Styling** — Ausschließlich Tailwind-Klassen nutzen. CSS-Keyframes nur in `index.css`.
3. **Tailwind-Merge** — Immer `cn()` aus `@/lib/utils` verwenden, wenn Klassen dynamisch zusammengesetzt werden.
4. **Deutsche UI-Texte** — Alle sichtbaren Texte auf Deutsch. Keine englischen Strings in der UI.
5. **Keine neuen Abhängigkeiten** ohne explizite Zustimmung. Das Projekt soll schlank bleiben.
6. **Kein Over-Engineering** — Keine Abstraktion für einmalige Operationen. Einfachste Lösung bevorzugen.

---

## File Structure

```
├── public/                    # Statische Assets (SVG-Icons, Logo, Favicon)
│   ├── Logo.svg
│   ├── Favicon.svg
│   └── [Kategorie].svg       # Icons pro Produktkategorie
├── src/
│   ├── main.tsx               # React-Entrypoint (StrictMode)
│   ├── App.tsx                # Root-Komponente: View-Routing (hero ↔ finder), Loading-State
│   ├── index.css              # Tailwind-Setup, CSS-Variablen, Keyframe-Animationen, Tag-Styles
│   ├── components/
│   │   ├── ProductFinder/
│   │   │   └── index.tsx      # ⭐ Kern: Mehrstufiger Wizard mit kategoriespezifischen Flows
│   │   └── ui/
│   │       ├── hero-1.tsx     # Hero-Landingpage mit Framer-Motion-Animationen
│   │       ├── loading-lines.tsx  # Loading-Splash-Screen (CSS-Keyframe-Animation)
│   │       ├── aurora-hero-bg-1.tsx  # Animierter Hintergrund-Gradient
│   │       └── dialog.tsx     # Radix-Dialog-Wrapper
│   └── lib/
│       ├── products.ts        # ⭐ Produktdaten (179 Produkte) + Product-Interface
│       └── utils.ts           # cn() Helper (clsx + tailwind-merge)
├── tailwind.config.js         # Brand-Farben, Custom-Fonts, Keyframes, Animationen
├── vite.config.ts             # Vite + React-Plugin, @/-Alias auf ./src
└── tsconfig.json              # TypeScript-Projekt-Referenzen
```

---

## Key Commands

```bash
npm run dev       # Vite Dev-Server starten (HMR)
npm run build     # TypeScript prüfen + Vite Production-Build
npm run lint      # ESLint ausführen
npm run preview   # Production-Build lokal testen
```

**Vor jedem Commit:** `npm run build` muss fehlerfrei durchlaufen (inkl. TypeScript-Check).

---

## State & Data Handling

- **Kein externer State-Manager** — Reines `useState` + Props-Drilling.
- **View-Routing:** `App.tsx` verwaltet `view: 'hero' | 'finder'` als State (kein Router).
- **Loading-Timing:** `ready`-State wird nach 2400ms gesetzt (synchronisiert mit Loading-Animation).
- **Produktdaten:** Statisch in `src/lib/products.ts` als Array. Kein API-Call, kein Lazy-Loading.
- **ProductFinder-Flow:**
  - `Answers`-Objekt sammelt Wizard-Antworten (`category`, `subtype`, `quantity`, `material`)
  - `getStepsForCategory()` gibt kategoriespezifische Schritte zurück
  - `getActiveSteps()` überspringt Schritte, wenn bereits ≤4 Produkte gefiltert sind
  - `filterProducts()` filtert die 179 Produkte basierend auf `Answers`
  - `matchesSubtype()` nutzt **Regex auf Produktnamen** für feinere Zuordnung

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

### Fonts
- **Display:** `font-display` → Comfortaa (Überschriften, Buttons)
- **Body:** `font-body` → DM Sans (Fließtext, UI-Elemente)

### Regeln
- Tags/Badges nutzen vordefinierte `.tag-*` Klassen aus `index.css`
- Animationen: Framer Motion für Layout-Transitionen, CSS-Keyframes für Loading-Screen
- Responsive: Mobile-first mit Tailwind-Breakpoints (`sm:`, `md:`, `lg:`)
- Hover-States: `transition-colors` / `transition-opacity` für weiche Übergänge

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
