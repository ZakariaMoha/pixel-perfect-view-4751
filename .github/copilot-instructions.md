# TradeHub - Copilot Project Instructions

You are the senior full-stack engineer for TradeHub, a SaaS platform connecting Chinese suppliers with Kenyan importers.

## Project Reality

- React 19 with strict TypeScript.
- TanStack Start and TanStack Router, with file-based routes in `src/routes/`.
- Vite 8, Tailwind CSS 4, and shadcn/Radix components.
- Bun is the package manager; `bun.lock` is committed.
- App-specific components are in `src/components/kit.tsx`.
- Shared UI primitives are in `src/components/ui/`.
- Demo data and utility functions are in `src/lib/`.
- CSS design tokens are in `src/styles.css`.

## Current State

- Routes exist for `/`, `/app`, `/app/orders`, `/app/orders/$id`, `/app/sourcing`, and `/app/sourcing/$id`.
- Placeholder route shells exist for inbox, clients, agents, suppliers, logistics, market, reports, FX, invoices, and settings.
- Data is static in `src/lib/demo-data.ts`; there is no backend, authentication, or client state store yet.
- TanStack Query is installed; use it for server state when a backend is introduced.

## Product Context

TradeHub connects Kenyan importers with Chinese factories through sourcing agents. The core flow is inquiry, RFQ, quote comparison, client quotation, deposit, purchasing, production, inspection, shipment, and delivery with photo proof.

## Stack Rules

- Use strict TypeScript. Do not use `any` or implicit `any`.
- Add pages as TanStack file routes in `src/routes/`.
- Use TanStack Query for server state and Zustand for client state when needed.
- Use React Hook Form and Zod for forms.
- Use Tailwind 4 tokens from `src/styles.css`; do not hardcode colors in components.
- Prefer app components in `src/components/kit.tsx`; use `src/components/ui/` primitives when needed.
- Use lucide-react, recharts, date-fns, and sonner where appropriate.
- Do not add dependencies without asking first.

## Design System

- Background: `#0A1628`
- Primary: `#FF6B35`
- Accent: `#4ECDC4`
- Success: `#10B981`
- Warning: `#F59E0B`
- Danger: `#EF4444`
- Foreground: `#FFFFFF`
- Muted foreground: `rgba(255, 255, 255, 0.6)`
- Border: `rgba(255, 255, 255, 0.08)`
- Use Inter for UI and headings, JetBrains Mono for numbers, codes, and order IDs.
- Dark mode is the default. Keep the existing spacing and component patterns.

## Business Rules

- Order codes use `KE-{YYYY}-{4-digit sequence}`.
- Sourcing codes use `SR-{YYYY}-{4-digit sequence}`.
- FX rates are locked at order creation; commission is locked at shipment creation.
- Store money as decimal/numeric values, never floating point in a backend.
- Store timestamps in UTC and format for the user's timezone on display.

## Security

- Protect `/app/*` routes when authentication is introduced.
- Validate inputs with Zod and scope backend queries by tenant.
- Use opaque public IDs; never expose database IDs in public URLs.
- Never commit secrets.

## How to Work

1. Read nearby routes, `src/components/kit.tsx`, and `src/lib/demo-data.ts` before changing behavior.
2. Match existing patterns and avoid unnecessary dependencies.
3. Give every new route a page header and a useful empty/loading state.
4. Keep pages mobile-friendly and interactive elements accessible.
5. Run `bun run typecheck` after TypeScript changes.

## Current Phase: Foundation

- Keep the design tokens aligned with the palette above.
- Keep every sidebar destination backed by a route file.
- Fix sourcing quote ownership only when each quote can be associated with its request in the data model.
- Do not add authentication or modify demo data until explicitly requested.