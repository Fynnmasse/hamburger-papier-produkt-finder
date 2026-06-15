'use client'

import { useState, useMemo, useEffect, useCallback } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight, Link2, Check, X, Plus } from 'lucide-react'
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
  vglsets: 'vglsets',
} as const

type VglDimension = 'lagen' | 'material' | 'versandart' | 'falzung'

/** Lesbares Label für einen Eigenschaftswert (z.B. lagen "2" → "2-lagig") */
function getDimLabel(dim: VglDimension, wert: string): string {
  switch (dim) {
    case 'lagen': return `${wert}-lagig`
    case 'material': return MATERIAL_LABELS[wert] || wert
    case 'versandart': return QUANTITY_LABELS[wert] || wert
    case 'falzung': return FALZUNG_LABELS[wert] || wert
  }
}

/** Eine frei zusammengestellte Vergleichs-Spalte (jede Eigenschaft optional = „egal") */
type FilterSet = { lagen?: string; material?: string; versandart?: string; falzung?: string }
const SET_KEYS: (keyof FilterSet)[] = ['lagen', 'material', 'versandart', 'falzung']

/** Trifft ein Produkt auf eine frei definierte Spalte zu? (nicht gesetzte Felder = beliebig) */
function matchSet(p: Product, set: FilterSet): boolean {
  if (set.lagen && p.layers !== parseInt(set.lagen)) return false
  if (set.material && p.material !== set.material) return false
  if (set.versandart && p.quantity !== set.versandart) return false
  if (set.falzung && getFalzung(p.name) !== set.falzung) return false
  return true
}

/** Lesbares Label für eine frei definierte Spalte, z.B. „1-lagig · Zellstoff · Karton · Z-Falz" */
function setLabel(set: FilterSet): string {
  const teile: string[] = []
  if (set.lagen) teile.push(getDimLabel('lagen', set.lagen))
  if (set.material) teile.push(getDimLabel('material', set.material))
  if (set.versandart) teile.push(getDimLabel('versandart', set.versandart))
  if (set.falzung) teile.push(getDimLabel('falzung', set.falzung))
  return teile.length ? teile.join(' · ') : 'Alle Produkte'
}

/** Spalten ⇄ URL: "lagen:1,material:zellstoff|lagen:2,material:recycling" */
function parseSets(raw: string | null): FilterSet[] {
  if (!raw) return []
  return raw.split('|').map(part => {
    const set: FilterSet = {}
    for (const pair of part.split(',')) {
      const [k, v] = pair.split(':')
      if (v && (SET_KEYS as string[]).includes(k)) set[k as keyof FilterSet] = v
    }
    return set
  })
}
function serializeSets(sets: FilterSet[]): string {
  const teile = sets.map(set => SET_KEYS.filter(k => set[k]).map(k => `${k}:${set[k]}`).join(','))
  // Nur serialisieren, wenn mindestens eine Spalte befüllt ist (sonst leerer Param)
  return teile.some(Boolean) ? teile.join('|') : ''
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
  const [customModus, setCustomModus] = useState<boolean>(() => searchParams.get(QUERY_KEYS.vglnach) === 'custom')
  // Frei zusammengestellte Spalten für den „Eigener Vergleich"-Modus
  const [vglSets, setVglSets] = useState<FilterSet[]>(() => {
    const parsed = parseSets(searchParams.get(QUERY_KEYS.vglsets))
    return parsed.length ? parsed : [{}, {}]
  })
  const [linkKopiert, setLinkKopiert] = useState(false)

  // Aktuelle Filter/Vergleichs-Auswahl als Query-String (zentral, damit Sync & Link identisch sind)
  const buildQuery = useCallback(() => {
    const params = new URLSearchParams()
    if (customModus) {
      params.set(QUERY_KEYS.vglnach, 'custom')
      const sets = serializeSets(vglSets)
      if (sets) params.set(QUERY_KEYS.vglsets, sets)
      return params.toString()
    }
    if (lagen) params.set(QUERY_KEYS.lagen, lagen)
    if (material) params.set(QUERY_KEYS.material, material)
    if (versandart) params.set(QUERY_KEYS.versandart, versandart)
    if (falzung) params.set(QUERY_KEYS.falzung, falzung)
    return params.toString()
  }, [lagen, material, versandart, falzung, customModus, vglSets])

  // Eigenen Vergleich ein-/ausschalten
  const toggleCustom = useCallback(() => {
    setCustomModus(prev => {
      const next = !prev
      if (next) {
        // Beim Aktivieren die einfachen Filter leeren und mind. 2 Startspalten sicherstellen
        setLagen(''); setMaterial(''); setVersandart(''); setFalzung('')
        setVglSets(s => s.length >= 2 ? s : [...s, ...Array(2 - s.length).fill({})])
      }
      return next
    })
  }, [])

  // Eine Eigenschaft einer Custom-Spalte setzen (leerer Wert = „egal")
  const updateSet = useCallback((index: number, key: keyof FilterSet, value: string) => {
    setVglSets(prev => prev.map((s, i) => {
      if (i !== index) return s
      const next = { ...s }
      if (value) next[key] = value
      else delete next[key]
      return next
    }))
  }, [])
  const addSet = useCallback(() => {
    setVglSets(prev => prev.length < 4 ? [...prev, {}] : prev)
  }, [])
  const removeSet = useCallback((index: number) => {
    setVglSets(prev => prev.length > 1 ? prev.filter((_, i) => i !== index) : prev)
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

  // Filtern (einfache Filter für die Listenansicht)
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (lagen && p.layers !== parseInt(lagen)) return false
      if (material && p.material !== material) return false
      if (versandart && p.quantity !== versandart) return false
      if (falzung && getFalzung(p.name) !== falzung) return false
      return true
    })
  }, [products, lagen, material, versandart, falzung])

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

  // Eigener Vergleich: jede frei definierte Spalte filtert die Produkte unabhängig
  const customSpalten = useMemo(() => {
    if (!customModus) return []
    return vglSets.map(set => {
      const produkte = [...products.filter(p => matchSet(p, set))].sort((a, b) => {
        const ga = getGuenstigsterGrundpreis(a)
        const gb = getGuenstigsterGrundpreis(b)
        if (ga === null && gb === null) return a.price - b.price
        if (ga === null) return 1
        if (gb === null) return -1
        return ga - gb
      })
      const bestGrundpreis = produkte.reduce<number | null>((min, p) => {
        const g = getGuenstigsterGrundpreis(p)
        if (g === null) return min
        return min === null ? g : Math.min(min, g)
      }, null)
      return { set, label: setLabel(set), produkte, bestGrundpreis }
    })
  }, [customModus, vglSets, products])

  // Günstigste Custom-Spalte (für die Hervorhebung), nur wenn mehrere echte Spalten Preise haben
  const guenstigsteCustomSpalte = useMemo(() => {
    let bestIdx = -1
    let bestVal: number | null = null
    customSpalten.forEach((s, i) => {
      if (s.bestGrundpreis === null) return
      if (bestVal === null || s.bestGrundpreis < bestVal) { bestVal = s.bestGrundpreis; bestIdx = i }
    })
    return bestIdx
  }, [customSpalten])

  // „Ihre Auswahl"-Bestätigung: spiegelt die aus dem Hero übergebenen Varianten als Chips.
  // Nur im Eigenen Vergleich und nur für Spalten mit mind. einer gewählten Eigenschaft –
  // so sieht der Kunde sofort, dass die Übergabe aus dem Shop funktioniert hat.
  const auswahlChips = useMemo(() => {
    if (!customModus) return []
    return vglSets
      .map(set => {
        const teile: string[] = []
        if (set.lagen) teile.push(getDimLabel('lagen', set.lagen))
        if (set.material) teile.push(getDimLabel('material', set.material))
        if (set.falzung) teile.push(getDimLabel('falzung', set.falzung))
        const menge = set.versandart ? getDimLabel('versandart', set.versandart) : ''
        return { name: teile.length ? teile.join(' · ') : 'Alle Produkte', menge, hatAuswahl: teile.length > 0 || menge !== '' }
      })
      .filter(c => c.hatAuswahl)
  }, [customModus, vglSets])

  return (
    <div>
      {/* „Ihre Auswahl"-Bestätigung — bestätigt ganz oben die aus dem Hero übergebene Auswahl */}
      {auswahlChips.length > 0 && (
        <section
          role="status"
          aria-live="polite"
          className="mb-6 animate-fade-up rounded-2xl border border-border bg-gradient-to-b from-white to-sand/40 p-4 sm:p-5 shadow-sm"
        >
          <div className="flex items-center gap-2 mb-3">
            <span className="grid place-items-center w-7 h-7 flex-shrink-0 rounded-full bg-primary/10 text-primary">
              <Check size={16} strokeWidth={3} aria-hidden="true" />
            </span>
            <span className="font-display font-bold text-navy text-base sm:text-lg">Ihre Auswahl</span>
            <span className="text-xs font-semibold text-muted-foreground">
              {auswahlChips.length} {auswahlChips.length === 1 ? 'Variante' : 'Varianten'}
            </span>
          </div>
          <ul className="flex flex-wrap gap-2 m-0 p-0 list-none">
            {auswahlChips.map((c, i) => (
              <li
                key={i}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-white px-3 py-1.5 text-sm font-semibold text-navy whitespace-nowrap"
              >
                {c.name}
                {c.menge && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
                    {c.menge}
                  </span>
                )}
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Diese Varianten werden hier gegenübergestellt.
          </p>
        </section>
      )}

      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {!customModus && verfuegbareLagen.length > 1 && (
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
        {!customModus && verfuegbareMaterialien.length > 1 && (
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
        {!customModus && verfuegbareVersandarten.length > 1 && (
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
        {!customModus && verfuegbareFalzungen.length > 1 && (
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

        {/* Eigener Vergleich: Spalten frei kombinieren (z.B. 1-lagig Zellstoff vs. 2-lagig Recycling) */}
        <button
          onClick={toggleCustom}
          aria-pressed={customModus}
          className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold min-h-[44px] border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
            customModus
              ? 'bg-primary text-white border-primary'
              : 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
          }`}
        >
          {customModus ? <Check size={16} aria-hidden="true" /> : <Plus size={16} aria-hidden="true" />}
          Eigener Vergleich
        </button>

        {(lagen || material || versandart || falzung || customModus) && (
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
                  <Link2 size={15} aria-hidden="true" /> {customModus ? 'Vergleichs-Link kopieren' : 'Filter-Link kopieren'}
                </>
              )}
            </button>
            <button
              onClick={() => { setLagen(''); setMaterial(''); setVersandart(''); setFalzung(''); setCustomModus(false); setVglSets([{}, {}]) }}
              className="text-sm text-muted-foreground hover:text-navy transition-colors underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              Zurücksetzen
            </button>
          </>
        )}
      </div>

      {!customModus && (
        <p className="text-sm text-muted-foreground mb-4">
          {sorted.length} {sorted.length === 1 ? 'Produkt' : 'Produkte'} gefunden
          {sorted.length > 0 && ' — sortiert nach günstigstem Grundpreis'}
        </p>
      )}

      {customModus ? (
        /* Eigener Vergleich: pro Spalte eigene Filter, frei kombinierbar */
        <>
          <p className="text-sm text-muted-foreground mb-4">
            Stellen Sie bis zu 4 Spalten frei zusammen — z.B. „1-lagig · Zellstoff · Karton" gegen „2-lagig · Recycling · Karton".
          </p>
          <div className="flex gap-4 overflow-x-auto pb-2 snap-x">
            {customSpalten.map((s, idx) => {
              const istGuenstigste = idx === guenstigsteCustomSpalte && customSpalten.length > 1
              const einheit = s.produkte.length ? getGrundpreisEinheit(s.produkte[0]) : ''
              return (
                <div
                  key={idx}
                  className={`snap-start flex-shrink-0 w-[260px] sm:w-[280px] rounded-xl border p-3 ${istGuenstigste ? 'border-green-300 bg-green-50/40' : 'border-border bg-sand/40'}`}
                >
                  {/* Spalten-Konfigurator */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold tracking-widest uppercase text-primary">Spalte {idx + 1}</span>
                    {customSpalten.length > 1 && (
                      <button
                        onClick={() => removeSet(idx)}
                        aria-label={`Spalte ${idx + 1} entfernen`}
                        className="text-steel hover:text-red-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    )}
                  </div>
                  <div className="flex flex-col gap-2 mb-3">
                    {verfuegbareLagen.length > 1 && (
                      <select value={s.set.lagen ?? ''} onChange={e => updateSet(idx, 'lagen', e.target.value)} aria-label={`Spalte ${idx + 1}: Lagen`} className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <option value="">Lagen: egal</option>
                        {verfuegbareLagen.map(l => <option key={l} value={l}>{l}-lagig</option>)}
                      </select>
                    )}
                    {verfuegbareMaterialien.length > 1 && (
                      <select value={s.set.material ?? ''} onChange={e => updateSet(idx, 'material', e.target.value)} aria-label={`Spalte ${idx + 1}: Material`} className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <option value="">Material: egal</option>
                        {verfuegbareMaterialien.map(m => <option key={m} value={m}>{MATERIAL_LABELS[m] || m}</option>)}
                      </select>
                    )}
                    {verfuegbareVersandarten.length > 1 && (
                      <select value={s.set.versandart ?? ''} onChange={e => updateSet(idx, 'versandart', e.target.value)} aria-label={`Spalte ${idx + 1}: Versand`} className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <option value="">Versand: egal</option>
                        {verfuegbareVersandarten.map(v => <option key={v} value={v}>{QUANTITY_LABELS[v] || v}</option>)}
                      </select>
                    )}
                    {verfuegbareFalzungen.length > 1 && (
                      <select value={s.set.falzung ?? ''} onChange={e => updateSet(idx, 'falzung', e.target.value)} aria-label={`Spalte ${idx + 1}: Falzung`} className="bg-white border border-border rounded-lg px-2 py-1.5 text-xs text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                        <option value="">Falzung: egal</option>
                        {verfuegbareFalzungen.map(f => <option key={f} value={f}>{FALZUNG_LABELS[f] || f}</option>)}
                      </select>
                    )}
                  </div>
                  {/* Spalten-Kopf mit Ergebnis */}
                  <div className="mb-3 pt-2 border-t border-border/50">
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-display font-bold text-navy text-xs leading-snug">{s.label}</h3>
                      {istGuenstigste && (
                        <span className="bg-green-100 text-green-800 text-[.6rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded whitespace-nowrap">Günstigste</span>
                      )}
                    </div>
                    <p className="text-xs text-steel mt-0.5">
                      {s.produkte.length} {s.produkte.length === 1 ? 'Produkt' : 'Produkte'}
                      {s.bestGrundpreis !== null && (
                        <> — ab <span className="font-bold text-navy">{formatPreis(s.bestGrundpreis)} €{einheit ? ` / ${einheit}` : ''}</span></>
                      )}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {s.produkte.length === 0 ? (
                      <p className="text-xs text-muted-foreground py-4 text-center">Keine Produkte für diese Kombination.</p>
                    ) : (
                      s.produkte.map((p, i) => (
                        <ProduktMini key={p.num} p={p} kategorie={kategorie} istGuenstigste={i === 0 && s.produkte.length > 1} />
                      ))
                    )}
                  </div>
                </div>
              )
            })}
            {/* Spalte hinzufügen */}
            {customSpalten.length < 4 && (
              <button
                onClick={addSet}
                className="snap-start flex-shrink-0 w-[120px] rounded-xl border-2 border-dashed border-primary/30 text-primary hover:border-primary hover:bg-primary/5 transition-colors flex flex-col items-center justify-center gap-1 min-h-[160px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
              >
                <Plus size={24} aria-hidden="true" />
                <span className="text-sm font-semibold">Spalte<br />hinzufügen</span>
              </button>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-4 mt-6 text-xs text-emerald-600">
            <span>&#10003; Kostenloser Versand</span>
            <span>&#10003; Kauf auf Rechnung</span>
            <span>&#10003; EU Ecolabel</span>
          </div>
        </>
      ) : sorted.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">Keine Produkte mit diesen Filtern gefunden.</p>
        </div>
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
