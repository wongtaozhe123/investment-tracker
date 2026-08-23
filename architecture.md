# Investment Tracker Architecture

This document provides a detailed overview of the Investment Tracker's architecture, system design, and deployment options.

---

## Table of Contents

1. [High-Level Overview](#high-level-overview)
2. [System Architecture](#system-architecture)
3. [Component Diagrams](#component-diagrams)
4. [Data Flow](#data-flow)
5. [Authentication Flow](#authentication-flow)
6. [Price Fetching Pipeline](#price-fetching-pipeline)
7. [Database Schema](#database-schema)
8. [API Architecture](#api-architecture)
9. [Infrastructure](#infrastructure)
10. [Deployment Options](#deployment-options)

---

## High-Level Overview

The Investment Tracker is a **passwordless portfolio tracking application** built with a modern full-stack JavaScript architecture:

| Aspect | Description |
|--------|-------------|
| **Architecture** | Server-side rendered with progressive enhancement |
| **Pattern** | Hybrid Next.js (App Router + Pages Router) |
| **Authentication** | WebAuthn/Passkeys (no passwords stored) |
| **Database** | MongoDB (document store) |
| **External APIs** | Yahoo Finance, CoinGecko, Frankfurter |
| **Deployment** | Containerized or serverless |

### Key Design Principles

1. **Passwordless by Design** — Users authenticate with biometric (Touch ID, Face ID) or hardware keys (Windows Hello, YubiKey)
2. **Real-time Data** — Live price feeds with intelligent caching
3. **Multi-currency** — 15 supported currencies with automatic FX conversion
4. **Offline-capable** — PWA with service worker for offline shell

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENT (Browser)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐   │
│  │   Next.js   │  │   React     │  │  Tailwind   │  │ Service Worker │   │
│  │  App Router │  │ Components  │  │    CSS      │  │   (PWA)        │   │
│  └──────┬──────┘  └──────┬──────┘  └─────────────┘  └─────────────────┘   │
│         │                │                                                  │
│         └────────┬───────┘                                                  │
│                  ▼                                                          │
│         ┌────────────────┐                                                  │
│         │  NextAuth.js   │                                                  │
│         │  (JWT Session) │                                                  │
│         └────────┬───────┘                                                  │
└──────────────────┼──────────────────────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────┼──────────────────────────────────────────────────────────┐
│                  ▼            SERVER (Next.js)                               │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        API Routes                                    │    │
│  ├──────────────┬──────────────┬──────────────┬─────────────────────────┤    │
│  │   /api       │  /api        │  /api        │   /pages/api           │    │
│  │  /price/     │  /fx         │  /portfolio  │   /auth/               │    │
│  │  stock       │              │  /holdings   │   /webauthn-*          │    │
│  │  crypto      │              │  /settings   │   /[...nextauth]       │    │
│  └──────┬───────┘──────────────┴───────┬───────┴───────────┬─────────────┘    │
│         │                             │                   │                   │
│         ▼                             ▼                   ▼                   │
│  ┌───────────────────────────────────────────────────────────────────────┐    │
│  │                    MongoDB Driver                                    │    │
│  │              (Connection Pool + Singleton)                          │    │
│  └────────────────────────────┬────────────────────────────────────────┘    │
└───────────────────────────────┼──────────────────────────────────────────────┘
                                │
                                ▼
                      ┌─────────────────┐     ┌───────────────┐
                      │  MongoDB Atlas   │     │ Yahoo Finance │
                      └─────────────────┘     │  CoinGecko     │
                                              │ Frankfurter    │
                                              └───────────────┘
```

---

## Component Diagrams

### Frontend Components

```
src/components/
├── AuthProvider.jsx          # Session context provider
├── LoginButton.jsx           # Standalone passkey sign-in
├── AppHeader.jsx             # Top navigation bar
├── SummaryCards.jsx          # Portfolio value/cost/gain cards
├── HoldingsTable.jsx         # Holdings table with inline editing
├── AddHoldingModal.jsx       # Modal for adding new holdings
├── ServiceWorkerRegister.jsx # PWA service worker registration
└── auth/
    ├── AuthShell.jsx         # Reusable auth page layout
    └── useWebAuthn.js        # WebAuthn hook (register/login)
```

### Data Layer (lib/)

```
src/lib/
├── db.js              # MongoDB client singleton (connection pooling)
├── auth-options.js   # NextAuth configuration
├── usePortfolio.js   # Core portfolio state management hook
├── format.js         # Currency/number formatting utilities
├── storage.js        # LocalStorage helpers
└── types.js          # TypeScript type definitions (comments)
```

### API Routes

```
App Router (src/app/api/)
├── price/
│   ├── stock/route.ts    # Yahoo Finance stock prices
│   └── crypto/route.ts  # CoinGecko crypto prices
└── fx/route.ts          # Frankfurter FX rates

Pages Router (src/pages/api/)
├── auth/
│   ├── [...nextauth].js       # NextAuth catch-all
│   ├── webauthn-register.js   # Start passkey registration
│   ├── webauthn-verify.js     # Complete registration
│   ├── webauthn-login.js      # Start passkey login
│   └── webauthn-login-verify.js # Complete login
└── portfolio/
    ├── holdings.js       # CRUD for holdings
    ├── settings.js       # User preferences (currency)
    └── manual-prices.js  # Manual price overrides
```

---

## Data Flow

### Portfolio Data Flow

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   Dashboard  │ ───▶ │ usePortfolio │ ───▶ │  API Calls   │
│  (React)     │      │    Hook      │      │              │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │                     ▼                     ▼
       │              ┌──────────────┐      ┌──────────────┐
       │              │  Holdings    │      │  MongoDB     │
       │◀──────────── │  + Prices    │ ◀─── │  Database    │
       │              │  + FX Rates  │      └──────────────┘
       │              └──────────────┘
       │                     │
       │                     ▼
       │              ┌──────────────┐
       │              │   External   │ ───▶ Yahoo Finance
       └─────────────▶│   APIs       │      CoinGecko
                      │              │      Frankfurter
                      └──────────────┘
```

### Portfolio Calculation Pipeline

The `usePortfolio` hook orchestrates the complete data flow:

1. **Fetch Holdings** — Load user's holdings from MongoDB
2. **Fetch Settings** — Get user's currency preference
3. **Fetch Manual Prices** — Get any user-defined price overrides
4. **Fetch FX Rates** — Get live FX rates for all currencies (cached 10 min)
5. **Fetch Live Prices** — Call price APIs for each holding symbol
6. **Compute Totals** — Calculate portfolio value, cost, gains, allocation

```javascript
// Simplified flow in usePortfolio.js
const totals = computeTotals(holdings, prices, manualPrices, fxRates, targetCurrency);
// Returns: { totalValue, totalCost, totalGain, totalGainPct, byType, detail[] }
```

---

## Authentication Flow

The application uses **WebAuthn** for passwordless authentication.

### Registration Flow

1. User enters email → `/api/auth/webauthn-register`
2. Server generates challenge, stores in MongoDB
3. Browser invokes `startRegistration()` (WebAuthn API)
4. User authenticates with biometrics/hardware key
5. Credential returned → `/api/auth/webauthn-verify`
6. Server verifies, stores credential, creates user record

### Login Flow

1. User enters email → `/api/auth/webauthn-login`
2. Server retrieves user's stored credentials
3. Browser invokes `startAuthentication()` (WebAuthn API)
4. User authenticates with same biometrics/key
5. Credential returned → `/api/auth/webauthn-login-verify`
6. Server verifies, creates NextAuth session (JWT)

---

## Price Fetching Pipeline

### Stock Prices (Yahoo Finance)

```
Request: GET /api/price/stock?symbol=AAPL&vs=SGD
         │
         ▼
┌─────────────────────────────────────────┐
│  Yahoo Finance API                       │
│  Response: { regularMarketPrice,        │
│              currency }                │
└─────────────────────────────────────────┘
         │
         ▼ (if currency !== vs)
┌─────────────────────────────────────────┐
│  Frankfurter (FX Conversion)            │
└─────────────────────────────────────────┘
         │
         ▼
{ price: 253.50, currency: "SGD", nativeCurrency: "USD" }
```

### Crypto Prices (CoinGecko)

```
Request: GET /api/price/crypto?symbol=BTC,ETH&vs=usd
         │
         ▼
┌─────────────────────────────────────────┐
│  CoinGecko Search API (resolve ID)       │
│  BTC → bitcoin, ETH → ethereum         │
└─────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│  CoinGecko Simple Price API              │
│  { bitcoin: { usd: 65000 },             │
│    ethereum: { usd: 3500 } }           │
└─────────────────────────────────────────┘
         │
         ▼
{ BTC: { price: 65000, currency: "USD" },
  ETH: { price: 3500, currency: "USD" } }
```

### FX Rates (Frankfurter)

```
Request: GET /api/fx?from=USD&to=SGD
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│  Caching Strategy:                                      │
│  - In-memory cache (server process lifetime)           │
│  - TTL: 10 minutes                                      │
│  - Stale cache fallback on API failure                 │
└─────────────────────────────────────────────────────────┘
         │
         ▼
{ rate: 1.36, currency: "SGD", source: "cache|live" }
```

---

## Database Schema

### MongoDB Collections

#### users

```javascript
{
  _id: ObjectId,
  email: String,           // Unique, indexed
  name: String,            // Optional display name
  userID: String,          // WebAuthn user ID (base64url)
  currentChallenge: String, // Current WebAuthn challenge
  createdAt: Date
}
```

#### holdings

```javascript
{
  _id: ObjectId,
  id: String,              // Client-generated unique ID
  user_id: String,         // References users._id
  type: String,            // "stock" | "etf" | "crypto"
  symbol: String,          // Ticker symbol (e.g., "AAPL")
  quantity: Number,        // Number of units
  pricePaid: Number,       // Price per unit at purchase
  priceCurrency: String,   // Currency of pricePaid
  dateBought: String,      // ISO date string
  createdAt: Date
}
```

#### settings

```javascript
{
  _id: ObjectId,
  user_id: String,         // References users._id, unique
  currency: String,        // Preferred display currency (default: SGD)
  updatedAt: Date
}
```

#### manual_prices

```javascript
{
  _id: ObjectId,
  user_id: String,         // References users._id
  prices: {
    [symbol: string]: {
      symbol: String,
      price: Number,
      currency: String,
      source: "manual",
      updatedAt: Date
    }
  }
}
```

### Database Connection Pattern

The app uses a **singleton pattern** for MongoDB connections:

```javascript
// src/lib/db.js
// Development: reuse global connection to prevent hot reload issues
// Production: create new connection per request (pool managed by driver)
```

This ensures:
- Connection pooling in production
- Hot-reload stability in development
- Single connection point throughout the app

---

## API Architecture

### App Router APIs (Next.js 13+)

These use the newer Next.js App Router with Route Handlers:

| Route | Method | Description |
|-------|--------|-------------|
| `/api/price/stock` | GET | Fetch stock price from Yahoo Finance |
| `/api/price/crypto` | GET | Fetch crypto prices from CoinGecko |
| `/api/fx` | GET | Fetch FX rates from Frankfurter |

### Pages Router APIs (Legacy)

These use the Pages Router (required for NextAuth v4 compatibility):

| Route | Method | Description |
|-------|--------|-------------|
| `/api/auth/[...nextauth]` | ALL | NextAuth catch-all |
| `/api/auth/webauthn-register` | POST | Start WebAuthn registration |
| `/api/auth/webauthn-verify` | POST | Complete registration |
| `/api/auth/webauthn-login` | POST | Start WebAuthn login |
| `/api/auth/webauthn-login-verify` | POST | Complete login |
| `/api/portfolio/holdings` | GET/POST/DELETE | Holdings CRUD |
| `/api/portfolio/settings` | GET/PUT | User settings |
| `/api/portfolio/manual-prices` | GET/PUT | Manual price overrides |

---

## Infrastructure

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `MONGODB_URI` | Yes | MongoDB connection string |
| `NEXTAUTH_SECRET` | Yes | JWT signing secret (generate with `openssl rand -base64 32`) |
| `NEXTAUTH_URL` | Yes | App URL (e.g., `http://localhost:3000`) |
| `WEBAUTHN_RP_ID` | No | WebAuthn Relying Party ID (default: `localhost`) |
| `WEBAUTHN_RP_NAME` | No | WebAuthn Relying Party Name (default: `Investment Tracker`) |

### Runtime Dependencies

- **Node.js** 18+
- **MongoDB** 5.0+ (local or Atlas)
- **External APIs** (free tiers sufficient):
  - Yahoo Finance (stock prices)
  - CoinGecko (crypto prices)
  - Frankfurter (FX rates)
