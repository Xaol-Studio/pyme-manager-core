-- ============================================================================
-- XAOL Software Studio | PyME Manager Core
-- Relational Database DDL Schema (PostgreSQL 14+)
-- Designed for High-Throughput Retail, Auto-parts & Point-of-Sale (POS)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Product Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug VARCHAR(64) NOT NULL UNIQUE,
    name VARCHAR(128) NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Products Master Table
-- Prices stored in integer cents (MXN) to avoid IEEE 754 floating-point drift
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    sku VARCHAR(64) NOT NULL UNIQUE,
    barcode VARCHAR(64) UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    cost_price_cents INT NOT NULL CHECK (cost_price_cents >= 0),
    retail_price_cents INT NOT NULL CHECK (retail_price_cents >= 0),
    wholesale_price_cents INT NOT NULL CHECK (wholesale_price_cents >= 0),
    current_stock INT NOT NULL DEFAULT 0 CHECK (current_stock >= 0),
    min_stock_alert INT NOT NULL DEFAULT 5 CHECK (min_stock_alert >= 0),
    tax_rate_basis_points INT NOT NULL DEFAULT 1600 CHECK (tax_rate_basis_points IN (0, 800, 1600)), -- 16% standard, 8% border, 0% exempt
    unit_of_measure VARCHAR(16) NOT NULL DEFAULT 'H87', -- SAT ClaveUnidad: H87 = Pieza
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexing for sub-millisecond POS lookups
CREATE INDEX idx_products_sku ON products(sku);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_low_stock ON products(current_stock) WHERE current_stock <= min_stock_alert;

-- 3. Customers
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    rfc VARCHAR(13) DEFAULT 'XAXX010101000', -- SAT RFC Genérico
    legal_name VARCHAR(255) NOT NULL,
    phone VARCHAR(32),
    email VARCHAR(255),
    price_tier VARCHAR(16) NOT NULL DEFAULT 'RETAIL' CHECK (price_tier IN ('RETAIL', 'WHOLESALE', 'MECHANIC')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Sales Orders & Invoices
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number VARCHAR(32) NOT NULL UNIQUE,
    customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
    payment_method VARCHAR(16) NOT NULL CHECK (payment_method IN ('CASH', 'DEBIT_CARD', 'CREDIT_CARD', 'TRANSFER', 'OTHER')),
    currency VARCHAR(3) NOT NULL DEFAULT 'MXN',
    subtotal_cents INT NOT NULL CHECK (subtotal_cents >= 0),
    discount_cents INT NOT NULL DEFAULT 0 CHECK (discount_cents >= 0),
    tax_cents INT NOT NULL CHECK (tax_cents >= 0),
    total_cents INT NOT NULL CHECK (total_cents >= 0),
    status VARCHAR(16) NOT NULL DEFAULT 'COMPLETED' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    cashier_id VARCHAR(64) NOT NULL DEFAULT 'system',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_orders_created_at ON orders(created_at DESC);
CREATE INDEX idx_orders_status ON orders(status);

-- 5. Order Line Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    quantity INT NOT NULL CHECK (quantity > 0),
    unit_price_cents INT NOT NULL CHECK (unit_price_cents >= 0),
    tax_rate_basis_points INT NOT NULL,
    tax_cents INT NOT NULL CHECK (tax_cents >= 0),
    line_total_cents INT NOT NULL CHECK (line_total_cents >= 0)
);

CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_items_product ON order_items(product_id);

-- 6. Inventory Audit Trail (Kardex)
CREATE TABLE inventory_movements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    movement_type VARCHAR(24) NOT NULL CHECK (movement_type IN ('INBOUND_PURCHASE', 'OUTBOUND_SALE', 'ADJUSTMENT_ADD', 'ADJUSTMENT_LOSS', 'RETURN')),
    quantity_delta INT NOT NULL, -- Positive for incoming, negative for outgoing
    previous_stock INT NOT NULL,
    resulting_stock INT NOT NULL CHECK (resulting_stock >= 0),
    reference_folio VARCHAR(64),
    performed_by VARCHAR(64) NOT NULL DEFAULT 'admin',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_movements_product ON inventory_movements(product_id);
CREATE INDEX idx_movements_created_at ON inventory_movements(created_at DESC);
