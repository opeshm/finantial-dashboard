# Domain Spec: Historical DCA Simulation

## Core Concepts

### Asset

An asset is identified by a Yahoo Finance symbol. Examples:

- `IWDA.AS`
- `SPY`
- `VOO`
- `QQQ`
- `^GSPC`
- `AAPL`

### Price Point

A normalized historical price point:

```ts
type PricePoint = {
  date: string;
  close: number;
};
```

`close` should use adjusted close when available, falling back to close.

### Contribution Block

A contribution block schedules one or more purchases.

```ts
type ContributionBlock = {
  id: string;
  label: string;
  startDate: string;
  endDate: string;
  amount: number;
  frequency: 'once' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
};
```

### Transaction

A transaction is the executed purchase produced by a scheduled contribution.

```ts
type Transaction = {
  date: string;
  scheduledDate: string;
  blockId: string;
  label: string;
  amount: number;
  price: number;
  units: number;
};
```

## Simulation Rules

1. Filter historical prices to the requested start/end range.
2. If no prices exist in range, fail with a domain error.
3. Expand contribution blocks into scheduled contribution dates.
4. Ignore scheduled contributions outside the global simulation date range.
5. Execute each scheduled contribution on the first available trading day on or after the scheduled date.
6. Skip a contribution if no trading day exists before or on the simulation end date.
7. Units purchased equal `amount / price`.
8. Portfolio value on each price point equals accumulated `units * close`.
9. Invested capital increases only when a transaction has executed.
10. Time series points are produced for each available price point in the simulation range.

## Frequency Scheduling

- `once`: one scheduled date at block start date.
- `weekly`: every 7 UTC days.
- `monthly`: same UTC day in following month where JavaScript date handling permits.
- `quarterly`: every 3 UTC months.
- `yearly`: every 1 UTC year.

The first version should preserve existing FullSimDCA scheduling behavior. If month-end handling is improved later, that should be a separate explicit change with tests.

## Metrics

### totalInvested

Sum of executed transaction amounts.

### finalValue

Portfolio value at the last available price point.

### profit

`finalValue - totalInvested`.

### returnPct

`profit / totalInvested`, or `0` when nothing was invested.

### cagr

Approximate annual growth rate from total invested to final value over the global requested date range.

Returns `null` when total invested or final value is not positive.

### annualizedMoneyWeightedReturn

Approximate XIRR using executed purchases as negative cash flows and final value as positive final cash flow.

Returns `null` when a solution cannot be found.

### benchmarkReturnPct

Buy-and-hold return of the asset price over the effective price range.

`(lastPrice - firstPrice) / firstPrice`.

### maxDrawdown

Worst percentage decline from prior portfolio value peak across the value series.

### units

Accumulated units at the final price point.

### purchases

Number of executed transactions.

## Test Scenarios

- Monthly contribution starting on a non-trading day executes on next available trading day.
- One-off contribution executes only once.
- Multiple blocks are merged and transactions are sorted by execution date.
- Contributions after end date are ignored.
- Empty price range throws a clear error.
- XIRR returns null when cash flows are insufficient.
- Drawdown returns the worst decline from peak.

## Domain Invariants

- Transaction amount must be positive.
- Transaction units must be positive.
- Price point close must be positive.
- Series dates must be sorted ascending.
- Transactions must be sorted ascending by execution date.
