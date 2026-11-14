# SchoolDesk ERP

School-office frontend (Next.js/React), backed by the separate SMS Barmer Express service. The public school website and office ERP share this repository. Parent/staff apps are separate projects.

## Local setup

Use a currently supported Node.js LTS release (Node 22 matches the adjacent backend).

1. Run `npm ci`.
2. Copy `.env.example` to `.env.local` and configure the backend origin.
3. Start the backend separately on its configured port.
4. Run `npm run dev` and open the URL printed by Next.js.

Prefer same-origin API forwarding: set `BACKEND_URL=http://localhost:4000` and leave `NEXT_PUBLIC_API_URL` empty. The browser calls `/api/*`; Next forwards those requests to Express. The Express API owns signed httpOnly sessions, authorization, database writes and provider integrations. Browser-local role/name data is never authorization.

For a deliberately separate browser API origin, set `NEXT_PUBLIC_API_URL` and configure backend CORS/cookie attributes accordingly. Public environment variables are embedded in the client bundle: never put service-role keys or signing secrets in `NEXT_PUBLIC_*` variables.

## Verification

- `npm test`: API/session/logout regression tests and fee-calculator source parity when the adjacent `../sms backend` checkout exists. The parity test explicitly skips otherwise.
- `npm run typecheck`: TypeScript without emitting or changing build cache.
- `npm run build`: production compilation and route generation.
- `npm run start`: serve a completed production build.

Use `NEXT_DIST_DIR=.next-build` for an isolated production build while development runs. Build output is not a source backup. Financial workflows still need an isolated test backend and transactional tests; the mock-fetch tests never send payments or messages.

## Runtime contracts

API requests default to a 30-second deadline and do not retry writes automatically. GET requests and POST requests accept optional timeout/signal settings. A timeout does not prove a payment or write failed: check its server record before retrying. Protected API 401 responses display session-recovery guidance; 403 remains a permission error. Sign-out is reported as successful only after the server accepts it or confirms the session is already expired.

`lib/feeEngine.ts` is the browser preview calculator. The adjacent backend copy remains authoritative for ledger writes; keep the parity test passing when either changes. Local/demo fallback branches in older services are inactive under `usingRemoteBackend = true`; do not enable them as automatic production recovery.

## Deployment and rollback

Build with the intended production API configuration; leave `NEXT_PUBLIC_API_URL` empty when using the first-party rewrite. Configure BACKEND_URL on the frontend host and verify backend session cookie/proxy settings. Test login, forbidden roles, fee preview, a sandbox transaction, receipt printing, upload and session expiry before promoting a release. Roll back by redeploying a known verified build; do not undo database migrations blindly.

The frontend does not back up school data. Database backups, restore drills, migrations and notification credentials belong to backend/database operations. Document those procedures in the backend runbook and test a restore outside production before treating recovery as proven.

## Availability and design

`components/layout/navConfig.ts` defines office navigation; `docs/mobile-ui.md` defines phone layouts. Use indigo primary actions, Jade positive states and written status labels. Unbuilt routes render ComingSoon rather than invented data. Their availability is listed in the review report; do not advertise those routes as completed workflows.

Review and remediation records: `docs/erp-review-2026-11-14/`.

## Repository recovery

On 14 November 2026 this checkout had missing Git objects. A worktree/.git archive was created in the OS temporary directory before repair. Refetching from the existing origin restored reachable objects without resetting the index or worktree. Existing staged work was preserved. A dangling commit is not itself corruption. Keep a separate durable source backup; temporary archives are not long-term backups.
