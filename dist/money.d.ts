/**
 * Financial Arithmetic Utilities (Integer-Cents)
 * Prevents IEEE 754 floating-point drift in accounting and retail calculations.
 */
export declare function parseMxnToCents(amount: number): number;
export declare function formatCentsToMxn(cents: number): string;
export declare function calculateBasisPoints(amountCents: number, basisPoints: number): number;
