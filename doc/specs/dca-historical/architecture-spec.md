# Architecture Spec: DCA Historical Integration

## Target Shape

The integration should make `finantial-dashboard` the owning repository for both UI and API logic.

Recommended structure:

```text
finantial-dashboard/
  apps/
    api/
      package.json
      tsconfig.json
      src/
        server.ts
        market-data/
          yahoo-market-data.provider.ts
          asset-presets.ts
        simulations/
          dca-historical/
            dca-historical.schema.ts
            dca-historical.simulator.ts
            dca-historical.routes.ts
            dca-historical.simulator.spec.ts
    dashboard/
      src/app/
        features/
          dca-historical/
            domain/
              dca-historical.models.ts
            application/
              dca-historical-api.service.ts
            ui/
              dca-historical.component.ts
              dca-historical.component.html
              components/
```

Earlier drafts used a root `api/` folder. The current project shape uses sibling apps under `apps/` so the backend is not nested inside the frontend application.

```text
finantial-dashboard/
  apps/api/
    package.json
    tsconfig.json
    src/
      server.ts
      market-data/
        yahoo-market-data.provider.ts
        asset-presets.ts
      simulations/
        dca-historical/
          dca-historical.schema.ts
          dca-historical.simulator.ts
          dca-historical.routes.ts
          dca-historical.simulator.spec.ts
  apps/dashboard/src/app/
    features/
      dca-historical/
        domain/
          dca-historical.models.ts
        application/
          dca-historical-api.service.ts
        ui/
          dca-historical.component.ts
          dca-historical.component.html
          components/
```

If a single-package setup is preferred later, the root package can orchestrate both apps, but source code should remain separated by app boundary.

## Frontend Boundary

Angular owns:

- Form state.
- User validation before submit.
- Loading and error states.
- Chart formatting.
- Route/menu integration.
- Mapping API DTOs to UI view models when needed.

Angular must not own:

- Yahoo Finance access.
- Historical price cache.
- Server-side validation as the only validation line.
- Simulation rules that must be shared/tested server-side.

## Backend Boundary

API owns:

- Yahoo Finance requests through `yahoo-finance2`.
- Historical price normalization.
- Currency lookup.
- In-memory cache.
- Request validation.
- Simulation execution.
- Consistent error responses.

## Route And Menu

Angular route:

```text
/simulations/dca-historical
```

Sidebar entry:

```text
Simulations
  DCA historico
```

Sidebar pages must update both `apps/dashboard/src/app/app.routes.ts` and `apps/dashboard/src/app/shared/layout/app-sidebar/app-sidebar.component.ts`.

## Data Flow

```text
Angular component
  -> DcaHistoricalApiService
  -> HTTP /api/simulate
  -> API route validation
  -> Yahoo market-data provider
  -> DCA simulator
  -> JSON response
  -> Angular charts and tables
```

## Runtime

Current conflict to resolve:

- Angular dashboard runs on port `4310`.
- FullSimDCA backend currently also runs on port `4310`.

Recommendation:

- Keep Angular on `4310`.
- Run integrated API on `4312` during development.
- Add Angular dev proxy from `/api` to `http://localhost:4312`.

Potential scripts:

```json
{
  "web:dev": "ng serve --project ng-tailadmin --port 4310 --proxy-config apps/dashboard/proxy.conf.json",
  "api:dev": "npm --prefix apps/api run dev",
  "dev": "concurrently -n api,web -c cyan,green \"npm run api:dev\" \"npm run web:dev\""
}
```

## Dependencies

Backend dependencies to migrate from FullSimDCA:

- `fastify`
- `@fastify/cors`
- `yahoo-finance2`
- `zod`
- `tsx`

Frontend dependency changes should be minimal. Do not add Recharts because ApexCharts already exists.

## Testing Strategy

- Put core simulation tests in the API package using Node test runner.
- Keep market-data provider behind a function/class boundary so tests do not hit Yahoo Finance.
- Add Angular tests only if the project starts maintaining component specs; currently no app specs exist.
- Minimum verification for first integration is API tests plus Angular production build.

## Architecture Risks

- Yahoo Finance can fail, throttle, or change payloads.
- In-memory cache is lost on restart.
- Client and server types can drift if duplicated manually.
- Sidebar hardcoded data will become harder to maintain as utilities grow.

## Improvement Recommendations

- Move finance features from `pages/` to `features/` before adding many more utilities.
- Centralize navigation config outside `AppSidebarComponent`.
- Use lazy route loading for finance tools.
- Replace hardcoded FullSimDCA strings with consistent Spanish labels and accents where project policy allows.
