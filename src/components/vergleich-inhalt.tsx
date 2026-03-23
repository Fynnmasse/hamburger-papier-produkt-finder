'use client'

import { useState, useMemo } from 'react'
import Image from 'next/image'
import { ExternalLink } from 'lucide-react'
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

export function VergleichInhalt({ products, kategorie, kategorieLabel }: VergleichInhaltProps) {
  const [lagen, setLagen] = useState('')
  const [material, setMaterial] = useState('')
  const [versandart, setVersandart] = useState('')

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

  // Filtern
  const filtered = useMemo(() => {
    return products.filter(p => {
      if (lagen && p.layers !== parseInt(lagen)) return false
      if (material && p.material !== material) return false
      if (versandart && p.quantity !== versandart) return false
      return true
    })
  }, [products, lagen, material, versandart])

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

  return (
    <div>
      {/* Filter */}
      <div className="flex flex-wrap gap-3 mb-6">
        {verfuegbareLagen.length > 1 && (
          <select
            value={lagen}
            onChange={e => setLagen(e.target.value)}
            aria-label="Lagen filtern"
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
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
            className="bg-white border border-border rounded-lg px-3 py-2 text-sm text-navy focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          >
            <option value="">Alle Versandarten</option>
            {verfuegbareVersandarten.map(v => (
              <option key={v} value={v}>{QUANTITY_LABELS[v] || v}</option>
            ))}
          </select>
        )}
        {(lagen || material || versandart) && (
          <button
            onClick={() => { setLagen(''); setMaterial(''); setVersandart('') }}
            className="text-sm text-muted-foreground hover:text-navy transition-colors underline rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
          >
            Filter zurücksetzen
          </button>
        )}
      </div>

      <p className="text-sm text-muted-foreground mb-4">
        {sorted.length} {sorted.length === 1 ? 'Produkt' : 'Produkte'} gefunden
        {sorted.length > 0 && ' — sortiert nach günstigstem Grundpreis'}
      </p>

      {sorted.length === 0 ? (
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
                          target="_blank"
                          rel="noopener"
                          className="inline-flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-primary/90 transition-colors whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                        >
                          Bestellen <ExternalLink size={11} aria-hidden="true" />
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
                      target="_blank"
                      rel="noopener"
                      className="inline-flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    >
                      Bestellen <ExternalLink size={11} />
                    </a>
                  </div>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}
