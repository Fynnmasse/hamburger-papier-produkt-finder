import React, { useState, useCallback, useMemo } from 'react'
import { ArrowLeft, Home, Edit, ExternalLink } from 'lucide-react'
import { PRODUCTS, type Product } from '@/lib/products'
import { cn } from '@/lib/utils'

// ── Types ──
type Category = 'alle' | 'toilettenpapier' | 'papierhandtuecher' | 'handtuchrollen' | 'putzpapier' | 'spender' | 'kuechenrollen' | 'seife'

interface Answers {
  category: Category
  subtype?: string
  quantity?: string
  material?: string
}

interface StepOption {
  value: string
  label: string
  desc: string
  tag?: string | null
  tagStyle?: string
}

interface StepDef {
  id: string
  title: string
  subtitle: string
  answerKey: keyof Answers
  options: StepOption[]
}

// ── Labels ──
const CAT_LABELS: Record<string, string> = {
  toilettenpapier: 'Toilettenpapier', papierhandtuecher: 'Papierhandtücher',
  handtuchrollen: 'Handtuchrollen', putzpapier: 'Putzpapier & Reinigung',
  spender: 'Spender & Zubehör', kuechenrollen: 'Küchenrollen & Servietten',
  seife: 'Seife & Desinfektion', alle: 'Alle Kategorien',
}

const CHIP_LABELS: Record<string, string> = {
  category: 'Kategorie', subtype: 'Typ', quantity: 'Menge', material: 'Qualität',
}

const VALUE_LABELS: Record<string, Record<string, string>> = {
  category: CAT_LABELS,
  subtype: {
    kleinrollen: 'Kleinrollen', jumborollen: 'Jumborollen', spender: 'Spender',
    'z-falz': 'Z-Falz', 'c-falz': 'C-Falz', interfold: 'Interfold',
    standard: 'Standard-Rollen', autocut: 'Autocut-System',
    putzpapier: 'Putzpapier-Rollen', aerzte: 'Ärzte- & Liegenrollen', mikrofaser: 'Mikrofaser',
    kuechenrollen: 'Küchenrollen', servietten: 'Servietten', kosmetiktuecher: 'Kosmetiktücher',
    papierhandtuecher: 'Papierhandtücher', seife: 'Seife & Schaumseife',
    jumborollen_spender: 'Jumborollen / WC', servietten_spender: 'Servietten',
  },
  quantity: { karton: 'Karton', palette: 'Palette' },
  material: { recycling: 'ECO / Recycling', zellstoff: 'Standard Zellstoff', premium: 'Premium' },
}

// ── Subtype Matching ──
function matchesSubtype(p: Product, category: string, subtype: string): boolean {
  const name = p.name.toLowerCase()

  switch (category) {
    case 'toilettenpapier':
      if (subtype === 'jumborollen') return name.includes('jumbo') && p.layers > 0
      if (subtype === 'kleinrollen') return !name.includes('jumbo') && !name.includes('spender') && p.layers > 0
      if (subtype === 'spender') return (name.includes('spender') || p.layers === 0) && p.quantity === 'stueck'
      break
    case 'papierhandtuecher':
      if (subtype === 'z-falz') return /z[\s-]?fal[tz]/i.test(p.name)
      if (subtype === 'c-falz') return /c[\s-]?fal[tz]/i.test(p.name)
      if (subtype === 'interfold') return /interfold/i.test(p.name)
      break
    case 'handtuchrollen':
      if (subtype === 'standard') return p.layers > 0 && !name.includes('autocut') && !name.includes('starterset') && !name.includes('spender')
      if (subtype === 'autocut') return name.includes('autocut') || name.includes('starterset')
      if (subtype === 'spender') return name.includes('spender') && p.layers === 0
      break
    case 'putzpapier':
      if (subtype === 'putzpapier') return /putz|werkstatt/i.test(p.name)
      if (subtype === 'aerzte') return /ärzt|liegen/i.test(p.name)
      if (subtype === 'mikrofaser') return /mikrofaser|wischmop/i.test(p.name)
      break
    case 'kuechenrollen':
      if (subtype === 'kuechenrollen') return p.category === 'kuechenrollen'
      if (subtype === 'servietten') return p.category === 'servietten'
      if (subtype === 'kosmetiktuecher') return p.category === 'kosmetiktuecher'
      break
    case 'spender':
      if (subtype === 'papierhandtuecher') return /papierhandtuchspender/i.test(p.name)
      if (subtype === 'seife') return /seifenspender|schaumseifenspender/i.test(p.name)
      if (subtype === 'jumborollen_spender') return /jumborollen\s*spender/i.test(p.name)
      if (subtype === 'servietten_spender') return /serviettenspender/i.test(p.name)
      break
  }
  return true
}

// ── Filter ──
function filterProducts(answers: Answers): Product[] {
  return PRODUCTS.filter(p => {
    // Category
    if (answers.category !== 'alle') {
      if (answers.category === 'kuechenrollen') {
        if (!['kuechenrollen', 'servietten', 'kosmetiktuecher'].includes(p.category)) return false
      } else {
        if (p.category !== answers.category) return false
      }
    }
    // Subtype
    if (answers.subtype && answers.subtype !== 'alle') {
      if (!matchesSubtype(p, answers.category, answers.subtype)) return false
    }
    // Quantity
    if (answers.quantity && answers.quantity !== 'alle') {
      if (p.quantity !== answers.quantity) return false
    }
    // Material
    if (answers.material && answers.material !== 'alle') {
      if (p.material !== answers.material) return false
    }
    return true
  }).sort((a, b) => {
    const ai = a.img ? 1 : 0, bi = b.img ? 1 : 0
    if (bi !== ai) return bi - ai
    return a.price - b.price
  })
}

// ── Shared Step Builders ──
const QUANTITY_STEP: StepDef = {
  id: 'quantity', title: 'Wie viel benötigen Sie?', subtitle: 'Wählen Sie die Bestellmenge passend zu Ihrem Betrieb.',
  answerKey: 'quantity',
  options: [
    { value: 'karton', label: 'Karton', desc: 'Kleine bis mittlere Bestellmengen. Ideal für Büros, Praxen oder als Erstbestellung.', tag: 'Schnellversand möglich', tagStyle: 'bg-green-100 text-green-800' },
    { value: 'palette', label: 'Palette', desc: 'Großmengen für Hotels, Gastronomie, Industrie. Maximale Ersparnis pro Einheit.', tag: 'Bester Preis/Menge', tagStyle: 'bg-blue-100 text-blue-800' },
    { value: 'alle', label: 'Beides / Egal', desc: 'Zeige alle verfügbaren Abpackungsgrößen.' },
  ],
}

function materialStep(includePremium: boolean): StepDef {
  const options: StepOption[] = [
    { value: 'recycling', label: 'ECO / Recycling', desc: 'Aus 100 % Altpapier. Nachhaltig & kosteneffizient.', tag: 'Nachhaltig', tagStyle: 'bg-teal-100 text-teal-800' },
    { value: 'zellstoff', label: 'Standard Zellstoff', desc: 'Aus Frischfasern. Weiß, weich und reißfest.', tag: 'Beliebteste Wahl', tagStyle: 'bg-blue-100 text-blue-800' },
  ]
  if (includePremium) {
    options.push({ value: 'premium', label: 'Premium / Ultra Soft', desc: 'Höchste Qualität: Ultra Soft, Super Soft oder Gold.', tag: 'Premium', tagStyle: 'bg-amber-100 text-amber-800' })
  }
  options.push({ value: 'alle', label: 'Egal / Alle', desc: 'Zeige alle Qualitätsstufen.' })
  return {
    id: 'material', title: 'Welche Qualität?', subtitle: 'Wählen Sie entsprechend Ihrer Anforderungen und Ihres Budgets.',
    answerKey: 'material', options,
  }
}

// ── Category-Specific Flows ──
function getStepsForCategory(answers: Answers): StepDef[] {
  const steps: StepDef[] = []

  switch (answers.category) {
    case 'toilettenpapier': {
      steps.push({
        id: 'subtype', title: 'Welcher Rollentyp?', subtitle: 'Standardrollen für jeden Halter oder Jumborollen für Spender-Systeme?',
        answerKey: 'subtype',
        options: [
          { value: 'kleinrollen', label: 'Kleinrollen', desc: 'Standard WC-Rollen (150–400 Blatt). Passend für jeden Rollenhalter.', tag: 'Am häufigsten', tagStyle: 'bg-blue-100 text-blue-800' },
          { value: 'jumborollen', label: 'Jumborollen', desc: 'Großrollen (130m–570m) für Jumborollenspender. Ideal für stark frequentierte WCs.', tag: 'Für Spender-Systeme', tagStyle: 'bg-teal-100 text-teal-800' },
          { value: 'spender', label: 'Spender & Zubehör', desc: 'Jumborollenspender und Toilettenpapierspender.' },
        ],
      })
      if (answers.subtype === 'spender') break
      steps.push(QUANTITY_STEP)
      steps.push(materialStep(true))
      break
    }

    case 'papierhandtuecher': {
      steps.push({
        id: 'subtype', title: 'Welche Falzung?', subtitle: 'Wählen Sie die Falzung passend zu Ihrem Spender-System.',
        answerKey: 'subtype',
        options: [
          { value: 'z-falz', label: 'Z-Falz', desc: 'Der Standard für die meisten Papierhandtuchspender. Einzelblattentnahme.', tag: 'Am häufigsten', tagStyle: 'bg-blue-100 text-blue-800' },
          { value: 'c-falz', label: 'C-Falz', desc: 'Breite Tücher (25×31 cm) für C-Falz Spender.' },
          { value: 'interfold', label: 'Interfold', desc: 'Ineinandergefaltete Tücher für Interfold-Spender. Automatische Einzelentnahme.' },
        ],
      })
      steps.push(QUANTITY_STEP)
      steps.push(materialStep(true))
      break
    }

    case 'handtuchrollen': {
      steps.push({
        id: 'subtype', title: 'Welches System?', subtitle: 'Wählen Sie den Rollentyp passend zu Ihrem Spender.',
        answerKey: 'subtype',
        options: [
          { value: 'standard', label: 'Standard-Rollen', desc: 'Handtuchrollen für Innenabrollung und Außenabwicklung. Verschiedene Längen und Breiten.', tag: 'Am häufigsten', tagStyle: 'bg-blue-100 text-blue-800' },
          { value: 'autocut', label: 'Autocut-System', desc: 'Automatische Einzelblattentnahme. Spender und Startersets verfügbar.' },
          { value: 'spender', label: 'Spender (Innenabrollung)', desc: 'Innenauszug-Spender in Schwarz oder Weiß.' },
        ],
      })
      if (answers.subtype === 'autocut' || answers.subtype === 'spender') break
      steps.push(QUANTITY_STEP)
      steps.push(materialStep(false))
      break
    }

    case 'putzpapier': {
      steps.push({
        id: 'subtype', title: 'Welches Produkt?', subtitle: 'Wählen Sie die passende Produktgruppe.',
        answerKey: 'subtype',
        options: [
          { value: 'putzpapier', label: 'Putzpapier-Rollen', desc: 'Industrie-Putzrollen und Werkstatt-Papier. Verschiedene Breiten und Lagen.' },
          { value: 'aerzte', label: 'Ärzte- & Liegenrollen', desc: 'Zellstoff-Rollen für Arztpraxen, Krankenhäuser und Therapieliegen.' },
          { value: 'mikrofaser', label: 'Mikrofaser & Wischmop', desc: 'Wiederverwendbare Mikrofasertücher und Wischmops für professionelle Reinigung.' },
        ],
      })
      steps.push(QUANTITY_STEP)
      if (answers.subtype === 'putzpapier') {
        steps.push(materialStep(false))
      }
      break
    }

    case 'kuechenrollen': {
      steps.push({
        id: 'subtype', title: 'Welches Produkt?', subtitle: 'Wählen Sie die gewünschte Unterkategorie.',
        answerKey: 'subtype',
        options: [
          { value: 'kuechenrollen', label: 'Küchenrollen', desc: 'Klassische Küchenrollen in verschiedenen Größen und Qualitäten.' },
          { value: 'servietten', label: 'Servietten', desc: 'Servietten für Gastronomie und Hotellerie.' },
          { value: 'kosmetiktuecher', label: 'Kosmetiktücher', desc: 'Kosmetiktücher in der Box. Standard und Würfel-Boxen.' },
        ],
      })
      steps.push(QUANTITY_STEP)
      break
    }

    case 'spender': {
      steps.push({
        id: 'subtype', title: 'Spender für welches Produkt?', subtitle: 'Wählen Sie den passenden Spender-Typ.',
        answerKey: 'subtype',
        options: [
          { value: 'papierhandtuecher', label: 'Papierhandtücher', desc: 'Spender für Falthandtücher (Z-Falz und Interfold).' },
          { value: 'seife', label: 'Seife & Schaumseife', desc: 'Wiederbefüllbare Seifen- und Schaumseifenspender.' },
          { value: 'jumborollen_spender', label: 'Jumborollen / WC', desc: 'Spender für Jumbo-Toilettenpapierrollen.' },
          { value: 'servietten_spender', label: 'Servietten', desc: 'Serviettenspender mit antibakterieller Oberfläche.' },
        ],
      })
      break
    }

    // seife + alle: no additional steps
  }

  return steps
}

// Determine relevant steps, skipping if already <=4 results
function getActiveSteps(answers: Answers): StepDef[] {
  const allSteps = getStepsForCategory(answers)
  const result: StepDef[] = []

  for (const step of allSteps) {
    // If this step's answer is already set, include it but continue
    if (answers[step.answerKey]) {
      result.push(step)
      continue
    }
    // Check if we already have few enough results
    const count = filterProducts(answers).length
    if (count <= 4) break
    result.push(step)
  }

  return result
}

// ── Product Card ──
function ProductCard({ p, index }: { p: Product; index: number }) {
  const shopUrl = p.url || `https://www.hamburgpapier-shop.de/search?search=${encodeURIComponent(p.num)}`
  const price   = p.price > 0 ? `${(p.price / 1.19).toFixed(2).replace('.', ',')} €` : 'Auf Anfrage'
  const name    = p.name.length > 80 ? p.name.substring(0, 77) + '…' : p.name

  return (
    <a
      href={shopUrl} target="_blank" rel="noopener"
      className="bg-white border border-border rounded-xl overflow-hidden flex flex-col opacity-0 translate-y-2 animate-card-in hover:-translate-y-1 hover:scale-[1.01] hover:border-primary hover:shadow-lg transition-[border-color,box-shadow,transform,opacity] duration-200 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
      style={{ animationDelay: `${Math.min(index * 40, 400)}ms`, animationFillMode: 'forwards' }}
      aria-label={`Im Shop kaufen: ${p.name}`}
    >
      <div className="w-full aspect-[4/3] bg-white overflow-hidden relative flex items-center justify-center p-2">
        {p.img ? (
          <img
            src={p.img} alt={p.name} loading="lazy"
            width={400} height={300}
            className="w-full h-full object-contain opacity-0 transition-opacity duration-500"
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
      <div className="p-4 flex flex-col gap-2 flex-1">
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
            <div className="text-xs text-muted-foreground mt-0.5">zzgl. 19% MwSt.</div>
          </div>
          <span className="flex items-center gap-1 bg-primary text-white text-xs font-semibold px-3 py-2 rounded-lg min-h-[40px] flex-shrink-0">
            Kaufen
            <ExternalLink size={12} />
          </span>
        </div>
      </div>
    </a>
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

// ── Dynamic Progress Bar ──
function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="max-w-xs mx-auto mb-10">
      <div className="flex items-center">
        {Array.from({ length: total }, (_, i) => i + 1).map((n, i) => (
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
            {i < total - 1 && (
              <div key={`line-${n}`} className={cn('flex-1 h-0.5 transition-colors', n < step ? 'bg-primary' : 'bg-border')} />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  )
}

// ── Main Component ──
export default function ProductFinder({ onBack }: { onBack?: () => void }) {
  const [stepIndex, setStepIndex] = useState(0) // 0 = category selection
  const [answers, setAnswers] = useState<Answers>({ category: 'alle' })
  const [showResults, setShowResults] = useState(false)

  const scrollTop = useCallback(() => window.scrollTo({ top: 0, behavior: 'smooth' }), [])

  const steps = useMemo(() => getActiveSteps(answers), [answers])

  // Total steps = 1 (category) + category-specific steps
  // On category screen (no category chosen yet), show minimum 2 so "1 von 1" doesn't appear
  const totalSteps = 1 + Math.max(steps.length, stepIndex === 0 ? 1 : 0)

  const goToResults = useCallback(() => {
    scrollTop()
    setShowResults(true)
  }, [scrollTop])

  const handleCategorySelect = useCallback((cat: Category) => {
    const newAnswers: Answers = { category: cat }
    setAnswers(newAnswers)

    if (cat === 'alle' || cat === 'seife') {
      setShowResults(true)
      scrollTop()
      return
    }

    // Check if this category has steps AND enough products to warrant them
    const categorySteps = getActiveSteps(newAnswers)
    if (categorySteps.length === 0 || filterProducts(newAnswers).length <= 4) {
      setShowResults(true)
      scrollTop()
      return
    }

    setStepIndex(1)
    setShowResults(false)
    scrollTop()
  }, [scrollTop])

  const handleStepAnswer = useCallback((answerKey: keyof Answers, value: string) => {
    const newAnswers = { ...answers, [answerKey]: value }
    setAnswers(newAnswers)

    // Re-evaluate steps with new answers
    const remainingSteps = getActiveSteps(newAnswers)
    const nextUnanswered = remainingSteps.findIndex(s => !newAnswers[s.answerKey])

    if (nextUnanswered === -1 || filterProducts(newAnswers).length <= 4) {
      setShowResults(true)
      scrollTop()
    } else {
      setStepIndex(nextUnanswered + 1) // +1 because step 0 is category
      setShowResults(false)
      scrollTop()
    }
  }, [answers, scrollTop])

  const goBack = useCallback(() => {
    scrollTop()
    if (showResults) {
      // Go back to last answered step
      const answeredSteps = steps.filter(s => answers[s.answerKey])
      if (answeredSteps.length > 0) {
        const lastStep = answeredSteps[answeredSteps.length - 1]
        setAnswers(prev => ({ ...prev, [lastStep.answerKey]: undefined }))
        setStepIndex(steps.indexOf(lastStep) + 1)
        setShowResults(false)
      } else {
        // No steps were answered (direct-to-results: seife, alle, spender subtype, etc.)
        // Go back to category selection
        setAnswers({ category: 'alle' })
        setStepIndex(0)
        setShowResults(false)
      }
      return
    }
    if (stepIndex <= 1) {
      // Go back to category selection
      setStepIndex(0)
      setAnswers({ category: 'alle' })
    } else {
      // Go back to previous step, clear current step's answer
      const currentStep = steps[stepIndex - 1]
      if (currentStep) {
        setAnswers(prev => ({ ...prev, [currentStep.answerKey]: undefined }))
      }
      setStepIndex(stepIndex - 1)
    }
  }, [scrollTop, showResults, stepIndex, steps, answers])

  const restart = useCallback(() => {
    scrollTop()
    setAnswers({ category: 'alle' })
    setStepIndex(0)
    setShowResults(false)
  }, [scrollTop])

  // ── Category Selection (Step 0) ──
  const categories: { id: Category; label: string; count: number; icon: React.ReactNode }[] = [
    { id: 'toilettenpapier', label: 'Toilettenpapier', count: 36, icon: <img src="/Toilettenpapier.svg" alt="Toilettenpapier" className="h-14 w-auto block" /> },
    { id: 'papierhandtuecher', label: 'Papierhandtücher', count: 43, icon: <img src="/Papierhandtücher.svg" alt="Papierhandtücher" className="h-14 w-auto block" /> },
    { id: 'handtuchrollen', label: 'Handtuchrollen', count: 30, icon: <img src="/Handtuchrollen.svg" alt="Handtuchrollen" className="h-14 w-auto block" /> },
    { id: 'putzpapier', label: 'Putzpapier & Reinigung', count: 27, icon: <img src="/Putzpapier.svg" alt="Putzpapier & Reinigung" className="h-14 w-auto block" /> },
    { id: 'spender', label: 'Spender & Zubehör', count: 10, icon: <img src="/Spender.svg" alt="Spender & Zubehör" className="h-14 w-auto block" /> },
    { id: 'kuechenrollen', label: 'Küchenrollen & Servietten', count: 24, icon: <img src="/Küchenrollen.svg" alt="Küchenrollen & Servietten" className="h-14 w-auto block" /> },
    { id: 'seife', label: 'Seife & Desinfektion', count: 3, icon: <img src="/Seife.svg" alt="Seife & Desinfektion" className="h-14 w-auto block" /> },
    { id: 'alle', label: 'Alles anzeigen', count: 179, icon: <svg width="56" height="56" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2"><rect x="6" y="6" width="15" height="15" rx="3"/><rect x="27" y="6" width="15" height="15" rx="3"/><rect x="6" y="27" width="15" height="15" rx="3"/><rect x="27" y="27" width="15" height="15" rx="3"/></svg> },
  ]

  if (!showResults && stepIndex === 0) {
    return (
      <div className="py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <ProgressBar step={1} total={totalSteps} />
          <div className="text-center mb-10 animate-fade-up">
            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">Schritt 1 von {totalSteps}</div>
            <h2 className="font-display font-extrabold text-4xl uppercase text-navy text-balance">Was suchen Sie?</h2>
            <p className="text-muted-foreground mt-2">Wählen Sie die Produktkategorie, die Sie benötigen.</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {categories.map(({ id, label, count, icon }, i) => (
              <button
                key={id}
                onClick={() => handleCategorySelect(id)}
                className="bg-white border-2 border-border rounded-xl p-6 text-center flex flex-col items-center gap-3 min-h-[170px] hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-[border-color,box-shadow,transform,color] animate-card-entrance text-steel hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                {icon}
                <span className="font-semibold text-base text-navy leading-tight">{label}</span>
                <span className="text-xs text-muted-foreground">{count} Produkte</span>
              </button>
            ))}
          </div>
          {onBack && (
            <div className="flex justify-start max-w-4xl mx-auto mt-8">
              <button onClick={() => { scrollTop(); onBack() }} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                <ArrowLeft size={16} /> Zurück
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ── Generic Step Screens ──
  if (!showResults && stepIndex >= 1 && stepIndex <= steps.length) {
    const step = steps[stepIndex - 1]
    const gridCols = step.options.length <= 3
      ? 'grid-cols-1 sm:grid-cols-3'
      : 'grid-cols-1 sm:grid-cols-2'

    return (
      <div className="py-12 px-4">
        <div className="max-w-3xl mx-auto">
          <ProgressBar step={stepIndex + 1} total={totalSteps} />
          <div className="text-center mb-10 animate-fade-up">
            <div className="text-xs font-bold tracking-widest uppercase text-primary mb-2">
              Schritt {stepIndex + 1} von {totalSteps}
            </div>
            <h2 className="font-display font-extrabold text-4xl uppercase text-navy text-balance">{step.title}</h2>
            <p className="text-muted-foreground mt-2">{step.subtitle}</p>
          </div>
          <div className={`grid ${gridCols} gap-4`}>
            {step.options.map(({ value, label, desc, tag, tagStyle }, i) => (
              <button
                key={value}
                onClick={() => handleStepAnswer(step.answerKey, value)}
                className="bg-white border-2 border-border rounded-xl p-6 text-left flex flex-col gap-2 hover:border-primary hover:shadow-md hover:-translate-y-0.5 active:scale-[.98] transition-[border-color,box-shadow,transform] animate-card-entrance focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                style={{ animationDelay: `${(i + 1) * 70}ms` }}
              >
                <div className="font-display font-bold text-xl uppercase text-navy">{label}</div>
                <div className="text-sm text-muted-foreground leading-relaxed">{desc}</div>
                {tag && <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded w-fit mt-1 ${tagStyle}`}>{tag}</span>}
              </button>
            ))}
          </div>
          <div className="flex justify-start mt-8">
            <button onClick={goBack} className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
              <ArrowLeft size={16} /> Zurück
            </button>
          </div>
        </div>
      </div>
    )
  }

  // ── Results ──
  if (showResults) {
    const all = filterProducts(answers)
    const shown = all.slice(0, 24)

    return (
      <div className="py-10 px-4">
        <div className="max-w-6xl mx-auto mb-8 animate-fade-up">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="font-display font-extrabold text-3xl uppercase text-navy">
                {answers.category === 'alle' ? 'Alle Produkte' : CAT_LABELS[answers.category]}
              </h2>
              <p className="text-sm text-muted-foreground mt-1" aria-live="polite" aria-atomic="true">
                {all.length === 0 ? 'Keine Produkte gefunden' : `${all.length} Produkte gefunden${all.length > 24 ? ' — Top 24 werden angezeigt' : ''}`}
              </p>
              <div className="flex flex-wrap gap-2 mt-2">
                {(Object.keys(answers) as (keyof Answers)[]).map(key => {
                  const value = answers[key]
                  if (!value || value === 'alle') return null
                  const chipLabel = CHIP_LABELS[key]
                  const labels = VALUE_LABELS[key]
                  if (!chipLabel || !labels) return null
                  return <Chip key={key} label={chipLabel} value={labels[value] || value} />
                })}
              </div>
            </div>
            <div className="flex gap-3 items-center">
              <button onClick={goBack} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                <Edit size={15} /> Suche anpassen
              </button>
              <button onClick={restart} className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-navy transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded">
                <Home size={15} /> Neu starten
              </button>
            </div>
          </div>
        </div>

        {shown.length === 0 ? (
          <div className="text-center py-16 max-w-sm mx-auto">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="font-display font-bold text-2xl uppercase text-navy mb-2">Keine Produkte gefunden</h3>
            <p className="text-muted-foreground text-sm mb-6">Mit diesen Filtereinstellungen haben wir leider keine Treffer. Versuchen Sie andere Kombinationen.</p>
            <button onClick={() => { setAnswers({ category: 'alle' }); goToResults() }} className="bg-primary text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:bg-primary/90 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2">
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
