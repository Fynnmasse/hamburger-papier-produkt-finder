# Prompt: Startseite und Kategorien neu strukturieren

## Ziel

Die Startseite des Produktfinders soll von der aktuellen Kachel-Anordnung auf eine neue Struktur mit **8 Kacheln** umgebaut werden. Einige bisherige Einzelkategorien werden unter Sammelkacheln zusammengefasst. Die bestehenden Frage-Pfade innerhalb der Kategorien bleiben unverändert.

---

## Neue Kachel-Anordnung auf der Startseite

### Reihe 1 (4 Kacheln):
1. **Papierhandtücher** → bestehender Pfad, unverändert
2. **Toilettenpapier** → enthält jetzt auch Jumbotoilettenpapier als Unterkategorie
3. **Handtuchrollen** → bestehender Pfad, unverändert
4. **Putzpapier** → bestehender Pfad, unverändert

### Reihe 2 (4 Kacheln):
5. **Küchenrollen** → bestehender Pfad, unverändert
6. **Waschraum-Ausstattung** → NEU: Sammelkachel für Kosmetiktücher, Hygienespender, Cremeseife
7. **Reinigung & Gastronomie** → NEU: Sammelkachel für Servietten, Ärztekrepp, Mikrofasertücher, Wischmop
8. **Preisvergleich** → Link zur bestehenden Vergleichsseite `/vergleich`

---

## Änderung 1: Toilettenpapier — Jumbotoilettenpapier integrieren

Wenn der Kunde auf "Toilettenpapier" klickt, soll als ERSTE Frage erscheinen:

**"Welche Art von Toilettenpapier suchen Sie?"**

Optionen (als Kacheln mit Bildern):

| Option | Beschreibung | Führt zu |
|--------|-------------|----------|
| Kleinrollen | Klassische Toilettenpapierrollen für Standardspender | Bestehender Toilettenpapier-Pfad (Lagen → Material → Blattzahl → Ergebnis) |
| Jumbotoilettenpapier | Große Rollen für Jumborollenspender | Bestehender Jumbotoilettenpapier-Pfad (unverändert übernehmen) |
| Einzelblatt | Einzelne Blätter für Einzelblatt-Spender | Bestehender Einzelblatt-Pfad (unverändert übernehmen) |

**WICHTIG:** Nach dieser ersten Auswahl laufen die bestehenden Frage-Pfade für jede Variante weiter wie bisher — KEINE Änderungen an den Folgefragen.

### URL-Struktur:
```
/toilettenpapier/                    → "Welche Art?" (NEU)
/toilettenpapier/kleinrollen/        → Bestehender Pfad (Lagen → Material → ...)
/toilettenpapier/jumborollen/        → Bestehender Jumbotoilettenpapier-Pfad
/toilettenpapier/einzelblatt/        → Bestehender Einzelblatt-Pfad
```

### SEO-Text für die neue Auswahlseite:
"Toilettenpapier für jeden Bedarf — von der klassischen Kleinrolle über Jumborollen für Großverbraucher bis zum Einzelblatt-System. Wählen Sie die passende Variante für Ihren Spender."

---

## Änderung 2: Waschraum-Ausstattung (NEUE Sammelkachel)

Wenn der Kunde auf "Waschraum-Ausstattung" klickt, sieht er als erste Frage:

**"Was suchen Sie für Ihren Waschraum?"**

Optionen (als Kacheln mit Bildern):

| Option | Führt zu |
|--------|----------|
| Kosmetiktücher | Bestehender Kosmetiktücher-Pfad (unverändert) |
| Spender & Zubehör | Bestehender Hygienespender-Pfad (ÜBERNEHMEN — die bestehenden Fragen für Spender sind gut und bleiben komplett erhalten) |
| Cremeseife | Direkt zur Cremeseife-Ergebnisseite (es gibt wahrscheinlich nur 1-2 Produkte, keine Zwischenfragen nötig) |

### URL-Struktur:
```
/waschraum/                          → "Was suchen Sie?" (NEU)
/waschraum/kosmetiktuecher/          → Bestehender Kosmetiktücher-Pfad
/waschraum/spender/                  → Bestehender Hygienespender-Pfad (alle Fragen übernehmen!)
/waschraum/cremeseife/               → Ergebnis-Seite (direkt Produkte anzeigen)
```

### Für Kosmetiktücher — Fragen erstellen:

**Frage 1: "Wie viele Lagen?"**
- 2 lagig
- 3 lagig

**Frage 2: "Welche Form?"**
- Flache Box (Standardbox)
- Würfelbox (Cube)

(Nur anzeigen wenn es für die gewählte Lagenzahl beide Formen gibt. Falls nur eine Form verfügbar ist → Frage überspringen.)

**Frage 3: "Welche Versandart?"**
- Karton (kleinere Menge)
- Palette (große Menge, günstiger pro Stück)

→ Ergebnis anzeigen

### Für Cremeseife:

Keine Fragen nötig — direkt die verfügbaren Cremeseife-Produkte als Ergebnis anzeigen. Falls es nur ein Produkt gibt, zeige es direkt mit Produktbild, Preis, und den Buttons "Jetzt bestellen" und "Gratis Muster bestellen".

### Für Spender & Zubehör:

Die bestehenden Fragen für Hygienespender/Spender KOMPLETT übernehmen. Nichts ändern an der Fragelogik, nur die URL anpassen von `/spender/...` zu `/waschraum/spender/...`. Falls die alte Route `/spender/` noch existiert, eine Weiterleitung (redirect) auf `/waschraum/spender/` einrichten.

### SEO-Text für die Waschraum-Auswahlseite:
"Komplette Waschraum-Ausstattung für Ihren Betrieb: Kosmetiktücher für den Waschtisch, Hygienespender für Papierhandtücher und Toilettenpapier sowie Cremeseife. Alle Produkte mit EU Ecolabel, versandkostenfrei."

---

## Änderung 3: Reinigung & Gastronomie (NEUE Sammelkachel)

Wenn der Kunde auf "Reinigung & Gastronomie" klickt, sieht er als erste Frage:

**"Was suchen Sie?"**

Optionen (als Kacheln mit Bildern):

| Option | Führt zu |
|--------|----------|
| Servietten | Servietten-Pfad mit Fragen |
| Ärztekrepp | Ärztekrepp-Pfad mit Fragen |
| Mikrofasertücher | Mikrofasertücher-Pfad mit Fragen |
| Wischmop | Wischmop-Ergebnisseite |

### URL-Struktur:
```
/reinigung/                          → "Was suchen Sie?" (NEU)
/reinigung/servietten/               → Servietten-Pfad
/reinigung/aerztekrepp/              → Ärztekrepp-Pfad
/reinigung/mikrofasertuecher/        → Mikrofasertücher-Pfad
/reinigung/wischmop/                 → Ergebnis-Seite
```

### Für Servietten — Fragen erstellen:

**Frage 1: "Wie viele Lagen?"**
- 1 lagig
- 2 lagig

**Frage 2: "Welches Material?"**
(Nur anzeigen wenn es für die gewählte Lagenzahl mehrere Materialien gibt)
- Zellstoff
- Recycling

**Frage 3: "Welche Versandart?"**
- Karton
- Palette

→ Ergebnis anzeigen

### Für Ärztekrepp — Fragen erstellen:

**Frage 1: "Welche Breite?"**
- 39 cm
- 50 cm
- 55 cm
- 60 cm (Ärzterolle)

**Frage 2: "Welche Versandart?"**
- Karton (ab 9 Rollen)
- Palette (ab 162-216 Rollen)

→ Ergebnis anzeigen

### Für Mikrofasertücher — Fragen erstellen:

**Frage 1: "Welche Qualität?"**
- Standard (220g/m²)
- Premium

(Nur anzeigen wenn beide verfügbar sind. Wenn nur eine Qualität existiert → überspringen.)

**Frage 2: "Welche Farbe?"**
Zeige alle verfügbaren Farben als Farbkacheln (Rot, Blau, Grün, Gelb — je nach Verfügbarkeit)

**Frage 3: "Welche Menge?"**
- Einzelne Tücher (Stück)
- Karton (200-250 Stück)
- Palette

→ Ergebnis anzeigen

### Für Wischmop:

Keine Fragen nötig — direkt die verfügbaren Wischmop-Produkte als Ergebnis anzeigen.

### SEO-Text für die Reinigung-Auswahlseite:
"Reinigungsbedarf und Gastronomie-Zubehör für Ihren Betrieb: Servietten für Restaurant und Hotel, Ärztekrepp für Praxis und Fitness, Mikrofasertücher und Wischmops für die professionelle Unterhaltsreinigung. Versandkostenfrei ab Palette."

---

## Änderung 4: Preisvergleich-Kachel

Die Kachel "Preisvergleich" ist ein einfacher Link zur bestehenden Vergleichsseite `/vergleich`. Kein neuer Pfad nötig — nur die Kachel auf der Startseite.

Die Kachel sollte sich visuell leicht von den anderen unterscheiden (z.B. andere Farbe oder ein Preistag-Icon), weil es keine Produktkategorie ist, sondern ein Tool.

---

## Alte Routen — Redirects einrichten

Falls diese alten Routen existieren, richte 301-Redirects auf die neuen URLs ein:

```
/jumbotoilettenpapier → /toilettenpapier/jumborollen
/spender → /waschraum/spender
/hygienespender → /waschraum/spender
/seife → /waschraum/cremeseife
/servietten → /reinigung/servietten
/aerztekrepp → /reinigung/aerztekrepp
/mikrofasertuecher → /reinigung/mikrofasertuecher
/wischmop → /reinigung/wischmop
/kosmetiktuecher → /waschraum/kosmetiktuecher
```

In Next.js in `next.config.js`:
```javascript
async redirects() {
  return [
    { source: '/jumbotoilettenpapier/:path*', destination: '/toilettenpapier/jumborollen/:path*', permanent: true },
    { source: '/spender/:path*', destination: '/waschraum/spender/:path*', permanent: true },
    { source: '/hygienespender/:path*', destination: '/waschraum/spender/:path*', permanent: true },
    { source: '/seife/:path*', destination: '/waschraum/cremeseife', permanent: true },
    { source: '/servietten/:path*', destination: '/reinigung/servietten/:path*', permanent: true },
    { source: '/aerztekrepp/:path*', destination: '/reinigung/aerztekrepp/:path*', permanent: true },
    { source: '/mikrofasertuecher/:path*', destination: '/reinigung/mikrofasertuecher/:path*', permanent: true },
    { source: '/wischmop/:path*', destination: '/reinigung/wischmop/:path*', permanent: true },
    { source: '/kosmetiktuecher/:path*', destination: '/waschraum/kosmetiktuecher/:path*', permanent: true },
  ]
}
```

---

## Was NICHT geändert werden darf

- Die bestehenden Frage-Pfade für Papierhandtücher → UNVERÄNDERT
- Die bestehenden Frage-Pfade für Toilettenpapier (Kleinrollen) → UNVERÄNDERT
- Die bestehenden Frage-Pfade für Jumbotoilettenpapier → UNVERÄNDERT (nur URL-Prefix ändert sich)
- Die bestehenden Frage-Pfade für Handtuchrollen → UNVERÄNDERT
- Die bestehenden Frage-Pfade für Putzpapier → UNVERÄNDERT
- Die bestehenden Frage-Pfade für Küchenrollen → UNVERÄNDERT
- Die bestehenden Frage-Pfade für Hygienespender/Spender → UNVERÄNDERT (nur URL-Prefix)
- Alle MusterButton-Funktionalität → UNVERÄNDERT
- Alle Shop-Links mit UTM-Parametern → UNVERÄNDERT
- Alle API-Anbindung und Preis-Synchronisation → UNVERÄNDERT

---

## Checkliste nach der Umsetzung

- [ ] Startseite zeigt genau 8 Kacheln in der richtigen Reihenfolge
- [ ] Kachel "Toilettenpapier" → erste Frage: Kleinrollen / Jumborollen / Einzelblatt
- [ ] Kachel "Waschraum" → erste Frage: Kosmetiktücher / Spender / Cremeseife
- [ ] Kachel "Reinigung" → erste Frage: Servietten / Ärztekrepp / Mikrofasertücher / Wischmop
- [ ] Kachel "Preisvergleich" → Link zu /vergleich
- [ ] Alle bestehenden Pfade funktionieren noch (Papierhandtücher, Handtuchrollen, Putzpapier, Küchenrollen)
- [ ] Spender-Fragen unter /waschraum/spender/ sind identisch mit den alten Fragen
- [ ] Alle Redirects von alten URLs funktionieren
- [ ] Neue Kategorien haben SEO-Texte
- [ ] Neue Kategorien haben generateMetadata() mit Title und Description
- [ ] Neue Kategorien erscheinen in der Sitemap
- [ ] Breadcrumbs sind korrekt (z.B. Startseite > Waschraum > Kosmetiktücher > 3-lagig)
- [ ] Kein Pfad führt zu einer leeren Ergebnisseite
- [ ] QA-Skill (SKILL-QA.md) durchlaufen lassen

---

## Wichtig
- Erstelle einen neuen Branch bevor du anfängst: `git checkout -b kategorien-umbau`
- Committe nach jeder abgeschlossenen Kachel separat
- Teste nach jeder Änderung mit `npm run dev`
- Wenn eine Frage nur eine Antwortmöglichkeit hätte → Frage überspringen und direkt zum nächsten Schritt
- Die neuen Fragen für Servietten, Ärztekrepp und Mikrofasertücher sollen die Optionen dynamisch aus den verfügbaren Produkten generieren (getAvailableOptions) — nicht statisch hardcoden
