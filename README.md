# finantial-dashboard

Personal finance dashboard built on **Angular 21** and **Tailwind CSS v4** with an integrated **Fastify API** for market data and simulations.

Based on the [TailAdmin Angular](https://github.com/TailAdmin/free-angular-admin-dashboard) template.

## Features

- **Simulador de interes compuesto** — compound-interest projections with configurable rates, periods, and contributions.
- **DCA historico** — backtest a Dollar Cost Averaging strategy over real ETFs, indices, or stocks using historical prices from Yahoo Finance.
  - Multi-block contributions with weekly/monthly/quarterly/yearly frequency.
  - Portfolio evolution, price/return charts, key metrics (CAGR, XIRR, drawdown), and transaction history.

## Project Structure

```text
finantial-dashboard/
  apps/
    api/          # Fastify API (port 4312)
      src/
        server.ts
        market-data/       # Yahoo Finance provider, asset presets
        simulations/
          dca-historical/  # schema, simulator, routes, tests
    dashboard/    # Angular SPA (port 4310)
      src/app/
        features/
          dca-historical/  # domain models, API client, UI component
        pages/
          simulations/
            compound-interest/   # legacy feature location
        shared/
          layout/          # sidebar, app layout
```

## Quick Start

```bash
git clone <repo-url>
cd finantial-dashboard
npm install
npm run dev
```

- **Dashboard**: http://localhost:4310
- **API**: http://localhost:4312
- **Health check**: http://localhost:4312/health

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start both Angular (4310) and API (4312) concurrently |
| `npm run web:dev` | Angular dev server only |
| `npm run api:dev` | API dev server only |
| `npm run build` | Build Angular + type-check API |
| `npm run api:test` | Run API unit tests |
| `npm run web:test` | Run Angular tests (Karma) |

## Tech Stack

- **Frontend**: Angular 21 standalone, Tailwind CSS v4, ApexCharts, ng-apexcharts
- **Backend**: Fastify 5, yahoo-finance2, Zod, tsx
- **Testing**: Node test runner (API), Karma/Jasmine (Angular)

## Development Proxy

During development, Angular proxies `/api` and `/health` to `localhost:4312` via `apps/dashboard/proxy.conf.json`.

---

*Base UI template by [TailAdmin](https://tailadmin.com/). Financial simulation logic built in-house.*
