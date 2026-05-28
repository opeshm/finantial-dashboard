# Implementation Plan: DCA Historical Integration

## Phase 1: API Package Skeleton

- Add `apps/api/package.json`.
- Add `apps/api/tsconfig.json`.
- Add `apps/api/src/server.ts`.
- Add scripts to root `package.json` for API dev/test/build.
- Pick API dev port `4312` to avoid conflict with Angular port `4310`.
- Add Angular proxy config for `/api`.

Verification:

- API starts locally.
- `GET /health` returns `{ "ok": true }`.

## Phase 2: Migrate FullSimDCA Backend Domain

- Move simulation schema and types into `apps/api`.
- Move `runSimulation` behavior into `dca-historical.simulator.ts`.
- Move asset presets into API package.
- Move Yahoo Finance market-data provider into API package.
- Preserve current response shape.

Verification:

- Port existing FullSimDCA `simulation.test.ts` into the API package.
- Add tests for multiple blocks and empty price range.

## Phase 3: API Routes

- Add `GET /api/assets`.
- Add `GET /api/history`.
- Add `POST /api/simulate`.
- Add validation and consistent error mapping.
- Add CORS for local development if API is run separately.

Verification:

- Manual request to `/api/assets` returns presets.
- Manual request to `/api/simulate` returns metrics for `IWDA.AS` or `SPY`.
- Invalid payload returns `400`.

## Phase 4: Angular Feature Skeleton

- Add `apps/dashboard/src/app/features/dca-historical/`.
- Add domain models matching API contract.
- Add `DcaHistoricalApiService`.
- Add route `/simulations/dca-historical`.
- Add sidebar entry under `Simulations`.

Verification:

- Page is reachable from URL.
- Sidebar active state works.
- Angular build still passes.

## Phase 5: Angular UI

- Build configuration form.
- Build contribution block editor.
- Build loading/error/empty states.
- Build summary metric cards.
- Build portfolio evolution chart with ApexCharts.
- Build price/return chart with ApexCharts.
- Build recent transactions table.

Verification:

- Mobile and desktop layout are usable.
- Simulation can be run end-to-end from UI.
- Empty/error states render clearly.

## Phase 6: Cleanup And Documentation

- Update README to describe the financial dashboard and local API workflow.
- Document API scripts and ports.
- Decide whether to keep, archive, or reference `/home/opes/Code/FullSimDCA` after migration.
- Consider moving `compound-interest` from `pages/` to `features/` in a separate refactor.

Verification:

- `npm run build` passes.
- API tests pass.
- No accidental dependency on the old `FullSimDCA` project remains.

## Suggested Root Scripts

Example only; validate after creating the API package:

```json
{
  "web:dev": "ng serve --project ng-tailadmin --port 4310 --proxy-config apps/dashboard/proxy.conf.json",
  "web:build": "ng build --project ng-tailadmin",
  "api:dev": "npm --prefix apps/api run dev",
  "api:test": "npm --prefix apps/api test",
  "api:build": "npm --prefix apps/api run build",
  "dev": "concurrently -n api,web -c cyan,green \"npm run api:dev\" \"npm run web:dev\"",
  "build": "npm run web:build && npm run api:build"
}
```

## Risks To Watch During Implementation

- Yahoo Finance network failures can make manual verification flaky.
- Adding API dependencies to the root app package could mix frontend and backend concerns; keep backend dependencies in `apps/api/package.json`.
- Angular and API DTO types can diverge; keep names and fields aligned with this spec.
- The current sidebar is hardcoded, so route/menu updates are easy to forget.

## First Implementation Slice

The smallest useful slice is:

1. API package with `/health`, `/api/assets`, and tested simulator function.
2. Angular route and menu entry with a static placeholder page.
3. API `/api/simulate` using Yahoo Finance.
4. Angular form calling `/api/simulate` and rendering metrics.
5. Charts and transaction table.
