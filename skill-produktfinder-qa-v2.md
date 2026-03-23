# SKILL: Produktfinder Qualitätsprüfung & Optimierung v2

## Beschreibung
Prüft den Hamburger Papier Produktfinder auf logische Fehler, fehlende Produkte, Sackgassen und SEO-Probleme. Dieser Skill gibt KONKRETE Befehle und Code-Snippets die ausgeführt werden müssen — nicht nur Beschreibungen.

---

## SCHRITT 1: Projekt scannen und Inventar erstellen

Führe diese Befehle aus und speichere die Ergebnisse:

### 1a: Alle Routen finden
```bash
find app -name "page.tsx" -o -name "page.jsx" | sort
```
Speichere die Liste als `ALLE_ROUTEN`.

### 1b: Alle verlinkten Pfade finden
```bash
grep -rn "href=" app/ --include="*.tsx" --include="*.jsx" | grep -v "node_modules" | grep -v "hamburgpapier-shop.de"
```
Speichere als `ALLE_INTERNEN_LINKS`.

### 1c: Alle Produktreferenzen finden
```bash
grep -rn "referencedId\|sampleProducts\|productId\|product\.id" app/ lib/ --include="*.tsx" --include="*.ts" | grep -v "node_modules"
```
Speichere als `ALLE_PRODUKT_REFERENZEN`.

### 1d: Alle Shopware API Calls finden
```bash
grep -rn "fetchAllProducts\|fetchProductPrices\|SHOPWARE_API" app/ lib/ --include="*.tsx" --include="*.ts"
```
Speichere als `ALLE_API_CALLS`.

### 1e: Alle Metadaten finden
```bash
grep -rn "generateMetadata\|title:\|description:" app/ --include="*.tsx" --include="*.ts" -A 3
```
Speichere als `ALLE_METADATEN`.

---

## SCHRITT 2: Jeden Pfad komplett durchlaufen

### 2a: Pfad-Baum erstellen

Lies JEDE `page.tsx` Datei und extrahiere:
- Welche Auswahloptionen werden dem Nutzer angezeigt? (Buttons, Links, Kacheln)
- Wohin führt jede Option? (href, Link, Router.push)
- Werden die Optionen statisch oder dynamisch generiert?
- Gibt es Bedingungen die Optionen ausblenden?

Erstelle einen vollständigen Pfad-Baum in diesem Format:
```
/ (Startseite)
├── /papierhandtuecher
│   ├── /papierhandtuecher/spender
│   │   ├── /papierhandtuecher/spender/21x21cm
│   │   │   ├── /papierhandtuecher/spender/21x21cm/2-lagig
│   │   │   │   ├── /papierhandtuecher/spender/21x21cm/2-lagig/recycling → ERGEBNIS: [Produkt-IDs]
│   │   │   │   └── /papierhandtuecher/spender/21x21cm/2-lagig/zellstoff → ERGEBNIS: [Produkt-IDs]
│   │   │   └── (keine weiteren Lagen verfügbar)
│   │   ├── /papierhandtuecher/spender/24x21cm
│   │   │   └── ...
│   └── /papierhandtuecher/ohne-spender
│       └── ...
├── /toilettenpapier
│   └── ...
└── ...
```

### 2b: Jeden Endpfad prüfen

Für JEDEN Pfad der zu einem Ergebnis führt, prüfe:

```
PFAD: /papierhandtuecher/spender/25x23cm/1-lagig/recycling
  □ Existiert die page.tsx für diese Route?
  □ Werden Produkte geladen und gefiltert?
  □ Welche Produkte werden angezeigt? (IDs auflisten)
  □ Mindestens 1 Produkt vorhanden?
  □ Produkt passt zum Pfad? (Name enthält "1 lagig" UND "recycling" UND "25x23"?)
  □ Preis wird angezeigt?
  □ "Jetzt bestellen"-Button vorhanden mit Shop-URL?
  □ "Gratis Muster bestellen"-Button vorhanden mit korrekter referencedId?
  □ UTM-Parameter auf Shop-Links?
  □ Breadcrumb korrekt?
```

---

## SCHRITT 3: Spezifische Fehlersuche

### 3a: SACKGASSEN — Pfade ohne Produkt

Erstelle ein Test-Script und führe es aus:

```typescript
// scripts/qa-check.ts — Ausführen mit: npx tsx scripts/qa-check.ts

import { fetchAllProducts } from '../lib/shopware-api';
import { getProductsByCategory, filterProducts, getAvailableOptions } from '../lib/product-filters';

async function checkAllPaths() {
  const products = await fetchAllProducts();
  console.log(`Gesamte Produkte geladen: ${products.length}`);
  
  const categories = [
    'papierhandtuecher', 'toilettenpapier', 'jumbotoilettenpapier',
    'putzpapier', 'handtuchrollen', 'kuechenrollen', 'servietten',
    'aerztekrepp', 'kosmetiktuecher', 'mikrofasertuecher'
  ];
  
  const errors: string[] = [];
  const warnings: string[] = [];
  let totalPaths = 0;
  let emptyPaths = 0;
  
  for (const category of categories) {
    const catProducts = getProductsByCategory(products, category as any);
    console.log(`\n${category}: ${catProducts.length} Produkte`);
    
    if (catProducts.length === 0) {
      errors.push(`KATEGORIE LEER: ${category} — keine Produkte zugeordnet`);
      continue;
    }
    
    // Verfügbare Optionen ermitteln
    const lagen = getAvailableOptions(catProducts, 'lagen');
    const materialien = getAvailableOptions(catProducts, 'material');
    
    // Jede Kombination testen
    for (const lage of lagen) {
      for (const material of materialien) {
        totalPaths++;
        const filtered = filterProducts(catProducts, { 
          lagen: `${lage} lagig`, 
          material: material 
        });
        
        if (filtered.length === 0) {
          emptyPaths++;
          warnings.push(`SACKGASSE: ${category} → ${lage}-lagig → ${material} — 0 Produkte`);
        } else {
          // Prüfe ob Produktname zum Filter passt
          for (const product of filtered) {
            const name = product.name.toLowerCase();
            if (!name.includes(lage) && !name.includes(`${lage} lagig`)) {
              errors.push(`FALSCHE ZUORDNUNG: "${product.name}" erscheint bei ${lage}-lagig`);
            }
            if (!name.includes(material.toLowerCase())) {
              errors.push(`FALSCHE ZUORDNUNG: "${product.name}" erscheint bei ${material}`);
            }
          }
        }
      }
    }
  }
  
  // Bericht
  console.log('\n\n=== QA BERICHT ===');
  console.log(`Geprüfte Pfade: ${totalPaths}`);
  console.log(`Pfade ohne Ergebnis: ${emptyPaths}`);
  console.log(`\n🔴 FEHLER (${errors.length}):`);
  errors.forEach(e => console.log(`  ${e}`));
  console.log(`\n🟡 WARNUNGEN (${warnings.length}):`);
  warnings.forEach(w => console.log(`  ${w}`));
}

checkAllPaths().catch(console.error);
```

Erstelle dieses Script, passe die Imports an die tatsächliche Projektstruktur an, und führe es aus. Wenn Imports nicht funktionieren, lies die tatsächlichen Dateien und passe den Code an.

### 3b: VERWAISTE PRODUKTE — Produkte die nie angezeigt werden

```bash
# Finde alle Produkt-IDs die im Code referenziert werden
grep -roh "[0-9a-f]\{32\}" app/ lib/ --include="*.tsx" --include="*.ts" | sort -u > /tmp/referenced_ids.txt

# Vergleiche mit allen Produkt-IDs aus sample-products.ts oder der API
# Jede ID die NICHT in referenced_ids.txt ist, wird nie angezeigt
```

Falls Produkte dynamisch aus der API geladen werden: Prüfe ob die Filter-Logik in `product-filters.ts` für JEDES aktive Produkt mindestens einen Pfad hat der es anzeigt. Erstelle eine Liste aller Produkte die durch kein Filter-Kombinat ion erreichbar sind.

### 3c: ÜBERFLÜSSIGE FRAGEN — Nur eine Antwortmöglichkeit

Für jede Frage-Seite im Finder:

```
Prüfe: Wie viele Optionen werden dem Nutzer angezeigt?

Wenn statische Optionen:
  → Zähle die Links/Buttons auf der Seite
  → Wenn nur 1 Option: FRAGE IST ÜBERFLÜSSIG → entfernen, direkt weiterleiten

Wenn dynamische Optionen (aus API):
  → Simuliere den API-Call mit den aktuellen Filtern
  → Zähle die Ergebnisse von getAvailableOptions()
  → Wenn nur 1 Option: FRAGE KANN ÜBERFLÜSSIG SEIN → prüfen ob sich das ändert wenn neue Produkte hinzukommen
```

Erstelle eine Liste:
```
SEITE: /papierhandtuecher/spender/21x21cm/lagen
  Optionen: ["2-lagig"] (nur 1)
  → ÜBERFLÜSSIG: Diese Frage überspringen, direkt zu /papierhandtuecher/spender/21x21cm/2-lagig weiterleiten

SEITE: /papierhandtuecher/spender/25x23cm/lagen  
  Optionen: ["1-lagig"] (nur 1)
  → ÜBERFLÜSSIG: Überspringen
```

### 3d: DOPPELTE ERGEBNISSE — Zwei Pfade zeigen das gleiche Produkt

```
Für jede Ergebnis-Seite:
  → Notiere welche Produkt-IDs angezeigt werden
  → Vergleiche mit allen anderen Ergebnis-Seiten
  → Wenn zwei verschiedene Pfade exakt die gleichen Produkte zeigen:
     WARNUNG: Pfade könnten zusammengefasst werden
```

### 3e: FALSCHE PRODUKTNAMEN — Produkt passt nicht zum Pfad

Für jedes Produkt auf jeder Ergebnis-Seite:

```
PFAD: /toilettenpapier/3-lagig/zellstoff/200-blatt
PRODUKT: "Toilettenpapier 3 lagig Zellstoff 200 Blatt 128 Rollen"

Prüfung:
  □ Enthält "3 lagig" → ✓
  □ Enthält "zellstoff" (case-insensitive) → ✓
  □ Enthält "200 Blatt" → ✓
  → KORREKT

PFAD: /toilettenpapier/3-lagig/recycling
PRODUKT: "Toilettenpapier 3 lagig Zellstoff SOFT 250 Blatt"

Prüfung:
  □ Enthält "3 lagig" → ✓
  □ Enthält "recycling" → ✗ (enthält "Zellstoff"!)
  → FEHLER: Produkt ist Zellstoff, steht aber im Recycling-Pfad
```

---

## SCHRITT 4: SEO-Prüfung

### 4a: Title-Tags

```bash
grep -rn "title:" app/ --include="*.tsx" --include="*.ts" | grep -i "metadata\|generateMetadata" -A 5
```

Prüfe für JEDE Seite:
- Hat die Seite einen Title-Tag? Wenn nicht → FEHLER
- Ist der Title einzigartig? Vergleiche alle Titles → Duplikate = FEHLER
- Enthält der Title relevante Keywords? (Produktname, Eigenschaft)
- Ist der Title unter 60 Zeichen? Wenn nicht → WARNUNG

### 4b: Meta-Descriptions

Prüfe für JEDE Seite:
- Hat die Seite eine Meta-Description? Wenn nicht → WARNUNG
- Ist sie einzigartig?
- Ist sie zwischen 120-160 Zeichen?
- Enthält sie einen Call-to-Action oder Vorteil?

### 4c: SEO-Textblöcke

Für jede Frage-Seite und Ergebnis-Seite:
```bash
# Suche nach Textblöcken (paragraphs, prose) in den Seiten
grep -rn "<p\|<article\|<section.*prose\|seo-text\|className.*text-" app/ --include="*.tsx" | grep -v "button\|btn\|nav\|footer\|header"
```

Prüfe: Hat die Seite Text-Content den Google lesen kann? Nicht nur Buttons und Produktkarten, sondern auch erklärenden Text?

### 4d: Breadcrumbs

```bash
grep -rn "Breadcrumb\|breadcrumb\|BreadcrumbList" app/ --include="*.tsx" --include="*.ts"
```

Prüfe: Ist auf jeder Unterseite eine Breadcrumb vorhanden? Stimmen die Links? Gibt es ein BreadcrumbList-Schema (JSON-LD)?

### 4e: Canonical Tags und Sitemap

```bash
# Prüfe ob sitemap.ts existiert und alle Routen enthält
cat app/sitemap.ts 2>/dev/null || echo "FEHLER: Keine sitemap.ts gefunden"

# Prüfe ob robots.ts existiert
cat app/robots.ts 2>/dev/null || echo "FEHLER: Keine robots.ts gefunden"

# Prüfe Canonical Tags
grep -rn "canonical\|alternates" app/ --include="*.tsx" --include="*.ts"
```

---

## SCHRITT 5: Links und Buttons prüfen

### 5a: Shop-Links validieren

```bash
# Alle Shop-Links extrahieren
grep -roh "https://www.hamburgpapier-shop.de/[^\"']*" app/ lib/ --include="*.tsx" --include="*.ts" | sort -u
```

Für jede gefundene URL: Existiert die Seite? (Keine tatsächlichen HTTP-Requests nötig — prüfe ob die URL einem bekannten Produkt-Slug entspricht)

### 5b: UTM-Parameter prüfen

```bash
grep -rn "utm_source\|utm_medium\|utm_campaign" app/ --include="*.tsx" --include="*.ts"
```

Prüfe:
- Haben ALLE Shop-Links UTM-Parameter?
- Ist `utm_source=produktfinder` konsistent auf allen Links?
- Ist `utm_medium` korrekt? ("bestellen" für Kauf-Button, "muster" für Muster-Button)
- Ist `utm_campaign` gesetzt und beschreibend?

### 5c: Muster-Button prüfen

```bash
grep -rn "MusterButton\|sample-line-item\|sampleId\|SAMPLE_ID" app/ lib/ components/ --include="*.tsx" --include="*.ts"
```

Prüfe:
- Ist die sampleId überall `0193f361b61e705c91ad45e3c5570185`?
- Wird der MusterButton auf Ergebnis-Seiten angezeigt?
- Wird er bei Hygienespender und Cremeseife NICHT angezeigt?
- Ist `target="hamburgpapier-shop"` gesetzt (nicht `_blank`)?
- Ist `redirectTo` auf `frontend.checkout.cart.page` gesetzt (nicht `offcanvas`)?

---

## SCHRITT 6: API und Daten-Integrität

### 6a: API-Anbindung testen

Wenn Environment Variables gesetzt sind, führe einen Test-Call aus:
```typescript
const response = await fetch(process.env.SHOPWARE_API_URL + '/product', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'sw-access-key': process.env.SHOPWARE_ACCESS_KEY!,
  },
  body: JSON.stringify({ limit: 1 })
});
console.log('API Status:', response.status);
```

### 6b: Revalidation Endpoint testen

```bash
# Prüfe ob der Endpoint existiert
cat app/api/revalidate/route.ts 2>/dev/null || echo "FEHLER: Kein Revalidation Endpoint"
```

### 6c: Fallback-Daten prüfen

```bash
# Prüfe ob Fallback existiert und aktuell ist
ls -la lib/fallback-products.ts lib/fallback-prices.ts 2>/dev/null
head -5 lib/fallback-products.ts 2>/dev/null
```

---

## SCHRITT 7: Bericht erstellen

Erstelle einen strukturierten Bericht:

```
═══════════════════════════════════════════════
  PRODUKTFINDER QUALITÄTSPRÜFUNG
  Datum: [Datum]
═══════════════════════════════════════════════

INVENTAR
────────
  Routen gesamt:              [Anzahl]
  Ergebnis-Seiten:            [Anzahl]
  Frage-Seiten:               [Anzahl]
  Produkte in Shopware:       [Anzahl]
  Produkte im Finder erreichbar: [Anzahl]
  Produkte nicht erreichbar:  [Anzahl + Liste]

🔴 KRITISCHE FEHLER (müssen sofort behoben werden)
──────────────────────────────────────────────
  1. [Fehler]
     Datei: [Dateipfad:Zeile]
     Problem: [Was ist falsch]
     Lösung: [Konkreter Fix]

  2. ...

🟡 WARNUNGEN (sollten behoben werden)
──────────────────────────────────────
  1. [Warnung]
     Datei: [Dateipfad:Zeile]
     Problem: [Was ist suboptimal]
     Empfehlung: [Konkreter Vorschlag]

🟢 OPTIMIERUNGEN (optional)
────────────────────────────
  1. [Optimierung]
     Betrifft: [Seite/Pfad]
     Empfehlung: [Vorschlag]

STATISTIKEN
───────────
  Pfade geprüft:              [Anzahl]
  Sackgassen gefunden:        [Anzahl]
  Falsche Zuordnungen:        [Anzahl]
  Überflüssige Fragen:        [Anzahl]
  Seiten ohne Title-Tag:      [Anzahl]
  Seiten ohne Description:    [Anzahl]
  Seiten ohne SEO-Text:       [Anzahl]
  Links ohne UTM-Parameter:   [Anzahl]
  Muster-Buttons korrekt:     [Ja/Nein + Details]
  API-Anbindung:              [OK/Fehler]
  Fallback-Daten:             [Vorhanden/Fehlt]
```

---

## SCHRITT 8: Fehler automatisch beheben

Nach dem Bericht: Behebe alle KRITISCHEN FEHLER und WARNUNGEN direkt.

### Reihenfolge der Behebung:
1. Sackgassen → Produkt zuweisen oder Pfad entfernen
2. Falsche Zuordnungen → Korrektes Produkt verlinken
3. Überflüssige Fragen mit nur 1 Option → Automatische Weiterleitung einbauen
4. Fehlende Title-Tags → Generieren aus Pfad-Informationen
5. Fehlende Meta-Descriptions → Generieren
6. Fehlende SEO-Texte → Kurze relevante Texte schreiben
7. Fehlende UTM-Parameter → Ergänzen
8. Muster-Button Fehler → Korrigieren

### Für jede Behebung:
- Eigener Commit mit beschreibender Message
- Beispiel: `fix: Sackgasse /papierhandtuecher/spender/21x21cm/3-lagig entfernt (kein 3-lagiges 21x21 Produkt)`
- Beispiel: `fix: Falsche Zuordnung bei /toilettenpapier/3-lagig/recycling korrigiert`
- Beispiel: `optimize: Überflüssige Lagen-Frage bei 21x21cm übersprungen (nur 2-lagig verfügbar)`

---

## WANN AUSFÜHREN

- Nach jeder größeren Änderung am Finder
- Nach der Umstellung auf automatische API-Synchronisation
- Nach dem Hinzufügen neuer Kategorien oder Pfade
- Vor jedem Deployment auf Production
- Wenn der Nutzer "QA prüfen", "Qualitätsprüfung", oder "Finder testen" sagt
- Regelmäßig (z.B. wöchentlich) um API-Änderungen zu erkennen
