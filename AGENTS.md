# Repository Guidelines

## Project Structure & Module Organization
- `app/`: React Router app code — `routes/`, `components/`, `services/`, `state/`, `utils/`, `data/`. Example: `app/components/buttons/ClearCacheButton.tsx`.
- `workers/`: Cloudflare Worker entry (`workers/app.ts`).
- `api/`: Shared service/mapping code (e.g., `api/service/clientPdfService2.0.ts`).
- `public/`: Static assets. `docs/` and `documentation*/`: design notes and reports.
- Tests: unit/spec files under `app/tests` (e.g., `app/tests/sections/Section13StateMachine.test.ts`) and ad‑hoc Playwright scripts at repo root (`test-section9.mjs`).

## Build, Test, and Development Commands
- `npm run dev`: Start the React Router dev server (Vite).
- `npm run build`: Production build.
- `npm run preview`: Serve the built app locally.
- `npm run typecheck`: Cloudflare typegen + React Router typegen + `tsc -b`.
- `npm run section13:test` / `npm run test:section13`: Run unit tests with Vitest.
- E2E: `node test-section9.mjs` (ensure dev server is running; update URL/port inside the script if needed).
- Deploy: `npm run deploy` (build + `wrangler deploy`).

## Coding Style & Naming Conventions
- TypeScript + React 19; 2-space indentation; semicolons required; single quotes or consistent quoting.
- Components and route modules in PascalCase (`StartForm.tsx`, `LoadingSpinner.tsx`).
- Variables/functions in camelCase; types/interfaces in PascalCase (suffix with `Props`, `Service`, etc.).
- Prefer named exports; colocate small helpers next to usage; keep files focused.

## Testing Guidelines
- Unit: Vitest. Name tests `*.test.ts`/`*.test.tsx` (e.g., `SectionContextFactory.test.tsx`). Place beside code or under `app/tests`.
- E2E: Playwright scripts `test-*.mjs` in repo root. Run against local dev; scripts save screenshots to repo root.
- Target high-value coverage for `app/services/*` mappers and validation.

## Commit & Pull Request Guidelines
- History is mixed; adopt Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `test:`.
- PRs: include a clear description, linked issues, screenshots for UI changes, and reproduction steps for bug fixes. Keep diffs scoped; update docs when behavior changes.

## Security & Configuration Tips
- Cloudflare: configure env/bindings in `wrangler.jsonc`. Do not commit secrets; use Wrangler secrets or CI variables.
- Local ports: Vite defaults to 5173; some scripts reference 5177 — adjust the script URL if your dev port differs.
