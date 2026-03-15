# GreenGrid — Peer-to-Peer Energy Trading Platform

## Overview

**GreenGrid** is a full-stack platform that enables households and businesses with renewable energy sources (solar panels, wind turbines, battery storage) — known as **prosumers** — to trade surplus energy directly with nearby consumers in real-time through a decentralized marketplace.

Traditional energy grids are one-directional: power flows from centralized plants to consumers. With the rise of rooftop solar and home batteries, millions of small producers now generate excess energy that either goes to waste or is sold back to the grid at minimal rates. **GreenGrid** creates a **peer-to-peer energy marketplace** where prosumers set prices, consumers find the best local deals, and the platform handles matching, settlement, and grid compliance — all in real-time.

---

## Problem Statement

1. **Wasted surplus energy** — Prosumers with solar panels often produce more than they consume during peak sun hours, but lack a marketplace to sell it efficiently.
2. **Unfair feed-in tariffs** — Utilities pay prosumers far below retail rates for surplus energy fed back to the grid.
3. **No local energy economy** — Neighbors cannot directly trade energy, creating dependency on centralized utilities.
4. **Lack of transparency** — Consumers have no visibility into the source, carbon footprint, or pricing breakdown of their energy.
5. **Grid congestion** — Without intelligent load balancing, surplus energy can destabilize local grids.

---

## Scope

### In Scope
- Real-time peer-to-peer energy trading marketplace
- Smart meter data ingestion and energy monitoring dashboard
- Dynamic pricing engine (supply/demand-based)
- Automated order matching and settlement
- Carbon credit tracking and green energy certificates
- Community microgrid management
- Grid operator dashboard for compliance and load monitoring
- User management with role-based access (Prosumer, Consumer, Grid Operator, Admin)
- Notification and alerting system
- Analytics and reporting (energy trends, earnings, carbon savings)
- RESTful API for smart meter / IoT device integration

### Out of Scope (for Milestone 1)
- Actual smart meter hardware integration
- Real payment gateway (simulated transactions)
- Blockchain-based ledger (architectural placeholder only)
- Mobile application (web-only for now)

---

## Key Features

### 1. Energy Marketplace
- **Trade Orders**: Prosumers create sell orders specifying quantity (kWh), price (per kWh), time window, and energy source type.
- **Automated Matching**: A matching engine pairs buy and sell orders based on price, proximity, grid zone, and time window.
- **Order Book**: Real-time order book showing available energy in each grid zone.
- **Auction Mode**: Support for Dutch auction pricing during surplus periods.

### 2. Real-time Energy Monitoring
- **Live Dashboard**: Real-time visualization of energy production, consumption, and net surplus/deficit.
- **Smart Meter Simulation**: Simulated smart meter data feeds with realistic production/consumption curves.
- **Forecasting**: Predict energy production based on weather data and historical patterns.

### 3. Dynamic Pricing Engine
- **Supply/Demand Pricing**: Prices adjust automatically based on real-time grid supply and demand.
- **Peak/Off-Peak Rates**: Different pricing tiers based on time of day.
- **Price Alerts**: Users can set price thresholds and get notified when favorable trading conditions arise.

### 4. Settlement & Billing
- **Automated Settlement**: Transactions are settled automatically after energy delivery confirmation.
- **Billing Cycles**: Monthly billing summaries with detailed transaction history.
- **Wallet System**: Internal wallet for managing credits and debits.
- **Escrow**: Funds held in escrow during active trades until delivery is confirmed.

### 5. Carbon Credit Tracking
- **Green Certificates**: Each kWh of renewable energy traded generates verifiable green energy certificates.
- **Carbon Footprint Dashboard**: Track total carbon savings from renewable energy trading.
- **Leaderboard**: Community leaderboard for top green energy contributors.

### 6. Community Microgrids
- **Grid Zones**: Geographic zones for localized energy trading.
- **Community Groups**: Users can form energy co-operatives with shared pricing rules.
- **Zone Analytics**: Per-zone energy flow, pricing trends, and grid health metrics.

### 7. Grid Operator Tools
- **Load Monitoring**: Real-time grid load and capacity visualization.
- **Compliance Dashboard**: Ensure all trades comply with regulatory limits.
- **Emergency Controls**: Ability to halt trading in specific zones during grid emergencies.
- **Audit Logs**: Complete tamper-proof audit trail of all grid operations.

### 8. Notification & Alert System
- **Trade Notifications**: Real-time updates on order matches, settlements, and price changes.
- **Grid Alerts**: Emergency notifications for grid issues, outages, or maintenance.
- **Email & In-App**: Multi-channel notification delivery.

---

## Tech Stack

| Layer          | Technology                                      |
|----------------|--------------------------------------------------|
| **Frontend**   | React.js, Chart.js / D3.js, Leaflet (maps)      |
| **Backend**    | Node.js (Express / NestJS), TypeScript           |
| **Database**   | PostgreSQL (relational), Redis (caching/pub-sub) |
| **Real-time**  | WebSocket (Socket.io)                            |
| **Auth**       | JWT + RBAC (Role-Based Access Control)           |
| **API**        | RESTful API + WebSocket events                   |
| **Testing**    | Jest, Supertest                                  |
| **DevOps**     | Docker, GitHub Actions CI/CD                     |

---

## Architecture Principles

- **Clean Architecture**: Controllers → Services → Repositories separation
- **OOP Principles**: Encapsulation, Abstraction, Inheritance, Polymorphism throughout the domain model
- **Design Patterns** (used where they naturally fit):
  - **Strategy** — Different pricing algorithms, matching strategies
  - **Observer** — Real-time event notifications, price change subscriptions
  - **State** — Trade/order lifecycle management
  - **Factory** — Creating different energy source types, meter types
  - **Chain of Responsibility** — Order validation pipeline, compliance checks
  - **Command** — Trading actions (place order, cancel order, settle)
  - **Builder** — Report and bill generation
  - **Template Method** — Settlement and billing process
  - **Mediator** — Trading engine mediating between buyers and sellers
- **SOLID Principles** adherence across all modules
- **Repository Pattern** for data access abstraction
- **DTO Pattern** for data transfer between layers

---

## User Roles

| Role              | Description                                                   |
|-------------------|---------------------------------------------------------------|
| **Prosumer**      | Produces and consumes energy. Can create sell/buy orders.      |
| **Consumer**      | Only consumes energy. Can create buy orders.                   |
| **Grid Operator** | Monitors grid health, manages compliance, emergency controls.  |
| **Admin**         | Full system access, user management, platform configuration.   |
