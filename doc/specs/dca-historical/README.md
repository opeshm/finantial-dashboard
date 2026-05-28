# DCA Historical Integration Spec

## Purpose

Integrate the `FullSimDCA` capability into `finantial-dashboard` as a first-class financial utility.

The feature must let users simulate a Dollar Cost Averaging strategy over a real ETF, index, or stock using historical market data. The implementation should migrate the useful backend logic from `FullSimDCA` into this repository instead of depending on a separate project at runtime.

## Source Context

- Source project: `/home/opes/Code/FullSimDCA`
- Target project: `/home/opes/Code/finantial-dashboard`
- Source backend: Fastify, `yahoo-finance2`, Zod, TypeScript
- Source frontend: React/Vite, Recharts
- Target frontend: Angular 21 standalone, Tailwind CSS v4, ApexCharts

## Chosen Direction

Use option 2: migrate the FullSimDCA backend into `finantial-dashboard` as an integrated API package/service.

Do not embed the existing React frontend. Rebuild the user interface as an Angular feature that follows the dashboard visual language and reuses existing shared UI building blocks.

## Spec Files

- `product-spec.md`: user goals, feature scope, and acceptance criteria.
- `architecture-spec.md`: proposed frontend/backend boundaries and folder structure.
- `api-contract.md`: HTTP API contracts for assets, history, and simulation.
- `domain-spec.md`: domain model, simulation rules, and metric definitions.
- `implementation-plan.md`: incremental work plan and verification strategy.

## Definition Of Ready

- API location and runtime command are decided. Current API location: `apps/api`.
- Route and sidebar labels are agreed.
- External market data source remains Yahoo Finance through `yahoo-finance2` unless explicitly changed.
- The first version can use in-memory cache only.

## Definition Of Done

- Dashboard has a menu entry under `Simulations`.
- New Angular page is reachable at `/simulations/dca-historical`.
- API serves assets and simulation results from this repository.
- Historical DCA simulation matches the existing FullSimDCA backend behavior for equivalent inputs.
- `npm run build` passes for the Angular app.
- Backend simulation unit tests cover scheduling, trading-day fallback, metrics, and empty-data errors.
