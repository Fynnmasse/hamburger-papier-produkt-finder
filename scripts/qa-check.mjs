/**
 * QA-Check: Produktfinder Qualitätsprüfung
 * Prüft alle Pfade auf Sackgassen, verwaiste Produkte, überflüssige Fragen und falsche Zuordnungen.
 *
 * Ausführen: node --loader ts-node/esm scripts/qa-check.mjs
 * Oder: npx tsx scripts/qa-check.mjs
 */

// Da wir TypeScript-Dateien nicht direkt importieren können,
// replizieren wir die Kernlogik hier für die statischen Produkte.

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.join(__dirname, '..');

// ── Produkte aus products.ts parsen ──
const productsFile = readFileSync(path.join(projectRoot, 'src/lib/products.ts'), 'utf-8');

function parseProducts() {
  // Extrahiere das Array aus dem TypeScript-File
  const arrayMatch = productsFile.match(/export const PRODUCTS:\s*Product\[\]\s*=\s*(\[[\s\S]*\])\s*;?\s*$/m);
  if (!arrayMatch) {
    console.error('Konnte PRODUCTS Array nicht finden');
    return [];
  }
  let jsonStr = arrayMatch[1];
  // Trailing Commas entfernen (TypeScript erlaubt sie, JSON nicht)
  jsonStr = jsonStr.replace(/,\s*([\]}])/g, '$1');
  try {
    return JSON.parse(jsonStr);
  } catch (e) {
    console.error('Fehler beim Parsen der Produkte:', e.message);
    // Versuche mit eval als Fallback
    try {
      return (new Function('return ' + arrayMatch[1]))();
    } catch (e2) {
      console.error('Auch eval fehlgeschlagen:', e2.message);
      return [];
    }
  }
}

const PRODUCTS = parseProducts();
console.log(`\n📦 ${PRODUCTS.length} Produkte geladen aus products.ts\n`);

// ── Dimension Config ──
const DIMENSION_CONFIG = {
  '21x21cm': { regex: /21\s*x\s*21/i, layers: [2], falzung: 'z-falz' },
  '24x21cm': { regex: /24\s*x\s*21/i, layers: [1, 2, 3], falzung: 'z-falz' },
  '25x21cm': { regex: /25\s*x\s*21/i, layers: [1, 2], falzung: 'z-falz' },
  '25x23cm': { regex: /25\s*x\s*23/i, layers: [1], falzung: 'z-falz' },
  '20-5x24cm': { regex: /20[,.]5\s*x\s*24/i, layers: [2], falzung: 'interfold' },
  '25x31cm': { regex: /25\s*x\s*31/i, layers: [1, 2], falzung: 'c-falz' },
};

// ── Filter-Logik (repliziert aus finder-config.ts) ──
function matchesSubtype(p, category, subtype) {
  const name = p.name.toLowerCase();
  switch (category) {
    case 'toilettenpapier':
      if (subtype === 'jumborollen') return name.includes('jumbo') && p.layers > 0;
      if (subtype === 'kleinrollen') return !name.includes('jumbo') && !name.includes('spender') && p.layers > 0;
      if (subtype === 'spender') return (name.includes('spender') || p.layers === 0) && p.quantity === 'stueck';
      break;
    case 'papierhandtuecher':
      if (subtype === 'z-falz') return /z[\s-]?fal[tz]/i.test(p.name);
      if (subtype === 'c-falz') return /c[\s-]?fal[tz]/i.test(p.name);
      if (subtype === 'interfold') return /interfold/i.test(p.name);
      break;
    case 'handtuchrollen':
      if (subtype === 'standard') return p.layers > 0 && !name.includes('autocut') && !name.includes('starterset') && !name.includes('spender');
      if (subtype === 'autocut') return name.includes('autocut') || name.includes('starterset');
      if (subtype === 'spender') return name.includes('spender') && p.layers === 0;
      break;
    case 'putzpapier':
      if (subtype === 'putzpapier') return /putz|werkstatt/i.test(p.name);
      if (subtype === 'aerzte') return /ärzt|liegen/i.test(p.name);
      if (subtype === 'mikrofaser') return /mikrofaser|wischmop/i.test(p.name);
      break;
    case 'kuechenrollen':
      if (subtype === 'kuechenrollen') return p.category === 'kuechenrollen';
      if (subtype === 'servietten') return p.category === 'servietten';
      if (subtype === 'kosmetiktuecher') return p.category === 'kosmetiktuecher';
      break;
    case 'spender':
      if (subtype === 'papierhandtuecher') return /papierhandtuchspender/i.test(p.name);
      if (subtype === 'seife') return /seifenspender|schaumseifenspender/i.test(p.name);
      if (subtype === 'jumborollen_spender') return /jumborollen\s*spender/i.test(p.name);
      if (subtype === 'servietten_spender') return /serviettenspender/i.test(p.name);
      break;
  }
  return true;
}

// Putzpapier-Rollen-SKUs
const PUTZPAPIER_ROLL_NUMS = PRODUCTS
  .filter(p => p.category === 'putzpapier' && /putz|werkstatt/i.test(p.name))
  .map(p => p.num);

const PRODUCT_BRANCHE_MAP = {
  'automobil-industrie': PUTZPAPIER_ROLL_NUMS,
  'gastronomie': PUTZPAPIER_ROLL_NUMS,
  'fitness-solarien': PUTZPAPIER_ROLL_NUMS,
  'lebensmittelindustrie': PUTZPAPIER_ROLL_NUMS,
};
const PRODUCT_ANWENDUNG_MAP = {
  'fluessigkeiten': PUTZPAPIER_ROLL_NUMS,
  'oberflaechen': PUTZPAPIER_ROLL_NUMS,
  'haende': PUTZPAPIER_ROLL_NUMS,
  'allzweck': PUTZPAPIER_ROLL_NUMS,
};

function filterProducts(params) {
  return PRODUCTS.filter(p => {
    if (params.category === 'kuechenrollen') {
      if (!['kuechenrollen', 'servietten', 'kosmetiktuecher'].includes(p.category)) return false;
    } else {
      if (p.category !== params.category) return false;
    }
    if (params.subtype && params.subtype !== 'alle') {
      if (!matchesSubtype(p, params.category, params.subtype)) return false;
    }
    if (params.quantity && params.quantity !== 'alle') {
      if (p.quantity !== params.quantity) return false;
    }
    if (params.material && params.material !== 'alle') {
      if (p.material !== params.material) return false;
    }
    if (params.abmessung) {
      const dimConfig = DIMENSION_CONFIG[params.abmessung];
      if (dimConfig && !dimConfig.regex.test(p.name)) return false;
    }
    if (params.layers) {
      if (p.layers !== params.layers) return false;
    }
    if (params.branche && params.branche !== 'alle') {
      const nums = PRODUCT_BRANCHE_MAP[params.branche];
      if (nums && nums.length > 0 && !nums.includes(p.num)) return false;
    }
    if (params.anwendung && params.anwendung !== 'alle') {
      const nums = PRODUCT_ANWENDUNG_MAP[params.anwendung];
      if (nums && nums.length > 0 && !nums.includes(p.num)) return false;
    }
    return true;
  });
}

// ── Pfad-Definitionen (repliziert aus finder-config.ts) ──

// Alle Pfade für jede Kategorie generieren + FilterParams berechnen
function getAllPathsWithParams() {
  const results = [];

  // 1. Toilettenpapier: typ → menge → qualitaet
  const tpTypes = ['kleinrollen', 'jumborollen', 'spender'];
  const quantities = ['karton', 'palette', 'alle'];
  const materials = ['recycling', 'zellstoff', 'premium', 'alle'];
  const materialsNoPremium = ['recycling', 'zellstoff', 'alle'];

  for (const typ of tpTypes) {
    results.push({ path: `/toilettenpapier/${typ}`, params: { category: 'toilettenpapier', subtype: typ } });
    for (const qty of quantities) {
      results.push({ path: `/toilettenpapier/${typ}/${qty}`, params: { category: 'toilettenpapier', subtype: typ, quantity: qty } });
      for (const mat of materials) {
        results.push({ path: `/toilettenpapier/${typ}/${qty}/${mat}`, params: { category: 'toilettenpapier', subtype: typ, quantity: qty, material: mat } });
      }
    }
  }

  // 2. Papierhandtücher — Spender-Pfad
  for (const [dimKey, dim] of Object.entries(DIMENSION_CONFIG)) {
    results.push({ path: `/papierhandtuecher/spender/${dimKey}`, params: { category: 'papierhandtuecher', abmessung: dimKey } });
    for (const layer of dim.layers) {
      const layerSlug = `${layer}-lagig`;
      results.push({ path: `/papierhandtuecher/spender/${dimKey}/${layerSlug}`, params: { category: 'papierhandtuecher', abmessung: dimKey, layers: layer } });
      // Verfügbare Materialien für diese Dimension/Lagen-Kombination
      const matchingProducts = PRODUCTS.filter(
        p => p.category === 'papierhandtuecher' && dim.regex.test(p.name) && p.layers === layer
      );
      const availableMats = [...new Set(matchingProducts.map(p => p.material))];
      for (const mat of [...availableMats, 'alle']) {
        results.push({
          path: `/papierhandtuecher/spender/${dimKey}/${layerSlug}/${mat}`,
          params: { category: 'papierhandtuecher', abmessung: dimKey, layers: layer, material: mat }
        });
      }
    }
  }

  // Papierhandtücher — Ohne-Spender-Pfad
  const falzungen = ['z-falz', 'c-falz', 'interfold'];
  for (const falz of falzungen) {
    results.push({ path: `/papierhandtuecher/ohne-spender/${falz}`, params: { category: 'papierhandtuecher', subtype: falz } });
    for (const qty of quantities) {
      results.push({ path: `/papierhandtuecher/ohne-spender/${falz}/${qty}`, params: { category: 'papierhandtuecher', subtype: falz, quantity: qty } });
      for (const mat of materials) {
        results.push({ path: `/papierhandtuecher/ohne-spender/${falz}/${qty}/${mat}`, params: { category: 'papierhandtuecher', subtype: falz, quantity: qty, material: mat } });
      }
    }
  }

  // 3. Handtuchrollen: system → menge → qualitaet
  const htSystems = ['standard', 'autocut', 'spender'];
  for (const sys of htSystems) {
    results.push({ path: `/handtuchrollen/${sys}`, params: { category: 'handtuchrollen', subtype: sys } });
    for (const qty of quantities) {
      results.push({ path: `/handtuchrollen/${sys}/${qty}`, params: { category: 'handtuchrollen', subtype: sys, quantity: qty } });
      for (const mat of materialsNoPremium) {
        results.push({ path: `/handtuchrollen/${sys}/${qty}/${mat}`, params: { category: 'handtuchrollen', subtype: sys, quantity: qty, material: mat } });
      }
    }
  }

  // 4. Putzpapier
  // Putzpapier-Rollen: suchmethode → branche/anwendung → qualitaet → menge
  const branchen = ['automobil-industrie', 'gastronomie', 'fitness-solarien', 'lebensmittelindustrie'];
  const anwendungen = ['fluessigkeiten', 'oberflaechen', 'haende', 'allzweck'];

  for (const branche of branchen) {
    results.push({ path: `/putzpapier/putzpapier/branche/${branche}`, params: { category: 'putzpapier', subtype: 'putzpapier', branche } });
    for (const mat of materialsNoPremium) {
      results.push({ path: `/putzpapier/putzpapier/branche/${branche}/${mat}`, params: { category: 'putzpapier', subtype: 'putzpapier', branche, material: mat } });
      for (const qty of quantities) {
        results.push({ path: `/putzpapier/putzpapier/branche/${branche}/${mat}/${qty}`, params: { category: 'putzpapier', subtype: 'putzpapier', branche, material: mat, quantity: qty } });
      }
    }
  }
  for (const anw of anwendungen) {
    results.push({ path: `/putzpapier/putzpapier/anwendung/${anw}`, params: { category: 'putzpapier', subtype: 'putzpapier', anwendung: anw } });
    for (const mat of materialsNoPremium) {
      results.push({ path: `/putzpapier/putzpapier/anwendung/${anw}/${mat}`, params: { category: 'putzpapier', subtype: 'putzpapier', anwendung: anw, material: mat } });
      for (const qty of quantities) {
        results.push({ path: `/putzpapier/putzpapier/anwendung/${anw}/${mat}/${qty}`, params: { category: 'putzpapier', subtype: 'putzpapier', anwendung: anw, material: mat, quantity: qty } });
      }
    }
  }

  // Ärzte / Mikrofaser: menge → qualitaet
  for (const sub of ['aerzte', 'mikrofaser']) {
    results.push({ path: `/putzpapier/${sub}`, params: { category: 'putzpapier', subtype: sub } });
    for (const qty of quantities) {
      results.push({ path: `/putzpapier/${sub}/${qty}`, params: { category: 'putzpapier', subtype: sub, quantity: qty } });
      for (const mat of materialsNoPremium) {
        results.push({ path: `/putzpapier/${sub}/${qty}/${mat}`, params: { category: 'putzpapier', subtype: sub, quantity: qty, material: mat } });
      }
    }
  }

  // 5. Küchenrollen: produkt → menge
  const krProducts = ['kuechenrollen', 'servietten', 'kosmetiktuecher'];
  for (const prod of krProducts) {
    results.push({ path: `/kuechenrollen/${prod}`, params: { category: 'kuechenrollen', subtype: prod } });
    for (const qty of quantities) {
      results.push({ path: `/kuechenrollen/${prod}/${qty}`, params: { category: 'kuechenrollen', subtype: prod, quantity: qty } });
    }
  }

  // 6. Spender: typ (nur 1 Step, Ergebnis-Seiten)
  const spenderTypes = ['papierhandtuecher', 'seife', 'jumborollen_spender', 'servietten_spender'];
  for (const typ of spenderTypes) {
    results.push({ path: `/spender/${typ}`, params: { category: 'spender', subtype: typ } });
  }

  // 7. Seife: keine Steps, direkte Ergebnisse
  results.push({ path: `/seife`, params: { category: 'seife' } });

  return results;
}

// ── Hauptprüfung ──
function runQA() {
  const allPaths = getAllPathsWithParams();
  const errors = [];
  const warnings = [];
  const optimizations = [];

  let totalPaths = 0;
  let emptyPaths = 0;
  let resultPaths = 0;
  const reachedProductNums = new Set();
  const resultSets = []; // Für Duplikat-Check

  console.log('═══════════════════════════════════════════════════════');
  console.log('  PRODUKTFINDER QUALITÄTSPRÜFUNG');
  console.log('  Datum: ' + new Date().toISOString().split('T')[0]);
  console.log('═══════════════════════════════════════════════════════\n');

  // Kategorie-Übersicht
  const categories = ['toilettenpapier', 'papierhandtuecher', 'handtuchrollen', 'putzpapier', 'kuechenrollen', 'spender', 'seife'];
  console.log('KATEGORIE-ÜBERSICHT');
  console.log('────────────────────');
  for (const cat of categories) {
    const catProducts = PRODUCTS.filter(p => {
      if (cat === 'kuechenrollen') return ['kuechenrollen', 'servietten', 'kosmetiktuecher'].includes(p.category);
      return p.category === cat;
    });
    console.log(`  ${cat}: ${catProducts.length} Produkte`);
  }
  console.log('');

  // 3a: Sackgassen prüfen
  console.log('PRÜFE ALLE PFADE...');
  console.log('────────────────────');

  for (const { path: urlPath, params } of allPaths) {
    totalPaths++;
    const products = filterProducts(params);

    // Nur "Endpfade" (= maximale Tiefe) als Ergebnis-Seiten zählen
    const isResultPath = isTerminalPath(urlPath, params);

    if (isResultPath) {
      resultPaths++;

      if (products.length === 0) {
        emptyPaths++;
        errors.push({
          type: 'SACKGASSE',
          path: urlPath,
          detail: `0 Produkte gefunden mit Filtern: ${JSON.stringify(params)}`,
        });
      } else {
        // Produkte als erreichbar markieren
        for (const p of products) reachedProductNums.add(p.num);

        // Ergebnis-Set für Duplikat-Check speichern
        const productSet = products.map(p => p.num).sort().join(',');
        resultSets.push({ path: urlPath, set: productSet, count: products.length });
      }
    }
  }

  // 3b: Verwaiste Produkte
  console.log('\nPRÜFE VERWAISTE PRODUKTE...');
  console.log('────────────────────────────');
  const unreachable = PRODUCTS.filter(p => !reachedProductNums.has(p.num));
  for (const p of unreachable) {
    warnings.push({
      type: 'VERWAIST',
      detail: `"${p.name}" (${p.num}, ${p.category}) ist über keinen Pfad erreichbar`,
    });
  }

  // 3c: Überflüssige Fragen (Steps mit nur 1 effektiver Option)
  console.log('\nPRÜFE ÜBERFLÜSSIGE FRAGEN...');
  console.log('─────────────────────────────');

  // Papierhandtücher Spender-Pfad: Lagen-Frage
  for (const [dimKey, dim] of Object.entries(DIMENSION_CONFIG)) {
    if (dim.layers.length === 1) {
      optimizations.push({
        type: 'ÜBERFLÜSSIGE FRAGE',
        path: `/papierhandtuecher/spender/${dimKey}`,
        detail: `Lagen-Frage hat nur 1 Option: ${dim.layers[0]}-lagig. Könnte übersprungen werden.`,
      });
    }
    // Material-Frage pro Dimension/Lagen
    for (const layer of dim.layers) {
      const matching = PRODUCTS.filter(
        p => p.category === 'papierhandtuecher' && dim.regex.test(p.name) && p.layers === layer
      );
      const availableMats = [...new Set(matching.map(p => p.material))];
      if (availableMats.length === 1) {
        optimizations.push({
          type: 'ÜBERFLÜSSIGE FRAGE',
          path: `/papierhandtuecher/spender/${dimKey}/${layer}-lagig`,
          detail: `Qualitäts-Frage hat nur 1 Option: ${availableMats[0]}. Könnte übersprungen werden.`,
        });
      }
    }
  }

  // 3d: Doppelte Ergebnisse
  console.log('\nPRÜFE DOPPELTE ERGEBNISSE...');
  console.log('─────────────────────────────');
  const seenSets = new Map();
  for (const { path: urlPath, set } of resultSets) {
    if (seenSets.has(set)) {
      const existing = seenSets.get(set);
      // Nur warnen wenn es wirklich verschiedene Pfade sind (nicht Varianten mit "alle")
      if (!urlPath.includes('/alle') && !existing.includes('/alle')) {
        warnings.push({
          type: 'DUPLIKAT',
          detail: `"${urlPath}" und "${existing}" zeigen exakt die gleichen Produkte`,
        });
      }
    } else {
      seenSets.set(set, urlPath);
    }
  }

  // 3e: Falsche Zuordnungen prüfen (Stichproben)
  console.log('\nPRÜFE FALSCHE ZUORDNUNGEN...');
  console.log('─────────────────────────────');

  // Material-Check bei Endpfaden
  for (const { path: urlPath, params } of allPaths) {
    if (!params.material || params.material === 'alle') continue;
    const products = filterProducts(params);
    for (const p of products) {
      if (p.material !== params.material && p.material !== 'mischung') {
        errors.push({
          type: 'FALSCHE ZUORDNUNG',
          path: urlPath,
          detail: `"${p.name}" hat Material "${p.material}", wird aber unter "${params.material}" angezeigt`,
        });
      }
    }
  }

  // Layer-Check
  for (const { path: urlPath, params } of allPaths) {
    if (!params.layers) continue;
    const products = filterProducts(params);
    for (const p of products) {
      if (p.layers !== params.layers && p.layers > 0) {
        errors.push({
          type: 'FALSCHE ZUORDNUNG',
          path: urlPath,
          detail: `"${p.name}" hat ${p.layers} Lagen, wird aber unter ${params.layers}-lagig angezeigt`,
        });
      }
    }
  }

  // ── BERICHT ──
  console.log('\n\n═══════════════════════════════════════════════════════');
  console.log('  ERGEBNIS-BERICHT');
  console.log('═══════════════════════════════════════════════════════\n');

  console.log('INVENTAR');
  console.log('────────');
  console.log(`  Produkte gesamt:              ${PRODUCTS.length}`);
  console.log(`  Pfade geprüft:                ${totalPaths}`);
  console.log(`  Davon Ergebnis-Pfade:         ${resultPaths}`);
  console.log(`  Produkte erreichbar:          ${reachedProductNums.size}`);
  console.log(`  Produkte NICHT erreichbar:    ${unreachable.length}`);
  console.log('');

  if (errors.length > 0) {
    console.log(`🔴 KRITISCHE FEHLER (${errors.length})`);
    console.log('──────────────────────────────────────────────');
    for (const [i, err] of errors.entries()) {
      console.log(`  ${i + 1}. [${err.type}]`);
      if (err.path) console.log(`     Pfad: ${err.path}`);
      console.log(`     ${err.detail}`);
      console.log('');
    }
  } else {
    console.log('🟢 Keine kritischen Fehler gefunden!\n');
  }

  if (warnings.length > 0) {
    console.log(`🟡 WARNUNGEN (${warnings.length})`);
    console.log('──────────────────────────────────────');
    for (const [i, warn] of warnings.entries()) {
      console.log(`  ${i + 1}. [${warn.type}]`);
      if (warn.path) console.log(`     Pfad: ${warn.path}`);
      console.log(`     ${warn.detail}`);
      console.log('');
    }
  } else {
    console.log('🟢 Keine Warnungen!\n');
  }

  if (optimizations.length > 0) {
    console.log(`🔵 OPTIMIERUNGEN (${optimizations.length})`);
    console.log('────────────────────────────────');
    for (const [i, opt] of optimizations.entries()) {
      console.log(`  ${i + 1}. [${opt.type}]`);
      if (opt.path) console.log(`     Pfad: ${opt.path}`);
      console.log(`     ${opt.detail}`);
      console.log('');
    }
  }

  console.log('STATISTIKEN');
  console.log('───────────');
  console.log(`  Pfade geprüft:              ${totalPaths}`);
  console.log(`  Ergebnis-Pfade:             ${resultPaths}`);
  console.log(`  Sackgassen (0 Produkte):    ${emptyPaths}`);
  console.log(`  Verwaiste Produkte:         ${unreachable.length}`);
  console.log(`  Falsche Zuordnungen:        ${errors.filter(e => e.type === 'FALSCHE ZUORDNUNG').length}`);
  console.log(`  Überflüssige Fragen:        ${optimizations.filter(o => o.type === 'ÜBERFLÜSSIGE FRAGE').length}`);
  console.log(`  Doppelte Ergebnisse:        ${warnings.filter(w => w.type === 'DUPLIKAT').length}`);
  console.log('');

  // Verwaiste Produkte auflisten
  if (unreachable.length > 0) {
    console.log('VERWAISTE PRODUKTE (Details)');
    console.log('────────────────────────────');
    for (const p of unreachable) {
      console.log(`  - ${p.num}: "${p.name}" (${p.category}, ${p.quantity}, ${p.material}, ${p.layers}L)`);
    }
    console.log('');
  }

  return { errors, warnings, optimizations };
}

// Hilfsfunktion: Ist der Pfad ein "Endpfad" (maximale Tiefe für die jeweilige Kategorie)?
function isTerminalPath(urlPath, params) {
  const segments = urlPath.split('/').filter(Boolean);
  const cat = segments[0];

  switch (cat) {
    case 'toilettenpapier': return segments.length === 4; // typ/menge/qualitaet
    case 'papierhandtuecher':
      if (segments[1] === 'spender') return segments.length === 5; // spender/dim/lagen/qualitaet
      if (segments[1] === 'ohne-spender') return segments.length === 5; // ohne-spender/falz/menge/qualitaet
      return false;
    case 'handtuchrollen': return segments.length === 4; // system/menge/qualitaet
    case 'putzpapier':
      if (segments[1] === 'putzpapier') return segments.length === 5; // putzpapier/methode/wert/qualitaet (eigentlich 6 mit menge)
      return segments.length === 4; // aerzte|mikrofaser/menge/qualitaet
    case 'kuechenrollen': return segments.length === 3; // produkt/menge
    case 'spender': return segments.length === 2; // typ
    case 'seife': return segments.length === 1; // direkt
    default: return false;
  }
}

runQA();
