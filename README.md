# Mini ERP + CRM Operations Portal

A full-stack enterprise ERP and CRM operations management portal built for wholesale and distribution companies. Manages customer relationships, inventory catalog, stock movement audit logs, sales challans, and real-time operational dashboard analytics.

![Tech Stack](https://img.shields.io/badge/Backend-NestJS_10-red?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Frontend-React_18_--_Vite_5-blue?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Database-SQLite_%2F_PostgreSQL-green?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Language-TypeScript_5-blue?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Themes-5_Dynamic_Palettes-purple?style=flat-square)

---

## Table of Contents

- [Live Demo & Quick Logins](#live-demo--quick-logins)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features & Business Logic](#features--business-logic)
- [Multi-Theme Engine](#multi-theme-engine)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Test Credentials](#test-credentials)
- [Deployment Guide](#deployment-guide)
- [Docker Setup](#docker-setup)
- [Architecture Decisions](#architecture-decisions)
- [Known Limitations](#known-limitations)
- [Assumptions](#assumptions)

---

## Live Demo & Quick Logins

- **Frontend Application**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:3000/api`

> [!TIP]
> **1-Click Demo Logins**: On the sign-in page (`http://localhost:5173/login`), click any role badge under **QUICK DEMO ACCOUNTS** to log in instantly without typing credentials!

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│       Glassmorphic Admin UI (Vite + TypeScript)         │
│   ┌──────────┬──────────┬──────────┬──────────┐       │
│   │Dashboard │Customers │Products  │Challans  │       │
│   └──────────┴──────────┴──────────┴──────────┘       │
│               Axios + JWT Interceptor                   │
└───────────────────────┬─────────────────────────────────┘
                        │ REST API (JSON)
┌───────────────────────┴─────────────────────────────────┐
│                   NestJS Backend                        │
│            (TypeScript + Express.js)                    │
│   ┌──────────┬──────────┬──────────┬──────────┐       │
│   │Auth      │Users     │Customers │Products  │       │
│   │Module    │Module    │Module    │Module    │       │
│   │          │          │          │          │       │
│   │JWT       │CRUD      │CRM      │Inventory │       │
│   │Guards    │Roles     │Follow-up │Stock Mgmt│       │
│   └──────────┴──────────┴──────────┴──────────┘       │
│   ┌──────────┬──────────┐                              │
│   │Challans  │Dashboard │  Guards, Validators,         │
│   │Module    │Module    │  Exception Filters            │
│   │          │          │                               │
│   │Sales     │Stats     │                               │
│   │Logic     │Aggregate │                               │
│   └──────────┴──────────┘                              │
│              TypeORM Data Mapper                        │
└───────────────────────┬─────────────────────────────────┘
                        │
┌───────────────────────┴─────────────────────────────────┐
│              SQLite (Dev) / PostgreSQL (Prod)            │
│   Tables: users, customers, customer_followups,         │
│           products, stock_movements,                    │
│           sales_challans, challan_items                  │
└─────────────────────────────────────────────────────────┘
```

---

## Tech Stack

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | Server runtime |
| **NestJS 10** | Modular web framework |
| **TypeScript 5** | Type-safe business logic |
| **TypeORM** | Data Mapper pattern ORM |
| **SQLite (better-sqlite3)** | Zero-config local development database |
| **PostgreSQL 15** | Production database support |
| **Passport JWT** | Secure bearer token authentication |
| **class-validator** | Request payload validation |
| **bcryptjs** | Password hashing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI framework |
| **TypeScript 5** | Typed frontend logic |
| **Vite 5** | Next-generation build tool & dev server |
| **React Router v6** | Declarative client routing |
| **Axios** | HTTP client with JWT interceptors |
| **Lucide React** | High-quality UI icons |
| **react-hot-toast** | Animated toast notifications |
| **Vanilla CSS** | HSL/RGB design system & multi-theme variables |

### DevOps & Deployment
| Technology | Purpose |
|------------|---------|
| **Docker** | Multi-stage container builds |
| **Docker Compose** | Orchestration for App + PostgreSQL |
| **Nginx** | Reverse proxy & static SPA serving |

---

## Features & Business Logic

### 1. Authentication & Role-Based Access Control (RBAC)
- JWT-based authentication storing signed session tokens.
- 4 distinct roles: **Admin**, **Sales**, **Warehouse**, **Accounts**.
- Dual-layer protection: **Backend Role Guards** (`@Roles()`, `RolesGuard`, `JwtAuthGuard`) and **Frontend Protected Routes** (`<ProtectedRoute>`).
- Admin user creation page for internal team onboarding.

### 2. Customer CRM Module
- Full CRUD management for customer records.
- Customer classifications: `Retail`, `Wholesale`, `Distributor`.
- Lifecycle status tracking: `Lead` ➔ `Active` ➔ `Inactive`.
- **Follow-Up Timeline**: Sales reps can record follow-up meeting notes and target next contact dates.
- Search by customer name, mobile, email, or business name.

### 3. Product & Inventory Module
- SKU-tracked product catalog with category tags, warehouse aisle locations, unit prices, and alert thresholds.
- **Stock Movement Log**: Audit trail tracking `IN` and `OUT` movements with reason codes and user attribution.
- **Low Stock Alerts**: Real-time identification of inventory items falling below minimum alert quantities (`currentStock <= minStockAlert`).

### 4. Sales Challan Module (Critical Business Logic)
- **Multi-Step Form**: Customer selection ➔ Product search & line-item assembly ➔ Qty calculation ➔ Draft creation.
- **Auto-Generated Challan Numbers**: Formatted as `CH-YYYYMMDD-XXXX`.
- **Transactional Stock Deduction**:
  - Executed inside a database transaction (`queryRunner.startTransaction()`).
  - Strict validation guarantees **stock never goes negative**.
  - Returns explicit HTTP 400 error payloads detailing short inventory items if stock is insufficient.
- **Historical Price Snapshotting**:
  - Each challan line item snapshots `productNameSnapshot`, `productSkuSnapshot`, and `productPriceSnapshot` at creation time, preserving historical billing accuracy even if master product prices change later.

### 5. Operations Dashboard
- Real-time KPI summary widgets: Total Customers, Active Products, Low Stock Warnings, Total Challans.
- Customer lifecycle stage distribution progress bars.
- Recent sales challan activity registry.

---

## Multi-Theme Engine

The application includes an interactive **Theme Switcher** in the top navigation header:

| Theme | Key | Palette Characteristics |
|-------|-----|-------------------------|
| 🌌 **Midnight Cyber** (*Default*) | `midnight` | Deep navy `#070913`, cyan glow `#06b6d4`, indigo accents |
| 🔮 **Obsidian Violet** | `violet` | Deep slate `#0b0717`, electric purple `#a855f7` & pink |
| 🌿 **Emerald Matrix** | `emerald` | Dark green `#04120b`, vibrant mint `#10b981` & cyan |
| 🌅 **Sunset Amber** | `amber` | Dark charcoal `#140d04`, warm gold `#f59e0b` & crimson |
| ☀️ **Clean Light Enterprise** | `light` | Crisp slate white `#f8fafc`, high-readability royal blue |

Theme selection is persisted in `localStorage` and applies dynamically across the DOM via `data-theme`.

---

## Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- Git

### Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone https://github.com/gvarunsaireddy/mini-erp-crm.git
cd mini-erp-crm

# 2. Install backend dependencies & seed database
cd server
npm install --legacy-peer-deps
cp .env.example .env
npm run seed

# 3. Start backend API server (runs at http://localhost:3000)
npm run start:dev

# 4. In a new terminal, install frontend dependencies
cd ../client
npm install

# 5. Start frontend dev server (runs at http://localhost:5173)
npm run dev
```

### Verify Setup
1. Open `http://localhost:5173` in your browser.
2. Click any **Quick Demo Account** button (e.g. **Admin** or **Sales**).
3. The system will log you in instantly!

---

## Environment Variables

### Backend (`server/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | JWT signing secret | `erp-super-secret-key-2024` |
| `JWT_EXPIRY` | Token expiry duration | `24h` |
| `DB_PATH` | SQLite database file path | `./data/erp.sqlite` |
| `DB_TYPE` | Database type (`better-sqlite3` or `postgres`) | `better-sqlite3` |
| `DB_HOST` | PostgreSQL host (if using PG) | `localhost` |
| `DB_PORT` | PostgreSQL port (if using PG) | `5432` |
| `DB_USERNAME` | PostgreSQL username | `erp_user` |
| `DB_PASSWORD` | PostgreSQL password | `erp_password_2024` |
| `DB_DATABASE` | PostgreSQL database name | `erp_crm` |

### Frontend (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` (proxied by Vite) |

---

## API Documentation

### Base URL: `http://localhost:3000/api`

### Authentication
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `POST` | `/auth/login` | Public | Login and get JWT token |
| `GET` | `/auth/me` | All Roles | Get current user profile |

### Users (Admin only)
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/users?page=1&limit=10` | Admin | List all users |
| `POST` | `/users` | Admin | Create new user |

### Customers CRM
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/customers?page=1&limit=10&search=` | Admin, Sales | List customers (paginated) |
| `POST` | `/customers` | Admin, Sales | Create customer account |
| `GET` | `/customers/:id` | Admin, Sales | Get customer details & history |
| `PUT` | `/customers/:id` | Admin, Sales | Update customer account |
| `POST` | `/customers/:id/followups` | Admin, Sales | Record CRM follow-up note |
| `GET` | `/customers/:id/followups` | Admin, Sales | List follow-up notes |

### Products & Inventory
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/products?page=1&limit=10&search=` | All Roles | List products (paginated) |
| `POST` | `/products` | Admin, Warehouse | Create product |
| `GET` | `/products/:id` | All Roles | Get product details |
| `PUT` | `/products/:id` | Admin, Warehouse | Update product details |
| `GET` | `/products/:id/stock-movements` | Admin, Warehouse | Stock movement audit log |
| `POST` | `/products/:id/stock-movements` | Admin, Warehouse | Add manual stock movement |

### Sales Challans
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/challans?page=1&limit=10` | Admin, Sales, Accounts | List challans (paginated) |
| `POST` | `/challans` | Admin, Sales | Create draft challan |
| `GET` | `/challans/:id` | Admin, Sales, Accounts | Get challan details & line items |
| `PATCH` | `/challans/:id/confirm` | Admin, Sales | **Confirm challan (deduct stock)** |
| `PATCH` | `/challans/:id/cancel` | Admin | Cancel challan (restore stock) |

### Dashboard
| Method | Endpoint | Auth Required | Description |
|--------|----------|---------------|-------------|
| `GET` | `/dashboard/stats` | All Roles | Operations summary statistics |

---

## Test Credentials

| Role | Email | Password | Access Matrix |
|------|-------|----------|---------------|
| **Admin** | `admin@erp.com` | `Admin@123` | Full access across all modules, including User Management |
| **Sales** | `sales@erp.com` | `Sales@123` | Customers CRM, Sales Challans, Product catalog, Dashboard |
| **Warehouse** | `warehouse@erp.com` | `Warehouse@123` | Product catalog, Stock Movements, Stock Alerts, Dashboard |
| **Accounts** | `accounts@erp.com` | `Accounts@123` | Sales Challans viewing, Product catalog, Dashboard |

---

## Deployment Guide

### Deployment Options

#### 1. Frontend → Vercel / Netlify
```bash
cd client
npm run build
# Deploy the generated `dist/` directory
# Set VITE_API_URL to your production backend URL
```

#### 2. Backend → Render / Railway
1. Create a Web Service connecting your GitHub repo.
2. Set Root Directory to `server/`.
3. Build Command: `npm install --legacy-peer-deps && npm run build && npm run seed`
4. Start Command: `node dist/main.js`

---

## Docker Setup

### Full-Stack Execution with PostgreSQL

```bash
# Build and start all services
docker-compose up --build -d

# Stop services
docker-compose down

# Reset database volumes
docker-compose down -v
```

---

## Architecture Decisions

1. **Why NestJS over Express.js?**
   - NestJS provides built-in dependency injection, modular organization (`AppModule`, `AuthModule`, `CustomersModule`), and decorators (`@Roles()`), leading to cleaner enterprise code.

2. **Why SQLite for Development?**
   - Requires zero local DB installation overhead. TypeORM abstracts SQL dialect differences, making switching to PostgreSQL in production a single config change.

3. **Why Product Snapshots in Challans?**
   - Line items store `productNameSnapshot`, `productSkuSnapshot`, and `productPriceSnapshot` at creation time to preserve historical billing integrity if master catalog prices change later.

4. **Why Transactional Stock Deductions?**
   - Challan confirmation executes within a TypeORM database transaction (`queryRunner.startTransaction()`) to guarantee zero partial updates during stock deduction or movement logging failures.

---

## Known Limitations

1. **No WebSockets** — Real-time updates use polling; WebSockets can be added for live activity feeds.
2. **Single Warehouse** — Products contain location strings, but multi-warehouse stock splitting is not implemented.
3. **Audit Log Scope** — Stock movements are fully audited; general entity edit audit logs are not implemented.

---

## Assumptions

1. **Internal Onboarding** — Internal employee accounts are created by Admins (`/users`), not public self-registration.
2. **Currency** — All monetary values are presented in Indian Rupees (₹).
3. **Challan Numbers** — Sequential per day (`CH-YYYYMMDD-XXXX`).

---

## License

Built as a case study assignment. All rights reserved.
