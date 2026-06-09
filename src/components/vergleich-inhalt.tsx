'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight, Link2, Check } from 'lucide-react'
import type { Product } from '@/lib/products'
import { formatPreis, getGuenstigsterGrundpreis, getGrundpreisEinheit } from '@/lib/price-utils'

interface VergleichInhaltProps {
  products: Product[]
  kategorie: string
  kategorieLabel: string
}

const MATERIAL_LABELS: Record<string, string> = {
  recycling: 'ECO / Recycling',
  zellstoff: 'Zellstoff',
  premium: 'Premium',
}

const QUANTITY_LABELS: Record<string, string> = {
  karton: 'Karton',
  palette: 'Palette',
  stueck: 'Stück',
}

const FALZUNG_LABELS: Record<string, string> = {
  'z-falz': 'Z-Falz',
  'c-falz': 'C-Falz',
  'interfold': 'Interfold',
}

function getFalzung(name: string): string {
  if (/z[\s-]?fal[tz]/i.test(name)) return 'z-falz'
  if (/c[\s-]?fal[tz]/i.test(name)) return 'c-falz'
  if (/interfold/i.test(name)) return 'interfold'
  return ''
}

/** Query-Parameter-Schlüssel für teilbare Filter-Links (z.B. ?falzung=z-falz&lagen=2) */
const QUERY_KEYS = {
  lagen: 'lagen',
  material: 'material',
  versandart: 'versandart',
  falzung: 'falzung',
  vglnach: 'vglnach',
  vglwerte: 'vglwerte',
} as const

/** Dimensionen, nach denen man Produkte gegenüberstellen kann (z.B. 1-lagig vs. 2-lagig) */
type VglDimension = 'lagen' | 'material' | 'versandart' | 'falzung'
const VGL_DIMENSIONEN: { key: VglDimension; label: string }[] = [
  { key: 'lagen', label: 'Lagen (z.B. 1- vs. 2-lagig)' },
  { key: 'material', label: 'Material (z.B. Zellstoff vs. Recycling)' },
  { key: 'versandart', label: 'Versand (z.B. Karton vs. Palette)' },
  { key: 'falzung', label: 'Falzung (z.B. Z-Falz vs. Interfold)' },
]

/** Rohwert eines Produkts für eine Vergleichs-Dimension (leerer String = nicht zuordenbar) */
function getDimWert(p: Product, dim: VglDimension): string {
  switch (dim) {
    case 'lagen': return p.layers > 0 ? String(p.layers) : ''
    case 'material': return p.material || ''
    case 'versandart': return p.quantity || ''
    case 'falzung': return getFalzung(p.name)
  }
}

/** Lesbares Label für einen Dimensionswert (z.B. lagen "2" → "2-lagig") */
function getDimLabel(dim: VglDimension, wert: string): string {
  switch (dim) {
    case 'lagen': return `${wert}-lagig`
    case 'material': return MATERIAL_LABELS[wert] || wert
    case 'versandart': return QUANTITY_LABELS[wert] || wert
    case 'falzung': return FALZUNG_LABELS[wert] || wert
  }
}

/** Shop-Link mit UTM-Parametern für ein Produkt (Fallback: Suche nach Artikelnummer) */
function getUtmUrl(p: Product, kategorie: string): string {
  const utm = `utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${kategorie}`
  return p.url
    ? `${p.url}?${utm}`
    : `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}&${utm}`
}

/** Kompakte Produktkarte für die Vergleichs-Spalten (eine Dimension gegenübergestellt) */
function ProduktMini({ p, kategorie, istGuenstigste }: { p: Product; kategorie: string; istGuenstigste: boolean }) {
  const grundpreis = getGuenstigsterGrundpreis(p)
  const einheit = getGrundpreisEinheit(p)
  const displayPrice = p.staffelpreise?.length
    ? p.staffelpreise[p.staffelpreise.length - 1].unitPrice
    : p.price > 0 ? p.price / 1.19 : 0

  return (
    <div className={`bg-white border rounded-lg p-3 ${istGuenstigste ? 'border-green-300 ring-1 ring-green-200' : 'border-border'}`}>
      <div className="flex items-start gap-2">
        {p.img && (
          <Image src={p.img} alt={p.name} width={40} height={40} className="w-10 h-10 object-contain flex-shrink-0 rounded" />
        )}
        <p className="font-medium text-navy text-xs leading-snug line-clamp-3">{p.name}</p>
      </div>
      <div className="mt-2 pt-2 border-t border-border/50">
        {grundpreis !== null ? (
          <div className="font-display font-extrabold text-base text-navy tabular-nums">{formatPreis(grundpreis)} € <span className="text-[.7rem] font-body font-medium text-steel">/ {einheit}</span></div>
        ) : (
          <div className="font-display font-bold text-sm text-navy">
            {displayPrice > 0 ? `ab ${formatPreis(displayPrice)} €` : 'Auf Anfrage'}
          </div>
        )}
        <a
          href={getUtmUrl(p, kategorie)}
          className="mt-2 group relative overflow-hidden inline-flex w-full items-center justify-center bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
        >
          <span className="transition-opacity duration-500 group-hover:opacity-0">Bestellen</span>
          <span className="absolute right-1 top-1 bottom-1 rounded z-10 grid w-6 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
            <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
          </span>
        </a>
      </div>
    </div>
  )
}

export function VergleichInhalt({ products, kategorie, kategorieLabel }: VergleichInhaltProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Filter aus der URL initialisieren, damit Filter-Links direkt vorausgewählt sind
  const [lagen, setLagen] = useState(() => searchParams.get(QUERY_KEYS.lagen) ?? '')
  const [material, setMaterial] = useState(() => searchParams.get(QUERY_KEYS.material) ?? '')
  const [versandart, setVersandart] = useState(() => searchParams.get(QUERY_KEYS.versandart) ?? '')
  const [falzung, setFalzung] = useState(() => searchParams.get(QUERY_KEYS.falzung) ?? '')
  const [vglNach, setVglNach] = useState<string>(() => searchParams.get(QUERY_KEYS.vglnach) ?? '')
  // Welche Werte der Vergleichs-Dimension als Spalten gezeigt werden ([] = alle)
  const [vglWerte, setVglWerte] = useState<string[]>(() => {
    const raw = searchParams.get(QUERY_KEYS.vglwerte)
    return raw ? raw.split(',').map(s => s.trim()).filter(Boolean) : []
  })
  const [linkKopiert, setLinkKopiert] = useState(false)

  // Aktuelle Filter/Vergleichs-Auswahl als Query-String (zentral, damit Sync & Link identisch sind)
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    if (lagen) params.set(QUERY_KEYS.lagen, lagen)
    if (material) params.set(QUERY_KEYS.material, material)
    if (versandart) params.set(QUERY_KEYS.versandart, versandart)
    if (falzung) params.set(QUERY_KEYS.falzung, falzung)
    if (vglNach) params.set(QUERY_KEYS.vglnach, vglNach)
    if (vglNach && vglWerte.length) params.set(QUERY_KEYS.vglwerte, vglWerte.join(','))
    return params.toString()
  }, [lagen, material, versandart, falzung, vglNach, vglWerte])

  // Vergleichs-Dimension wechseln → Werte-Auswahl zurücksetzen (= alle Spalten)
  const handleVglNachChange = useCallback((wert: string) => {
    setVglNach(wert)
    setVglWerte([])
  }, [])

  // State → URL synchronisieren, sodass jede Filter-/Vergleichskombination eine eigene, teilbare URL hat
  useEffect(() => {
    const query = buildQuery()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }, [buildQuery, pathname, router])

  const aktuellerFilterLink = useCallback(() => {
    const query = buildQuery()
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    return query ? `${origin}${pathname}?${query}` : `${origin}${pathname}`
  }, [buildQuery, pathname])

  const handleLinkKopieren = useCallback(() => {
    const link = aktuellerFilterLink()
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(link).then(() => {
        setLinkKopiert(true)
        setTimeout(() => setLinkKopiert(false), 2000)
      })
    }
  }, [aktuellerFilterLink])

  // Verfügbare Filter-Optionen aus Produkten ableiten
  const verfuegbareLagen = useMemo(() =>
    [...new Set(products.filter(p => p.layers > 0).map(p => p.layers))].sort((a, b) => a - b),
    [products]
  )
  const verfuegbareMaterialien = useMemo(() =>
    [...new Set(products.map(p => p.material))],
    [products]
  )
  const verfuegbareVersandarten = useMemo(() =>
    [...new Set(products.map(p => p.quantity))],
    [products]
  )
  const verfuegbareFalzungen = useMemo(() =>
    kategorie === 'papierhandtuecher'
      ? [...new Set(products.map(p => getFalzung(p.name)).filter(Boolean))]
      : [],
    [products, kategorie]
  )

  // Welche Dimensionen lohnen einen Vergleich? (mind. 2 unterschiedliche Werte vorhanden)
  const verfuegbareDimensionen = useMemo(() => {
    return VGL_DIMENSIONEN.filter(({ key }) => {
      if (key === 'falzung' && kategorie !== 'papierhandtuecher') return false
      const werte = new Set(products.map(p => getDimWert(p, key)).filter(Boolean))
      return werte.size >= 2
    })
  }, [products, kategorie])

  const aktiveDimension = (verfuegbareDimensionen.some(d => d.key === vglNach) ? vglNach : '') as VglDimension | ''

  // Filtern — die aktive Vergleichs-Dimension NICHT zusätzlich einschränken,
  // sonst bliebe nur eine Gruppe übrig und der Vergleich wäre sinnlos.
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (aktiveDimension !== 'lagen' && lagen && p.layers !== parseInt(lagen)) return false
      if (aktiveDimension !== 'material' && material && p.material !== material) return false
      if (aktiveDimension !== 'versandart' && versandart && p.quantity !== versandart) return false
      if (aktiveDimension !== 'falzung' && falzung && getFalzung(p.name) !== falzung) return false
      return true
    })
  }, [products, lagen, material, versandart, falzung, aktiveDimension])

  // Nach Grundpreis sortieren (günstigster zuerst, ohne Grundpreis am Ende)
  const sorted = useMemo(() => {
    return [...filtered].sort((a, b) => {
      const ga = getGuenstigsterGrundpreis(a)
      const gb = getGuenstigsterGrundpreis(b)
      if (ga === null && gb === null) return a.price - b.price
      if (ga === null) return 1
      if (gb === null) return -1
      return ga - gb
    })
  }, [filtered])

  const hatMehrereGrundpreise = sorted.filter(p => getGuenstigsterGrundpreis(p) !== null).length >= 2

  // Vergleichs-Gruppen: gefilterte Produkte nach der aktiven Dimension gegenüberstellen
  const gruppen = useMemo(() => {
    if (!aktiveDimension) return []
    const map = new Map<string, Product[]>()
    for (const p of sorted) {
      const wert = getDimWert(p, aktiveDimension)
      if (!wert) continue
      if (!map.has(wert)) map.set(wert, [])
      map.get(wert)!.push(p)
    }
    // Nur die vom Nutzer ausgewählten Werte als Spalten zeigen ([] = alle)
    const auswahl = vglWerte.length ? new Set(vglWerte) : null
    const eintraege = [...map.entries()]
      .filter(([wert]) => !auswahl || auswahl.has(wert))
      .map(([wert, produkte]) => ({
        wert,
        label: getDimLabel(aktiveDimension, wert),
        produkte,
        bestGrundpreis: produkte.reduce<number | null>((min, p) => {
          const g = getGuenstigsterGrundpreis(p)
          if (g === null) return min
          return min === null ? g : Math.min(min, g)
        }, null),
      }))
    // Lagen numerisch sortieren, sonst nach günstigstem Grundpreis (billigste Gruppe zuerst)
    eintraege.sort((a, b) => {
      if (aktiveDimension === 'lagen') return parseInt(a.wert) - parseInt(b.wert)
      if (a.bestGrundpreis === null && b.bestGrundpreis === null) return 0
      if (a.bestGrundpreis === null) return 1
      if (b.bestGrundpreis === null) return -1
      return a.bestGrundpreis - b.bestGrundpreis
    })
    return eintraege
  }, [sorted, aktiveDimension, vglWerte])

  // Günstigste Gruppe (niedrigster Grundpreis) für die Hervorhebung bestimmen
  const guenstigsteGruppe = useMemo(() => {
    let best: string | null = null
    let bestVal: number | null = null
    for (const g of gruppen) {
      if (g.bestGrundpreis === null) continue
      if (bestVal === null || g.bestGrundpreis < bestVal) {
        bestVal = g.bestGrundpreis
        best = g.wert
      }
    }
    return best
  }, [gruppen])

  // Alle wählbaren Werte der aktiven Dimension (für die Werte-Auswahl-Chips)
  const aktiveDimensionWerte = useMemo(() => {
    if (!aktiveDimension) return []
    const werte = [...new Set(sorted.map(p => getDimWert(p, aktiveDimension)).filter(Boolean))]
    werte.sort((a, b) => aktiveDimension === 'lagen' ? parseInt(a) - parseInt(b) : a.localeCompare(b))
    return werte
  }, [sorted, aktiveDimension])

  // Effektiv ausgewählte Werte ([] in State = alle Werte aktiv)
  const effektiveWerte = vglWerte.length ? vglWerte : aktiveDimensionWerte

  // Wert in der Vergleichs-Auswahl an-/abwählen (mind. eine Spalte muss aktiv bleiben)
  const toggleVglWert = useCallback((wert: string) => {
    setVglWerte(prev => {
      const alle = aktiveDimensionWerte
      const aktuell = prev.length ? prev : alle
      let next: string[]
      if (aktuell.includes(wert)) {
        if (aktuell.length <= 1) return prev // letzte aktive Spalte nicht entfernen
        next = aktuell.filter(w => w !== wert)
      } else {
        next = [...aktuell, wert]
      }
      // Entspricht die Auswahl wieder allen Werten? → [] speichern (= alle, kürzere URL)
      if (next.length === alle.length && alle.every(w => next.includes(w))) return []
      return next
    })
  }, [aktiveDimensionWerte])

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {verfuegbareLagen.length > 1 && (
          <select
            value={lagen}
            onChange={e => setLagen(e.target.value)}
            aria-label="Lagen filtern"
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-navy min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Alle Lagen</option>
            {verfuegbareLagen.map(l => (
              <option key={l} value={l}>{l}-lagig</option>
            ))}
          </select>
        )}
        {verfuegbareMaterialien.length > 1 && (
          <select
            value={material}
            onChange={e => setMaterial(e.target.value)}
            aria-label="Material filtern"
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-navy min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Alle Materialien</option>
            {verfuegbareMaterialien.map(m => (
              <option key={m} value={m}>{MATERIAL_LABELS[m] || m}</option>
            ))}
          </select>
        )}
        {verfuegbareVersandarten.length > 1 && (
          <select
            value={versandart}
            onChange={e => setVersandart(e.target.value)}
            aria-label="Versandart filtern"
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-navy min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Alle Versandarten</option>
            {verfuegbareVersandarten.map(v => (
              <option key={v} value={v}>{QUANTITY_LABELS[v] || v}</option>
            ))}
          </select>
        )}
        {verfuegbareFalzungen.length > 1 && (
          <select
            value={falzung}
            onChange={e => setFalzung(e.target.value)}
            aria-label="Falzung filtern"
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-navy min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Alle Falzungen</option>
            {verfuegbareFalzungen.map(f => (
              <option key={f} value={f}>{FALZUNG_LABELS[f] || f}</option>
            ))}
          </select>
        )}

        {/* Vergleichen nach: stellt die Produkte nach einer Dimension gegenüber (z.B. 1- vs. 2-lagig) */}
        {verfuegbareDimensionen.length > 0 && (
          <select
            value={aktiveDimension}
            onChange={e => handleVglNachChange(e.target.value)}
            aria-label="Produkte vergleichen nach"
            className="bg-primary/10 border border-primary/30 rounded-lg px-3 py-2 text-sm font-semibold text-primary min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Vergleichen nach …</option>
            {verfuegbareDimensionen.map(d => (
              <option key={d.key} value={d.key}>{d.label}</option>
            ))}
          </select>
        )}

        {(lagen || material || versandart || falzung || vglNach) && (
          <>
            <button
              onClick={handleLinkKopieren}
              className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80 transition-colors rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
              title="Direkten Link zu dieser Auswahl kopieren"
            >
              {linkKopiert ? (
                <>
                  <Check size={15} aria-hidden="true" /> Link kopiert
                </>
              ) : (
                <>
                  <Link2 size={15} aria-hidden="true" /> {vglNach ? 'Vergleichs-Link kopieren' : 'Filter-Link kopieren'}
                </>
              )}
            </button>
            <button
              onClick={() => { setLagen(''); setMaterial(''); setVersandart(''); setFalzung(''); setVglNach(''); setVglWerte([]) }}
              className="text-sm text-muted-foreground hover:text-navy transition-colors underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Zurücksetzen
            </button>
          </>
        )}
      </div>

      {/* Werte-Auswahl: frei entscheiden, welche Werte verglichen werden (z.B. nur 2- & 3-lagig) */}
      {aktiveDimension && aktiveDimensionWerte.length > 1 && (
        <div className="flex flex-wrap items-center gap-2 mb-6 -mt-2">
          <span className="text-sm text-steel mr-1">Spalten:</span>
          {aktiveDimensionWerte.map(w => {
            const aktiv = effektiveWerte.includes(w)
            return (
              <button
                key={w}
                onClick={() => toggleVglWert(w)}
                aria-pressed={aktiv}
                className={`text-sm font-medium px-3 py-1.5 rounded-full border transition-colors min-h-[36px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  aktiv
                    ? 'bg-primary text-white border-primary'
                    : 'bg-white text-steel border-border hover:border-primary/40'
                }`}
              >
                {getDimLabel(aktiveDimension, w)}
              </button>
            )
          })}
          {vglWerte.length > 0 && (
            <button
              onClick={() => setVglWerte([])}
              className="text-sm text-muted-foreground hover:text-navy transition-colors underline rounded px-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Alle anzeigen
            </button>
          )}
        </div>
      )}

      <p className="text-sm text-muted-foreground mb-4">
        {sorted.length} {sorted.length === 1 ? 'Produkt' : 'Produkte'} gefunden
        {sorted.length > 0 && (aktiveDimension
          ? ` — gegenübergestellt nach ${VGL_DIMENSIONEN.find(d => d.key === aktiveDimension)?.label.split(' (')[0]}`
          : ' — sortiert nach günstigstem Grundpreis')}
      </p>

      {sorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Produkte mit diesen Filtern gefunden.</p>
        </div>
      ) : aktiveDimension ? (
        /* Vergleichs-Ansicht: Gruppen als Spalten nebeneinander */
        <>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {gruppen.map(g => {
              const istGuenstigste = g.wert === guenstigsteGruppe
              const einheit = g.produkte.length ? getGrundpreisEinheit(g.produkte[0]) : ''
              return (
                <div
                  key={g.wert}
                  className={`snap-start flex-shrink-0 w-[260px] sm:w-[280px] rounded-xl border p-3 ${istGuenstigste ? 'border-green-300 bg-green-50/40' : 'border-border bg-sand/40'}`}
                >
                  <div className="mb-3">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-extrabold text-navy uppercase text-sm">{g.label}</h3>
                      {istGuenstigste && (
                        <span className="bg-green-100 text-green-800 text-[.6rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded whitespace-nowrap">
                          Günstigste Gruppe
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-steel mt-0.5">
                      {g.produkte.length} {g.produkte.length === 1 ? 'Produkt' : 'Produkte'}
                      {g.bestGrundpreis !== null && (
                        <> — ab <span className="font-bold text-navy">{formatPreis(g.bestGrundpreis)} €{einheit ? ` / ${einheit}` : ''}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {g.produkte.map((p, i) => (
                      <ProduktMini key={p.num} p={p} kategorie={kategorie} istGuenstigste={i === 0 && g.produkte.length > 1} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-emerald-600">
            <span>&#10003; Kostenloser Versand</span>
            <span>&#10003; Kauf auf Rechnung</span>
            <span>&#10003; EU Ecolabel</span>
          </div>
        </>
      ) : (
        <>
          {/* Desktop-Tabelle */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-navy/10 text-steel">
                  <th className="text-left py-3 px-3 font-semibold">Produkt</th>
                  <th className="text-center py-3 px-2 font-semibold">Lagen</th>
                  <th className="text-center py-3 px-2 font-semibold">Versand</th>
                  <th className="text-right py-3 px-3 font-semibold tabular-nums">Stückpreis</th>
                  <th className="text-right py-3 px-3 font-semibold tabular-nums">Grundpreis</th>
                  <th className="py-3 px-3"></th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p, i) => {
                  const grundpreis = getGuenstigsterGrundpreis(p)
                  const einheit = getGrundpreisEinheit(p)
                  const isGuenstigste = i === 0 && hatMehrereGrundpreise && grundpreis !== null
                  const displayPrice = p.staffelpreise?.length
                    ? p.staffelpreise[p.staffelpreise.length - 1].unitPrice
                    : p.price > 0 ? p.price / 1.19 : 0
                  const utmUrl = p.url
                    ? `${p.url}?utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${kategorie}`
                    : `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}&utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${kategorie}`

                  return (
                    <tr key={p.num} className={`border-b border-border/50 ${isGuenstigste ? 'bg-green-50/60' : ''}`}>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-3">
                          {p.img && (
                            <Image src={p.img} alt={p.name} width={48} height={48} className="w-12 h-12 object-contain flex-shrink-0 rounded" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-navy text-sm leading-snug line-clamp-2">{p.name}</p>
                            {isGuenstigste && (
                              <span className="inline-block mt-1 bg-green-100 text-green-800 text-[.65rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded">
                                Günstigste Option
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="text-center py-3 px-2 text-steel">{p.layers > 0 ? `${p.layers}-lagig` : '—'}</td>
                      <td className="text-center py-3 px-2">
                        <span className={p.quantity === 'palette' ? 'tag-dark' : p.quantity === 'karton' ? 'tag-blue' : 'tag-grey'}>
                          {QUANTITY_LABELS[p.quantity] || p.quantity}
                        </span>
                      </td>
                      <td className="text-right py-3 px-3 text-navy font-medium tabular-nums">
                        {displayPrice > 0 ? `ab ${formatPreis(displayPrice)} €` : 'Auf Anfrage'}
                      </td>
                      <td className="text-right py-3 px-3 tabular-nums">
                        {grundpreis !== null ? (
                          <span className="font-bold text-navy">{formatPreis(grundpreis)} € / {einheit}</span>
                        ) : (
                          <span className="text-steel">—</span>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <a
                          href={utmUrl}
                          className="group relative overflow-hidden inline-flex items-center justify-center bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          <span className="mr-6 transition-opacity duration-500 group-hover:opacity-0 whitespace-nowrap">Bestellen</span>
                          <span className="absolute right-1 top-1 bottom-1 rounded z-10 grid w-6 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                            <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
                          </span>
                        </a>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          {/* Desktop Trust-Zeile */}
          <div className="hidden md:flex flex-wrap justify-center gap-4 mt-6 text-xs text-emerald-600">
            <span>&#10003; Kostenloser Versand</span>
            <span>&#10003; Kauf auf Rechnung</span>
            <span>&#10003; EU Ecolabel</span>
          </div>

          {/* Mobile-Karten */}
          <div className="md:hidden flex flex-col gap-3">
            {sorted.map((p, i) => {
              const grundpreis = getGuenstigsterGrundpreis(p)
              const einheit = getGrundpreisEinheit(p)
              const isGuenstigste = i === 0 && hatMehrereGrundpreise && grundpreis !== null
              const displayPrice = p.staffelpreise?.length
                ? p.staffelpreise[p.staffelpreise.length - 1].unitPrice
                : p.price > 0 ? p.price / 1.19 : 0
              const utmUrl = p.url
                ? `${p.url}?utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${kategorie}`
                : `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}&utm_source=produktfinder&utm_medium=vergleich&utm_campaign=${kategorie}`

              return (
                <div key={p.num} className={`bg-white border rounded-xl p-4 ${isGuenstigste ? 'border-green-300 bg-green-50/40' : 'border-border'}`}>
                  {isGuenstigste && (
                    <span className="inline-block mb-2 bg-green-100 text-green-800 text-[.65rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded">
                      Günstigste Option
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    {p.img && (
                      <Image src={p.img} alt={p.name} width={56} height={56} className="w-14 h-14 object-contain flex-shrink-0 rounded" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-navy text-sm leading-snug">{p.name}</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {p.layers > 0 && <span className="tag-grey">{p.layers}-lagig</span>}
                        <span className={p.quantity === 'palette' ? 'tag-dark' : p.quantity === 'karton' ? 'tag-blue' : 'tag-grey'}>
                          {QUANTITY_LABELS[p.quantity] || p.quantity}
                        </span>
                        {p.material === 'recycling' && <span className="tag-green">ECO</span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-end justify-between mt-3 pt-3 border-t border-border/50">
                    <div>
                      {grundpreis !== null ? (
                        <div className="font-display font-extrabold text-lg text-navy">{formatPreis(grundpreis)} € / {einheit}</div>
                      ) : (
                        <div className="font-display font-extrabold text-lg text-navy">
                          {displayPrice > 0 ? `ab ${formatPreis(displayPrice)} €` : 'Auf Anfrage'}
                        </div>
                      )}
                    </div>
                    <a
                      href={utmUrl}
                      className="group relative overflow-hidden inline-flex items-center justify-center bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      <span className="mr-6 transition-opacity duration-500 group-hover:opacity-0 whitespace-nowrap">Bestellen</span>
                      <span className="absolute right-1 top-1 bottom-1 rounded z-10 grid w-6 place-items-center transition-all duration-500 bg-white/15 group-hover:w-[calc(100%-0.5rem)] group-active:scale-95">
                        <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
                      </span>
                    </a>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Mobile Trust-Zeile */}
          <div className="md:hidden flex flex-wrap justify-center gap-4 mt-6 text-xs text-emerald-600">
            <span>&#10003; Kostenloser Versand</span>
            <span>&#10003; Kauf auf Rechnung</span>
            <span>&#10003; EU Ecolabel</span>
          </div>
        </>
      )}
    </div>
  )
}
