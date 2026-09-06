-- ============================================================================
-- XAOL Software Studio | PyME Manager Core
-- Relational Database DDL Schema (SQLite 3.35+)
-- Optimized for Embedded Edge POS Terminals & Offline Operation
-- ============================================================================

PRAGMA foreign_keys = ON;

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
    id TEXT PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Products Master Table
CREATE TABLE IF NOT EXISTS products (
    id TEXT PRIMARY KEY,
    category_id TEXT NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    sku TEXT NOT NULL UNIQUE,
    barcode TEXT UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    cost_price_cents INTEGER NOT NULL CHECK (cost_price_cents >= 0),
    retail_price_cents INTEGER NOT NULL CHECK (retail_price_cents >= 0),
    wholesale_price_cents INTEGER NOT NULL CHECK (wholesale_price_cents >= 0),
    current_stock INTEGER NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock_alert INTEGER NOT NULL DEFAULT 5 CHECK (min_stock_alert >= 0),
    tax_rate_basis_points INTEGER NOT NULL DEFAULT 1600 CHECK (tax_rate_basis_points IN (0, 800, 1600)),
    unit_of_measure TEXT NOT NULL DEFAULT 'H87',
    is_active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);

-- 3. Customers
CREATE TABLE IF NOT EXISTS customers (
    id TEXT PRIMARY KEY,
    rfc TEXT DEFAULT 'XAXX010101000',
    legal_name TEXT NOT NULL,
    phone TEXT,
    email TEXT,
    price_tier TEXT NOT NULL DEFAULT 'RETAIL' CHECK (price_tier IN ('RETAIL', 'WHOLESALE', 'MECHANIC')),
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 4. Orders
CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    order_number TEXT NOT NULL UNIQUE,
    customer_id TEXT REFERENCES customers(id) ON DELETE SET NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'TRANSFER', 'OTHER')),
    currency TEXT NOT NULL DEFAULT 'MXN',
    subtotal_cents INTEGER NOT NULL CHECK (subtotal_cents >= 0),
    discount_cents INTEGER NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    tax_cents INTEGER NOT NULL CHECK (tax_cents >= 0),
    total_cents INTEGER NOT NULL CHECK (total_cents >= 0),
    status TEXT NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    cashier_id TEXT NOT NULL DEFAULT 'system',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 5. Order Items
CREATE TABLE IF NOT EXISTS order_items (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    tax_rate_basis_points INTEGER NOT NULL,
    tax_cents INTEGER NOT NULL CHECK (tax_cents >= 0),
    line_total_cents INTEGER NOT NULL CHECK (line_total_cents >= 0)
);

-- 6. Inventory Movements
CREATE TABLE IF NOT EXISTS inventory_movements (
    id TEXT PRIMARY KEY,
    product_id TEXT NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    order_id TEXT REFERENCES orders(id) ON DELETE SET NULL,
    movement_type TEXT NOT NULL CHECK (movement_type IN ('INBOUND_PURCHASE', 'OUTBOUND_SALE', 'ADJUSTMENT_ADD', 'ADJUSTMENT_LOSS', 'RETURN')),
    quantity_delta INTEGER NOT NULL,
    previous_stock INTEGER NOT NULL,
    resulting_stock INTEGER NOT NULL CHECK (resulting_stock >= 0),
    reference_folio TEXT,
    performed_by TEXT NOT NULL DEFAULT 'admin',
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
