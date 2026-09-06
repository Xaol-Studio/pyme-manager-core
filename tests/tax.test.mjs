import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateLineTax, aggregateTaxes } from '../dist/tax.js';

test('Tax: calculates line tax for 16% IVA', () => {
  const baseCents = 100000; // $1,000.00 MXN
  const tax = calculateLineTax(baseCents, 1600);
  assert.equal(tax, 16000); // $160.00 MXN
});

test('Tax: aggregates multiple tax rates correctly', () => {
  const lines = [
    { taxableBaseCents: 10000, rate: 1600 },
    { taxableBaseCents: 20000, rate: 1600 },
    { taxableBaseCents: 5000, rate: 800 },
    { taxableBaseCents: 1000, rate: 0 }
  ];

  const breakdown = aggregateTaxes(lines);
  assert.equal(breakdown.length, 3);

  const iva16 = breakdown.find(b => b.basisPoints === 1600);
  assert.ok(iva16);
  assert.equal(iva16.taxableBaseCents, 30000);
  assert.equal(iva16.taxAmountCents, 4800); // 16% of 30000

  const iva8 = breakdown.find(b => b.basisPoints === 800);
  assert.ok(iva8);
  assert.equal(iva8.taxableBaseCents, 5000);
  assert.equal(iva8.taxAmountCents, 400); // 8% of 5000
});
