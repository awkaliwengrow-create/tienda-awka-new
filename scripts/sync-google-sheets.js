#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const https = require('https');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const DEFAULT_METADATA_PATH = path.join(ROOT, 'data', 'product-metadata.json');

function parseArgs(argv) {
  const args = {
    config: path.join(__dirname, 'google-sheets-sync.config.json'),
    writeProducts: false,
    writeRewards: false
  };

  for (let i = 0; i < argv.length; i += 1) {
    const arg = argv[i];
    if (arg === '--config' && argv[i + 1]) {
      args.config = path.resolve(process.cwd(), argv[i + 1]);
      i += 1;
    } else if (arg === '--write-products') {
      args.writeProducts = true;
    } else if (arg === '--write-rewards') {
      args.writeRewards = true;
    }
  }

  return args;
}

function readConfig(configPath) {
  if (!fs.existsSync(configPath)) {
    throw new Error(`No encontramos el archivo de config: ${configPath}`);
  }
  return JSON.parse(fs.readFileSync(configPath, 'utf8'));
}

function fetchText(source) {
  if (/^https?:\/\//i.test(source)) {
    return new Promise((resolve, reject) => {
      const lib = source.startsWith('https://') ? https : http;
      lib.get(source, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          fetchText(res.headers.location).then(resolve).catch(reject);
          return;
        }
        if (res.statusCode !== 200) {
          reject(new Error(`No pudimos leer ${source} (${res.statusCode})`));
          return;
        }
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => {
          const body = Buffer.concat(chunks).toString('utf8');
          const googleRedirectMatch = body.match(/<A\s+HREF="([^"]+)"/i);
          if (
            /<TITLE>\s*Temporary Redirect\s*<\/TITLE>/i.test(body) &&
            googleRedirectMatch &&
            googleRedirectMatch[1]
          ) {
            const redirected = googleRedirectMatch[1].replace(/&amp;/g, '&');
            fetchText(redirected).then(resolve).catch(reject);
            return;
          }
          resolve(body);
        });
      }).on('error', reject);
    });
  }

  return Promise.resolve(fs.readFileSync(path.resolve(ROOT, source), 'utf8'));
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

function normalizeHeader(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();
}

function findHeaderRowIndex(rows, requiredHeaders) {
  for (let index = 0; index < rows.length; index += 1) {
    const headers = rows[index].map(normalizeHeader);
    if (requiredHeaders.every((header) => headers.includes(header))) {
      return index;
    }
  }
  return -1;
}

function yes(value) {
  return ['SI', 'SÍ', 'TRUE', '1', 'YES'].includes(String(value || '').trim().toUpperCase());
}

function num(value, fallback = 0) {
  const normalized = String(value || '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function slugify(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function loadProductMetadata(filePath = DEFAULT_METADATA_PATH) {
  if (!fs.existsSync(filePath)) {
    return new Map();
  }

  const items = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const metadata = new Map();
  items.forEach((item) => {
    const idKey = Number(item.id);
    const brandNameKey = `${String(item.brand || '').trim()}::${String(item.name || '').trim()}`;
    if (Number.isFinite(idKey)) {
      metadata.set(`id:${idKey}`, item);
    }
    if (brandNameKey !== '::') {
      metadata.set(`name:${brandNameKey}`, item);
    }
  });
  return metadata;
}

function rowsToObjects(rows) {
  if (!rows.length) return [];
  const requiredHeaders = ['PRODUCTO', 'P_EFECTIVO'];
  const headerRowIndex = findHeaderRowIndex(rows, requiredHeaders);
  if (headerRowIndex >= 0) {
    const headers = rows[headerRowIndex].map(normalizeHeader);
    return rows.slice(headerRowIndex + 1).map((row) => {
      const item = {};
      headers.forEach((header, index) => {
        item[header] = row[index] ?? '';
      });
      return item;
    });
  }

  const firstRowHeaders = rows[0].map(normalizeHeader);
  const rewardHeaders = ['ACTIVO', 'PRODUCT_ID_WEB', 'NOMBRE', 'SIZE_LABEL', 'PUNTOS_CANJE'];
  if (rewardHeaders.every((header) => firstRowHeaders.includes(header))) {
    return rows.slice(1).map((row) => {
      const item = {};
      firstRowHeaders.forEach((header, index) => {
        item[header] = row[index] ?? '';
      });
      return item;
    });
  }

  const fallbackHeaders = [
    'ACTIVO',
    'MOSTRAR_WEB',
    'DESTACADO',
    'PRODUCT_ID_WEB',
    'CATEGORIA_WEB',
    'MARCA',
    'NOMBRE',
    'SIZE_LABEL',
    'PRECIO',
    'STOCK'
  ];

  return rows.map((row) => {
    const item = {};
    fallbackHeaders.forEach((header, index) => {
      item[header] = row[index] ?? '';
    });
    return item;
  });
}

function buildProducts(objects, productMetadata = new Map()) {
  const groups = new Map();

  objects
    .filter((row) => {
      const active = yes(row.ACTIVO);
      const explicitShow = String(row.MOSTRAR_WEB || '').trim();
      const hasStock = num(row.STOCK, 0) > 0;
      const visible = yes(explicitShow) || hasStock;
      return active && visible;
    })
    .forEach((row) => {
      const productId = num(row.PRODUCT_ID_WEB, 0) || num(row.ID, 0);
      const key = String(productId || row.SKU || `${row.MARCA}:${row.NOMBRE}`).trim();
      if (!key) return;
      const metadata =
        productMetadata.get(`id:${productId}`) ||
        productMetadata.get(`name:${String(row.MARCA || '').trim()}::${String(row.NOMBRE || '').trim()}`) ||
        null;

      const current = groups.get(key) || {
        id: productId || groups.size + 1,
        name: String(row.NOMBRE || '').trim(),
        category: String(row.CATEGORIA_WEB || 'sin-definir').trim().toLowerCase(),
        brand: String(row.MARCA || '').trim(),
        image: String(row.IMAGEN || metadata?.image || '').trim(),
        sizes: [],
        description: String(row.DESCRIPCION_CORTA || metadata?.description || '').trim(),
        featured: yes(row.DESTACADO) || Boolean(metadata?.featured),
        offer: yes(row.OFERTA) || Boolean(metadata?.offer),
        offerText: String(row.OFERTA_TEXTO || metadata?.offerText || '').trim(),
        icon: String(row.ICON || metadata?.icon || '').trim(),
        order: num(row.ORDEN, num(metadata?.order, 9999))
      };

      current.featured = current.featured || yes(row.DESTACADO) || Boolean(metadata?.featured);
      current.offer = current.offer || yes(row.OFERTA) || Boolean(metadata?.offer);
      current.offerText = current.offerText || String(row.OFERTA_TEXTO || metadata?.offerText || '').trim();
      current.icon = current.icon || String(row.ICON || metadata?.icon || '').trim();
      current.image = current.image || String(row.IMAGEN || metadata?.image || '').trim();
      current.description = current.description || String(row.DESCRIPCION_CORTA || metadata?.description || '').trim();
      current.order = Math.min(current.order, num(row.ORDEN, current.order));

      const sizeLabel = String(row.SIZE_LABEL || row.TAMANO || row.PRESENTACION || '').trim();
      const price = num(row.PRECIO, 0);
      if (sizeLabel && price > 0) {
        current.sizes.push({ size: sizeLabel, price });
      }

      groups.set(key, current);
    });

  return Array.from(groups.values())
    .map((item) => ({
      ...item,
      sizes: item.sizes.sort((a, b) => a.price - b.price)
    }))
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name, 'es'));
}

function findRewardReferencePrice(products, productId, sizeLabel) {
  const product = products.find((item) => Number(item.id) === Number(productId));
  if (!product) return 0;

  const matchingSize = (product.sizes || []).find(
    (size) => String(size.size || '').trim().toLowerCase() === String(sizeLabel || '').trim().toLowerCase()
  );

  if (matchingSize?.price) return num(matchingSize.price, 0);
  return num(product.sizes?.[0]?.price, 0);
}

function buildRewards(objects, products, redeemValuePerPoint = 500) {
  return objects
    .filter((row) => yes(row.ACTIVO))
    .map((row, index) => {
      const productId = num(row.PRODUCT_ID_WEB, 0);
      const sizeLabel = String(row.SIZE_LABEL || '').trim();
      const referencePrice =
        num(row.PRECIO_REFERENCIA, 0) ||
        num(row.PRECIO, 0) ||
        findRewardReferencePrice(products, productId, sizeLabel);
      const manualPoints = num(row.PUNTOS_CANJE, 0);
      const pointsCost = referencePrice > 0
        ? Math.max(1, Math.ceil(referencePrice / redeemValuePerPoint))
        : manualPoints;

      return {
        key: String(row.REWARD_KEY || `${productId}:${sizeLabel}`).trim() || `reward-${index + 1}`,
        productId,
        sizeLabel,
        pointsCost,
        productName: String(row.NOMBRE || '').trim(),
        referencePrice
      };
    })
    .filter((item) => item.productId > 0 && item.pointsCost > 0 && item.productName);
}

function ensureDir(filePath) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
}

function writeJson(filePath, data) {
  ensureDir(filePath);
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8');
}

function buildProductsScript(products) {
  return `// Archivo generado desde Google Sheets. No editar a mano.\nconst products = ${JSON.stringify(products, null, 2)};\n\nfunction getCategoryName(category) {\n    const names = {\n        'fertilizantes': 'Fertilizantes/Nutrientes',\n        'plaguicidas': 'Plaguicidas/Insecticidas',\n        'herramientas': 'Herramientas',\n        'macetas': 'Macetas',\n        'parafernalia': 'Parafernalia',\n        'papeles': 'Papeles',\n        'filtros': 'Filtros',\n        'sin-definir': 'Sin Definir'\n    };\n    return names[category] || category;\n}\n\nfunction getFeaturedProducts() {\n    return products.filter(p => p.featured === true);\n}\n\nfunction getOfferProducts() {\n    return products.filter(p => p.offer === true);\n}\n\nfunction getProductsByCategory(category) {\n    return products.filter(p => p.category === category);\n}\n\nfunction getProductById(id) {\n    return products.find(p => p.id === id);\n}\n`;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const config = readConfig(args.config);

  const catalogText = await fetchText(config.catalog.source);
  const rewardsText = await fetchText(config.rewards.source);

  const catalogObjects = rowsToObjects(parseCsv(catalogText));
  const rewardObjects = rowsToObjects(parseCsv(rewardsText));
  const productMetadata = loadProductMetadata();
  const redeemValuePerPoint = Number(config.rewards?.redeemValuePerPoint) || 500;

  const products = buildProducts(catalogObjects, productMetadata);
  const rewards = buildRewards(rewardObjects, products, redeemValuePerPoint);

  const outputs = config.outputs || {};
  const catalogSnapshotPath = path.resolve(ROOT, outputs.catalogSnapshot || 'tmp/web-catalog.snapshot.json');
  const rewardsSnapshotPath = path.resolve(ROOT, outputs.rewardsSnapshot || 'tmp/web-rewards.snapshot.json');
  const productsPreviewPath = path.resolve(ROOT, outputs.productsPreviewScript || 'tmp/products.from-sheet.js');
  const rewardCatalogPath = path.resolve(ROOT, outputs.rewardCatalogJson || 'api/_lib/reward-catalog.generated.json');

  writeJson(catalogSnapshotPath, products);
  writeJson(rewardsSnapshotPath, rewards);
  ensureDir(productsPreviewPath);
  fs.writeFileSync(productsPreviewPath, buildProductsScript(products), 'utf8');

  if (args.writeProducts) {
    fs.writeFileSync(path.join(ROOT, 'js', 'products.js'), buildProductsScript(products), 'utf8');
  }

  if (args.writeRewards) {
    writeJson(rewardCatalogPath, rewards);
  }

  console.log(`Productos listos: ${products.length}`);
  console.log(`Recompensas listas: ${rewards.length}`);
  console.log(`Snapshot catalogo: ${catalogSnapshotPath}`);
  console.log(`Snapshot recompensas: ${rewardsSnapshotPath}`);
  console.log(`Preview products.js: ${productsPreviewPath}`);
  if (args.writeProducts) {
    console.log('products.js fue actualizado desde Google Sheets.');
  }
  if (args.writeRewards) {
    console.log(`reward-catalog.generated.json fue actualizado: ${rewardCatalogPath}`);
  }
}

main().catch((error) => {
  console.error(error.message || error);
  process.exit(1);
});
