# ⚡ GreenGrid v0.1 — P2P Energy Trading Platform

> **This is not a project — it's a product.**  
> GreenGrid is built with the mindset of a real-world, production-grade energy trading platform. Every architectural decision, design pattern, and module is crafted to be scalable, maintainable, and ready for deployment — not just to pass a milestone.

## Live URL

- Dashboard: https://greengrid-orcin.vercel.app/

## Vision

GreenGrid enables a **decentralized energy marketplace** where prosumers (producer-consumers) with solar panels, wind turbines, and battery storage can trade surplus renewable energy directly with nearby consumers — in real-time, with transparent pricing, escrow-secured transactions, and verifiable carbon credits.

### Who Is It For?

| Persona | Role |
|---------|------|
| 🏠 **Prosumer** | Homeowner with solar/wind who sells surplus energy |
| 🏢 **Consumer** | Buys clean energy at competitive rates |
| 🔌 **Grid Operator** | Monitors zone loads, halts/resumes trading |
| 🛡️ **Admin** | Manages users, audits platform activity |

### Business Model
- **2% platform fee** on every settled trade
- **Carbon credit issuance** for every kWh of green energy traded
- **Dynamic pricing** driven by real-time supply/demand per grid zone

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Node.js, Express, TypeScript, TypeORM |
| Database | SQLite (swappable to PostgreSQL) |
| Real-time | Socket.io (WebSocket) |
| Frontend | React 19, TypeScript, Vite 6 |
| Auth | JWT + RBAC |

## Architecture

- **Clean Architecture**: Controllers → Services → Repositories
- **OOP Principles**: Encapsulation, Abstraction, Inheritance, Polymorphism
- **Design Patterns**:
  - **Strategy** — Matching engine (PriceTimePriority, ProximityFirst, GreenSourceFirst) & Pricing (SupplyDemand, TimeOfDay)
  - **Chain of Responsibility** — Order validation pipeline (Quantity → Price → TimeWindow → Compliance)
  - **Observer** — Real-time notifications (WebSocket + InApp observers)
  - **Template Method** — Settlement process
  - **State** — Order/Trade lifecycle management
  - **Factory** — Energy source output estimation
  - **Repository** — Data access abstraction

## Quick Start

### Backend
```bash
cd server
npm install
npm run dev
```
Server starts on `http://localhost:3001`

### Frontend
```bash
cd client
npm install
npm run dev
```
Client starts on `http://localhost:5173`

### Demo Accounts
| Email | Password | Role |
|-------|----------|------|
| prosumer@green.grid | password123 | Prosumer |
| consumer@green.grid | password123 | Consumer |
| operator@green.grid | password123 | Grid Operator |
| admin@green.grid | password123 | Admin |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| POST | /api/auth/register | Register new user |
| POST | /api/auth/login | Login |
| POST | /api/orders | Create order |
| GET | /api/orders/book/:zoneId | Get order book |
| GET | /api/orders/my | Get user's orders |
| DELETE | /api/orders/:id | Cancel order |
| GET | /api/trades/my | Get user's trades |
| GET | /api/wallet | Get wallet balance |
| POST | /api/wallet/add-funds | Add funds |
| GET | /api/energy/dashboard | Energy dashboard |
| GET | /api/zones | Get all grid zones |
| POST | /api/zones/:id/halt | Halt zone (operator) |
| GET | /api/admin/users | List all users (admin) |
| GET | /api/notifications | Get notifications |

## Project Structure
```
server/
├── src/
│   ├── entities/        # TypeORM entities (17 classes)
│   ├── services/        # Business logic (10 services)
│   ├── controllers/     # Route handlers (8 controllers)
│   ├── patterns/        # Design patterns
│   │   ├── matching/    # Strategy pattern
│   │   ├── pricing/     # Strategy pattern
│   │   ├── validation/  # Chain of Responsibility
│   │   └── observer/    # Observer pattern
│   ├── middleware/       # Auth, RBAC, error handler
│   ├── enums/           # Shared enumerations
│   ├── dtos/            # Data transfer objects
│   └── websocket/       # Socket.io manager

client/
├── src/
│   ├── pages/           # 9 React pages
│   ├── components/      # Layout, Sidebar
│   ├── context/         # Auth context
│   └── api/             # API client
```
