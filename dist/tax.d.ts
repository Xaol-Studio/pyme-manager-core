/**
 * Mexican Tax Calculation Engine (SAT Anexo 20 Compliant)
 */
import { TaxRateBasisPoints, TaxBreakdown } from './types.js';
export declare function calculateLineTax(taxableBaseCents: number, rate: TaxRateBasisPoints): number;
export declare function aggregateTaxes(lines: Array<{
    taxableBaseCents: number;
    rate: TaxRateBasisPoints;
}>): TaxBreakdown[];
