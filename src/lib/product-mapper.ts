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
  if (name.includes('karton') || name.includes('krt')) return 'karton';
  return 'stueck';
}

function resolveMaterial(product: ShopwareProduct): string {
  const name = product.name.toLowerCase();
  if (name.includes('recycling')) return 'recycling';
  if (name.includes('zellstoff') || name.includes('hochweiß') || name.includes('hochweiss')) return 'zellstoff';
  if (name.includes('premium')) return 'premium';
  return 'mischung';
}

function resolveLayers(product: ShopwareProduct): number {
  const match = product.name.match(/(\d+)\s*[-]?\s*lagig/i);
  return match ? parseInt(match[1]) : 0;
}

function resolveEco(product: ShopwareProduct): string[] {
  const eco: string[] = [];
  const name = product.name.toLowerCase();
  if (name.includes('blauer engel')) eco.push('blauer-engel');
  if (name.includes('ecolabel') || name.includes('eco label')) eco.push('ecolabel');
  for (const prop of product.properties ?? []) {
    const propName = prop.name.toLowerCase();
    if (propName.includes('blauer engel') && !eco.includes('blauer-engel')) eco.push('blauer-engel');
    if (propName.includes('ecolabel') && !eco.includes('ecolabel')) eco.push('ecolabel');
  }
  return eco;
}

/**
 * Shopware-Produkte in das bestehende Product-Interface konvertieren.
 * Preis wird als Brutto gespeichert (× 1.19) für Kompatibilität mit
 * der bestehenden Anzeige-Logik (product-card.tsx teilt durch 1.19).
 */
export function mapShopwareToProducts(shopwareProducts: ShopwareProduct[]): Product[] {
  return shopwareProducts
    .filter(sp => sp.active !== false && sp.available !== false)
    .map(sp => {
      const category = resolveCategory(sp);
      if (!category) return null;
      return {
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
      };
    })
    .filter((p): p is Product => p !== null);
}
