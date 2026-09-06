import { calculateLineTax, aggregateTaxes } from './tax.js';
export class PosCart {
    items = new Map();
    discountCents = 0;
    tier = 'RETAIL';
    constructor(tier = 'RETAIL') {
        this.tier = tier;
    }
    setPriceTier(tier) {
        this.tier = tier;
    }
    addItem(product, quantity = 1) {
        if (quantity <= 0) {
            throw new Error(`Quantity must be greater than zero, got: ${quantity}`);
        }
        const existing = this.items.get(product.id);
        const newQty = (existing ? existing.quantity : 0) + quantity;
        if (newQty > product.currentStock) {
            throw new Error(`Insufficient inventory for SKU '${product.sku}'. Requested: ${newQty}, Available: ${product.currentStock}`);
        }
        this.items.set(product.id, { product, quantity: newQty });
    }
    setItemQuantity(product, quantity) {
        if (quantity <= 0) {
            this.removeItem(product.id);
            return;
        }
        if (quantity > product.currentStock) {
            throw new Error(`Insufficient inventory for SKU '${product.sku}'. Requested: ${quantity}, Available: ${product.currentStock}`);
        }
        this.items.set(product.id, { product, quantity });
    }
    removeItem(productId) {
        this.items.delete(productId);
    }
    clear() {
        this.items.clear();
        this.discountCents = 0;
    }
    setDiscountCents(cents) {
        if (cents < 0) {
            throw new Error('Discount cents cannot be negative');
        }
        this.discountCents = cents;
    }
    getSummary() {
        const computedItems = [];
        const taxLines = [];
        let subtotalCents = 0;
        let totalItemCount = 0;
        for (const entry of this.items.values()) {
            const { product, quantity } = entry;
            totalItemCount += quantity;
            // Select price based on active customer tier
            let unitPrice = product.retailPriceCents;
            if (this.tier === 'WHOLESALE' || this.tier === 'MECHANIC') {
                unitPrice = product.wholesalePriceCents;
            }
            const lineBaseCents = unitPrice * quantity;
            const lineTaxCents = calculateLineTax(lineBaseCents, product.taxRateBasisPoints);
            const lineTotal = lineBaseCents + lineTaxCents;
            subtotalCents += lineBaseCents;
            computedItems.push({
                product,
                quantity,
                unitPriceCents: unitPrice,
                taxCents: lineTaxCents,
                lineTotalCents: lineTotal,
            });
            taxLines.push({
                taxableBaseCents: lineBaseCents,
                rate: product.taxRateBasisPoints,
            });
        }
        const taxBreakdown = aggregateTaxes(taxLines);
        const totalTaxCents = taxBreakdown.reduce((sum, b) => sum + b.taxAmountCents, 0);
        const cappedDiscount = Math.min(this.discountCents, subtotalCents);
        const grandTotalCents = subtotalCents - cappedDiscount + totalTaxCents;
        return {
            items: computedItems,
            totalItemCount,
            subtotalCents,
            discountCents: cappedDiscount,
            taxBreakdown,
            totalTaxCents,
            grandTotalCents,
        };
    }
}
