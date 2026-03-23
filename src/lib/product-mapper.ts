import type { Product } from './products';
import type { ShopwareProduct } from './shopware-api';
import { getCheapestPrice, getCoverImage } from './shopware-api';

/**
 * Mapping: Shopware-Kategorie-Name → Product.category
 * Muss mit den Kategorien in finder-config.ts übereinstimmen.
 */
const CATEGORY_MAPPING: Record<string, string> = {
  // Papierhandtücher
  'Papierhandtücher': 'papierhandtuecher',
  'Falthandtücher': 'papierhandtuecher',
  // Toilettenpapier (inkl. Jumbo)
  'Toilettenpapier': 'toilettenpapier',
  'Jumbotoilettenpapier': 'toilettenpapier',
  'Jumbo-Toilettenpapier': 'toilettenpapier',
  // Putzpapier (inkl. Ärzte, Mikrofaser)
  'Putzpapier': 'putzpapier',
  'Putzpapier blau': 'putzpapier',
  'Putzrollen': 'putzpapier',
  'Ärztekrepp': 'putzpapier',
  'Ärzterolle': 'putzpapier',
  'Liegenabdeckung': 'putzpapier',
  'Mikrofasertücher': 'putzpapier',
  'Mikrofaser': 'putzpapier',
  // Handtuchrollen
  'Handtuchrollen': 'handtuchrollen',
  // Küchenrollen / Servietten / Kosmetiktücher
  'Küchenrollen': 'kuechenrollen',
  'Servietten': 'servietten',
  'Kosmetiktücher': 'kosmetiktuecher',
  // Spender
  'Spender': 'spender',
  'Hygienespender': 'spender',
  // Seife
  'Seife': 'seife',
  'Cremeseife': 'seife',
  'Schaumseife': 'seife',
  'Handdesinfektion': 'seife',
};

/** Kategorie aus Shopware-Kategorien oder Produktname ableiten */
function resolveCategory(product: ShopwareProduct): string | null {
  // 1) Exakte Übereinstimmung mit Shopware-Kategorien
  for (const cat of product.categories ?? []) {
    if (CATEGORY_MAPPING[cat.name]) return CATEGORY_MAPPING[cat.name];
  }
  // 2) Teilstring-Suche in Shopware-Kategorien
  for (const cat of product.categories ?? []) {
    const lower = cat.name.toLowerCase();
    for (const [key, value] of Object.entries(CATEGORY_MAPPING)) {
      if (lower.includes(key.toLowerCase())) return value;
    }
  }
  // 3) Fallback: aus Produktname ableiten
  const name = product.name.toLowerCase();
  if (name.includes('spender')) return 'spender';
  if (name.includes('seife') || name.includes('desinfektion')) return 'seife';
  if (name.includes('handtuchrolle')) return 'handtuchrollen';
  if (name.includes('papierhandtuch') || name.includes('falthandtuch')) return 'papierhandtuecher';
  if (name.includes('jumbo') && name.includes('toilettenpapier')) return 'toilettenpapier';
  if (name.includes('toilettenpapier')) return 'toilettenpapier';
  if (name.includes('putz') || name.includes('werkstatt')) return 'putzpapier';
  if (name.includes('ärzt') || name.includes('liegen')) return 'putzpapier';
  if (name.includes('mikrofaser') || name.includes('wischmop')) return 'putzpapier';
  if (name.includes('küchenrolle')) return 'kuechenrollen';
  if (name.includes('serviette')) return 'servietten';
  if (name.includes('kosmetik')) return 'kosmetiktuecher';
  return null;
}

function resolveQuantity(product: ShopwareProduct): string {
  const name = product.name.toLowerCase();
  if (name.includes('palette')) return 'palette';
  if (name.includes('karton') || name.includes('krt') || /\bve\b/.test(name)) return 'karton';
  return 'stueck';
}

function resolveMaterial(product: ShopwareProduct): string {
  const name = product.name.toLowerCase();
  // 1) Premium (spezifischste Keywords zuerst)
  if (name.includes('ultra soft') || name.includes('super soft') || name.includes('gold') || name.includes('premium')) {
    return 'premium';
  }
  // 2) Explizit Recycling
  if (name.includes('recycling')) return 'recycling';
  // 3) Farb-Indikatoren: GRAU/GRÜN ohne "zellstoff" = Recycling
  if ((name.includes('grau') || name.includes('grün') || name.includes('gruen')) && !name.includes('zellstoff')) {
    return 'recycling';
  }
  // 4) Zellstoff
  if (name.includes('zellstoff') || name.includes('hochweiß') || name.includes('hochweiss')) {
    return 'zellstoff';
  }
  // 5) Shopware Properties als Fallback
  for (const prop of product.properties ?? []) {
    const pn = prop.name.toLowerCase();
    const gn = prop.group?.name?.toLowerCase() ?? '';
    if (gn.includes('material') || gn.includes('qualit')) {
      if (pn.includes('recycling')) return 'recycling';
      if (pn.includes('zellstoff')) return 'zellstoff';
      if (pn.includes('premium')) return 'premium';
    }
  }
  // 6) Default: zellstoff (kein Produkt nutzt "mischung")
  return 'zellstoff';
}

function resolveLayers(product: ShopwareProduct): number {
  const match = product.name.match(/(\d+)\s*[-]?\s*lagig/i);
  return match ? parseInt(match[1]) : 0;
}

function resolveEco(product: ShopwareProduct): string[] {
  const eco: string[] = [];
  const name = product.name.toLowerCase();

  // Aus Produktname
  if (name.includes('blauer engel') || name.includes('blauer-engel')) eco.push('blauer-engel');
  if (/eco\s*label|eu[\s-]eco/i.test(product.name)) eco.push('ecolabel');
  if (name.includes('ohne plastik') || name.includes('ohne-plastik')) eco.push('ohne-plastik');

  // Aus Shopware Properties (Name + Group)
  for (const prop of product.properties ?? []) {
    const pn = prop.name.toLowerCase();
    const gn = prop.group?.name?.toLowerCase() ?? '';

    // Direkte Property-Name Prüfung
    if ((pn.includes('blauer engel') || pn.includes('blauer-engel')) && !eco.includes('blauer-engel')) {
      eco.push('blauer-engel');
    }
    if ((pn.includes('ecolabel') || pn.includes('eco label') || pn.includes('eu ecolabel') || pn.includes('eco-label')) && !eco.includes('ecolabel')) {
      eco.push('ecolabel');
    }

    // Group-basierte Erkennung (Gruppe "Umweltzeichen", "Zertifikate", etc.)
    if (gn.includes('umwelt') || gn.includes('zertifi') || gn.includes('siegel') || gn.includes('eco') || gn.includes('label')) {
      if (pn.includes('blauer engel') && !eco.includes('blauer-engel')) eco.push('blauer-engel');
      if ((pn.includes('ecolabel') || pn.includes('eu')) && !eco.includes('ecolabel')) eco.push('ecolabel');
    }
  }
  return eco;
}

/**
 * Shopware-Produkte in das bestehende Product-Interface konvertieren.
 * Preis wird als Brutto gespeichert (× 1.19) für Kompatibilität mit
 * der bestehenden Anzeige-Logik (product-card.tsx teilt durch 1.19).
 */
export function mapShopwareToProducts(shopwareProducts: ShopwareProduct[]): Product[] {
  const results: Product[] = [];
  for (const sp of shopwareProducts) {
    if (sp.active === false || sp.available === false) continue;
    const category = resolveCategory(sp);
    if (!category) continue;
    results.push({
      name: sp.name,
      num: sp.productNumber,
      price: getCheapestPrice(sp) * 1.19, // Brutto für Kompatibilität
      img: getCoverImage(sp),
      url: `https://www.hamburgpapier-shop.de/detail/${sp.id}`,
      category,
      quantity: resolveQuantity(sp),
      material: resolveMaterial(sp),
      layers: resolveLayers(sp),
      eco: resolveEco(sp),
      staffelpreise: sp.calculatedPrices?.length > 0
        ? sp.calculatedPrices.map(cp => ({
            quantity: cp.quantity,
            unitPrice: cp.unitPrice,
            referencePrice: cp.referencePrice ? {
              price: cp.referencePrice.price,
              purchaseUnit: cp.referencePrice.purchaseUnit,
              referenceUnit: cp.referencePrice.referenceUnit,
              unitName: cp.referencePrice.unitName,
            } : undefined,
          }))
        : undefined,
    });
  }
  return results;
}
