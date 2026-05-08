# Prompt: Cross-Selling zwischen Spendern und Papierprodukten

## Ziel

Auf bestimmten Ergebnis-Seiten des Produktfinders soll unter dem Hauptergebnis ein Cross-Selling-Bereich erscheinen, der das passende Gegenstück empfiehlt:

- Kunde findet **Spender** → zeige passende **Papierprodukte**
- Kunde findet **Papierprodukte** → zeige passenden **Spender**

---

## Wo Cross-Selling angezeigt werden soll

### Spender → Papierprodukte

| Ergebnis-Seite | Cross-Selling zeigen |
|---|---|
| `/waschraum/spender/papierhandtuecher` (Papierhandtuchspender, Autocutspender) | "Passende Papierhandtücher" → Link zu `/papierhandtuecher` |
| `/waschraum/spender/handtuchrollen` (Innenauszugspender, Autocutspender) | "Passende Handtuchrollen" → Link zu `/handtuchrollen` |
| `/waschraum/spender/toilettenpapier` (Toilettenpapierspender) | "Passendes Toilettenpapier" → Link zu `/toilettenpapier` |
| `/waschraum/spender/jumborollen` (Jumborollenspender) | "Passende Jumborollen" → Link zu `/toilettenpapier/jumborollen` |
| `/waschraum/spender/seife` (Seifenspender) | "Passende Cremeseife" → Link zu `/waschraum/cremeseife` |
| `/waschraum/spender/servietten` (Serviettenspender) | "Passende Servietten" → Link zu `/reinigung/servietten` |

### Papierprodukte → Spender

| Ergebnis-Seite | Cross-Selling zeigen |
|---|---|
| Alle Papierhandtücher-Ergebnisse | "Dazu passender Spender" → Link zu `/waschraum/spender/papierhandtuecher` |
| Alle Handtuchrollen-Ergebnisse | "Dazu passender Spender" → Link zu `/waschraum/spender/handtuchrollen` |
| Alle Toilettenpapier-Ergebnisse (Kleinrollen) | "Dazu passender Spender" → Link zu `/waschraum/spender/toilettenpapier` |
| Alle Jumbotoilettenpapier-Ergebnisse | "Dazu passender Spender" → Link zu `/waschraum/spender/jumborollen` |
| Alle Servietten-Ergebnisse | "Dazu passender Spender" → Link zu `/waschraum/spender/servietten` |

---

## Design der Cross-Selling-Sektion

Platziere den Cross-Selling-Bereich UNTER den Hauptergebnis-Buttons ("Jetzt bestellen" + "Gratis Muster bestellen") aber ÜBER dem SEO-Text.

### Variante A: Spender-Ergebnis → Papierprodukte empfehlen

```tsx
<div className="mt-8 border-t pt-6">
  <h3 className="text-lg font-semibold mb-2">Passende Papierhandtücher für diesen Spender</h3>
  <p className="text-sm text-gray-500 mb-4">
    Finden Sie die Papierhandtücher die exakt in diesen Spender passen.
  </p>
  
  {/* Wenn wir konkrete Produkte kennen die passen: Produktkarten anzeigen */}
  {/* Wenn wir es nicht exakt wissen: Link zum Finder-Pfad */}
  
  <a 
    href="/papierhandtuecher"
    className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 px-4 py-3 rounded-lg font-medium text-sm hover:bg-teal-100 transition"
  >
    Passende Papierhandtücher finden →
  </a>
</div>
```

### Variante B: Papierprodukt-Ergebnis → Spender empfehlen

```tsx
<div className="mt-8 border-t pt-6">
  <h3 className="text-lg font-semibold mb-2">Dazu passender Spender</h3>
  <p className="text-sm text-gray-500 mb-4">
    Sie brauchen noch einen Spender für diese Papierhandtücher?
  </p>
  
  <a 
    href="/waschraum/spender/papierhandtuecher"
    className="inline-flex items-center gap-2 bg-teal-50 text-teal-800 px-4 py-3 rounded-lg font-medium text-sm hover:bg-teal-100 transition"
  >
    Passenden Spender finden →
  </a>
</div>
```

---

## Intelligentes Matching (wenn möglich)

Wenn auf der Spender-Ergebnis-Seite ein konkreter Spender angezeigt wird (z.B. Papierhandtuchspender für Z-Falz), können wir die passenden Papierhandtücher direkt als Produktkarten anzeigen statt nur einen Link:

```tsx
// Mapping: Spendertyp → passende Papiereigenschaften
const spenderZuPapier = {
  'papierhandtuchspender-z-falz': {
    kategorie: 'papierhandtuecher',
    filter: { falzung: 'Z Falzung' },
    text: 'Alle Z-Falz Papierhandtücher passen in diesen Spender'
  },
  'papierhandtuchspender-c-falz': {
    kategorie: 'papierhandtuecher',
    filter: { falzung: 'C Falz' },
    text: 'Alle C-Falz Papierhandtücher passen in diesen Spender'
  },
  'papierhandtuchspender-interfold': {
    kategorie: 'papierhandtuecher',
    filter: { falzung: 'Interfold' },
    text: 'Alle Interfold Papierhandtücher passen in diesen Spender'
  },
  'innenauszugspender': {
    kategorie: 'handtuchrollen',
    filter: { abwicklung: 'Innenauszug' },
    text: 'Alle Handtuchrollen mit Innenauszug passen in diesen Spender'
  },
  'autocutspender': {
    kategorie: 'handtuchrollen',
    filter: { abwicklung: 'Außenabwicklung' },
    text: 'Alle Handtuchrollen mit Außenabwicklung passen in diesen Spender'
  },
  'jumborollenspender': {
    kategorie: 'jumbotoilettenpapier',
    filter: {},
    text: 'Alle Jumbotoilettenpapiere passen in diesen Spender'
  },
  'toilettenpapierspender': {
    kategorie: 'toilettenpapier',
    filter: {},
    text: 'Alle Kleinrollen-Toilettenpapiere passen in diesen Spender'
  },
};
```

Wenn ein Match gefunden wird, zeige 2-3 passende Produkte als kleine Karten mit Bild, Name, Preis und "Jetzt bestellen"-Button. Wenn kein exaktes Match möglich ist, zeige den einfachen Link zum Finder-Pfad.

---

## Cross-Selling Produktkarten (wenn konkrete Produkte angezeigt werden)

```tsx
<div className="mt-8 border-t pt-6">
  <h3 className="text-lg font-semibold mb-1">Passende Papierhandtücher für diesen Spender</h3>
  <p className="text-sm text-gray-500 mb-4">Alle Z-Falz Papierhandtücher passen in diesen Spender</p>
  
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
    {passendeProdukte.slice(0, 3).map(product => (
      <div key={product.id} className="border rounded-lg p-4">
        {getCoverImage(product) && (
          <img src={getCoverImage(product)} alt={product.name} className="w-full h-24 object-contain mb-3" />
        )}
        <p className="font-medium text-sm mb-1 line-clamp-2">{product.name}</p>
        <p className="text-lg font-bold mb-3">
          ab {getCheapestPrice(product).toFixed(2).replace('.', ',')} €
        </p>
        <div className="flex gap-2">
          <a 
            href={`${getShopUrl(product)}?utm_source=produktfinder&utm_medium=cross-selling&utm_campaign=spender`}
            target="hamburgpapier-shop"
            className="text-sm bg-teal-600 text-white px-3 py-2 rounded-lg"
          >
            Bestellen
          </a>
          {hasSample(product) && (
            <MusterButton referencedId={product.id} sampleId={SAMPLE_ID} />
          )}
        </div>
      </div>
    ))}
  </div>
  
  <a href="/papierhandtuecher" className="inline-block mt-3 text-sm text-teal-700 hover:underline">
    Alle passenden Papierhandtücher anzeigen →
  </a>
</div>
```

---

## UTM-Parameter für Cross-Selling Links

Alle Links im Cross-Selling-Bereich verwenden `utm_medium=cross-selling`:

```
?utm_source=produktfinder&utm_medium=cross-selling&utm_campaign=spender-zu-papier
?utm_source=produktfinder&utm_medium=cross-selling&utm_campaign=papier-zu-spender
```

So seht ihr in Google Analytics wie viel Umsatz das Cross-Selling generiert.

---

## Wichtig
- Cross-Selling erscheint NUR auf Ergebnis-Seiten, nicht auf Frage-Seiten
- Maximal 3 Produktkarten im Cross-Selling (nicht die Seite überladen)
- Die Produkte im Cross-Selling nutzen die gleiche API wie der Rest (Preise aktuell)
- Der Muster-Button funktioniert auch auf Cross-Selling-Produktkarten
- Wenn keine passenden Produkte gefunden werden, zeige nur den Link zum Finder-Pfad
- Cross-Selling-Bereich soll visuell abgesetzt sein vom Hauptergebnis (border-top, etwas Abstand)
