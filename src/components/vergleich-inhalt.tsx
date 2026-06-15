'use client'

import { useState, useMemo, useEffect, useCallback, useRef } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { ChevronRight, Link2, Check, X, Plus, SlidersHorizontal } from 'lucide-react'
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
function ProduktMini({ p, kategorie }: { p: Product; kategorie: string }) {
  const grundpreis = getGuenstigsterGrundpreis(p)
  const einheit = getGrundpreisEinheit(p)
  const displayPrice = p.staffelpreise?.length
    ? p.staffelpreise[p.staffelpreise.length - 1].unitPrice
    : p.price > 0 ? p.price / 1.19 : 0

  return (
    <div className="bg-white border border-border rounded-lg p-3 animate-card-in">
      <div className="flex items-start gap-2">
        {p.img && (
          <Image src={p.img} alt={p.name} width={56} height={56} className="w-14 h-14 object-contain flex-shrink-0 rounded" />
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

/** Eine Eigenschaft als antippbare Chips. `selected` markiert den aktiven Wert (im Modal). */
function ChipGruppe({ label, options, selected, onPick }: { label: string; options: { value: string; label: string }[]; selected?: string; onPick: (value: string) => void }) {
  return (
    <div>
      <span className="block text-[.7rem] font-bold tracking-wide uppercase text-steel mb-1.5">{label}</span>
      <div className="flex flex-wrap gap-1.5">
        {options.map(o => {
          const aktiv = selected === o.value
          return (
            <button
              key={o.value}
              type="button"
              onClick={() => onPick(o.value)}
              aria-pressed={aktiv}
              className={`rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all duration-150 ease-out active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${aktiv ? 'border-primary bg-primary text-white' : 'border-border bg-white text-navy hover:border-primary hover:text-primary'}`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

type DimChip = { key: VglDimension; label: string; options: { value: string; label: string }[] }

/** Modal zum Zusammenstellen / Bearbeiten einer Vergleichs-Spalte. Zentriert (Desktop), Bottom-Sheet (Mobile). */
function VarianteModal({ open, editMode, dimChips, draft, products, onToggle, onReset, onApply, onClose }: {
  open: boolean
  editMode: boolean
  dimChips: DimChip[]
  draft: FilterSet
  products: Product[]
  onToggle: (key: VglDimension, value: string) => void
  onReset: () => void
  onApply: () => void
  onClose: () => void
}) {
  const reduce = useReducedMotion()
  const panelRef = useRef<HTMLDivElement>(null)
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  // Escape schließt; Body-Scroll sperren, solange offen
  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  // Fokus in den Dialog legen, sobald er öffnet
  useEffect(() => { if (open) panelRef.current?.focus() }, [open])

  // Live-Vorschau: wie viele Produkte trifft die aktuelle Auswahl?
  const treffer = useMemo(() => products.filter(p => matchSet(p, draft)), [products, draft])
  const bestGrundpreis = useMemo(() => treffer.reduce<number | null>((min, p) => {
    const g = getGuenstigsterGrundpreis(p)
    if (g === null) return min
    return min === null ? g : Math.min(min, g)
  }, null), [treffer])
  const einheit = treffer.length ? getGrundpreisEinheit(treffer[0]) : ''
  const hatAuswahl = SET_KEYS.some(k => draft[k])

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center sm:p-4">
          <motion.div
            className="absolute inset-0 bg-navy/40 backdrop-blur-[1px]"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
            onClick={onClose}
          />
          <motion.div
            ref={panelRef}
            tabIndex={-1}
            role="dialog" aria-modal="true" aria-label={editMode ? 'Variante bearbeiten' : 'Variante zusammenstellen'}
            className="relative w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl shadow-xl outline-none max-h-[88vh] overflow-y-auto"
            initial={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.96, y: 12 }}
            animate={reduce ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, scale: 0.98, y: 12 }}
            transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] }}
          >
            <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3 border-b border-border/60 sticky top-0 bg-white z-10">
              <h2 className="font-display font-extrabold text-navy text-lg">{editMode ? 'Variante bearbeiten' : 'Variante zusammenstellen'}</h2>
              <button type="button" onClick={onClose} aria-label="Schließen" className="text-steel hover:text-navy transition-colors rounded p-1 active:scale-[0.95] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                <X size={20} aria-hidden="true" />
              </button>
            </div>

            <div className="px-5 py-4 flex flex-col gap-4">
              <p className="text-xs text-steel">Wähle die Eigenschaften, die dir wichtig sind. Nicht gewählt heißt „egal". Erneut tippen hebt die Auswahl auf.</p>
              {dimChips.map(d => (
                <ChipGruppe key={d.key} label={d.label} options={d.options} selected={draft[d.key]} onPick={value => onToggle(d.key, value)} />
              ))}
            </div>

            <div className="px-5">
              <div className="rounded-lg bg-sand/60 px-3 py-2 text-sm text-navy">
                {hatAuswahl ? (
                  <>
                    <span className="font-bold">{treffer.length}</span> {treffer.length === 1 ? 'Produkt' : 'Produkte'}
                    {bestGrundpreis !== null && <> · ab <span className="font-bold">{formatPreis(bestGrundpreis)} €{einheit ? ` / ${einheit}` : ''}</span></>}
                  </>
                ) : (
                  <span className="text-steel">Mindestens eine Eigenschaft wählen.</span>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 px-5 py-4 mt-2 border-t border-border/60 sticky bottom-0 bg-white">
              <button type="button" onClick={onReset} disabled={!hatAuswahl} className="text-sm text-steel hover:text-navy transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                Zurücksetzen
              </button>
              <button type="button" onClick={onApply} disabled={!hatAuswahl} className="inline-flex items-center gap-1.5 bg-primary text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
                <Check size={16} aria-hidden="true" /> Übernehmen
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  )
}

/** Vertrauenssignale — einmal definiert, einmal gerendert (statt 3× dupliziert) */
function TrustLine() {
  return (
    <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-8 text-xs font-medium text-steel">
      <span>&#10003; Kostenloser Versand</span>
      <span>&#10003; Kauf auf Rechnung</span>
      <span>&#10003; EU Ecolabel</span>
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
  // Konfigurations-Modal: welche Spalte wird bearbeitet (null = geschlossen) + Entwurf der Auswahl
  const [modalSpalte, setModalSpalte] = useState<number | null>(null)
  const [draft, setDraft] = useState<FilterSet>({})
  const openModal = useCallback((index: number) => {
    setDraft(vglSets[index] ? { ...vglSets[index] } : {})
    setModalSpalte(index)
  }, [vglSets])
  const closeModal = useCallback(() => setModalSpalte(null), [])
  const toggleDraft = useCallback((key: keyof FilterSet, value: string) => {
    setDraft(prev => {
      const next = { ...prev }
      if (next[key] === value) delete next[key]
      else next[key] = value
      return next
    })
  }, [])
  const resetDraft = useCallback(() => setDraft({}), [])
  const applyDraft = useCallback(() => {
    if (modalSpalte === null) return
    setVglSets(prev => prev.map((s, i) => (i === modalSpalte ? draft : s)))
    setModalSpalte(null)
  }, [modalSpalte, draft])

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

  // Eigenschaften als Chip-Schnellstart für leere Spalten: geführte Liste,
  // erste Eigenschaft = naheliegende erste Frage, der Rest klappt bei Bedarf auf.
  const dimChips = useMemo(() => {
    const dims: { key: VglDimension; label: string; options: { value: string; label: string }[] }[] = [
      { key: 'lagen',      label: 'Lagen',    options: verfuegbareLagen.map(l => ({ value: String(l), label: `${l}-lagig` })) },
      { key: 'falzung',    label: 'Falzung',  options: verfuegbareFalzungen.map(f => ({ value: f, label: FALZUNG_LABELS[f] || f })) },
      { key: 'material',   label: 'Material', options: verfuegbareMaterialien.map(m => ({ value: m, label: MATERIAL_LABELS[m] || m })) },
      { key: 'versandart', label: 'Versand',  options: verfuegbareVersandarten.map(v => ({ value: v, label: QUANTITY_LABELS[v] || v })) },
    ]
    return dims.filter(d => d.options.length > 1)
  }, [verfuegbareLagen, verfuegbareFalzungen, verfuegbareMaterialien, verfuegbareVersandarten])

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
      // Leere Spalte (noch nichts gewählt) = noch kein Vergleich → keine Produkte zeigen,
      // statt alle 179 Produkte doppelt aufzulisten. Erst eine Auswahl füllt die Spalte.
      const hatAuswahl = SET_KEYS.some(k => set[k])
      const produkte = hatAuswahl
        ? [...products.filter(p => matchSet(p, set))].sort((a, b) => {
            const ga = getGuenstigsterGrundpreis(a)
            const gb = getGuenstigsterGrundpreis(b)
            if (ga === null && gb === null) return a.price - b.price
            if (ga === null) return 1
            if (gb === null) return -1
            return ga - gb
          })
        : []
      const bestGrundpreis = produkte.reduce<number | null>((min, p) => {
        const g = getGuenstigsterGrundpreis(p)
        if (g === null) return min
        return min === null ? g : Math.min(min, g)
      }, null)
      return { set, label: setLabel(set), produkte, bestGrundpreis, hatAuswahl }
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

  // Kam der Kunde mit einer Auswahl aus dem Shop-Hero? (mind. eine Spalte befüllt)
  // Die Spalten selbst zeigen die Varianten bereits — daher reicht eine ruhige Bestätigungszeile
  // statt einer Chip-Liste, die die Spaltenköpfe doppelt.
  const hatHeroAuswahl = useMemo(
    () => customModus && vglSets.some(set => SET_KEYS.some(k => set[k])),
    [customModus, vglSets]
  )

  return (
    <div>
      {/* „Ihre Auswahl"-Bestätigung — eine Zeile bestätigt die aus dem Shop übergebene Auswahl */}
      {hatHeroAuswahl && (
        <p role="status" aria-live="polite" className="mb-6 flex items-center gap-2 text-sm text-steel animate-fade-up">
          <Check size={16} strokeWidth={3} className="text-primary flex-shrink-0" aria-hidden="true" />
          <span><span className="font-semibold text-navy">Ihre Auswahl</span> aus dem Shop wird hier direkt gegenübergestellt.</span>
        </p>
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
                  className={`snap-start flex-shrink-0 w-[260px] sm:w-[280px] rounded-xl border p-3 bg-white ${istGuenstigste ? 'border-green-400' : 'border-border'}`}
                >
                  {/* Spalten-Konfigurator — kein „Spalte N"-Label nötig, die Spalte ist sichtbar eine Spalte */}
                  {customSpalten.length > 1 && (
                    <div className="flex justify-end mb-1">
                      <button
                        onClick={() => removeSet(idx)}
                        aria-label={`Spalte ${idx + 1} entfernen`}
                        className="text-steel hover:text-red-600 transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                      >
                        <X size={16} aria-hidden="true" />
                      </button>
                    </div>
                  )}
                  {!s.hatAuswahl ? (
                    /* Leere Spalte: ein Klick öffnet das Konfigurations-Modal */
                    <button
                      type="button"
                      onClick={() => openModal(idx)}
                      className="w-full mt-1 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-10 text-center hover:border-primary hover:bg-primary/10 transition-colors active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                    >
                      <span className="grid place-items-center w-9 h-9 mx-auto mb-2 rounded-full bg-primary/10 text-primary">
                        <Plus size={20} aria-hidden="true" />
                      </span>
                      <span className="block font-display font-bold text-navy text-sm">Variante wählen</span>
                      <span className="block text-xs text-steel mt-0.5">Eigenschaften zusammenstellen</span>
                    </button>
                  ) : (
                    <>
                      {/* Kopf: Ergebnis + „Bearbeiten" öffnet das Modal — keine Inline-Dropdowns mehr */}
                      <div className="mb-3 pt-1">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-display font-bold text-navy text-sm leading-snug">{s.label}</h3>
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
                        <button
                          type="button"
                          onClick={() => openModal(idx)}
                          className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors active:scale-[0.98] rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          <SlidersHorizontal size={13} aria-hidden="true" /> Bearbeiten
                        </button>
                      </div>
                      <div className="flex flex-col gap-2">
                        {s.produkte.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">Keine Produkte für diese Kombination.</p>
                        ) : (
                          s.produkte.map((p) => (
                            <ProduktMini key={p.num} p={p} kategorie={kategorie} />
                          ))
                        )}
                      </div>
                    </>
                  )}
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
                  <th className="text-right py-3 px-3 font-semibold tabular-nums">Grundpreis</th>
                  <th className="text-right py-3 px-3 font-medium text-xs tabular-nums">Stückpreis</th>
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
                            <Image src={p.img} alt={p.name} width={64} height={64} className="w-16 h-16 object-contain flex-shrink-0 rounded" />
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-navy text-sm leading-snug line-clamp-2">{p.name}</p>
                            {/* Lagen & Versand als Tags am Produkt — statt zwei eigener Spalten */}
                            <div className="flex flex-wrap items-center gap-1 mt-1">
                              {isGuenstigste && (
                                <span className="bg-green-100 text-green-800 text-[.65rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded">
                                  Günstigste
                                </span>
                              )}
                              {p.layers > 0 && <span className="tag-grey">{p.layers}-lagig</span>}
                              <span className={p.quantity === 'palette' ? 'tag-dark' : p.quantity === 'karton' ? 'tag-blue' : 'tag-grey'}>
                                {QUANTITY_LABELS[p.quantity] || p.quantity}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="text-right py-3 px-3 tabular-nums">
                        {grundpreis !== null ? (
                          <span className="font-display font-extrabold text-base text-navy whitespace-nowrap">
                            {formatPreis(grundpreis)} €<span className="block text-[.7rem] font-body font-medium text-steel">/ {einheit}</span>
                          </span>
                        ) : (
                          <span className="font-display font-extrabold text-base text-navy whitespace-nowrap">
                            {displayPrice > 0 ? `ab ${formatPreis(displayPrice)} €` : 'Auf Anfrage'}
                          </span>
                        )}
                      </td>
                      <td className="text-right py-3 px-3 text-steel tabular-nums whitespace-nowrap">
                        {grundpreis !== null && displayPrice > 0 ? `ab ${formatPreis(displayPrice)} €` : ''}
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
                <div key={p.num} className={`bg-white border rounded-xl p-4 ${isGuenstigste ? 'border-green-400' : 'border-border'}`}>
                  {isGuenstigste && (
                    <span className="inline-block mb-2 bg-green-100 text-green-800 text-[.65rem] font-bold tracking-wide uppercase px-2 py-0.5 rounded">
                      Günstigste Option
                    </span>
                  )}
                  <div className="flex items-start gap-3">
                    {p.img && (
                      <Image src={p.img} alt={p.name} width={64} height={64} className="w-16 h-16 object-contain flex-shrink-0 rounded" />
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

        </>
      )}

      {/* Konfigurations-Modal — einmal gerendert, via Portal über allem */}
      <VarianteModal
        open={modalSpalte !== null}
        editMode={modalSpalte !== null && SET_KEYS.some(k => !!vglSets[modalSpalte]?.[k])}
        dimChips={dimChips}
        draft={draft}
        products={products}
        onToggle={toggleDraft}
        onReset={resetDraft}
        onApply={applyDraft}
        onClose={closeModal}
      />

      {/* Vertrauenssignale — einmal, unter dem jeweils sichtbaren Inhalt */}
      <TrustLine />
    </div>
  )
}
