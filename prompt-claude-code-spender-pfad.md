# Prompt: "Haben Sie bereits einen Spender?" als erste Frage bei Papierhandtüchern

## Was gebaut werden soll

Wenn ein Kunde im Produktfinder auf **"Papierhandtücher"** klickt, soll als ERSTE Frage erscheinen:

**"Haben Sie bereits einen Spender?"**

Mit zwei Auswahlmöglichkeiten:

1. **"Ja, ich habe einen Spender"** → Führt zum Abmessungs-Pfad (Kunde wählt die Größe seines aktuellen Papierhandtuchs, damit das neue Produkt in den vorhandenen Spender passt)
2. **"Nein / Ich bin nicht sicher"** → Führt zum normalen Pfad (Lagen → Material → Qualität, wie bisher)

---

## Pfad 1: "Ja, ich habe einen Spender"

### Nächste Frage: "Welche Abmessungen haben Ihre aktuellen Papierhandtücher?"

Zeige die gängigen Größen als Kacheln mit Bildern. Jede Kachel zeigt die Abmessung ausgefaltet UND gefaltet:

| Kachel | Ausgefaltet | Gefaltet | Falzung |
|--------|-------------|----------|---------|
| 21 x 21 cm | 21 x 21 cm | 21 x 10,5 cm | Z-Falz |
| 24 x 21 cm | 24 x 21 cm | 24 x 10,5 cm | Z-Falz |
| 25 x 21 cm | 25 x 21 cm | 25 x 10,5 cm | Z-Falz |
| 25 x 23 cm | 25 x 23 cm | 25 x 11,5 cm | Z-Falz |
| 20,5 x 24 cm | 20,5 x 24 cm | 20,5 x 8 cm | Interfold |
| 25 x 31 cm | 25 x 31 cm | 25 x 10,3 cm | C-Falz |

Füge unter den Kacheln einen Hilfetext ein:
**"Nicht sicher welche Größe? Messen Sie ein gefaltetes Handtuch aus Ihrem Spender — Breite x Höhe in cm."**

Optional: Füge ein kleines Hilfsbild/Grafik ein, das zeigt WO man das Papierhandtuch messen soll (Breite und Höhe eines gefalteten Blatts mit Pfeilen).

### Nach Abmessungs-Auswahl: "Wie viele Lagen?"

Zeige nur die Lagen-Optionen die für die gewählte Abmessung verfügbar sind. Zum Beispiel:

- **21 x 21 cm** → nur 2-lagig verfügbar
- **24 x 21 cm** → 1-lagig und 2-lagig und 3-lagig verfügbar
- **25 x 21 cm** → 1-lagig und 2-lagig verfügbar
- **25 x 23 cm** → 1-lagig verfügbar
- **20,5 x 24 cm (Interfold)** → 2-lagig verfügbar
- **25 x 31 cm (C-Falz)** → 1-lagig und 2-lagig verfügbar

Passe diese Zuordnungen an das tatsächliche Sortiment im Shop an. Schaue dafür in die Produktdaten in `lib/sample-products.ts` welche Kombinationen existieren.

### Nach Lagen-Auswahl: "Welches Material?"

- **Recycling** (günstiger, umweltfreundlich, EU Ecolabel)
- **Zellstoff** (weicher, saugfähiger, hochweiß)

Auch hier nur die Optionen anzeigen die für die gewählte Abmessung + Lagen-Kombination tatsächlich verfügbar sind.

### Ergebnis-Seite

Zeige das passende Produkt (oder die 2-3 passenden Produkte falls Karton- und Paletten-Variante existieren) mit:
- Produktbild
- Produktname
- Preis
- "Jetzt bestellen"-Button
- "Gratis Muster bestellen"-Button (MusterButton-Komponente)
- Hinweis: **"✓ Passt in Ihren vorhandenen Spender"** — als visuellen Bestätigungs-Badge

---

## Pfad 2: "Nein / Ich bin nicht sicher"

Dieser Pfad bleibt wie er aktuell ist — der bestehende Papierhandtücher-Flow ändert sich nicht. Wenn am Ende ein Produkt empfohlen wird, zeige zusätzlich den passenden Spender als Cross-Selling:

**"Dazu passender Spender:"** mit Link zum entsprechenden Spender im Shop.

---

## SEO-Content

### Auf der Seite "Haben Sie bereits einen Spender?"
Textblock unter den Kacheln:
"Die richtige Größe ist entscheidend: Papierhandtücher, die nicht in Ihren Spender passen, verursachen Staus, reißen beim Entnehmen oder lassen sich gar nicht erst einlegen. Mit unserem Produktfinder finden Sie in wenigen Klicks die exakt passenden Papierhandtücher für Ihren vorhandenen Spender — egal ob Z-Falz, Interfold oder C-Falz."

### Auf jeder Abmessungs-Seite
Kurzer Text der erklärt, welche Spender diese Abmessung typischerweise verwenden. Zum Beispiel für 25x23cm:
"Papierhandtücher mit 25 x 23 cm (gefaltet 25 x 11,5 cm) sind das Standardmaß für die meisten handelsüblichen Z-Falz-Spender. Diese Größe bietet eine gute Balance zwischen Ergiebigkeit und Handlichkeit und ist besonders in Büros, Arztpraxen und der Gastronomie verbreitet."

---

## URL-Struktur

```
/papierhandtuecher/                          → "Haben Sie bereits einen Spender?"
/papierhandtuecher/spender/                  → Abmessungs-Auswahl
/papierhandtuecher/spender/21x21cm/          → Lagen-Auswahl
/papierhandtuecher/spender/21x21cm/2-lagig/  → Material-Auswahl
/papierhandtuecher/spender/21x21cm/2-lagig/recycling/  → Ergebnis
/papierhandtuecher/ohne-spender/             → Bestehender Pfad (Lagen → Material → ...)
```

---

## Wichtig
- Behalte den bestehenden Papierhandtücher-Pfad als "Nein / Ich bin nicht sicher"-Option bei — nichts daran ändern
- Zeige auf jeder Ebene nur Optionen die tatsächlich zu Produkten führen — keine Sackgassen
- Nutze `generateStaticParams()` und `generateMetadata()` für alle neuen Routen
- Breadcrumb aktualisieren: Startseite > Papierhandtücher > Spender > 25x23cm > 1-lagig > Recycling
