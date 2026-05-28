# API Contract: DCA Historical Simulator

## Base URL

Development frontend should call relative `/api/*` paths. Angular dev proxy should forward to the API process.

## Error Shape

All API errors should use this shape:

```json
{
  "error": "Human readable message",
  "details": []
}
```

`details` is optional and intended for validation issues.

## GET /health

Health check.

Response:

```json
{
  "ok": true
}
```

## GET /api/assets

Returns preset assets for the selector.

Response:

```json
{
  "presets": [
    {
      "label": "MSCI World ETF - iShares Core MSCI World UCITS",
      "symbol": "IWDA.AS",
      "type": "ETF",
      "region": "Europa"
    }
  ]
}
```

## GET /api/history

Returns normalized daily historical prices for an asset.

Query params:

- `symbol`: required string.
- `startDate`: required ISO date, `YYYY-MM-DD`.
- `endDate`: required ISO date, `YYYY-MM-DD`.

Success response:

```json
{
  "symbol": "IWDA.AS",
  "prices": [
    {
      "date": "2024-01-02",
      "close": 82.31
    }
  ]
}
```

Error responses:

- `400` for invalid query.
- `404` when no historical prices are available.
- `500` for market-data provider failure.

## POST /api/simulate

Runs a DCA simulation.

Request body:

```json
{
  "symbol": "IWDA.AS",
  "startDate": "2014-01-01",
  "endDate": "2026-05-28",
  "contributionBlocks": [
    {
      "id": "base",
      "label": "Mensual",
      "startDate": "2014-01-01",
      "endDate": "2026-05-28",
      "amount": 300,
      "frequency": "monthly"
    }
  ]
}
```

Validation rules:

- `symbol`: trimmed, 1 to 32 chars.
- `startDate`: ISO date.
- `endDate`: ISO date.
- `contributionBlocks`: at least one block.
- `contributionBlocks[].label`: non-empty.
- `contributionBlocks[].amount`: positive number.
- `frequency`: `once`, `weekly`, `monthly`, `quarterly`, or `yearly`.

Success response:

```json
{
  "symbol": "IWDA.AS",
  "currency": "EUR",
  "startDate": "2014-01-02",
  "endDate": "2026-05-28",
  "metrics": {
    "totalInvested": 45000,
    "finalValue": 83000,
    "profit": 38000,
    "returnPct": 0.8444,
    "cagr": 0.052,
    "annualizedMoneyWeightedReturn": 0.071,
    "benchmarkReturnPct": 1.28,
    "maxDrawdown": -0.31,
    "units": 730.25,
    "purchases": 149,
    "firstPrice": 41.2,
    "lastPrice": 113.6
  },
  "transactions": [
    {
      "date": "2014-01-02",
      "scheduledDate": "2014-01-01",
      "blockId": "base",
      "label": "Mensual",
      "amount": 300,
      "price": 41.2,
      "units": 7.2815533981
    }
  ],
  "series": [
    {
      "date": "2014-01-02",
      "price": 41.2,
      "units": 7.2815533981,
      "invested": 300,
      "value": 300,
      "profit": 0,
      "returnPct": 0
    }
  ]
}
```

Error responses:

- `400` for invalid request.
- `404` when no historical prices are available.
- `500` for unexpected simulation or market-data failure.

## Compatibility With FullSimDCA

The first integrated API should preserve the existing FullSimDCA response shape unless a deliberate versioned change is made. This reduces frontend migration risk and keeps existing simulation tests meaningful.
