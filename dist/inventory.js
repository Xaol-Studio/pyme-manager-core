export class InventoryCatalog {
    byId = new Map();
    bySku = new Map();
    byBarcode = new Map();
    constructor(initialProducts = []) {
        for (const p of initialProducts) {
            this.register(p);
        }
    }
    register(product) {
        this.byId.set(product.id, product);
        this.bySku.set(product.sku.toUpperCase(), product);
        if (product.barcode) {
            this.byBarcode.set(product.barcode.trim(), product);
        }
    }
    findById(id) {
        return this.byId.get(id);
    }
    findBySku(sku) {
        return this.bySku.get(sku.toUpperCase().trim());
    }
    findByBarcode(barcode) {
        return this.byBarcode.get(barcode.trim());
    }
    search(query) {
        const q = query.toLowerCase().trim();
        if (!q)
            return Array.from(this.byId.values());
        return Array.from(this.byId.values()).filter(p => p.name.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q) ||
            (p.barcode && p.barcode.includes(q)));
    }
    getLowStockAlerts() {
        return Array.from(this.byId.values()).filter(p => p.currentStock <= p.minStockAlert && p.isActive);
    }
    get count() {
        return this.byId.size;
    }
}
