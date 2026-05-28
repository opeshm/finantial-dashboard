# AGENTS.md

## Commands
- Use `npm install`; `package-lock.json` is the only lockfile.
- Dev server: `npm run dev` starts both apps: Angular dashboard on port 4310 and API on port 4312.
- Frontend-only dev server: `npm start` or `npm run web:dev` runs Angular on port 4310 with `apps/dashboard/proxy.conf.json`.
- Production build/type/template check: `npm run build` builds Angular and type-checks the API.
- API tests: `npm run api:test`.
- Angular tests: `npm run web:test`. For non-watch verification use `npx ng test --project ng-tailadmin --watch=false`; for a focused spec use `npx ng test --project ng-tailadmin --include='apps/dashboard/src/path/to/file.spec.ts' --watch=false`.
- There is no lint or formatter script configured in `package.json`.

## App Wiring
- This repository uses an `apps/` layout: Angular lives in `apps/dashboard`, Fastify API lives in `apps/api`.
- The Angular 21 standalone application is named `ng-tailadmin`; there are no NgModules.
- Runtime entrypoint is `apps/dashboard/src/main.ts`, which registers Swiper custom elements before `bootstrapApplication(AppComponent, appConfig)`.
- Routes live in `apps/dashboard/src/app/app.routes.ts`; most pages render under `AppLayoutComponent`, while `/signin` and `/signup` are outside that layout.
- If adding a sidebar page, update both `apps/dashboard/src/app/app.routes.ts` and the nav arrays in `apps/dashboard/src/app/shared/layout/app-sidebar/app-sidebar.component.ts`.

## Styling
- Tailwind CSS v4 is configured through `.postcssrc.json` and `apps/dashboard/src/styles.css`; there is no `tailwind.config.*` file.
- Theme tokens, custom breakpoints, dark variant, and shared utilities are defined directly in `apps/dashboard/src/styles.css` via Tailwind v4 `@theme`, `@custom-variant`, and `@utility` blocks.
- Global styles also contain third-party overrides for ApexCharts, FullCalendar, Flatpickr, Swiper, and Prism; check `apps/dashboard/src/styles.css` before adding component-local overrides for those libraries.

## Feature Boundaries
- The legacy compound-interest feature is under `apps/dashboard/src/app/pages/simulations/compound-interest/` and is organized as `domain/`, `application/`, `infrastructure/`, and `presentation/`.
- New finance features should go under `apps/dashboard/src/app/features/`.
- The integrated backend API is under `apps/api/src/`.
- `CompoundInterestComponent` provides `CompoundInterestSimulationService`, `CompoundInterestConfigService`, and maps `CompoundInterestConfigRepository` to `LocalStorageCompoundInterestConfigRepository` locally for the feature.
- Saved compound-interest configurations use browser `localStorage` key `compound-interest-configs`; changing stored shapes may require migration or import/export handling.

## Verification Notes
- `apps/dashboard/tsconfig.json` enables strict TypeScript and strict Angular templates; `npm run build` is the main available static verification.
- No Angular `apps/dashboard/src/**/*.spec.ts` files exist currently, so adding Angular tests may require creating the first Karma specs.
