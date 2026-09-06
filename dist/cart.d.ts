/**
 * Transactional Point-of-Sale Cart Engine
 */
import { Product, CartSummary, PriceTier } from './types.js';
export declare class PosCart {
    private items;
    private discountCents;
    private tier;
    constructor(tier?: PriceTier);
    setPriceTier(tier: PriceTier): void;
    addItem(product: Product, quantity?: number): void;
    setItemQuantity(product: Product, quantity: number): void;
    removeItem(productId: string): void;
    clear(): void;
    setDiscountCents(cents: number): void;
    getSummary(): CartSummary;
}
