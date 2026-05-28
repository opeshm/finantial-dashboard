# Product Spec: DCA Historical Simulator

## Problem

The dashboard currently has a compound-interest simulator based on assumed annual returns. It does not answer a different and important question: how a DCA strategy would have behaved against a real asset using real historical prices.

Users need a utility that can backtest recurring contributions into ETFs, indexes, or stocks and compare invested capital with final value, returns, drawdown, and benchmark behavior.

## Goals

- Add a historical DCA simulator as a financial utility in the Angular dashboard.
- Use real historical prices from Yahoo Finance through a server-side API.
- Support predefined assets and manual Yahoo Finance tickers.
- Support multiple contribution blocks with different dates, frequencies, labels, and amounts.
- Show portfolio evolution, price/return history, key metrics, and recent transactions.
- Keep the experience consistent with the existing dashboard layout and chart components.

## Non-Goals

- Do not implement broker integration.
- Do not store real user portfolios.
- Do not provide investment advice.
- Do not support tax calculations in the first version.
- Do not migrate the FullSimDCA React UI directly.
- Do not introduce persistent backend storage in the first version.

## Users

- Personal investor comparing ETF accumulation strategies.
- Dashboard user exploring financial planning utilities.
- Developer maintaining future financial simulation tools in one repository.

## Primary User Flow

1. User opens `Simulations > DCA historico`.
2. User selects a preset asset or enters a ticker manually.
3. User chooses a global simulation start and end date.
4. User configures one or more contribution blocks.
5. User runs the simulation.
6. Dashboard displays metrics, charts, and transaction details.

## Inputs

- Asset symbol.
- Start date.
- End date.
- Contribution blocks:
  - id
  - label
  - start date
  - end date
  - amount
  - frequency: once, weekly, monthly, quarterly, yearly

## Outputs

- Normalized symbol.
- Currency.
- Effective start and end date from available market data.
- Metrics:
  - total invested
  - final value
  - profit
  - total return percentage
  - CAGR
  - approximate annualized money-weighted return
  - benchmark buy-and-hold return
  - max drawdown
  - accumulated units
  - number of purchases
  - first and last price
- Transactions.
- Daily/market-session time series.

## UX Requirements

- Use the existing app layout and sidebar.
- Use `app-page-breadcrumb` at the top of the page.
- Use dashboard card styling and responsive grids.
- Use ApexCharts because it is already part of the target app.
- Show empty, loading, success, and error states.
- Keep controls usable on mobile.
- Avoid blocking the UI during network requests.

## Acceptance Criteria

- Given valid inputs, the user can run a simulation and see metrics and charts.
- Given a non-trading contribution date, the purchase uses the first available trading day on or after the scheduled date.
- Given no available historical prices, the user sees a useful error message.
- Given multiple contribution blocks, purchases are scheduled and sorted by date.
- Given a manual ticker, the API normalizes it to uppercase.
- Given an invalid payload, the API returns a validation error instead of crashing.

## Open Decisions

- Exact backend command name, for example `npm run api` or `npm run dev:api`.
- Whether Angular and API are run as two processes or via one development command.
- Whether to persist user simulation presets in localStorage, similar to compound-interest configs, in a later iteration.
