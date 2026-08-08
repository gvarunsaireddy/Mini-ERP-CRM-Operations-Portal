# Mini ERP + CRM Operations Portal

[![Repo](https://img.shields.io/badge/GitHub-Mini--ERP--CRM--Operations--Portal-181717?style=for-the-badge&logo=github)](https://github.com/gvarunsaireddy/Mini-ERP-CRM-Operations-Portal)
![Backend](https://img.shields.io/badge/Backend-NestJS_10-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Frontend](https://img.shields.io/badge/Frontend-React_18_--_Vite_5-61DAFB?style=for-the-badge&logo=react&logoColor=black)
![Database](https://img.shields.io/badge/Database-SQLite_%2F_PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)
![TypeScript](https://img.shields.io/badge/Language-TypeScript_5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

A full-stack enterprise **Mini ERP + CRM Operations Portal** built for wholesale and distribution companies. The portal streamlines customer relationship management (CRM), product cataloging, stock movement audit trails, multi-item sales challans with transactional inventory deductions, and real-time operations dashboard analytics.

---

## 📌 Repository Information

- **GitHub Repository**: [https://github.com/gvarunsaireddy/Mini-ERP-CRM-Operations-Portal](https://github.com/gvarunsaireddy/Mini-ERP-CRM-Operations-Portal)
- **Author**: Varun Sai Reddy G

---

## ⚡ Quick Access & 1-Click Logins

- **Frontend Portal**: `http://localhost:5173`
- **Backend REST API**: `http://localhost:3000/api`

> [!TIP]
> **1-Click Demo Logins**: On the sign-in page at `http://localhost:5173/login`, click any of the 4 role badges (**Admin**, **Sales**, **Warehouse**, **Accounts**) under **QUICK DEMO ACCOUNTS** to log in instantly without typing credentials!

---

## 🎨 Interactive Multi-Theme Engine

The platform features an interactive **Theme Switcher** in the top navigation bar with 5 distinct enterprise palettes:

| Theme | Key | Style & Color Highlights |
|-------|-----|--------------------------|
| 🌌 **Midnight Cyber** (*Default*) | `midnight` | Deep space navy background `#070913`, glowing cyan accents `#06b6d4`, indigo highlights |
| 🔮 **Obsidian Violet** | `violet` | Dark slate `#0b0717`, electric purple `#a855f7`, magenta highlights |
| 🌿 **Emerald Matrix** | `emerald` | Dark forest space `#04120b`, vibrant mint `#10b981`, cyan highlights |
| 🌅 **Sunset Amber** | `amber` | Dark charcoal `#140d04`, warm gold `#f59e0b`, crimson highlights |
| ☀️ **Clean Light Enterprise** | `light` | Crisp slate white `#f8fafc`, high-readability royal blue `#0284c7` |

Themes persist automatically in `localStorage` and switch dynamically across the application DOM.

---

## 📐 Architecture & Infrastructure

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

## 🔑 Test Credentials (Role Access Control)

| Role | Email | Password | Access & Module Permissions |
|------|-------|----------|-----------------------------|
| **Admin** | `admin@erp.com` | `Admin@123` | Full system access + Internal User Onboarding (`/users`) |
| **Sales** | `sales@erp.com` | `Sales@123` | Customers CRM, Sales Challans, Product catalog, Dashboard |
| **Warehouse** | `warehouse@erp.com` | `Warehouse@123` | Product catalog, Stock Movements (IN/OUT), Stock Alerts |
| **Accounts** | `accounts@erp.com` | `Accounts@123` | Sales Challans viewing, Product catalog, Dashboard |

---

## 🛠️ Technology Stack

### Backend
- **Framework**: NestJS 10 (Express runtime)
- **Language**: TypeScript 5
- **ORM**: TypeORM (Data Mapper pattern)
- **Database**: SQLite (`better-sqlite3`) for local dev, PostgreSQL 15 for production
- **Security**: Passport JWT, bcryptjs password hashing, `@Roles()` decorators & guards
- **Validation**: `class-validator` & `class-transformer`

### Frontend
- **Framework**: React 18
- **Language**: TypeScript 5
- **Build System**: Vite 5
- **Routing**: React Router v6
- **HTTP Client**: Axios with automatic JWT Authorization header interceptors
- **Icons & UI**: Lucide React, react-hot-toast notifications
- **Styling**: Vanilla CSS Design System with CSS Custom Properties & Glassmorphism

---

## 💼 Core Modules & Business Flow

### 1. Authentication & RBAC
- JWT bearer token authentication with server-side validation (`GET /api/auth/me`).
- Role-gated route guards (`<ProtectedRoute requiredRoles={['Admin']}>`) and NestJS backend `@Roles()` guards.

### 2. Customer CRM Module
- Full CRUD operations for customer profiles.
- Categories: `Retail`, `Wholesale`, `Distributor`.
- Lifecycle Pipeline: `Lead` ➔ `Active` ➔ `Inactive`.
- **Follow-Up Timeline**: Sales representatives can record structured follow-up meeting notes and target next contact dates.

### 3. Product Catalog & Inventory
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

## 📡 REST API Reference

### Base URL: `http://localhost:3000/api`

| Module | Method | Endpoint | Auth Required | Description |
|--------|--------|----------|---------------|-------------|
| **Auth** | `POST` | `/auth/login` | Public | Authenticate user and return JWT |
| | `GET` | `/auth/me` | All Roles | Retrieve current user profile |
| **Users** | `GET` | `/users?page=1&limit=10` | Admin | List users (paginated) |
| | `POST` | `/users` | Admin | Provision new internal user |
| **Customers**| `GET` | `/customers` | Admin, Sales | List & search customers (paginated) |
| | `POST` | `/customers` | Admin, Sales | Create customer account |
| | `GET` | `/customers/:id` | Admin, Sales | Get customer details & history |
| | `PUT` | `/customers/:id` | Admin, Sales | Update customer account |
| | `POST` | `/customers/:id/followups` | Admin, Sales | Record CRM follow-up note |
| | `GET` | `/customers/:id/followups` | Admin, Sales | List follow-up notes |
| **Products** | `GET` | `/products` | All Roles | List & search products (paginated) |
| | `POST` | `/products` | Admin, Warehouse | Create inventory product |
| | `GET` | `/products/:id` | All Roles | Get product detail & stock levels |
| | `PUT` | `/products/:id` | Admin, Warehouse | Update product details |
| | `GET` | `/products/:id/stock-movements` | Admin, Warehouse | View product movement audit log |
| | `POST` | `/products/:id/stock-movements` | Admin, Warehouse | Manual stock adjustment (`IN`/`OUT`) |
| **Challans** | `GET` | `/challans` | Admin, Sales, Accounts | List sales challans (paginated) |
| | `POST` | `/challans` | Admin, Sales | Create draft challan |
| | `GET` | `/challans/:id` | Admin, Sales, Accounts | Get challan details & line items |
| | `PATCH` | `/challans/:id/confirm` | Admin, Sales | **Confirm challan (deduct stock)** |
| | `PATCH` | `/challans/:id/cancel` | Admin | Cancel challan (restore stock) |
| **Dashboard**| `GET` | `/dashboard/stats` | All Roles | Aggregated summary stats |

---

## 💻 Local Installation & Setup

```bash
# 1. Clone the repository
git clone https://github.com/gvarunsaireddy/Mini-ERP-CRM-Operations-Portal.git
cd Mini-ERP-CRM-Operations-Portal

# 2. Install backend dependencies & seed database
cd server
npm install --legacy-peer-deps
cp .env.example .env
npm run seed

# 3. Start backend API server (http://localhost:3000)
npm run start:dev

# 4. In a new terminal, install frontend dependencies & launch dev server
cd ../client
npm install
npm run dev
# Frontend runs at http://localhost:5173
```

---

## 🐳 Docker Deployment

Run the complete multi-container setup with PostgreSQL:

```bash
# Build and run containers
docker-compose up --build -d

# Services will be accessible at:
# - Frontend: http://localhost:80
# - Backend API: http://localhost:3000/api
# - PostgreSQL: localhost:5432
```

---

## 📤 How to Push Code to GitHub Repository

If pushing updates to your repository:

```bash
# Check status
git status

# Stage & Commit
git add .
git commit -m "Update README and project files"

# Set remote URL
git remote add origin https://github.com/gvarunsaireddy/Mini-ERP-CRM-Operations-Portal.git

# Push to main branch
git push -u origin main
```

---

## 📜 License

Built for Full Stack Developer Case Study assignment. All rights reserved.
