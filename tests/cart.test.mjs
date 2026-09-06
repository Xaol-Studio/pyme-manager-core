import test from 'node:test';
import assert from 'node:assert/strict';
import { PosCart } from '../dist/cart.js';
import { InventoryCatalog } from '../dist/inventory.js';

const sampleProductA = {
  id: 'prod-001',
  sku: 'REF-BALATAS-01',
  barcode: '7501234567890',
  name: 'Juego de Balatas Delanteras Cerámicas',
  categoryId: 'cat-frenos',
  costPriceCents: 28000, // $280.00
  retailPriceCents: 45000, // $450.00
  wholesalePriceCents: 38000, // $380.00
  currentStock: 15,
  minStockAlert: 3,
  taxRateBasisPoints: 1600,
  isActive: true,
};

const sampleProductB = {
  id: 'prod-002',
  sku: 'ACEITE-5W30-SYN',
  barcode: '7509876543210',
  name: 'Garrafa Aceite Sintético 5W-30 5L',
  categoryId: 'cat-lubricantes',
  costPriceCents: 42000, // $420.00
  retailPriceCents: 65000, // $650.00
  wholesalePriceCents: 54000, // $540.00
  currentStock: 8,
  minStockAlert: 2,
  taxRateBasisPoints: 1600,
  isActive: true,
};

test('Cart: calculates subtotal, tax, and grand total accurately in Retail tier', () => {
  const cart = new PosCart('RETAIL');
  cart.addItem(sampleProductA, 2); // 2 * $450 = $900 ($90,000 cents)
  cart.addItem(sampleProductB, 1); // 1 * $650 = $650 ($65,000 cents)

  const summary = cart.getSummary();
  assert.equal(summary.totalItemCount, 3);
  assert.equal(summary.subtotalCents, 155000); // $1,550.00
  assert.equal(summary.totalTaxCents, 24800); // 16% of 155,000 = 24,800 ($248.00)
  assert.equal(summary.grandTotalCents, 179800); // $1,798.00
});

test('Cart: switches to Wholesale/Mechanic price tier properly', () => {
  const cart = new PosCart('MECHANIC');
  cart.addItem(sampleProductA, 2); // 2 * $380 = $760 ($76,000 cents)

  const summary = cart.getSummary();
  assert.equal(summary.subtotalCents, 76000);
  assert.equal(summary.totalTaxCents, 12160); // 16% of 76,000 = 12,160
  assert.equal(summary.grandTotalCents, 88160);
});

test('Cart: enforces inventory stock boundary and throws on deficit', () => {
  const cart = new PosCart();
  assert.throws(() => {
    cart.addItem(sampleProductB, 20); // only 8 available
  }, /Insufficient inventory/);
});

test('Catalog: performs O(1) searches by SKU, barcode, and fuzzy search', () => {
  const catalog = new InventoryCatalog([sampleProductA, sampleProductB]);
  assert.equal(catalog.findBySku('REF-BALATAS-01')?.id, 'prod-001');
  assert.equal(catalog.findByBarcode('7509876543210')?.id, 'prod-002');
  
  const searchResults = catalog.search('sintético');
  assert.equal(searchResults.length, 1);
  assert.equal(searchResults[0].sku, 'ACEITE-5W30-SYN');
});
