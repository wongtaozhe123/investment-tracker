# Investment Tracker 📈

A **passwordless portfolio tracking application** built with Next.js, React, and MongoDB. Track your investments across stocks, crypto, and forex with real-time price updates and a beautiful dashboard interface.

![Next.js](https://img.shields.io/badge/Next.js-16-black)
![React](https://img.shields.io/badge/React-18-black)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-5-green)

---

## ✨ Features

- 🔐 **Passwordless Authentication** — Secure login with WebAuthn/Passkeys (no passwords stored)
- 📊 **Real-time Dashboard** — Live portfolio value tracking with automatic FX conversion
- 💰 **Multi-currency Support** — 15+ currencies including USD, EUR, SGD, MYR, and more
- 🔄 **Live Price Feeds** — Integrated with Yahoo Finance, CoinGecko, and Frankfurter APIs
- 📱 **Progressive Web App (PWA)** — Works offline with service worker caching
- 🎨 **Modern UI** — Tailwind CSS styled responsive interface
- 🔍 **Yahoo Finance Ticker Search** — Auto-suggest dropdown as you type!

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- MongoDB (local or cloud instance)
- npm, yarn, or pnpm

### Installation

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your MongoDB connection string and API keys

# Start development server
npm run dev
```

Visit `http://localhost:3000` to see the app.

### Build for Production

```bash
npm run build
npm start
```

---

## 🎯 Yahoo Finance Ticker Lookup (NEW!)

Type in the ticker field and watch suggestions appear automatically!

**How it works:**
1. Click "Add holding" on your dashboard
2. Start typing a ticker like `AAPL`, `MSFT`, or `BTC`
3. See real-time suggestions with company names, prices, and exchange info
4. Press Enter or click to select

**Supported assets:**
- 📈 Stocks & ETFs (e.g., AAPL, SPY, QQQ)
- 💎 Cryptocurrencies (e.g., BTC, ETH, SOL)
- 🌍 International stocks with exchange suffixes (e.g., TSLA.X, BABA.SI)

See [`YAHOO_FINANCE_FEATURES.md`](./YAHOO_FINANCE_FEATURES.md) for detailed documentation.

---

## 🏗️ Architecture

The app uses a hybrid Next.js architecture combining the App Router and Pages Router for optimal performance:

```
┌─────────────────────────────────────────────────────────────┐
│                      CLIENT (Browser)                        │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌──────────┐ │
│  │   Next.js │  │   React   │  │ Tailwind  │  │ Service  │ │
│  │ App Router│  │ Components│  │    CSS    │  │ Worker   │ │
│  └───────────┘  └───────────┘  └───────────┘  └──────────┘ │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                    API ROUTES & AUTH                         │
├─────────────────────────────────────────────────────────────┤
│  ┌───────────┐  ┌───────────┐  ┌───────────┐               │
│  │   /api    │  │ NextAuth  │  │ MongoDB   │               │
│  │  Routes   │  │ Adapter   │  │ Database  │               │
│  └───────────┘  └───────────┘  └───────────┘               │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **Passwordless by Design** — Users authenticate with biometric (Touch ID, Face ID) or hardware keys (Windows Hello, YubiKey)
2. **Real-time Data** — Live price feeds with intelligent caching strategies
3. **Multi-currency** — Automatic FX conversion for global portfolios
4. **Offline-capable** — PWA with service worker for offline shell

---

## 📁 Project Structure

```
investment-tracker/
├── src/
│   ├── app/              # App Router pages and API routes
│   │   ├── api/         # API endpoints
│   │   │   ├── auth/    # WebAuthn authentication
│   │   │   ├── portfolio/# Portfolio operations
│   │   │   └── fx/      # FX rate calculations
│   │   ├── dashboard/   # Dashboard route
│   │   ├── login/       # Login page
│   │   ├── register/    # Registration page
│   │   └── pages/       # Pages Router (legacy)
│   ├── components/      # Reusable React components
│   │   ├── TickerInput.tsx     # Auto-suggest ticker input ✨ NEW!
│   │   ├── AddHoldingModal.jsx # Enhanced with ticker search ✨ NEW!
│   │   └── ...          # Other UI components
│   ├── lib/             # Utility functions and configurations
│   │   ├── yahoo-finance/# Yahoo Finance API integration ✨ NEW!
│   │   └── ...         # Other utilities
│   └── globals.css      # Global styles
├── public/              # Static assets
├── .env.local           # Environment variables (local only)
├── next.config.mjs      # Next.js configuration
├── tailwind.config.ts   # Tailwind CSS config
└── tsconfig.json        # TypeScript configuration
```

---

## 🔌 API Integrations

| Service | Purpose | Documentation |
|---------|---------|---------------|
| **Yahoo Finance** | Stock prices, ticker search, historical data | [finance.yahoo.com](https://finance.yahoo.com) |
| **CoinGecko** | Cryptocurrency prices | [www.coingecko.com](https://www.coingecko.com) |
| **Frankfurter** | Currency exchange rates | [api.frankfurter.app](https://api.frankfurter.app) |

---

## 🔐 Authentication Flow

The app uses NextAuth.js with WebAuthn for passwordless authentication:

1. User registers with email and authenticates via passkey
2. Server generates a public key challenge
3. Browser handles biometric/hardware key authentication
4. JWT token issued after successful verification
5. MongoDB adapter stores user sessions securely

---

## 🗄️ Database Schema

The app uses MongoDB with the following core collections:

- **users** — User accounts and passkey credentials
- **portfolios** — Investment portfolios linked to users
- **holdings** — Individual holdings within portfolios (stocks, crypto, forex)
- **transactions** — Buy/sell transaction history

See [`architecture.md`](./architecture.md) for detailed schema documentation.

---

## 🛠️ Tech Stack

| Category | Technology |
|----------|------------|
| **Framework** | Next.js 16 (App Router + Pages Router) |
| **Language** | TypeScript |
| **Styling** | Tailwind CSS |
| **Authentication** | NextAuth.js with WebAuthn/Passkeys |
| **Database** | MongoDB with Mongoose adapter |
| **Icons** | Lucide React |

---

## 📦 Dependencies

### Production Dependencies

- `next` — React framework
- `react`, `react-dom` — UI library
- `mongodb` — Database driver
- `next-auth` — Authentication handling
- `@simplewebauthn/browser/server` — Passkey authentication
- `mongo-adapter` — MongoDB integration layer
- `lucide-react` — Icon library

### Development Dependencies

- `typescript` — Type checking
- `tailwindcss`, `autoprefixer`, `postcss` — Styling pipeline
- Various type definitions (`@types/*`)

---

## 📝 License

This project is private and for internal use only.

---

## 🤝 Contributing

This is an internal investment tracking tool. For questions or issues, please contact the development team.

---

## 🔗 Useful Links

- [Next.js Documentation](https://nextjs.org/docs)
- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Documentation](https://www.mongodb.com/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [WebAuthn API](https://www.w3.org/TR/webauthn-2/)
- [Yahoo Finance API](https://developer.finance.yahoo.com/)

---

**Built with ❤️ for tracking investments across stocks, crypto, and forex.**