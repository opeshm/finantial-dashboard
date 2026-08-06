# AGENTS.md

## Overview & Architecture
This project is a monorepo for a **Financial Dashboard** application.
- **Frontend App**: Angular 21 standalone SPA located at `apps/dashboard` (named `ng-tailadmin`).
- **Backend API**: Fastify 5 REST API located at `apps/api` (TypeScript, PostgreSQL, Zod, `yahoo-finance2`).
- **MCP Servers**: Local project MCP configuration lives in `.gemini/mcp.json` (`codebase-memory-mcp`, `angular-cli`, `postgres`, `netlify`).

## Code Discovery & Tooling Rules
- **Prefer Codebase Memory MCP**: Use `codebase-memory-mcp` tools (`search_graph`, `trace_path`, `get_code_snippet`, `query_graph`, `search_code`) over `grep`/`file-search` for symbol lookups and dependency tracing across frontend and backend.
- **PostgreSQL MCP**: Use the `postgres` MCP server to inspect database schemas, verify SQL queries, and audit financial transaction models.
- **Angular CLI MCP**: Use `angular-cli` MCP tools for Angular best practices, Zoneless/OnPush migration, and modern template control flow guidance.

## Commands
- **Install Dependencies**: Use `npm install` (root `package-lock.json` is the single source of truth).
- **Full Dev Server**: `npm run dev` starts both API (port `4312`) and Angular frontend (port `4310`) concurrently.
- **API Dev Server**: `npm run api:dev` starts Fastify API on port `4312` with auto-reload.
- **Frontend Dev Server**: `npm start` or `npm run web:dev` starts Angular on port `4310` using `apps/dashboard/proxy.conf.json`.
- **Production Build & Type Check**: `npm run build` (builds Angular SPA and type-checks Fastify API).
- **API Tests**: `npm run api:test`.
- **Angular Tests**: `npm run web:test`.
  - Non-watch run: `npx ng test --project ng-tailadmin --watch=false`.
  - Focused spec run: `npx ng test --project ng-tailadmin --include='apps/dashboard/src/path/to/file.spec.ts' --watch=false`.

## App Wiring & Navigation
- **Frontend Entrypoint**: `apps/dashboard/src/main.ts` registers Swiper custom elements before calling `bootstrapApplication(AppComponent, appConfig)`.
- **Routing**: Main routes live in `apps/dashboard/src/app/app.routes.ts`. Most pages render inside `AppLayoutComponent` (except standalone pages like `/signin` and `/signup`).
- **Adding Nav Pages**: When adding a new page to the sidebar, update both `apps/dashboard/src/app/app.routes.ts` and the navigation arrays in `apps/dashboard/src/app/shared/layout/app-sidebar/app-sidebar.component.ts`.

## Angular & Frontend Coding Standards
- **Modern Angular 21**:
  - Use **Standalone Components** exclusively (no `NgModules`).
  - Prefer **Signals** (`signal()`, `computed()`, `effect()`) for state management over manual RxJS subscriptions where appropriate.
  - Use modern **Control Flow** syntax (`@if`, `@for`, `@switch`) instead of legacy structural directives (`*ngIf`, `*ngFor`).
  - Use `inject()` function for dependency injection instead of constructor parameter injection.
  - Apply `OnPush` change detection strategy where possible.
- **Feature Structure**:
  - Legacy simulations live under `apps/dashboard/src/app/pages/simulations/compound-interest/` using Clean Architecture layers (`domain/`, `application/`, `infrastructure/`, `presentation/`).
  - New financial features (e.g., `dca-historical`) must be placed under `apps/dashboard/src/app/features/`.
- **LocalStorage State**:
  - Compound interest configurations use `localStorage` key `compound-interest-configs`. Handle schema migrations carefully if modifying stored shapes.

## Styling & Theme Tokens
- **Tailwind CSS v4**: Configured via `.postcssrc.json` and `apps/dashboard/src/styles.css` (no `tailwind.config.*` file).
- **Custom Tokens**: Theme tokens, custom breakpoints, dark variants, and shared utilities are defined directly in `apps/dashboard/src/styles.css` using `@theme`, `@custom-variant`, and `@utility` directives.
- **Third-Party Styling**: Global styles contain custom overrides for ApexCharts, FullCalendar, Flatpickr, Swiper, and Prism. Check `apps/dashboard/src/styles.css` before adding local component overrides.

## Backend & API Development (`apps/api`)
- **Framework & Validation**: Built with Fastify 5 and Zod schema validation.
- **Database Access**: Uses `pg` driver to connect to PostgreSQL.
- **Market Data**: Integrates `yahoo-finance2` for real-time stock/ETF prices and historical DCA inputs.
- **Environment Variables**: Managed via `.env` file in `apps/api/`.

## Verification & Quality Notes
- `apps/dashboard/tsconfig.json` enables strict TypeScript and strict Angular template checking. Always run `npm run build` to verify type safety.
