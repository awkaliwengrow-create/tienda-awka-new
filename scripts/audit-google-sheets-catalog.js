#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_PATH = path.join(ROOT, 'js', 'products.js');
const OUTPUT_PATH = path.join(ROOT, 'tmp', 'catalog-audit.json');

function loadProducts() {
  if (!fs.existsSync(PRODUCTS_PATH)) {
    throw new Error(`No encontramos ${PRODUCTS_PATH}`);
  }

  const source = fs.readFileSync(PRODUCTS_PATH, 'utf8');
  const sandbox = {};
  vm.runInNewContext(`${source}\nthis.__products = products;`, sandbox);
  return Array.isArray(sandbox.__products) ? sandbox.__products : [];
}

function hasMojibake(value = '') {
  return /Ã|Â|�/.test(String(value || ''));
}

function buildAudit(products) {
  const duplicateIds = new Map();
  const duplicateVariants = new Map();
  const missingImages = [];
  const missingDescriptions = [];
  const suspiciousText = [];
  const emptySizes = [];
  const zeroPrices = [];

  products.forEach((product) => {
    const idKey = String(product.id);
    duplicateIds.set(idKey, (duplicateIds.get(idKey) || 0) + 1);

    if (!product.image) {
      missingImages.push({ id: product.id, name: product.name, brand: product.brand });
    }

    if (!String(product.description || '').trim()) {
      missingDescriptions.push({ id: product.id, name: product.name, brand: product.brand });
    }

    if (
      hasMojibake(product.name) ||
      hasMojibake(product.brand) ||
      hasMojibake(product.description)
    ) {
      suspiciousText.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        description: product.description
      });
    }

    if (!Array.isArray(product.sizes) || product.sizes.length === 0) {
      emptySizes.push({ id: product.id, name: product.name, brand: product.brand });
      return;
    }

    product.sizes.forEach((size) => {
      const sizeLabel = String(size.size || '').trim();
      const variantKey = `${product.id}::${sizeLabel}`;
      duplicateVariants.set(variantKey, (duplicateVariants.get(variantKey) || 0) + 1);

      if (!size.price || Number(size.price) <= 0) {
        zeroPrices.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          size: sizeLabel,
          price: size.price
        });
      }
    });
  });

  const duplicateIdItems = Array.from(duplicateIds.entries())
    .filter(([, count]) => count > 1)
    .map(([id, count]) => ({ id: Number(id), count }));

  const duplicateVariantItems = Array.from(duplicateVariants.entries())
    .filter(([, count]) => count > 1)
    .map(([key, count]) => {
      const [id, size] = key.split('::');
      return { id: Number(id), size, count };
    });

  return {
    generatedAt: new Date().toISOString(),
    totals: {
      products: products.length,
      missingImages: missingImages.length,
      missingDescriptions: missingDescriptions.length,
      suspiciousText: suspiciousText.length,
      emptySizes: emptySizes.length,
      zeroPrices: zeroPrices.length,
      duplicateIds: duplicateIdItems.length,
      duplicateVariants: duplicateVariantItems.length
    },
    missingImages,
    missingDescriptions,
    suspiciousText,
    emptySizes,
    zeroPrices,
    duplicateIds: duplicateIdItems,
    duplicateVariants: duplicateVariantItems
  };
}

function main() {
  const products = loadProducts();
  const audit = buildAudit(products);

  fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
  fs.writeFileSync(OUTPUT_PATH, `${JSON.stringify(audit, null, 2)}\n`, 'utf8');

  console.log(`Productos auditados: ${audit.totals.products}`);
  console.log(`Sin imagen: ${audit.totals.missingImages}`);
  console.log(`Sin descripcion: ${audit.totals.missingDescriptions}`);
  console.log(`Texto sospechoso: ${audit.totals.suspiciousText}`);
  console.log(`Variantes sin precio: ${audit.totals.zeroPrices}`);
  console.log(`IDs duplicados: ${audit.totals.duplicateIds}`);
  console.log(`Variantes duplicadas: ${audit.totals.duplicateVariants}`);
  console.log(`Reporte: ${OUTPUT_PATH}`);
}

main();
