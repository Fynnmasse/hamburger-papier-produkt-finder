import { PRODUCTS, type Product } from './products'

// ── Types ──
export type CategorySlug =
  | 'toilettenpapier'
  | 'papierhandtuecher'
  | 'handtuchrollen'
  | 'putzpapier'
  | 'kuechenrollen'
  | 'spender'
  | 'seife'

export interface StepOption {
  value: string
  label: string
  desc: string
  tag?: string
  tagStyle?: string
  image?: string // Optional: Bild-Pfad in /public (z.B. für Illustrations-Icons)
}

export interface StepDef {
  id: string
  slug: string // URL-Param name (typ, falzung, menge, qualitaet, etc.)
  title: string
  subtitle: string
  options: StepOption[]
}

export interface CategoryDef {
  slug: CategorySlug
  label: string
  icon: string // SVG filename in /public
  metaTitle: string
  metaDescription: string
  seoContent: string
  steps: StepDef[]
  getSteps?: (segments: string[]) => StepDef[]  // Dynamische Step-Resolution (optional)
  getAllPaths?: () => string[][]                  // Custom SSG-Pfade (optional)
}

// ── Shared Steps ──
const QUANTITY_STEP: StepDef = {
  id: 'quantity',
  slug: 'menge',
  title: 'Wie viel benötigen Sie?',
  subtitle: 'Wählen Sie die Bestellmenge passend zu Ihrem Betrieb.',
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
    id: 'material',
    slug: 'qualitaet',
    title: 'Welche Qualität?',
    subtitle: 'Wählen Sie entsprechend Ihrer Anforderungen und Ihres Budgets.',
    options,
  }
}

// ── Putzpapier-Rollen: Suche nach Branche / Anwendung ──
const PUTZPAPIER_SUBTYPE_STEP: StepDef = {
  id: 'subtype', slug: 'produkt',
  title: 'Welches Produkt?',
  subtitle: 'Wählen Sie die passende Produktgruppe.',
  options: [
    { value: 'putzpapier', label: 'Putzpapier-Rollen', desc: 'Industrie-Putzrollen und Werkstatt-Papier. Verschiedene Breiten und Lagen.' },
    { value: 'aerzte', label: 'Ärzte- & Liegenrollen', desc: 'Zellstoff-Rollen für Arztpraxen, Krankenhäuser und Therapieliegen.' },
    { value: 'mikrofaser', label: 'Mikrofaser & Wischmop', desc: 'Wiederverwendbare Mikrofasertücher und Wischmops für professionelle Reinigung.' },
  ],
}

const SEARCH_METHOD_STEP: StepDef = {
  id: 'searchMethod',
  slug: 'suchmethode',
  title: 'Wie möchten Sie suchen?',
  subtitle: 'Finden Sie das passende Putzpapier für Ihre Branche oder Anwendung.',
  options: [
    {
      value: 'branche',
      label: 'Nach Branche',
      desc: 'Finden Sie Putzpapier passend zu Ihrer Branche — Automobil, Gastronomie, Fitness und mehr.',
      tag: 'Empfohlen',
      tagStyle: 'bg-blue-100 text-blue-800',
      image: 'Produktsuche nach Branche.svg',
    },
    {
      value: 'anwendung',
      label: 'Nach Anwendung',
      desc: 'Wählen Sie nach Einsatzzweck — z.\u00A0B. Aufnahme von Flüssigkeiten, Ölen & Fetten.',
      image: 'Produktsuche nach Anwendung.svg',
    },
  ],
}

const BRANCHE_STEP: StepDef = {
  id: 'branche',
  slug: 'branche',
  title: 'Für welche Branche?',
  subtitle: 'Wählen Sie Ihre Branche für passende Putzpapier-Empfehlungen.',
  options: [
    { value: 'automobil-industrie', label: 'Automobil · Werkstatt · Tankstelle · Industrie', desc: 'Robustes Putzpapier für ölige und stark verschmutzte Umgebungen in Werkstätten, Tankstellen und Industriebetrieben.' },
    { value: 'gastronomie', label: 'Gastronomie', desc: 'Putzpapier für Küche, Service und Reinigung in der Gastronomie.' },
    { value: 'fitness-solarien', label: 'Fitness · Solarien', desc: 'Hygienisches Putzpapier für Geräte, Liegen und Kabinen.' },
    { value: 'lebensmittelindustrie', label: 'Lebensmittelindustrie', desc: 'Lebensmittelechtes Putzpapier für Produktions- und Verarbeitungsumgebungen.' },
  ],
}

const ANWENDUNG_STEP: StepDef = {
  id: 'anwendung',
  slug: 'anwendung',
  title: 'Für welche Anwendung?',
  subtitle: 'Für welche Anwendung wird das Papier hauptsächlich benötigt?',
  options: [
    { value: 'fluessigkeiten', label: 'Aufnahme von Flüssigkeiten, Ölen & Fetten', desc: 'Saugstarkes Putzpapier für Flüssigkeiten, Öle und Fette in Werkstatt und Industrie.' },
    { value: 'oberflaechen', label: 'Oberflächen reinigen & trocknen', desc: 'Putzpapier zum Reinigen und Trockenwischen von Oberflächen, Geräten und Maschinen.' },
    { value: 'haende', label: 'Hände abwischen & trocknen', desc: 'Weiches Putzpapier zum Händetrocknen in Werkstatt, Küche und Produktion.' },
    { value: 'allzweck', label: 'Allzweck / Universell', desc: 'Vielseitig einsetzbares Putzpapier für verschiedenste Reinigungsaufgaben.' },
  ],
}

// Produkt-Zuordnung nach Branche (Artikelnummern — wird später befüllt)
export const PRODUCT_BRANCHE_MAP: Record<string, string[]> = {
  'automobil-industrie': [],
  'gastronomie': [],
  'fitness-solarien': [],
  'lebensmittelindustrie': [],
}

// Produkt-Zuordnung nach Anwendung (Artikelnummern — wird später befüllt)
export const PRODUCT_ANWENDUNG_MAP: Record<string, string[]> = {
  'fluessigkeiten': [],
  'oberflaechen': [],
  'haende': [],
  'allzweck': [],
}

/** Dynamische Steps für Putzpapier-Kategorie */
function getPutzpapierSteps(segments: string[]): StepDef[] {
  // Ärzte / Mikrofaser: normaler linearer Flow
  if (segments.length > 0 && segments[0] !== 'putzpapier') {
    return [PUTZPAPIER_SUBTYPE_STEP, QUANTITY_STEP, materialStep(false)]
  }
  // Putzpapier-Rollen: Branche oder Anwendung → Qualität → Menge
  if (segments.length >= 2 && segments[1] === 'branche') {
    return [PUTZPAPIER_SUBTYPE_STEP, SEARCH_METHOD_STEP, BRANCHE_STEP, materialStep(false), QUANTITY_STEP]
  }
  if (segments.length >= 2 && segments[1] === 'anwendung') {
    return [PUTZPAPIER_SUBTYPE_STEP, SEARCH_METHOD_STEP, ANWENDUNG_STEP, materialStep(false), QUANTITY_STEP]
  }
  // Default: zeige Suchmethode-Wahl
  return [PUTZPAPIER_SUBTYPE_STEP, SEARCH_METHOD_STEP]
}

/** Alle SSG-Pfade für Putzpapier-Kategorie */
function getPutzpapierAllPaths(): string[][] {
  const paths: string[][] = []

  for (const subOpt of PUTZPAPIER_SUBTYPE_STEP.options) {
    paths.push([subOpt.value])

    if (subOpt.value === 'putzpapier') {
      // Suchmethode-Wahl
      const matOpts = materialStep(false).options
      for (const method of SEARCH_METHOD_STEP.options) {
        paths.push([subOpt.value, method.value])
        const nextStep = method.value === 'branche' ? BRANCHE_STEP : ANWENDUNG_STEP
        for (const opt of nextStep.options) {
          paths.push([subOpt.value, method.value, opt.value])
          // Qualität → Menge
          for (const mOpt of matOpts) {
            paths.push([subOpt.value, method.value, opt.value, mOpt.value])
            for (const qOpt of QUANTITY_STEP.options) {
              paths.push([subOpt.value, method.value, opt.value, mOpt.value, qOpt.value])
            }
          }
        }
      }
    } else {
      // Ärzte / Mikrofaser: linearer Flow
      for (const qOpt of QUANTITY_STEP.options) {
        paths.push([subOpt.value, qOpt.value])
        for (const mOpt of materialStep(false).options) {
          paths.push([subOpt.value, qOpt.value, mOpt.value])
        }
      }
    }
  }
  return paths
}

// ── Category Definitions ──
export const CATEGORIES: CategoryDef[] = [
  {
    slug: 'toilettenpapier',
    label: 'Toilettenpapier',
    icon: 'Toilettenpapier.svg',
    metaTitle: 'Toilettenpapier B2B Großhandel | Hamburg Papier Produktfinder',
    metaDescription: 'Toilettenpapier in Kleinrollen oder Jumborollen für Ihr Unternehmen finden. Recycling, Zellstoff oder Premium — als Karton oder Palette. 36 Produkte.',
    seoContent: 'Toilettenpapier gehört zu den am häufigsten benötigten Hygieneprodukten in jedem Betrieb. Ob Büro, Gastronomie, Hotel oder Arztpraxis — die Anforderungen variieren stark. Kleinrollen passen in jeden handelsüblichen WC-Rollenhalter und eignen sich für Räume mit geringer bis mittlerer Frequentierung. Jumborollen dagegen sind ideal für stark besuchte Sanitäranlagen: Sie bieten deutlich mehr Papier pro Rolle (130–570 Meter), wodurch ein Rollenwechsel seltener nötig ist. Achten Sie bei der Materialwahl auf Ihre Zielgruppe: Recycling-Papier (Blauer Engel) ist nachhaltig und kosteneffizient, während Premium-Zellstoff für Hotels und Restaurants mit gehobenen Ansprüchen die richtige Wahl ist.',
    steps: [
      {
        id: 'subtype', slug: 'typ',
        title: 'Welcher Rollentyp?',
        subtitle: 'Standardrollen für jeden Halter oder Jumborollen für Spender-Systeme?',
        options: [
          { value: 'kleinrollen', label: 'Kleinrollen', desc: 'Standard WC-Rollen (150–400 Blatt). Passend für jeden Rollenhalter.', tag: 'Am häufigsten', tagStyle: 'bg-blue-100 text-blue-800' },
          { value: 'jumborollen', label: 'Jumborollen', desc: 'Großrollen (130m–570m) für Jumborollenspender. Ideal für stark frequentierte WCs.', tag: 'Für Spender-Systeme', tagStyle: 'bg-teal-100 text-teal-800' },
          { value: 'spender', label: 'Spender & Zubehör', desc: 'Jumborollenspender und Toilettenpapierspender.' },
        ],
      },
      QUANTITY_STEP,
      materialStep(true),
    ],
  },
  {
    slug: 'papierhandtuecher',
    label: 'Papierhandtücher',
    icon: 'Papierhandtücher.svg',
    metaTitle: 'Papierhandtücher B2B kaufen | Hamburg Papier Produktfinder',
    metaDescription: 'Papierhandtücher in Z-Falz, C-Falz oder Interfold für Ihren Spender finden. Recycling oder Zellstoff, als Karton oder Palette. 43 Produkte.',
    seoContent: 'Papierhandtücher unterscheiden sich vor allem in der Falzung — und die muss zum Spender passen. Z-Falz (Zickzack-Faltung) ist der Standard: Die Tücher werden einzeln entnommen, was Verbrauch reduziert und Hygiene erhöht. C-Falz-Tücher sind breiter (25×31 cm) und eignen sich für C-Falz-Spender, wie sie häufig in älteren Sanitäranlagen zu finden sind. Interfold-Papierhandtücher sind ineinander gefaltet und ermöglichen eine besonders gleichmäßige Einzelblattentnahme. Bei der Qualität gilt: Recycling-Papier ist die wirtschaftliche Wahl für Hochfrequenzbereiche, Zellstoff bietet mehr Saugstärke und Weichheit.',
    steps: [
      {
        id: 'subtype', slug: 'falzung',
        title: 'Welche Falzung?',
        subtitle: 'Wählen Sie die Falzung passend zu Ihrem Spender-System.',
        options: [
          { value: 'z-falz', label: 'Z-Falz', desc: 'Der Standard für die meisten Papierhandtuchspender. Einzelblattentnahme.', tag: 'Am häufigsten', tagStyle: 'bg-blue-100 text-blue-800' },
          { value: 'c-falz', label: 'C-Falz', desc: 'Breite Tücher (25×31 cm) für C-Falz Spender.' },
          { value: 'interfold', label: 'Interfold', desc: 'Ineinandergefaltete Tücher für Interfold-Spender. Automatische Einzelentnahme.' },
        ],
      },
      QUANTITY_STEP,
      materialStep(true),
    ],
  },
  {
    slug: 'handtuchrollen',
    label: 'Handtuchrollen',
    icon: 'Handtuchrollen.svg',
    metaTitle: 'Handtuchrollen B2B bestellen | Hamburg Papier Produktfinder',
    metaDescription: 'Handtuchrollen für Innenabrollung, Autocut-Systeme oder als Spender. Standard oder Zellstoff, als Karton oder Palette. 30 Produkte.',
    seoContent: 'Handtuchrollen sind die hygienische Alternative zu Falthandtüchern und besonders in Waschräumen mit hoher Frequenz beliebt. Standard-Rollen gibt es für Innenabrollung und Außenabwicklung in verschiedenen Breiten (20–26 cm). Autocut-Systeme schneiden automatisch einzelne Blätter ab — das reduziert den Verbrauch um bis zu 40 % gegenüber offenen Spendersystemen. Spender für Handtuchrollen mit Innenabrollung sind platzsparend und einfach nachzufüllen. Bei der Qualität empfehlen wir Zellstoff für repräsentative Bereiche und Recycling für Produktionsumgebungen.',
    steps: [
      {
        id: 'subtype', slug: 'system',
        title: 'Welches System?',
        subtitle: 'Wählen Sie den Rollentyp passend zu Ihrem Spender.',
        options: [
          { value: 'standard', label: 'Standard-Rollen', desc: 'Handtuchrollen für Innenabrollung und Außenabwicklung. Verschiedene Längen und Breiten.', tag: 'Am häufigsten', tagStyle: 'bg-blue-100 text-blue-800' },
          { value: 'autocut', label: 'Autocut-System', desc: 'Automatische Einzelblattentnahme. Spender und Startersets verfügbar.' },
          { value: 'spender', label: 'Spender (Innenabrollung)', desc: 'Innenauszug-Spender in Schwarz oder Weiß.' },
        ],
      },
      QUANTITY_STEP,
      materialStep(false),
    ],
  },
  {
    slug: 'putzpapier',
    label: 'Putzpapier & Reinigung',
    icon: 'Putzpapier.svg',
    metaTitle: 'Putzpapier & Reinigungstücher B2B | Hamburg Papier Produktfinder',
    metaDescription: 'Putzpapier, Ärzte- und Liegenrollen oder Mikrofasertücher für Ihren Betrieb finden. Verschiedene Qualitäten, als Karton oder Palette. 27 Produkte.',
    seoContent: 'Putzpapier ist aus dem professionellen Reinigungsalltag nicht wegzudenken. Industrie-Putzrollen eignen sich für Werkstätten, Produktionshallen und Reinräume. Ärzte- und Liegenrollen aus Zellstoff sind in Arztpraxen, Krankenhäusern und Physiotherapiepraxen Standard — sie bieten eine hygienische Auflage und sind in verschiedenen Breiten erhältlich. Mikrofasertücher und Wischmops sind die wiederverwendbare Alternative: Sie nehmen Schmutz und Feuchtigkeit besonders effektiv auf und eignen sich für die tägliche Unterhaltsreinigung in Büros, Hotels und Gastronomiebetrieben.',
    steps: [PUTZPAPIER_SUBTYPE_STEP, QUANTITY_STEP, materialStep(false)],
    getSteps: getPutzpapierSteps,
    getAllPaths: getPutzpapierAllPaths,
  },
  {
    slug: 'kuechenrollen',
    label: 'Küchenrollen & Servietten',
    icon: 'Küchenrollen.svg',
    metaTitle: 'Küchenrollen & Servietten B2B | Hamburg Papier Produktfinder',
    metaDescription: 'Küchenrollen, Servietten und Kosmetiktücher für Gastronomie und Hotellerie. Als Karton oder Palette verfügbar. 24 Produkte.',
    seoContent: 'Küchenrollen, Servietten und Kosmetiktücher gehören zur Grundausstattung in Gastronomie, Hotellerie und Büros. Küchenrollen in verschiedenen Größen eignen sich sowohl für die Profiküche als auch für Teeküchen und Aufenthaltsräume. Servietten sind in der Gastronomie unverzichtbar — wir bieten verschiedene Formate und Qualitäten. Kosmetiktücher in der Box sind ideal für Hotelzimmer, Empfangsbereiche und Konferenzräume. Alle Produkte sind als Karton für kleinere Bestellungen oder als Palette für maximale Kosteneffizienz erhältlich.',
    steps: [
      {
        id: 'subtype', slug: 'produkt',
        title: 'Welches Produkt?',
        subtitle: 'Wählen Sie die gewünschte Unterkategorie.',
        options: [
          { value: 'kuechenrollen', label: 'Küchenrollen', desc: 'Klassische Küchenrollen in verschiedenen Größen und Qualitäten.' },
          { value: 'servietten', label: 'Servietten', desc: 'Servietten für Gastronomie und Hotellerie.' },
          { value: 'kosmetiktuecher', label: 'Kosmetiktücher', desc: 'Kosmetiktücher in der Box. Standard und Würfel-Boxen.' },
        ],
      },
      QUANTITY_STEP,
    ],
  },
  {
    slug: 'spender',
    label: 'Spender & Zubehör',
    icon: 'Spender.svg',
    metaTitle: 'Spender & Zubehör B2B | Hamburg Papier Produktfinder',
    metaDescription: 'Spender für Papierhandtücher, Seife, Jumborollen und Servietten. Professionelle Hygienelösungen für Ihren Betrieb. 10 Produkte.',
    seoContent: 'Hygienespender sind die Grundlage für einen professionellen Waschraum. Papierhandtuchspender ermöglichen die hygienische Einzelblattentnahme und reduzieren den Papierverbrauch. Seifenspender und Schaumseifenspender sind wiederbefüllbar und besonders wirtschaftlich. Jumborollenspender eignen sich für stark frequentierte WC-Anlagen und reduzieren den Wartungsaufwand erheblich. Serviettenspender mit antibakterieller Oberfläche sind in der Gastronomie Standard. Alle unsere Spender sind robust, langlebig und einfach zu montieren.',
    steps: [
      {
        id: 'subtype', slug: 'typ',
        title: 'Spender für welches Produkt?',
        subtitle: 'Wählen Sie den passenden Spender-Typ.',
        options: [
          { value: 'papierhandtuecher', label: 'Papierhandtücher', desc: 'Spender für Falthandtücher (Z-Falz und Interfold).' },
          { value: 'seife', label: 'Seife & Schaumseife', desc: 'Wiederbefüllbare Seifen- und Schaumseifenspender.' },
          { value: 'jumborollen_spender', label: 'Jumborollen / WC', desc: 'Spender für Jumbo-Toilettenpapierrollen.' },
          { value: 'servietten_spender', label: 'Servietten', desc: 'Serviettenspender mit antibakterieller Oberfläche.' },
        ],
      },
    ],
  },
  {
    slug: 'seife',
    label: 'Seife & Desinfektion',
    icon: 'Seife.svg',
    metaTitle: 'Seife & Desinfektion B2B | Hamburg Papier Produktfinder',
    metaDescription: 'Cremeseife, Schaumseife und Desinfektionsmittel für professionelle Hygiene. Hamburg Papier B2B Großhandel.',
    seoContent: 'Seife und Desinfektion sind unverzichtbare Bestandteile professioneller Handhygiene. Unsere Cremeseifen eignen sich hervorragend für den täglichen Gebrauch in Büros, Praxen und Gastronomie — sie sind hautschonend und ergiebig. Für den gewerblichen Einsatz bieten wir Großgebinde an, die sich in handelsübliche Seifenspender nachfüllen lassen. Alle Produkte erfüllen die Anforderungen an professionelle Handhygiene nach HACCP-Standards.',
    steps: [],
  },
]

export const CATEGORY_MAP = new Map(CATEGORIES.map(c => [c.slug, c]))

// ── Label Maps ──
export const STEP_VALUE_LABELS: Record<string, Record<string, string>> = {
  typ: {
    kleinrollen: 'Kleinrollen', jumborollen: 'Jumborollen', spender: 'Spender',
    papierhandtuecher: 'Papierhandtücher', seife: 'Seife & Schaumseife',
    jumborollen_spender: 'Jumborollen / WC', servietten_spender: 'Servietten',
  },
  falzung: { 'z-falz': 'Z-Falz', 'c-falz': 'C-Falz', interfold: 'Interfold' },
  system: { standard: 'Standard-Rollen', autocut: 'Autocut-System', spender: 'Spender' },
  produkt: {
    putzpapier: 'Putzpapier-Rollen', aerzte: 'Ärzte- & Liegenrollen', mikrofaser: 'Mikrofaser',
    kuechenrollen: 'Küchenrollen', servietten: 'Servietten', kosmetiktuecher: 'Kosmetiktücher',
  },
  menge: { karton: 'Karton', palette: 'Palette', alle: 'Alle' },
  qualitaet: { recycling: 'ECO / Recycling', zellstoff: 'Zellstoff', premium: 'Premium', alle: 'Alle' },
  suchmethode: { branche: 'Nach Branche', anwendung: 'Nach Anwendung' },
  branche: {
    'automobil-industrie': 'Automobil / Werkstatt / Industrie',
    gastronomie: 'Gastronomie',
    'fitness-solarien': 'Fitness / Solarien',
    lebensmittelindustrie: 'Lebensmittelindustrie',
  },
  anwendung: {
    fluessigkeiten: 'Flüssigkeiten & Öle & Fette',
    oberflaechen: 'Oberflächen reinigen',
    haende: 'Hände abwischen',
    allzweck: 'Allzweck',
  },
}

// ── Product Filtering ──
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

export interface FilterParams {
  category: CategorySlug
  subtype?: string
  quantity?: string
  material?: string
  branche?: string
  anwendung?: string
}

export function filterProducts(params: FilterParams): Product[] {
  return PRODUCTS.filter(p => {
    // Category
    if (params.category === 'kuechenrollen') {
      if (!['kuechenrollen', 'servietten', 'kosmetiktuecher'].includes(p.category)) return false
    } else {
      if (p.category !== params.category) return false
    }
    // Subtype
    if (params.subtype && params.subtype !== 'alle') {
      if (!matchesSubtype(p, params.category, params.subtype)) return false
    }
    // Quantity
    if (params.quantity && params.quantity !== 'alle') {
      if (p.quantity !== params.quantity) return false
    }
    // Material
    if (params.material && params.material !== 'alle') {
      if (p.material !== params.material) return false
    }
    // Branche (filtert nach Artikelnummern aus PRODUCT_BRANCHE_MAP)
    if (params.branche && params.branche !== 'alle') {
      const nums = PRODUCT_BRANCHE_MAP[params.branche]
      if (nums && nums.length > 0 && !nums.includes(p.num)) return false
    }
    // Anwendung (filtert nach Artikelnummern aus PRODUCT_ANWENDUNG_MAP)
    if (params.anwendung && params.anwendung !== 'alle') {
      const nums = PRODUCT_ANWENDUNG_MAP[params.anwendung]
      if (nums && nums.length > 0 && !nums.includes(p.num)) return false
    }
    return true
  }).sort((a, b) => {
    const ai = a.img ? 1 : 0, bi = b.img ? 1 : 0
    if (bi !== ai) return bi - ai
    return a.price - b.price
  })
}

/** Resolve steps for a category — uses dynamic getSteps if available */
export function resolveSteps(catDef: CategoryDef, segments: string[]): StepDef[] {
  return catDef.getSteps ? catDef.getSteps(segments) : catDef.steps
}

/** Parse URL segments into filter params for a given category */
export function parseStepParams(
  categorySlug: CategorySlug,
  segments: string[]
): FilterParams {
  const catDef = CATEGORY_MAP.get(categorySlug)
  if (!catDef) return { category: categorySlug }

  const steps = resolveSteps(catDef, segments)
  const params: FilterParams = { category: categorySlug }

  steps.forEach((step, i) => {
    if (i < segments.length) {
      const val = segments[i]
      if (step.id === 'subtype') params.subtype = val
      else if (step.id === 'quantity') params.quantity = val
      else if (step.id === 'material') params.material = val
      else if (step.id === 'branche') params.branche = val
      else if (step.id === 'anwendung') params.anwendung = val
      // searchMethod ist nur Routing — kein Filter
    }
  })

  return params
}

/** Get the current step definition to show, or null if we're at results */
export function getCurrentStep(
  categorySlug: CategorySlug,
  segments: string[]
): StepDef | null {
  const catDef = CATEGORY_MAP.get(categorySlug)
  if (!catDef) return null

  const steps = resolveSteps(catDef, segments)
  const stepIndex = segments.length
  if (stepIndex >= steps.length) return null

  // Check if enough products are already filtered
  const params = parseStepParams(categorySlug, segments)
  const products = filterProducts(params)
  if (products.length <= 4) return null

  return steps[stepIndex]
}

/** Generate all possible step combinations for static generation */
export function getAllStaticPaths(categorySlug: CategorySlug): string[][] {
  const catDef = CATEGORY_MAP.get(categorySlug)
  if (!catDef || catDef.steps.length === 0) return []

  // Custom SSG-Pfade wenn vorhanden (z.B. Putzpapier mit Branching)
  if (catDef.getAllPaths) return catDef.getAllPaths()

  const paths: string[][] = []

  function generate(stepIndex: number, current: string[]) {
    if (stepIndex >= catDef!.steps.length) return
    const step = catDef!.steps[stepIndex]
    for (const option of step.options) {
      const next = [...current, option.value]
      paths.push(next)
      generate(stepIndex + 1, next)
    }
  }

  generate(0, [])
  return paths
}
