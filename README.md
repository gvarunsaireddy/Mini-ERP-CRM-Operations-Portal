# Mini ERP + CRM Operations Portal

A full-stack ERP/CRM system for wholesale/distribution companies, built with modern technologies. Manages customers, products, inventory, sales challans, and basic CRM follow-ups.

![Tech Stack](https://img.shields.io/badge/Backend-NestJS-red?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Frontend-React-blue?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Database-SQLite%2FPostgreSQL-green?style=flat-square)
![Tech Stack](https://img.shields.io/badge/Language-TypeScript-blue?style=flat-square)

---

## Table of Contents

- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Documentation](#api-documentation)
- [Test Credentials](#test-credentials)
- [Deployment](#deployment)
- [Docker Setup](#docker-setup)
- [Architecture Decisions](#architecture-decisions)
- [Known Limitations](#known-limitations)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend                       │
│         (Vite + TypeScript + React Router)             │
│   ┌──────────┬──────────┬──────────┬──────────┐       │
│   │Dashboard │Customers │Products  │Challans  │       │
│   └──────────┴──────────┴──────────┴──────────┘       │
│              Axios + JWT Auth Token                     │
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
│              TypeORM + Repositories                     │
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
| **Node.js** | Runtime |
| **NestJS** | Framework (Express.js under the hood) |
| **TypeScript** | Language |
| **TypeORM** | ORM for database access |
| **SQLite** | Development database (zero-config) |
| **PostgreSQL** | Production database |
| **Passport JWT** | Authentication |
| **class-validator** | Request validation |
| **bcryptjs** | Password hashing |

### Frontend
| Technology | Purpose |
|------------|---------|
| **React 18** | UI library |
| **TypeScript** | Language |
| **Vite** | Build tool |
| **React Router v6** | Routing |
| **Axios** | HTTP client |
| **Lucide React** | Icons |
| **react-hot-toast** | Notifications |
| **Vanilla CSS** | Styling (custom dark theme) |

### DevOps
| Technology | Purpose |
|------------|---------|
| **Docker** | Containerization |
| **Docker Compose** | Multi-container orchestration |
| **Nginx** | Frontend static serving + API proxy |

---

## Features

### 1. Authentication & Roles
- JWT-based login with role-based access control
- 4 roles: **Admin**, **Sales**, **Warehouse**, **Accounts**
- Protected routes on both frontend and backend
- Auto token refresh and session management

### 2. Customer CRM Module
- Full CRUD for customer management
- Customer types: Retail, Wholesale, Distributor
- Status tracking: Lead → Active → Inactive
- Follow-up notes with timeline view
- Search by name, mobile, email, business name
- Pagination and filtering

### 3. Product & Inventory Module
- Full CRUD for product management
- SKU-based product identification
- Real-time stock tracking
- Stock movement log (IN/OUT with reasons)
- Low stock alert indicators
- Category-based organization
- Warehouse location tracking

### 4. Sales Challan Module
- Multi-step challan creation (select customer → add products → review)
- Auto-generated challan numbers (CH-YYYYMMDD-XXXX)
- Draft → Confirmed → Cancelled workflow
- **Transactional stock deduction** on confirmation
- Negative stock prevention with clear error messages
- Product snapshot storage (price/name at time of creation)
- PDF export capability

### 5. Dashboard
- Real-time stats cards (customers, products, stock alerts, challans)
- Recent challans overview
- Quick action buttons

---

## Getting Started

### Prerequisites
- **Node.js** >= 18.x
- **npm** >= 9.x
- Git

### Quick Start (Local Development)

```bash
# 1. Clone the repository
git clone <repository-url>
cd mini-erp-crm

# 2. Install backend dependencies
cd server
npm install --legacy-peer-deps

# 3. Set up environment variables
cp .env.example .env
# Edit .env if needed (defaults work for local dev)

# 4. Seed the database with demo data
npm run seed

# 5. Start the backend server
npm run start:dev
# Backend runs at http://localhost:3000

# 6. In a new terminal, install frontend dependencies
cd ../client
npm install

# 7. Start the frontend dev server
npm run dev
# Frontend runs at http://localhost:5173
```

### Verify Setup
1. Open http://localhost:5173 in your browser
2. Login with `admin@erp.com` / `Admin@123`
3. You should see the dashboard with stats

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
| `NODE_ENV` | Environment | `development` |

### Frontend (`client/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_API_URL` | Backend API base URL | `/api` (proxied by Vite) |

---

## API Documentation

### Base URL: `http://localhost:3000/api`

### Authentication
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/login` | Public | Login and get JWT token |
| GET | `/auth/me` | All Roles | Get current user profile |

### Users (Admin only)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/users?page=1&limit=10` | Admin | List all users |
| POST | `/users` | Admin | Create new user |

### Customers
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/customers?page=1&limit=10&search=` | Admin, Sales | List customers |
| POST | `/customers` | Admin, Sales | Create customer |
| GET | `/customers/:id` | Admin, Sales | Get customer details |
| PUT | `/customers/:id` | Admin, Sales | Update customer |
| POST | `/customers/:id/followups` | Admin, Sales | Add follow-up note |
| GET | `/customers/:id/followups` | Admin, Sales | List follow-ups |

### Products
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/products?page=1&limit=10&search=` | All Roles | List products |
| POST | `/products` | Admin, Warehouse | Create product |
| GET | `/products/:id` | All Roles | Get product details |
| PUT | `/products/:id` | Admin, Warehouse | Update product |
| GET | `/products/:id/stock-movements` | Admin, Warehouse | Stock movement log |
| POST | `/products/:id/stock-movements` | Admin, Warehouse | Add stock movement |

### Sales Challans
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/challans?page=1&limit=10` | Admin, Sales, Accounts | List challans |
| POST | `/challans` | Admin, Sales | Create challan (Draft) |
| GET | `/challans/:id` | Admin, Sales, Accounts | Get challan details |
| PATCH | `/challans/:id/confirm` | Admin, Sales | Confirm challan |
| PATCH | `/challans/:id/cancel` | Admin | Cancel challan |

### Dashboard
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard/stats` | All Roles | Dashboard statistics |

### Error Response Format
```json
{
  "statusCode": 400,
  "message": "Validation failed",
  "error": "Bad Request",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Pagination Response Format
```json
{
  "data": [...],
  "total": 50,
  "page": 1,
  "limit": 10,
  "totalPages": 5
}
```

---

## Test Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Admin** | admin@erp.com | Admin@123 | Full access to all modules |
| **Sales** | sales@erp.com | Sales@123 | Customers, Challans, Products (read), Dashboard |
| **Warehouse** | warehouse@erp.com | Warehouse@123 | Products, Stock Management, Dashboard |
| **Accounts** | accounts@erp.com | Accounts@123 | Challans (read), Products (read), Dashboard |

---

## Deployment

### Option 1: Free Tier Deployment (Recommended)

#### Frontend → Vercel
```bash
cd client
npm run build
# Deploy the `dist/` folder to Vercel
# Set VITE_API_URL to your backend URL
```

#### Backend → Render
1. Create a Web Service on Render
2. Connect your GitHub repo
3. Set root directory to `server/`
4. Build command: `npm install --legacy-peer-deps && npm run build && npm run seed`
5. Start command: `node dist/main.js`
6. Add environment variables from the table above

#### Database → Neon (PostgreSQL)
1. Create a free PostgreSQL database on Neon
2. Copy the connection string
3. Set `DB_TYPE=postgres` and connection variables in Render

### Option 2: Docker Deployment

```bash
# Start all services
docker-compose up -d

# Access:
# Frontend: http://localhost
# Backend API: http://localhost:3000
# PostgreSQL: localhost:5432
```

### Option 3: AWS Deployment (Bonus)
1. **EC2**: Deploy backend with PM2
2. **RDS**: PostgreSQL database
3. **S3 + CloudFront**: Static frontend hosting
4. **Elastic Beanstalk**: Alternative for backend

---

## Docker Setup

### Development with Docker Compose

```bash
# Build and start all services
docker-compose up --build

# Stop all services
docker-compose down

# Reset database
docker-compose down -v  # removes volumes
docker-compose up --build
```

### Individual Docker Builds

```bash
# Build backend
cd server
docker build -t erp-server .

# Build frontend
cd client
docker build -t erp-client .
```

---

## Architecture Decisions

### Why NestJS over Express.js?
NestJS provides built-in support for modules, dependency injection, guards, and decorators — all essential for an enterprise-grade ERP system. It uses Express.js under the hood, satisfying the tech stack requirement while providing better structure.

### Why SQLite for Development?
SQLite requires zero configuration — no database server to install or Docker to run. Clone the repo, `npm install`, and start developing. TypeORM abstracts the database layer, so switching to PostgreSQL for production is a one-line config change.

### Why Feature-Based Architecture?
Both backend (NestJS modules) and frontend (feature folders) use feature-based organization. This keeps related code together, making it easier to understand, maintain, and potentially extract into microservices later.

### Why Product Snapshots in Challans?
Challan items store the product name, SKU, and price at the time of creation. This ensures that if a product's price changes later, historical challans remain accurate — a critical business requirement.

### Why Transactional Stock Management?
Challan confirmation uses database transactions to ensure atomicity: either all stock deductions succeed, or none do. This prevents partial stock updates and data inconsistency.

---

## Project Structure

```
mini-erp-crm/
├── server/                    # NestJS Backend
│   ├── src/
│   │   ├── main.ts           # App bootstrap
│   │   ├── app.module.ts     # Root module
│   │   ├── common/           # Guards, decorators, filters
│   │   ├── modules/
│   │   │   ├── auth/         # JWT authentication
│   │   │   ├── users/        # User management
│   │   │   ├── customers/    # Customer CRM
│   │   │   ├── products/     # Product & inventory
│   │   │   ├── challans/     # Sales challans
│   │   │   └── dashboard/    # Dashboard stats
│   │   └── database/
│   │       └── seed.ts       # Database seeding
│   ├── Dockerfile
│   └── package.json
├── client/                    # React Frontend
│   ├── src/
│   │   ├── App.tsx           # Root component
│   │   ├── index.css         # Design system
│   │   ├── features/         # Feature modules
│   │   │   ├── auth/
│   │   │   ├── dashboard/
│   │   │   ├── customers/
│   │   │   ├── products/
│   │   │   ├── challans/
│   │   │   └── users/
│   │   └── shared/           # Shared components
│   ├── Dockerfile
│   ├── nginx.conf
│   └── package.json
├── docker-compose.yml
├── postman_collection.json
└── README.md
```

---

## Known Limitations

1. **No real-time notifications** — The system uses polling; WebSocket support could be added for real-time updates.
2. **No invoice generation** — Only sales challans are implemented. A separate invoice module with PDF generation would be a natural next step.
3. **No file uploads** — Product images and document attachments are not implemented. Would require S3 integration.
4. **No audit trail** — While stock movements are tracked, a comprehensive audit log for all entity changes is not implemented.
5. **Single warehouse** — Products have a location field but multi-warehouse stock splitting is not supported.
6. **No email notifications** — Follow-up reminders and challan confirmations don't send email notifications.
7. **SQLite limitations** — Development uses SQLite which doesn't support concurrent writes well. Production should use PostgreSQL.

---

## Assumptions

1. **Single company** — The system is designed for a single company, not multi-tenant.
2. **INR currency** — All prices are assumed to be in Indian Rupees (₹).
3. **Sequential challan numbers** — Challan numbers are auto-generated and sequential per day.
4. **No partial shipments** — A challan is either fully confirmed or cancelled; partial fulfillment is not supported.
5. **GST is informational** — GST number is stored but no GST calculations or tax logic is implemented.

---

## License

This project is built as a case study assignment. All rights reserved.
