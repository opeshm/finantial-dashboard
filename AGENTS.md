# AGENTS.md

## Commands
- Use `npm install`; `package-lock.json` is the only lockfile.
- Dev server: `npm start` runs `ng serve --port 4310`, not Angular's default 4200.
- Production build/type/template check: `npm run build`.
- Tests: `npm test` runs Angular Karma. For non-watch verification use `npx ng test --watch=false`; for a focused spec use `npx ng test --include='src/path/to/file.spec.ts' --watch=false`.
- There is no lint or formatter script configured in `package.json`.

## App Wiring
- This is a single Angular 21 standalone application named `ng-tailadmin`; there are no NgModules or workspace packages.
- Runtime entrypoint is `src/main.ts`, which registers Swiper custom elements before `bootstrapApplication(AppComponent, appConfig)`.
- Routes live in `src/app/app.routes.ts`; most pages render under `AppLayoutComponent`, while `/signin` and `/signup` are outside that layout.
- If adding a sidebar page, update both `src/app/app.routes.ts` and the nav arrays in `src/app/shared/layout/app-sidebar/app-sidebar.component.ts`.

## Styling
- Tailwind CSS v4 is configured through `.postcssrc.json` and `src/styles.css`; there is no `tailwind.config.*` file.
- Theme tokens, custom breakpoints, dark variant, and shared utilities are defined directly in `src/styles.css` via Tailwind v4 `@theme`, `@custom-variant`, and `@utility` blocks.
- Global styles also contain third-party overrides for ApexCharts, FullCalendar, Flatpickr, Swiper, and Prism; check `src/styles.css` before adding component-local overrides for those libraries.

## Feature Boundaries
- The custom finance feature is under `src/app/pages/simulations/compound-interest/` and is organized as `domain/`, `application/`, `infrastructure/`, and `presentation/`.
- `CompoundInterestComponent` provides `CompoundInterestSimulationService`, `CompoundInterestConfigService`, and maps `CompoundInterestConfigRepository` to `LocalStorageCompoundInterestConfigRepository` locally for the feature.
- Saved compound-interest configurations use browser `localStorage` key `compound-interest-configs`; changing stored shapes may require migration or import/export handling.

## Verification Notes
- `tsconfig.json` enables strict TypeScript and strict Angular templates; a production `npm run build` is the main available static verification.
- No `src/**/*.spec.ts` files exist currently, so adding tests may require creating the first Karma specs.
