/**
 * XAOL Software Studio | PyME Manager Core
 * Domain Types & Schemas
 */
export type TaxRateBasisPoints = 0 | 800 | 1600;
export type PriceTier = 'RETAIL' | 'WHOLESALE' | 'MECHANIC';
export type PaymentMethod = 'CASH' | 'DEBIT_CARD' | 'CREDIT_CARD' | 'TRANSFER' | 'OTHER';
export type MovementType = 'INBOUND_PURCHASE' | 'OUTBOUND_SALE' | 'ADJUSTMENT_ADD' | 'ADJUSTMENT_LOSS' | 'RETURN';
export interface Product {
    id: string;
    sku: string;
    barcode?: string;
    name: string;
    categoryId: string;
    costPriceCents: number;
    retailPriceCents: number;
    wholesalePriceCents: number;
    currentStock: number;
    minStockAlert: number;
    taxRateBasisPoints: TaxRateBasisPoints;
    isActive: boolean;
}
export interface CartItem {
    product: Product;
    quantity: number;
    unitPriceCents: number;
    taxCents: number;
    lineTotalCents: number;
}
export interface TaxBreakdown {
    basisPoints: TaxRateBasisPoints;
    percentageLabel: string;
    taxableBaseCents: number;
    taxAmountCents: number;
}
export interface CartSummary {
    items: CartItem[];
    totalItemCount: number;
    subtotalCents: number;
    discountCents: number;
    taxBreakdown: TaxBreakdown[];
    totalTaxCents: number;
    grandTotalCents: number;
}
