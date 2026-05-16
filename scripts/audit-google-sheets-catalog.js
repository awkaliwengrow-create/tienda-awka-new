#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const PRODUCTS_PATH = path.join(ROOT, 'js', 'products.js');
const OUTPUT_PATH = path.join(ROOT, 'tmp', 'catalog-audit.json');
const ALLOWED_CATEGORIES = new Set([
  'fertilizantes',
  'plaguicidas',
  'herramientas',
  'macetas',
  'parafernalia',
  'papeles',
  'filtros',
  'sin-definir'
]);

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
  return /Ã.|Â|ï¿½|�/.test(String(value || ''));
}

function isValidSizeLabel(value = '') {
  const size = String(value || '').trim();
  if (!size) return false;

  return [
    /^\d+(?:[.,]\d+)?\s?(?:ml|cc|gr|g|kg|lt|lts|u)$/i,
    /^\d+\/\d+\s?(?:lt|lts)$/i,
    /^\d+(?:[.,]\d+)?x\d+(?:[.,]\d+)?$/i,
    /^x\d+$/i,
    /^(unitario|medium|monster)$/i
  ].some((pattern) => pattern.test(size));
}

function buildAudit(products) {
  const duplicateIds = new Map();
  const duplicateVariants = new Map();
  const missingImages = [];
  const missingDescriptions = [];
  const suspiciousText = [];
  const emptySizes = [];
  const zeroPrices = [];
  const invalidCategories = [];
  const invalidSizeLabels = [];

  products.forEach((product) => {
    const idKey = String(product.id);
    duplicateIds.set(idKey, (duplicateIds.get(idKey) || 0) + 1);

    if (!ALLOWED_CATEGORIES.has(String(product.category || '').trim().toLowerCase())) {
      invalidCategories.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        category: product.category
      });
    }

    if (!product.image) {
      missingImages.push({ id: product.id, name: product.name, brand: product.brand });
    }

    if (!String(product.description || '').trim()) {
      missingDescriptions.push({ id: product.id, name: product.name, brand: product.brand });
    }

    if (
      hasMojibake(product.name) ||
      hasMojibake(product.brand) ||
      hasMojibake(product.description) ||
      hasMojibake(product.image)
    ) {
      suspiciousText.push({
        id: product.id,
        name: product.name,
        brand: product.brand,
        description: product.description,
        image: product.image
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

      if (!isValidSizeLabel(sizeLabel)) {
        invalidSizeLabels.push({
          id: product.id,
          name: product.name,
          brand: product.brand,
          size: sizeLabel
        });
      }

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
      invalidCategories: invalidCategories.length,
      invalidSizeLabels: invalidSizeLabels.length,
      duplicateIds: duplicateIdItems.length,
      duplicateVariants: duplicateVariantItems.length
    },
    missingImages,
    missingDescriptions,
    suspiciousText,
    emptySizes,
    zeroPrices,
    invalidCategories,
    invalidSizeLabels,
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
  console.log(`Categorias fuera de norma: ${audit.totals.invalidCategories}`);
  console.log(`Tamanos fuera de norma: ${audit.totals.invalidSizeLabels}`);
  console.log(`IDs duplicados: ${audit.totals.duplicateIds}`);
  console.log(`Variantes duplicadas: ${audit.totals.duplicateVariants}`);
  console.log(`Reporte: ${OUTPUT_PATH}`);
}

main();
