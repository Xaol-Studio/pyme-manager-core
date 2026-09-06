/**
 * Financial Arithmetic Utilities (Integer-Cents)
 * Prevents IEEE 754 floating-point drift in accounting and retail calculations.
 */

export function parseMxnToCents(amount: number): number {
  return Math.round(amount * 100);
}

export function formatCentsToMxn(cents: number): string {
  const pesos = cents / 100;
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(pesos);
}

export function calculateBasisPoints(amountCents: number, basisPoints: number): number {
  // 1 basis point = 0.01%, so 1600 bp = 16.00%
  // Formula: (amountCents * basisPoints) / 10,000 with half-up rounding
  return Math.round((amountCents * basisPoints) / 10000);
}
