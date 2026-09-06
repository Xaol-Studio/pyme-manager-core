/**
 * Fast In-Memory Catalog Index
 * Provides O(1) lookups by ID, SKU, and Barcode.
 */
import { Product } from './types.js';

export class InventoryCatalog {
  private byId = new Map<string, Product>();
  private bySku = new Map<string, Product>();
  private byBarcode = new Map<string, Product>();

  constructor(initialProducts: Product[] = []) {
    for (const p of initialProducts) {
      this.register(p);
    }
  }

  public register(product: Product): void {
    this.byId.set(product.id, product);
    this.bySku.set(product.sku.toUpperCase(), product);
    if (product.barcode) {
      this.byBarcode.set(product.barcode.trim(), product);
    }
  }

  public findById(id: string): Product | undefined {
    return this.byId.get(id);
  }

  public findBySku(sku: string): Product | undefined {
    return this.bySku.get(sku.toUpperCase().trim());
  }

  public findByBarcode(barcode: string): Product | undefined {
    return this.byBarcode.get(barcode.trim());
  }

  public search(query: string): Product[] {
    const q = query.toLowerCase().trim();
    if (!q) return Array.from(this.byId.values());

    return Array.from(this.byId.values()).filter(
      p =>
        p.name.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        (p.barcode && p.barcode.includes(q))
    );
  }

  public getLowStockAlerts(): Product[] {
    return Array.from(this.byId.values()).filter(
      p => p.currentStock <= p.minStockAlert && p.isActive
    );
  }

  public get count(): number {
    return this.byId.size;
  }
}
