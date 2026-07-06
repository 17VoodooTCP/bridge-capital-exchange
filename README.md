# Bridge Capital Exchange

Enterprise-grade multi-asset trading and investment platform. Trade crypto, US stocks, and ETFs from a single, institutional-quality interface.

## Stack

- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS, Zustand, lightweight-charts, Recharts
- **Backend**: NestJS, TypeScript, Prisma, PostgreSQL, Redis, Socket.io
- **Infra**: Docker Compose

## Quick start

### Option A — Docker (recommended)

```bash
docker-compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:3001/api
- Swagger: http://localhost:3001/api/docs

### Option B — Local dev

```bash
# Backend
cd backend
cp .env.example .env
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev

# Frontend (in a new terminal)
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

## Features

- Portfolio dashboard with allocation, P&L, and 30-day chart
- Trading terminal with candlestick chart, order book, and buy/sell form
- Markets, Stocks, ETFs pages with real-time price ticks
- Wallet with deposit/withdraw modals, WalletConnect integration
- Earn (staking) with flexible + fixed products and ROI calculator
- News + Signals Center
- Support: bot with escalation to live agent
- Full admin panel: users, transactions, KYC review, wallet config, live chat takeover, platform settings
- Role-based access control + audited admin actions
- Session monitoring with geolocation

## Demo credentials

The login page has **Demo User** and **Demo Admin** buttons that bypass API auth and go straight to the dashboards.
