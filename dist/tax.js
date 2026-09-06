import { calculateBasisPoints } from './money.js';
export function calculateLineTax(taxableBaseCents, rate) {
    if (rate === 0)
        return 0;
    return calculateBasisPoints(taxableBaseCents, rate);
}
export function aggregateTaxes(lines) {
    const map = new Map();
    for (const line of lines) {
        const existing = map.get(line.rate) || { base: 0, tax: 0 };
        existing.base += line.taxableBaseCents;
        existing.tax += calculateLineTax(line.taxableBaseCents, line.rate);
        map.set(line.rate, existing);
    }
    const result = [];
    for (const [rate, values] of map.entries()) {
        let label = 'IVA 0%';
        if (rate === 1600)
            label = 'IVA 16%';
        else if (rate === 800)
            label = 'IVA 8% (Frontera)';
        result.push({
            basisPoints: rate,
            percentageLabel: label,
            taxableBaseCents: values.base,
            taxAmountCents: values.tax,
        });
    }
    return result.sort((a, b) => b.basisPoints - a.basisPoints);
}
