# SKILL: Produktfinder Qualitätsprüfung & Optimierung

## Beschreibung
Dieser Skill prüft den Hamburger Papier Produktfinder auf logische Fehler, fehlende Produkte, doppelte Fragen und Sackgassen. Führe diese Prüfung nach jeder größeren Änderung am Produktfinder durch.

---

## Schritt 1: Projektstruktur verstehen

Lies zuerst diese Dateien um den aktuellen Stand zu verstehen:
- `lib/sample-products.ts` → Alle Produkte mit IDs und Shop-URLs
- `app/` Verzeichnis → Alle Routen und Pfade des Finders
- Alle `page.tsx` Dateien → Die Fragen und Auswahlmöglichkeiten pro Schritt

Erstelle dir eine mentale Karte: Welche Kategorien gibt es? Welche Fragen werden in welcher Reihenfolge gestellt? Welche Produkte sind welchen Ergebnis-Seiten zugeordnet?

---

## Schritt 2: Prüfungen durchführen

Führe ALLE folgenden Prüfungen durch und erstelle einen Bericht.

### Prüfung A: Sackgassen finden (KRITISCH)

Gehe jeden möglichen Pfad im Finder durch — jede Kombination von Antworten. Prüfe:

1. **Führt jeder Pfad zu einem Ergebnis mit mindestens einem Produkt?**
   - Wenn ein Pfad zu einer leeren Ergebnis-Seite führt → FEHLER
   - Liste alle Pfade auf die kein Produkt zeigen
   - Empfehlung: Entweder Produkt zuweisen oder den Pfad entfernen

2. **Gibt es Auswahloptionen die zu keiner weiteren Seite führen?**
   - Zum Beispiel: Kunde wählt "3-lagig" aber es gibt keine Folgeseite dafür → FEHLER
   - Prüfe jeden Link/Button ob die Zielseite existiert

3. **Gibt es Routen in `app/` die von keiner Auswahlseite verlinkt werden?**
   - Verwaiste Seiten die niemand erreichen kann → WARNUNG

### Prüfung B: Produkt-Zuordnung prüfen (KRITISCH)

1. **Sind alle Produkte aus `sample-products.ts` mindestens einem Finder-Ergebnis zugeordnet?**
   - Suche nach Produkt-IDs die in keiner Ergebnis-Seite referenziert werden → WARNUNG
   - Diese Produkte sind im System aber der Finder empfiehlt sie nie

2. **Stimmen die Produkt-Eigenschaften mit dem Finder-Pfad überein?**
   - Wenn der Pfad "2-lagig → Zellstoff" ist, muss das angezeigte Produkt tatsächlich 2-lagig UND Zellstoff sein
   - Prüfe den Produktnamen gegen die gewählten Filter
   - Beispiel FEHLER: Pfad "1-lagig → recycling" zeigt ein Produkt mit "2 lagig Zellstoff" im Namen

3. **Werden Karton- UND Paletten-Varianten angezeigt wo beide existieren?**
   - Die meisten Produkte gibt es als Karton (kleine Menge) und Palette (große Menge)
   - Auf der Ergebnis-Seite sollten idealerweise beide Varianten sichtbar sein
   - Prüfe ob Produkt-Paare (gleicher Artikel, unterschiedliche Versandart) gemeinsam angezeigt werden

### Prüfung C: Doppelte oder überflüssige Fragen finden (OPTIMIERUNG)

1. **Gibt es Fragen die immer nur eine Antwortmöglichkeit haben?**
   - Wenn bei einer Frage nur EIN Button/Option angezeigt wird → die Frage ist überflüssig
   - Beispiel: "Welches Material?" zeigt nur "Recycling" → Frage überspringen, direkt zum Ergebnis
   - EMPFEHLUNG: Frage entfernen und den einzigen Pfad automatisch nehmen

2. **Gibt es Fragen die im Kontext keinen Unterschied machen?**
   - Wenn zwei verschiedene Antworten zum exakt gleichen Ergebnis führen → eine der Optionen ist überflüssig
   - Beispiel: Egal ob der Kunde "Standard" oder "Premium" wählt, beide zeigen das gleiche Produkt

3. **Werden Fragen in einer logischen Reihenfolge gestellt?**
   - Die wichtigste Unterscheidung sollte ZUERST kommen
   - Bei Papierhandtüchern: Spender → Abmessung → Lagen → Material (von spezifisch zu allgemein)
   - Bei Toilettenpapier: Lagen → Material → Blattzahl
   - Prüfe ob die Reihenfolge Sinn ergibt oder ob Fragen getauscht werden sollten

4. **Gibt es Fragen die zusammengefasst werden können?**
   - Wenn zwei aufeinanderfolgende Fragen jeweils nur 2 Optionen haben, könnten sie zu einer Frage mit 4 Optionen zusammengefasst werden
   - Weniger Klicks = bessere Conversion

### Prüfung D: SEO und Meta-Daten prüfen (WICHTIG)

1. **Hat jede Seite einen einzigartigen Title-Tag?**
   - Suche in allen `page.tsx` oder `layout.tsx` nach `generateMetadata`
   - Jede Seite braucht einen eigenen Title — keine Duplikate

2. **Hat jede Seite eine einzigartige Meta-Description?**
   - Descriptions sollten den Pfad widerspiegeln
   - Beispiel: "Papierhandtücher 2-lagig Zellstoff für Ihren Spender | Hamburgpapier Produktfinder"

3. **Gibt es SEO-Textblöcke auf den Zwischenseiten?**
   - Jede Frage-Seite sollte einen kurzen Text unter den Auswahloptionen haben
   - Ergebnis-Seiten brauchen Produktbeschreibungen

4. **Funktioniert die Breadcrumb auf allen Seiten korrekt?**
   - Breadcrumb muss den tatsächlichen Pfad widerspiegeln
   - Alle Links in der Breadcrumb müssen funktionieren

### Prüfung E: Links und Buttons prüfen (WICHTIG)

1. **Führen alle "Jetzt bestellen"-Links zu existierenden Shop-URLs?**
   - Prüfe ob die URLs in `sample-products.ts` korrekt sind
   - Keine 404-Links zum Shop

2. **Haben alle Links UTM-Parameter?**
   - Format: `?utm_source=produktfinder&utm_medium=bestellen&utm_campaign={kategorie}`
   - Prüfe ob die Parameter konsistent sind

3. **Funktioniert der Muster-Button mit der korrekten referencedId?**
   - Prüfe ob die referencedId im MusterButton-Formular mit der Produkt-ID in `sample-products.ts` übereinstimmt

---

## Schritt 3: Bericht erstellen

Erstelle einen strukturierten Bericht mit folgendem Format:

```
=== PRODUKTFINDER QUALITÄTSPRÜFUNG ===
Datum: [aktuelles Datum]
Geprüfte Pfade: [Anzahl]
Geprüfte Produkte: [Anzahl]

--- KRITISCHE FEHLER (sofort beheben) ---
🔴 [Beschreibung des Fehlers]
   Pfad: [betroffener Pfad]
   Empfehlung: [konkrete Lösung]

--- WARNUNGEN (sollte behoben werden) ---
🟡 [Beschreibung der Warnung]
   Betrifft: [betroffene Seite/Produkt]
   Empfehlung: [konkrete Lösung]

--- OPTIMIERUNGEN (nice to have) ---
🟢 [Beschreibung der Optimierung]
   Betrifft: [betroffene Seite]
   Empfehlung: [konkrete Lösung]

--- STATISTIKEN ---
Kategorien: [Anzahl]
Gesamte Pfade: [Anzahl möglicher Kombinationen]
Pfade mit Ergebnis: [Anzahl]
Pfade ohne Ergebnis (Sackgassen): [Anzahl]
Produkte zugewiesen: [Anzahl] von [Gesamt]
Produkte nicht zugewiesen: [Liste]
Überflüssige Fragen: [Anzahl]
Doppelte Fragen: [Anzahl]
Seiten ohne SEO-Text: [Anzahl]
Seiten ohne Meta-Description: [Anzahl]
```

---

## Schritt 4: Fehler automatisch beheben

Wenn du kritische Fehler findest (Sackgassen, falsche Produkt-Zuordnungen), behebe sie direkt:

1. **Sackgassen** → Entweder das richtige Produkt zuweisen oder den Pfad entfernen
2. **Falsche Zuordnungen** → Das korrekte Produkt anhand des Namens und der Eigenschaften zuweisen
3. **Überflüssige Fragen mit nur einer Option** → Frage entfernen, den einzigen Pfad automatisch nehmen
4. **Fehlende SEO-Texte** → Kurzen, relevanten Text generieren der die Keywords des Pfades enthält
5. **Fehlende Meta-Descriptions** → Generiere einzigartige Descriptions pro Seite

Erstelle für jede Behebung einen eigenen Commit mit aussagekräftiger Message, z.B.:
- "fix: Sackgasse bei Papierhandtücher > 3-lagig > recycling behoben"
- "optimize: Überflüssige Material-Frage bei C-Falz entfernt (nur Zellstoff verfügbar)"
- "seo: Meta-Description für Toilettenpapier 3-lagig Ergebnis-Seite ergänzt"

---

## Wann diese Prüfung ausführen

Führe diese Prüfung aus wenn:
- Neue Produkte zum Finder hinzugefügt wurden
- Pfade oder Fragen geändert wurden
- Neue Kategorien erstellt wurden
- Vor jedem größeren Deployment
- Wenn der Nutzer nach einer Qualitätsprüfung fragt
