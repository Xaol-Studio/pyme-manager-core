/**
 * Fast In-Memory Catalog Index
 * Provides O(1) lookups by ID, SKU, and Barcode.
 */
import { Product } from './types.js';
export declare class InventoryCatalog {
    private byId;
    private bySku;
    private byBarcode;
    constructor(initialProducts?: Product[]);
    register(product: Product): void;
    findById(id: string): Product | undefined;
    findBySku(sku: string): Product | undefined;
    findByBarcode(barcode: string): Product | undefined;
    search(query: string): Product[];
    getLowStockAlerts(): Product[];
    get count(): number;
}
