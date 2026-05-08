# Prompt: Preisvergleich-Kachel visuell hervorheben

## Ziel

Die Preisvergleich-Kachel auf der Startseite des Produktfinders wird aktuell übersehen, weil sie genauso aussieht wie die Produktkategorien. Sie soll sich visuell deutlich abheben, damit Besucher sofort erkennen: Das ist kein Produkt, sondern ein nützliches Tool.

## Änderung

Die Preisvergleich-Kachel (Kachel 8, unten rechts) bekommt:

1. **Dunkler Hintergrund** — `background: #1a3a4a` (gleiche Farbe wie der Shop-Header/Navy)
2. **Weiße Schrift** — `color: white` für den Titel "Preisvergleich"
3. **Untertitel** — Unter dem Titel in kleinerer, halbtransparenter Schrift: "Günstigster Preis pro Rolle"
4. **Icon-Hintergrund anpassen** — Das Preisvergleich-Icon bekommt einen halbtransparenten Teal-Hintergrund: `background: rgba(42, 157, 143, 0.3)` mit `border-radius: 12px` und `padding: 12px`
5. **Kein Border** — Die anderen Kacheln haben einen hellen Border, die Preisvergleich-Kachel braucht keinen (der dunkle Hintergrund ist genug Abgrenzung)

## CSS für die Preisvergleich-Kachel

```css
/* Alle normalen Kacheln */
.kategorie-kachel {
  background: white;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kategorie-kachel:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

/* Preisvergleich-Kachel — visuell hervorgehoben */
.kategorie-kachel--preisvergleich {
  background: #1a3a4a;
  border: none;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.kategorie-kachel--preisvergleich:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(26, 58, 74, 0.3);
}

/* Titel in der Preisvergleich-Kachel */
.kategorie-kachel--preisvergleich .kachel-titel {
  color: white;
  font-weight: 600;
}

/* Untertitel in der Preisvergleich-Kachel */
.kategorie-kachel--preisvergleich .kachel-untertitel {
  color: rgba(255, 255, 255, 0.5);
  font-size: 12px;
  margin-top: 4px;
}

/* Icon-Container in der Preisvergleich-Kachel */
.kategorie-kachel--preisvergleich .kachel-icon {
  background: rgba(42, 157, 143, 0.25);
  border-radius: 12px;
  padding: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 12px;
}
```

## JSX/TSX Struktur

```tsx
{/* Normale Produktkachel */}
<a href="/papierhandtuecher" className="kategorie-kachel">
  <img src="/Papierhandtücher.svg" alt="Papierhandtücher" className="kachel-icon" />
  <div className="kachel-titel">Papierhandtücher</div>
</a>

{/* Preisvergleich-Kachel — hervorgehoben */}
<a href="/vergleich" className="kategorie-kachel--preisvergleich">
  <div className="kachel-icon">
    <img src="/preisvergleich-icon.svg" alt="Preisvergleich" width="48" height="48" />
  </div>
  <div className="kachel-titel">Preisvergleich</div>
  <div className="kachel-untertitel">Günstigster Preis pro Rolle</div>
</a>
```

## Tailwind CSS Alternative (falls Tailwind verwendet wird)

```tsx
{/* Normale Kachel */}
<a href="/papierhandtuecher" className="bg-white border border-gray-100 rounded-xl p-6 text-center hover:-translate-y-0.5 hover:shadow-md transition">
  <img src="/Papierhandtücher.svg" alt="" className="mx-auto mb-3 h-12" />
  <span className="font-semibold text-gray-800">Papierhandtücher</span>
</a>

{/* Preisvergleich-Kachel */}
<a href="/vergleich" className="bg-[#1a3a4a] rounded-xl p-6 text-center hover:-translate-y-0.5 hover:shadow-lg transition">
  <div className="bg-[rgba(42,157,143,0.25)] rounded-xl p-3 inline-flex mb-3">
    <img src="/preisvergleich-icon-white.svg" alt="" className="h-12 w-12" />
  </div>
  <div className="font-semibold text-white">Preisvergleich</div>
  <div className="text-xs text-white/50 mt-1">Günstigster Preis pro Rolle</div>
</a>
```

## Wichtig

- Verwende das **weiße** Preisvergleich-Icon (`preisvergleich-icon-white.svg`) auf dem dunklen Hintergrund, nicht das normale farbige Icon
- Der Untertitel "Günstigster Preis pro Rolle" ist wichtig — er erklärt in 4 Worten was der Preisvergleich macht
- Die Kachel verlinkt auf `/vergleich` (die bestehende Preisvergleichsseite)
- Die Hover-Animation soll gleich bleiben wie bei den anderen Kacheln (leichtes Anheben)
- Nur die Preisvergleich-Kachel bekommt diese Sonderbehandlung — alle anderen Kacheln bleiben wie sie sind
- Auf Mobile soll die Kachel genauso aussehen, nur in der responsiven Grid-Anordnung
