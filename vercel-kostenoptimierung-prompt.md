# Claude Code Prompt: Vercel Kostenoptimierung

```
Analysiere dieses Vercel-Projekt und optimiere es für minimale Hosting-Kosten. Die Nutzer sitzen hauptsächlich in Deutschland. Gehe dabei folgende Schritte durch:

## 1. vercel.json prüfen & anpassen
- Setze die Function Region auf Frankfurt: "regions": ["fra1"]
- Prüfe, ob bereits eine vercel.json existiert. Falls ja, ergänze sie. Falls nein, erstelle eine.
- Stelle sicher, dass keine unnötigen Multi-Region-Konfigurationen vorhanden sind.

## 2. Rendering-Strategie analysieren
- Finde alle Seiten/Routes, die aktuell Server-Side Rendering (SSR) nutzen (getServerSideProps, "use server", dynamic fetch ohne Cache etc.)
- Liste auf, welche davon stattdessen als Static Site Generation (SSG) oder mit Incremental Static Regeneration (ISR) ausgeliefert werden könnten
- Schlage konkrete Code-Änderungen vor, z.B.:
  - getServerSideProps → getStaticProps + revalidate
  - fetch() ohne cache → fetch() mit { next: { revalidate: 3600 } }
  - Seiten mit generateStaticParams wo möglich

## 3. API-Routes & Serverless Functions optimieren
- Finde alle API-Routes und Serverless Functions
- Prüfe, ob API-Responses gecacht werden können (Cache-Control Header, Vercel Edge Config, etc.)
- Identifiziere Functions mit potenziell langer Laufzeit (z.B. externe API-Calls) und schlage Optimierungen vor
- Prüfe, ob der Memory-Wert der Functions reduziert werden kann (Standard ist oft 1024MB, viele brauchen nur 256MB oder 512MB)

## 4. Bildoptimierung prüfen
- Prüfe ob next/image oder andere Bild-Komponenten verwendet werden
- Schaue ob Bilder unnötig groß geladen werden (fehlende width/height, kein sizes-Attribut)
- Prüfe ob externe Bild-URLs in next.config.js unter images.remotePatterns korrekt konfiguriert sind

## 5. Bundle Size & Bandwidth reduzieren
- Führe eine Bundle-Analyse durch (falls möglich)
- Identifiziere große Dependencies, die eventuell durch leichtere Alternativen ersetzt werden können
- Prüfe ob dynamic imports für schwere Komponenten genutzt werden sollten
- Schaue ob Fonts optimal geladen werden (next/font statt externe Requests)

## 6. Build & Deployment optimieren
- Prüfe ob unnötige Preview Deployments konfiguriert sind (z.B. für jeden Push statt nur für PRs)
- Schaue ob die .vercelignore Datei existiert und unnötige Dateien vom Build ausschließt

## 7. Zusammenfassung erstellen
Erstelle am Ende eine priorisierte Liste aller Findings mit:
- Problem / aktuelle Situation
- Empfohlene Änderung
- Geschätztes Einsparpotenzial (hoch/mittel/niedrig)
- Ob du die Änderung direkt umsetzen kannst oder ob sie manuell geprüft werden muss

Setze alle Änderungen um, die sicher sind (z.B. vercel.json Region, Cache-Header). 
Bei Änderungen die das Verhalten der App beeinflussen könnten, frage zuerst nach.
```
