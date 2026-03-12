import React, { useState, useCallback } from 'react'
import { ArrowLeft, Home, Edit, ExternalLink } from 'lucide-react'
import { PRODUCTS, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

// ── Types ──
type Screen = 'intro' | 'step1' | 'step2' | 'step3' | 'results'
type Category = 'alle' | 'toilettenpapier' | 'papierhandtuecher' | 'handtuchrollen' | 'putzpapier' | 'spender' | 'kuechenrollen' | 'seife'
type Quantity  = 'alle' | 'karton' | 'palette'
type Quality   = 'alle' | 'recycling' | 'zellstoff' | 'premium'

interface State { category: Category; quantity: Quantity; quality: Quality }

// ── Labels ──
const CAT_LABELS: Record<string, string> = {
  toilettenpapier: 'Toilettenpapier', papierhandtuecher: 'Papierhandtücher',
  handtuchrollen: 'Handtuchrollen', putzpapier: 'Putzpapier & Reinigung',
  spender: 'Spender & Zubehör', kuechenrollen: 'Küchenrollen & Servietten',
  seife: 'Seife & Desinfektion', alle: 'Alle Kategorien',
}
const QTY_LABELS: Record<string, string>  = { karton: 'Karton', palette: 'Palette', alle: 'Alle Mengen' }
const QUAL_LABELS: Record<string, string> = { recycling: 'ECO / Recycling', zellstoff: 'Standard Zellstoff', premium: 'Premium', alle: 'Alle Qualitäten' }

// ── Filter ──
function filterProducts(s: State): Product[] {
  return PRODUCTS.filter(p => {
    let catMatch = false
    if (s.category === 'alle') catMatch = true
    else if (s.category === 'kuechenrollen') catMatch = ['kuechenrollen','servietten','kosmetiktuecher'].includes(p.category)
    else catMatch = p.category === s.category
    if (!catMatch) return false
    if (s.quantity === 'karton'  && p.quantity !== 'karton')  return false
    if (s.quantity === 'palette' && p.quantity !== 'palette') return false
    if (s.quality !== 'alle' && p.material !== s.quality)    return false
    return true
  }).sort((a, b) => {
    const ai = a.img ? 1 : 0, bi = b.img ? 1 : 0
    if (bi !== ai) return bi - ai
    return a.price - b.price
  })
}

// ── Product Card ──
function ProductCard({ p, index }: { p: Product; index: number }) {
  const shopUrl = `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}`
  const price   = p.price > 0 ? `${p.price.toFixed(2).replace('.', ',')} €` : 'Auf Anfrage'
  const name    = p.name.length > 80 ? p.name.substring(0, 77) + '…' : p.name

  return (
    <article
      className="bg-white border border-border rounded-xl overflow-hidden flex flex-col opacity-0 translate-y-2 animate-card-in hover:-translate-y-1 hover:scale-[1.01] hover:border-primary hover:shadow-lg transition-all duration-200"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, animationFillMode: 'forwards' }}
    >
      {/* Image */}
      <div className="w-full aspect-[4/3] bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden relative flex items-center justify-center">
        {p.img ? (
          <img
            src={p.img} alt={p.name} loading="lazy"
            className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-500"
            onLoad={e => (e.currentTarget.style.opacity = '1')}
            onError={e => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <svg width="48" height="48" viewBox="0 0 48 48" fill="none" stroke="#c8c4bf" strokeWidth="1.5">
            <rect x="8" y="8" width="32" height="32" rx="4"/>
            <path d="M16 28l6-8 5 6 4-4 5 6"/><circle cx="18" cy="20" r="3"/>
          </svg>
        )}
      </div>

      {/* Body */}
      <div className="p-4 flex flex-col gap-2 flex-1">
        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {p.quantity === 'palette' && <span className="tag-dark">Palette</span>}
          {p.quantity === 'karton'  && <span className="tag-blue">Karton</span>}
          {p.layers >= 1            && <span className="tag-grey">{p.layers}-lagig</span>}
          {p.material === 'premium' && <span className="tag-orange">Premium</span>}
          {p.material === 'recycling' && <span className="tag-green">ECO</span>}
          {p.eco?.includes('ecolabel')     && <span className="tag-green">EU Ecolabel ✓</span>}
          {!p.eco?.includes('ecolabel') && p.eco?.includes('blauer-engel') && <span className="tag-green">Blauer Engel</span>}
        </div>
        <p className="text-sm font-semibold text-navy leading-snug flex-1">{name}</p>
        <div className="flex items-center justify-between gap-2 mt-1">
          <div>
            <div className="font-display font-extrabold text-xl text-navy leading-none">{price}</div>
            <div className="text-xs text-muted-foreground mt-0.5">inkl. 19% MwSt.</div>
          </div>
          <a
            href={shopUrl} target="_blank" rel="noopener"
            className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg min-h-[40px] hover:bg-primary/90 transition-colors group flex-shrink-0"
            aria-label={`Im Shop kaufen: ${p.name}`}
          >
            Kaufen
            <ExternalLink size={12} className="transition-transform group-hover:translate-x-0.5" />
          </a>
        </div>
      </div>
    </article>
  )
}

// ── Chip ──
function Chip({ label, value }: { label: string; value: string }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-navy text-white/85 text-xs font-semibold px-3 py-1 rounded-full animate-chip-in">
      {label}: <span className="text-primary">{value}</span>
    </div>
  )
}

// ── Progress ──
function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div className="max-w-xs mx-auto mb-10">
      <div className="flex items-center">
        {[1, 2, 3].map((n, i) => (
          <React.Fragment key={n}>
            <div className={cn(
              'w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm font-bold shrink-0 transition-all',
              n < step  ? 'border-primary bg-primary text-white' :
              n === step ? 'border-primary text-primary bg-white' :
                           'border-border text-muted-foreground bg-white'
            )}>
              {n < step ? (
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><path d="M5 13l4 4L19 7"/></svg>
              ) : n}
            </div>
            {i < 2 && (
              <div key={`line-${n}`} className={cn('flex-1 h-0.5 transition-colors', n < step ? 'bg-primary' : 'bg-border')} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ──
export default function ProductFinder() {
  const [screen, setScreen] = useState<Screen>('step1')
  const [state, setState] = useState<State>({ category: 'alle', quantity: 'alle', quality: 'alle' })

  const goTo = useCallback((next: Screen) => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    setScreen(next)
  }, [])

  // ── Step 1: Category ──
  const categories: { id: Category; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'toilettenpapier', label: 'Toilettenpapier', count: 36, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="24" cy="24" rx="14" ry="18"/><ellipse cx="24" cy="24" rx="5" ry="7"/><line x1="24" y1="17" x2="24" y2="6"/><line x1="20" y1="8" x2="24" y2="6"/></svg> },
    { id: 'papierhandtuecher', label: 'Papierhandtücher', count: 43, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><rect x="8" y="12" width="32" height="8" rx="2"/><rect x="10" y="20" width="28" height="6" rx="1"/><rect x="12" y="26" width="24" height="6" rx="1"/><rect x="14" y="32" width="20" height="6" rx="1"/></svg> },
    { id: 'handtuchrollen', label: 'Handtuchrollen', count: 30, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="10" width="36" height="28" rx="3"/><circle cx="24" cy="24" r="9"/><circle cx="24" cy="24" r="3"/></svg> },
    { id: 'putzpapier', label: 'Putzpapier & Reinigung', count: 27, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><path d="M10 38 Q14 28 20 22 Q26 16 34 12"/><path d="M34 12 L38 8 L40 14 L34 12z" fill="currentColor" opacity=".3"/><ellipse cx="22" cy="32" rx="8" ry="4" transform="rotate(-35 22 32)"/></svg> },
    { id: 'spender', label: 'Spender & Zubehör', count: 10, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><rect x="14" y="6" width="20" height="32" rx="4"/><rect x="18" y="10" width="12" height="16" rx="2"/><path d="M24 38 v4"/><rect x="18" y="36" width="12" height="4" rx="2"/></svg> },
    { id: 'kuechenrollen', label: 'Küchenrollen & Servietten', count: 16, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="24" cy="16" rx="12" ry="10"/><ellipse cx="24" cy="16" rx="5" ry="4"/><rect x="20" y="26" width="8" height="16" rx="2"/><line x1="14" y1="42" x2="34" y2="42"/></svg> },
    { id: 'seife', label: 'Seife & Desinfektion', count: 3, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><rect x="14" y="14" width="20" height="26" rx="4"/><rect x="18" y="8" width="12" height="8" rx="2"/><path d="M24 8 v-4"/><rect x="18" y="22" width="12" height="3" rx="1.5"/></svg> },
    { id: 'alle', label: 'Alles anzeigen', count: 179, icon: <svg width="40" height="40" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="15" height="15" rx="3"/><rect x="27" y="6" width="15" height="15" rx="3"/><rect x="6" y="27" width="15" height="15" rx="3"/><rect x="27" y="27" width="15" height="15" rx="3"/></svg> },
  ]

  if (screen === 'step1') return (
    <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <ProgressBar step={1} />
        <div className="text-center mb-10 animate-fade-up">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Schritt 1 von 3</div>
          <h2 className="font-display font-extrabold text-4xl uppercase text-navy">Was suchen Sie?</h2>
          <p className="text-muted-foreground mt-2">Wählen Sie die Produktkategorie, die Sie benötigen.</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {categories.map(({ id, label, count, icon }, i) => (
            <button
              key={id}
              onClick={() => {
                setState(s => ({ ...s, category: id }))
                if (id === 'alle') { setState({ category: 'alle', quantity: 'alle', quality: 'alle' }); goTo('results') }
                else goTo('step2')
              }}
              className="bg-white border-2 border-border rounded-xl p-5 text-center flex flex-col items-center gap-2 min-h-[130px] hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all animate-card-entrance text-steel hover:text-primary"
              style={{ animationDelay: `${i * 60}ms` }}
            >
              {icon}
              <span className="font-semibold text-sm text-navy leading-tight">{label}</span>
              <span className="text-xs text-muted-foreground">{count} Produkte</span>
            </button>
          ))}
        </div>
        <div className="flex justify-start max-w-4xl mx-auto mt-8">
          <button onClick={() => goTo('intro')} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy transition-colors">
            <ArrowLeft size={16} /> Zurück
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 'step2') return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressBar step={2} />
        <div className="text-center mb-10 animate-fade-up">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Schritt 2 von 3</div>
          <h2 className="font-display font-extrabold text-4xl uppercase text-navy">Wie viel benötigen Sie?</h2>
          <p className="text-muted-foreground mt-2">Wählen Sie die Bestellmenge passend zu Ihrem Betrieb.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { id: 'karton'  as Quantity, title: 'Karton',       desc: 'Kleine bis mittlere Bestellmengen. Ideal für kleine Büros, Praxen oder als Probemenge.', tag: 'Schnellversand möglich', tagStyle: 'bg-green-100 text-green-800', delay: 70 },
            { id: 'palette' as Quantity, title: 'Palette',      desc: 'Großmengen für Hotels, Gastronomie, Industrie. Maximale Ersparnis pro Einheit.', tag: 'Bester Preis/Menge', tagStyle: 'bg-blue-100 text-blue-800', delay: 140 },
            { id: 'alle'    as Quantity, title: 'Beides / Egal',desc: 'Zeige alle verfügbaren Abpackungsgrößen — Karton und Palette.', tag: null, tagStyle: '', delay: 210 },
          ].map(({ id, title, desc, tag, tagStyle, delay }) => (
            <button
              key={id}
              onClick={() => { setState(s => ({ ...s, quantity: id })); goTo('step3') }}
              className="bg-white border-2 border-border rounded-xl p-6 text-left flex flex-col gap-2 hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-[.98] transition-all animate-card-entrance"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="font-display font-bold text-xl uppercase text-navy">{title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
              {tag && <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded w-fit mt-1 ${tagStyle}`}>✓ {tag}</span>}
            </button>
          ))}
        </div>
        <div className="flex justify-start mt-8">
          <button onClick={() => goTo('step1')} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy transition-colors">
            <ArrowLeft size={16} /> Zurück
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 'step3') return (
    <div className="py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <ProgressBar step={3} />
        <div className="text-center mb-10 animate-fade-up">
          <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Schritt 3 von 3</div>
          <h2 className="font-display font-extrabold text-4xl uppercase text-navy">Welche Qualität?</h2>
          <p className="text-muted-foreground mt-2">Wählen Sie entsprechend Ihrer Anforderungen und Ihres Budgets.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: 'recycling' as Quality, title: 'ECO / Recycling',      desc: 'Aus 100 % Altpapier. EU ECOLABEL oder Blauer Engel zertifiziert. Nachhaltig & kosteneffizient.', tag: 'Nachhaltig',      tagStyle: 'bg-teal-100 text-teal-800', delay: 70 },
            { id: 'zellstoff' as Quality, title: 'Standard Zellstoff',   desc: 'Aus Frischfasern. Weiß, weich und reißfest. Ideale Balance aus Qualität und Preis.',               tag: 'Beliebteste Wahl', tagStyle: 'bg-blue-100 text-blue-800', delay: 140 },
            { id: 'premium'   as Quality, title: 'Premium / Ultra Soft', desc: 'Höchste Qualität: Ultra Soft, Super Soft oder Gold. Für Hotels, Arztpraxen und höchste Ansprüche.',tag: 'Premium',          tagStyle: 'bg-amber-100 text-amber-800', delay: 210 },
            { id: 'alle'      as Quality, title: 'Egal / Alle',          desc: 'Zeige alle Qualitätsstufen — sortiert nach Preis.', tag: null, tagStyle: '', delay: 280 },
          ].map(({ id, title, desc, tag, tagStyle, delay }) => (
            <button
              key={id}
              onClick={() => { setState(s => ({ ...s, quality: id })); goTo('results') }}
              className="bg-white border-2 border-border rounded-xl p-6 text-left flex flex-col gap-2 hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-[.98] transition-all animate-card-entrance"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="font-display font-bold text-xl uppercase text-navy">{title}</div>
              <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
              {tag && <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded w-fit mt-1 ${tagStyle}`}>{tag}</span>}
            </button>
          ))}
        </div>
        <div className="flex justify-start mt-8">
          <button onClick={() => goTo('step2')} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy transition-colors">
            <ArrowLeft size={16} /> Zurück
          </button>
        </div>
      </div>
    </div>
  )

  if (screen === 'results') {
    const all = filterProducts(state)
    const shown = all.slice(0, 24)
    return (
      <div className="py-10 px-4">
        {/* Results header */}
        <div className="max-w-6xl mx-auto mb-8 animate-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display font-extrabold text-3xl uppercase text-navy">
                {state.category === 'alle' ? 'Alle Produkte' : CAT_LABELS[state.category]}
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                {all.length === 0 ? 'Keine Produkte gefunden' : `${all.length} Produkte gefunden${all.length > 24 ? ' — Top 24 werden angezeigt' : ''}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {state.category !== 'alle' && <Chip label="Kategorie" value={CAT_LABELS[state.category] || state.category} />}
                {state.quantity !== 'alle' && <Chip label="Menge"     value={QTY_LABELS[state.quantity]   || state.quantity} />}
                {state.quality  !== 'alle' && <Chip label="Qualität"  value={QUAL_LABELS[state.quality]   || state.quality} />}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={() => goTo('step1')} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy transition-colors">
                <Edit size={15} /> Suche anpassen
              </button>
              <button onClick={() => { setState({ category: 'alle', quantity: 'alle', quality: 'alle' }); goTo('intro') }} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy transition-colors">
                <Home size={15} /> Neu starten
              </button>
            </div>
          </div>
        </div>

        {/* Grid */}
        {shown.length === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-2xl uppercase text-navy mb-2">Keine Produkte gefunden</h3>
            <p className="text-muted-foreground text-sm mb-6">Mit diesen Filtereinstellungen haben wir leider keine Treffer. Versuchen Sie andere Kombinationen.</p>
            <button onClick={() => { setState({ category: 'alle', quantity: 'alle', quality: 'alle' }); goTo('results') }} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors">
              Alle Produkte anzeigen
            </button>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shown.map((p, i) => <ProductCard key={p.num} p={p} index={i} />)}
          </div>
        )}
      </div>
    )
  }

  return null
}
