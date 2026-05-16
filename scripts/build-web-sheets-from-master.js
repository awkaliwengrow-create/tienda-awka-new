#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, ' ')
    .trim();
}

function toCsvValue(value) {
  const text = String(value ?? '');
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function parseCsv(text) {
  const rows = [];
  let value = '';
  let row = [];
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i];
    const next = text[i + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        value += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      row.push(value);
      value = '';
    } else if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && next === '\n') i += 1;
      row.push(value);
      value = '';
      if (row.some((cell) => String(cell).trim() !== '')) {
        rows.push(row);
      }
      row = [];
    } else {
      value += char;
    }
  }

  if (value.length || row.length) {
    row.push(value);
    if (row.some((cell) => String(cell).trim() !== '')) {
      rows.push(row);
    }
  }

  return rows;
}

function parsePrice(value) {
  const digits = String(value || '').replace(/[^0-9-]/g, '');
  const parsed = Number(digits);
  return Number.isFinite(parsed) ? parsed : 0;
}

function detectHeaderIndex(rows) {
  return rows.findIndex((row) => row.includes('LÍNEA') && row.includes('PRODUCTO') && row.includes('P. EFECTIVO'));
}

function loadMasterCsv() {
  const csvPath = path.join(ROOT, 'tmp', 'lista-prod.master.csv');
  if (!fs.existsSync(csvPath)) {
    throw new Error(`Falta ${csvPath}`);
  }
  const rows = parseCsv(fs.readFileSync(csvPath, 'utf8'));
  const headerIndex = detectHeaderIndex(rows);
  if (headerIndex < 0) {
    throw new Error('No encontramos encabezados en Lista Prod.');
  }
  const headers = rows[headerIndex];
  const indexes = {
    linea: headers.indexOf('LÍNEA'),
    sub: headers.indexOf('SUB-CATEGORÍA'),
    producto: headers.indexOf('PRODUCTO'),
    cantidad: headers.indexOf('CANTIDAD'),
    efectivo: headers.indexOf('P. EFECTIVO')
  };

  return rows
    .slice(headerIndex + 1)
    .map((row) => ({
      linea: row[indexes.linea] || '',
      sub: row[indexes.sub] || '',
      producto: row[indexes.producto] || '',
      cantidad: row[indexes.cantidad] || '',
      efectivo: row[indexes.efectivo] || ''
    }))
    .filter((row) => row.producto);
}

function loadProducts() {
  const source = fs.readFileSync(path.join(ROOT, 'js', 'products.js'), 'utf8');
  const match = source.match(/const products = (\[[\s\S]*?\]);/);
  if (!match) {
    throw new Error('No encontramos const products en js/products.js');
  }
  return Function(`return ${match[1]};`)();
}

function sizeVariants(label) {
  const raw = String(label || '').trim();
  const compact = normalize(raw).replace(/\s+/g, '');
  return new Set([
    normalize(raw),
    compact,
    compact.replace('LTS', 'L'),
    compact.replace('LITROS', 'L'),
    compact.replace('ML', 'ML'),
    compact.replace('GR', 'GR')
  ]);
}

function buildMasterIndex(masterRows) {
  return masterRows.map((row) => {
    const raw = row.producto;
    const norm = normalize(raw);
    return {
      ...row,
      norm,
      normCompact: norm.replace(/\s+/g, ''),
      lineNorm: normalize(row.linea),
      subNorm: normalize(row.sub)
    };
  });
}

function productNameCandidates(product, sizeLabel) {
  const candidates = new Set();
  const nameNorm = normalize(product.name);
  const sizeSet = sizeVariants(sizeLabel);
  sizeSet.forEach((sizeNorm) => {
    if (sizeNorm) {
      candidates.add(`${nameNorm} ${sizeNorm}`.trim());
      candidates.add(`${nameNorm.replace(/\s+/g, '')}${sizeNorm}`.trim());
    }
  });

  if (product.brand === 'Top Crop') {
    candidates.add(`${nameNorm} ${[...sizeSet][0]}`.replace(/\s+/g, ' ').trim());
  }

  if (product.name === 'Veg' && product.brand === 'Kawsay') candidates.add('VEGE');
  if (product.name === 'Combo pH' && product.brand === 'Kawsay') candidates.add('PACK PH');
  if (product.name === 'Biocann') {
    sizeSet.forEach((sizeNorm) => candidates.add(`BIOCANN ${sizeNorm}`.trim()));
  }
  if (product.name === 'pH- Namaste') {
    sizeSet.forEach((sizeNorm) => candidates.add(`PH ${sizeNorm}`.trim()));
  }
  if (product.name === 'pH- Mantra') candidates.add('PH');
  if (product.name === 'Top Barrier') sizeSet.forEach((sizeNorm) => candidates.add(`TOP BARRIER ${sizeNorm}`.trim()));
  if (product.name === 'Top Bloom') sizeSet.forEach((sizeNorm) => candidates.add(`TOP BLOOM ${sizeNorm}`.trim()));
  if (product.name === 'Top Veg') sizeSet.forEach((sizeNorm) => candidates.add(`TOP VEG ${sizeNorm}`.trim()));
  if (product.name === 'Top Deeper') sizeSet.forEach((sizeNorm) => candidates.add(`TOP DEEPER ${sizeNorm}`.trim()));
  if (product.name === 'Top Candy') sizeSet.forEach((sizeNorm) => candidates.add(`TOP CANDY ${sizeNorm}`.trim()));
  if (product.name === 'Top Auto') sizeSet.forEach((sizeNorm) => candidates.add(`TOP AUTO ${sizeNorm}`.trim()));
  if (product.name === 'Top Bud') sizeSet.forEach((sizeNorm) => candidates.add(`TOP BUD ${sizeNorm}`.trim()));
  if (product.name === 'Big One') sizeSet.forEach((sizeNorm) => candidates.add(`BIG ONE ${sizeNorm}`.trim()));
  if (product.name === 'Amazonia') sizeSet.forEach((sizeNorm) => candidates.add(`AMAZONIA ${sizeNorm}`.trim()));
  if (product.name === 'Oro Negro') sizeSet.forEach((sizeNorm) => candidates.add(`ORO NEGRO ${sizeNorm}`.trim()));
  if (product.name === 'Flora Booster') sizeSet.forEach((sizeNorm) => candidates.add(`FLORA BOOSTER ${sizeNorm}`.trim()));
  if (product.name === 'Trico+') sizeSet.forEach((sizeNorm) => candidates.add(`TRICO+ ${sizeNorm}`.trim()));

  return Array.from(candidates).map((item) => normalize(item));
}

function findMasterMatch(masterIndex, product, sizeLabel) {
  const lineNorm = normalize(product.brand);
  const candidates = productNameCandidates(product, sizeLabel);
  return masterIndex.find((row) => {
    if (lineNorm && row.lineNorm !== lineNorm) return false;
    return candidates.includes(row.norm);
  }) || null;
}

function categoryWeb(category) {
  const map = {
    fertilizantes: 'fertilizantes',
    plaguicidas: 'plaguicidas',
    herramientas: 'herramientas',
    macetas: 'macetas',
    parafernalia: 'parafernalia',
    papeles: 'papeles',
    filtros: 'filtros'
  };
  return map[category] || 'sin-definir';
}

function buildCatalogRows(products, masterIndex) {
  const rows = [];
  const matchedRows = [];
  const unmatched = [];

  products.forEach((product) => {
    (product.sizes || []).forEach((size) => {
      const match = findMasterMatch(masterIndex, product, size.size);
      const row = {
        ACTIVO: 'SI',
        MOSTRAR_WEB: match && parsePrice(match.efectivo) > 0 ? 'SI' : 'NO',
        DESTACADO: product.featured ? 'SI' : 'NO',
        PRODUCT_ID_WEB: product.id,
        CATEGORIA_WEB: categoryWeb(product.category),
        MARCA: product.brand,
        NOMBRE: product.name,
        SIZE_LABEL: size.size,
        PRECIO: match ? parsePrice(match.efectivo) : size.price,
        STOCK: match ? parsePrice(match.cantidad) : 0
      };
      rows.push(row);
      if (match) {
        matchedRows.push(row);
      } else {
        unmatched.push(`${product.brand} | ${product.name} | ${size.size}`);
      }
    });
  });

  return { rows, matchedRows, unmatched };
}

function buildRewardsRows(catalogRows) {
  const filtered = catalogRows
    .filter((row) => Number(row.STOCK) > 0)
    .filter((row) => ['papeles', 'filtros'].includes(row.CATEGORIA_WEB))
    .filter((row) => Number(row.PRECIO) > 0 && Number(row.PRECIO) <= 4000)
    .sort((a, b) => Number(a.PRECIO) - Number(b.PRECIO));

  const rewards = filtered.slice(0, 12).map((row) => ({
    ACTIVO: 'SI',
    PRODUCT_ID_WEB: row.PRODUCT_ID_WEB,
    NOMBRE: row.NOMBRE,
    SIZE_LABEL: row.SIZE_LABEL,
    PUNTOS_CANJE: Math.max(1, Math.round(Number(row.PRECIO) / 2500))
  }));

  const seen = new Set();
  return rewards.filter((row) => {
    const key = `${row.PRODUCT_ID_WEB}:${row.SIZE_LABEL}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function toCsv(headers, rows) {
  return [
    headers.join(','),
    ...rows.map((row) => headers.map((header) => toCsvValue(row[header])).join(','))
  ].join('\n');
}

function toTsv(headers, rows) {
  return [
    headers.join('\t'),
    ...rows.map((row) => headers.map((header) => String(row[header] ?? '')).join('\t'))
  ].join('\n');
}

function main() {
  const masterRows = loadMasterCsv();
  const masterIndex = buildMasterIndex(masterRows);
  const products = loadProducts();
  const { rows: catalogRows, matchedRows, unmatched } = buildCatalogRows(products, masterIndex);
  const rewardsRows = buildRewardsRows(catalogRows);

  const outDir = path.join(ROOT, 'tmp');
  fs.mkdirSync(outDir, { recursive: true });

  fs.writeFileSync(
    path.join(outDir, 'web-catalog.from-master.csv'),
    toCsv(
      ['ACTIVO', 'MOSTRAR_WEB', 'DESTACADO', 'PRODUCT_ID_WEB', 'CATEGORIA_WEB', 'MARCA', 'NOMBRE', 'SIZE_LABEL', 'PRECIO', 'STOCK'],
      catalogRows
    ),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'web-catalog.from-master.tsv'),
    toTsv(
      ['ACTIVO', 'MOSTRAR_WEB', 'DESTACADO', 'PRODUCT_ID_WEB', 'CATEGORIA_WEB', 'MARCA', 'NOMBRE', 'SIZE_LABEL', 'PRECIO', 'STOCK'],
      catalogRows
    ),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'web-catalog.matched-only.csv'),
    toCsv(
      ['ACTIVO', 'MOSTRAR_WEB', 'DESTACADO', 'PRODUCT_ID_WEB', 'CATEGORIA_WEB', 'MARCA', 'NOMBRE', 'SIZE_LABEL', 'PRECIO', 'STOCK'],
      matchedRows
    ),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'web-catalog.matched-only.tsv'),
    toTsv(
      ['ACTIVO', 'MOSTRAR_WEB', 'DESTACADO', 'PRODUCT_ID_WEB', 'CATEGORIA_WEB', 'MARCA', 'NOMBRE', 'SIZE_LABEL', 'PRECIO', 'STOCK'],
      matchedRows
    ),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'web-catalog.review-needed.tsv'),
    toTsv(
      ['ACTIVO', 'MOSTRAR_WEB', 'DESTACADO', 'PRODUCT_ID_WEB', 'CATEGORIA_WEB', 'MARCA', 'NOMBRE', 'SIZE_LABEL', 'PRECIO', 'STOCK'],
      catalogRows.filter((row) => row.MOSTRAR_WEB === 'NO' || Number(row.STOCK) === 0)
    ),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'web-rewards.suggested.csv'),
    toCsv(['ACTIVO', 'PRODUCT_ID_WEB', 'NOMBRE', 'SIZE_LABEL', 'PUNTOS_CANJE'], rewardsRows),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'web-rewards.suggested.tsv'),
    toTsv(['ACTIVO', 'PRODUCT_ID_WEB', 'NOMBRE', 'SIZE_LABEL', 'PUNTOS_CANJE'], rewardsRows),
    'utf8'
  );

  fs.writeFileSync(
    path.join(outDir, 'web-catalog.unmatched.txt'),
    unmatched.join('\n'),
    'utf8'
  );

  console.log(`WEB_CATALOGO sugerido: ${catalogRows.length} filas`);
  console.log(`WEB_CATALOGO con match seguro: ${matchedRows.length} filas`);
  console.log(`WEB_CANJES sugerido: ${rewardsRows.length} filas`);
  console.log(`Sin match exacto: ${unmatched.length}`);
}

main();
