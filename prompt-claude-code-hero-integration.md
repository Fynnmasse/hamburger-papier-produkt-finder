# Prompt: Produktfinder-Kategorien direkt in den Hero-Bereich integrieren

---

## Was soll passieren

Auf der Startseite (`app/page.tsx`) des Produktfinders soll die **Kategorieauswahl** (Papierhandtücher, Toilettenpapier, Putzpapier, Handtuchrollen) direkt in den Hero-Bereich integriert werden — nicht darunter als separate Sektion.

Der Nutzer soll beim Laden der Seite **sofort** die Kategorieauswahl sehen, ohne scrollen zu müssen. Das Tool muss above-the-fold benutzbar sein.

---

## Aktueller Zustand

Aktuell gibt es eine Hero-Sektion (großes Bild/Banner mit Headline) und darunter separat die Kategorie-Kacheln. Der Nutzer muss erst am Hero vorbeiscrollen, bevor er den Finder benutzen kann.

---

## Gewünschter Zustand

Verschmelze Hero und Kategorieauswahl zu einem einzigen, kompakten Block:

### Layout-Struktur (von oben nach unten, alles above-the-fold):

1. **Kurze Headline** (1 Zeile): z.B. "Finden Sie das richtige Hygienepapier — in 3 Klicks"
2. **Optionaler Subtitle** (1 Zeile, kleiner): z.B. "Wählen Sie eine Kategorie um zu starten"
3. **Kategorie-Kacheln** direkt darunter — das ist das Hauptelement der Seite

Die Kacheln sollen visuell prominent sein und den größten Teil des Viewports einnehmen. Die Headline ist nur kurzer Kontext, kein eigenständiger Hero-Block.

### Was NICHT mehr da sein soll:
- Kein großes Hero-Bild oder Hero-Banner
- Kein separater Hero-Container mit eigenem Hintergrund
- Kein großer Abstand/Padding zwischen Headline und Kacheln
- Kein "Scroll down" oder sonstige Hinweise dass es weitergeht

### Responsive Verhalten:
- **Desktop (ab 1024px):** Kacheln in einer Reihe nebeneinander (4 Spalten wenn 4 Kategorien)
- **Tablet (768-1023px):** 2x2 Grid
- **Mobile (unter 768px):** Kacheln untereinander, aber kompakt genug dass mindestens 2-3 Kacheln ohne Scrollen sichtbar sind

---

## SEO-Content UNTER den Kacheln

Der SEO-Textblock (falls vorhanden) bleibt bestehen, aber er wandert UNTER die Kategorieauswahl. Reihenfolge:

1. Headline + Kacheln (above-the-fold, kein Scrollen nötig)
2. SEO-Content darunter (für Google, nicht für den ersten Eindruck)

---

## Wichtig

- Behalte alle bestehenden Kategorie-Links, Bilder und Texte bei
- Behalte alle bestehenden Klick-Handler und Navigation bei
- Ändere NUR das Layout der Startseite — keine anderen Seiten anfassen
- Das Ergebnis soll auf einem 1080p-Bildschirm komplett ohne Scrollen benutzbar sein
- Teste mit `npm run dev` und prüfe Desktop + Mobile
