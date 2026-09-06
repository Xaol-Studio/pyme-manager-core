import test from 'node:test';
import assert from 'node:assert/strict';
import { parseMxnToCents, formatCentsToMxn, calculateBasisPoints } from '../dist/money.js';

test('Money: converts decimal pesos to integer cents correctly', () => {
  assert.equal(parseMxnToCents(10.50), 1050);
  assert.equal(parseMxnToCents(0.99), 99);
  assert.equal(parseMxnToCents(1950.00), 195000);
});

test('Money: formats integer cents to MXN string with currency symbol', () => {
  const formatted = formatCentsToMxn(105050);
  assert.ok(formatted.includes('1,050.50') || formatted.includes('1.050,50'));
  assert.ok(formatted.includes('$'));
});

test('Money: calculates basis points accurately with rounding', () => {
  // 16% (1600 bp) of $100.00 (10000 cents) = $16.00 (1600 cents)
  assert.equal(calculateBasisPoints(10000, 1600), 1600);
  // 8% (800 bp) of $50.00 (5000 cents) = $4.00 (400 cents)
  assert.equal(calculateBasisPoints(5000, 800), 400);
  // Zero tax
  assert.equal(calculateBasisPoints(10000, 0), 0);
});
