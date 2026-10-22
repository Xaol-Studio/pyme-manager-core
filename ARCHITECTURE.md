# 🏛️ PyME Manager Core Architecture & System Topology

Deterministic, integer-cents financial engine and transactional retail backend for Mexican small and medium enterprises (PyMEs). Built with TypeScript, PostgreSQL / SQLite relational schemas, and Mexican SAT Anexo 20 fiscal compliance. Complete zero-dependency runtime tested via Node.js native test runner.

---

## 1. Technology Stack

| Layer | Technology | Details |
| :--- | :--- | :--- |
| **Language & Runtime** | TypeScript 5 (Strict) / Node.js | Zero external runtime dependencies; pure compiled JavaScript |
| **Arithmetic Engine** | Integer Cents Arithmetic | Eliminates IEEE 754 floating-point drift across bulk transactions |
| **Database Schemas** | PostgreSQL 16 & SQLite 3 | Relational DDL with CHECK constraints, foreign keys, and indexes |
| **Fiscal Rules** | Mexican SAT Anexo 20 | Multi-rate VAT aggregator (16%, 8% border, 0%, exempt) and retentions |
| **Testing** | Node.js Native Test Runner | Fast, zero-dependency testing (`node --test`) without framework bloat |

---

## 2. System Topology & Component Graph

```mermaid
flowchart TD
    subgraph ClientLayers["Consumer Applications"]
        POS["POS Cash Register UI"]
        ERP["PyME ERP / Inventory Management"]
        XAOLWebsite["XAOL Studio Interactive Demos"]
    end

    subgraph CoreEngine["pyme-manager-core (src/)"]
        Money["Integer Cents Money Math (src/money.ts)"]
        Tax["SAT Anexo 20 Tax Aggregator (src/tax.ts)"]
        Cart["Transactional Cart Manager (src/cart.ts)"]
        Inventory["Stock Boundary & Reserves (src/inventory.ts)"]
        Quote["Commercial Quotation Engine (src/quote.ts)"]
    end

    subgraph RelationalDDL["Database Layer (sql/)"]
        PostgresDDL["PostgreSQL ACID Schema (sql/postgres_schema.sql)"]
        SqliteDDL["SQLite Embedded Schema (sql/sqlite_schema.sql)"]
    end

    POS --> Cart
    ERP --> Inventory
    XAOLWebsite --> Quote
    Cart --> Money
    Cart --> Tax
    Cart --> Inventory
    Quote --> Cart
    Cart -.-> PostgresDDL
    Cart -.-> SqliteDDL
```

---

## 3. Financial Transaction Lifecycle (Zero Float Drift)

```mermaid
sequenceDiagram
    autonumber
    actor Cashier as Cashier / POS Terminal
    participant Cart as Transactional Cart (cart.ts)
    participant Inventory as Stock Manager (inventory.ts)
    participant Money as Integer Math (money.ts)
    participant Tax as SAT Aggregator (tax.ts)

    Cashier->>Cart: addItem(SKU, quantity, unitPriceInCents)
    Cart->>Inventory: verifyStock(SKU, quantity)
    Inventory-->>Cart: Stock confirmed (Atomic reservation)
    Cart->>Money: lineSubtotal = quantity * unitPriceInCents
    Cart->>Tax: computeTaxes(lineSubtotal, rate=0.16)
    Tax->>Money: taxInCents = roundHalfUp(lineSubtotal * 1600 / 10000)
    Tax-->>Cart: Aggregated VAT vector
    Cart-->>Cashier: Total in integer cents ($245.50 MXN = 24550 cents)
    Note over Cashier,Tax: Exact integer math guarantees zero sub-cent variance across millions of lines.
```

---

## 4. Directory Structure & Module Breakdown

```
pyme-manager-core/
├── src/                      # Core TypeScript source code
│   ├── index.ts              # Unified library export barrel
│   ├── money.ts              # Integer cents conversion, formatting, basis points
│   ├── tax.ts                # SAT Anexo 20 VAT transfers (16%, 8%, 0%) & retentions
│   ├── cart.ts               # POS cart session with multi-tier pricing (Retail, Wholesale)
│   ├── inventory.ts          # Atomic SKU stock checking and deficit guards
│   ├── quote.ts              # Formal commercial quotation generator
│   └── types.ts              # Core domain models (Item, Cart, TaxSummary, Quote)
├── sql/                      # Relational database schemas
│   ├── postgres_schema.sql   # Production PostgreSQL DDL with table constraints
│   └── sqlite_schema.sql     # Local embedded SQLite DDL for offline point-of-sale
├── tests/                    # Native Node.js test suite (`node --test`)
│   ├── money.test.mjs        # Float-to-cents rounding and formatting tests
│   ├── tax.test.mjs          # SAT Anexo 20 tax rate combination assertions
│   └── cart.test.mjs         # Multi-tier pricing and stock boundary validation
├── dist/                     # Compiled JavaScript and TypeScript declaration files
├── tsconfig.json             # TypeScript compiler settings
└── package.json              # Library manifest and build scripts
```
