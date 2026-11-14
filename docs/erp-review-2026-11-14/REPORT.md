# SMS BARMER ERP — Repository, System and UI Review

14 November 2026. Scope: F:/folders of web/SMS BARMER, plus targeted reads of the adjacent Express backend. Review only; no application fixes, deployment or Git repair performed.

## Executive assessment

This is a substantial school-operations application, not merely a dashboard template. Its strongest features are task-based navigation, shared drawers/receipts, explicit backend separation and a genuine manual-payment reconciliation workflow. Its immediate priorities are repository integrity, dependency maintenance, truthful failure states and a consistent interface system. A cosmetic redesign should follow those priorities, not obscure them.

This report is a source-led review. It inventories the route tree and examines selected critical workflows and shared infrastructure. It is NOT a claim that every authenticated screen was visually tested or every backend endpoint was penetration-tested. Authenticated rendered review, production-like financial transactions, full backend authorization coverage and accessibility testing remain open verification work. No invented usability scores or conversion improvements are assigned.

## Findings ordered by consequence

### R1 — High: local Git object database is damaged

Evidence: `git status --short` fails with `unable to read tree (0c63c926ad1e14135d9d55be740ede2d7410e3d7)`. `git fsck --no-reflogs` reports missing commits, trees and blobs, broken links, and invalid cache-tree pointers. Dangling objects alone are not the problem; missing reachable objects and unreadable trees are.

Impact: status/diff/history cannot be trusted to describe local changes completely. Ordinary commit, checkout or rollback operations may fail. This finding does not establish that application files or the remote repository are corrupt.

Fix sequence: preserve a complete copy of the current worktree and existing .git first; inspect the remote in a separate fresh clone; compare files including untracked work; recover missing objects if available; migrate verified edits into the healthy clone. Do not reset, prune, garbage-collect or replace .git as a first action. Recovery is separate authorised work.

Acceptance: fresh clone history passes fsck; local changes are accounted for; status/diff work; remote integrity is checked independently.

### R2 — High: Next.js is behind published security patches

Evidence: `package.json` pins Next.js 14.2.15. The official December 2025 advisory lists 14.2.35 as the fix for the 14.x App Router denial-of-service issue. The middleware bypass postmortem lists 14.2.25 as its 14.x patch. Actual exposure depends on deployment/runtime; backend authorization is a separate boundary.

Do not claim this React 18/Next 14 stable application is affected by every React2Shell advisory: version ranges matter. Upgrade to an appropriately supported, currently patched release after checking current advisories and framework compatibility; 14.2.35 is historical advisory evidence, not a promise it is the latest safe release in November 2026.

Validate authentication redirects, API rewrite, production build, documents/printing and all critical workflows after upgrading. Do not auto-run a forceful dependency fix.

Sources: https://nextjs.org/blog/security-update-2025-12-11 and https://vercel.com/blog/postmortem-on-next-js-middleware-bypass

### R3 — Medium: client colour systems disagree

Evidence: `tailwind.config.ts` defines `brand: indigo`, while `app/globals.css` still defines green `--primary` and green `--accent`. Configuration comments continue describing Jade as brand. Components using brand utilities and components using primary tokens can present different primary-action colours.

Fix: one semantic map. Indigo #3446D1 for primary ERP actions, darker indigo for hover, Jade only for positive state, rose for error/destructive state, muted amber for real waiting/warnings. Retain the dark sidebar if its contrast and active states pass. Public school marketing may retain its own blue/marigold world; its purpose differs from office operations.

Acceptance: equivalent actions have equivalent colours across buttons, Radix-style controls, focus, tabs and menus. Status remains written, not colour-only. Document exceptions rather than adding inline colours per module.

### R4 — Medium: network operations have no shared time limit or session-expiry handling

Evidence: `lib/apiClient.ts` calls fetch without a default AbortController deadline; responses are normalised, but 401/403 are not handled centrally. The API returns structured errors rather than throwing, which is useful when callers consume them correctly.

Impact: slow/offline work may keep individual screens waiting, and expired sessions can appear as unrelated errors in multiple sections. Do not blindly retry POST requests.

Fix: configurable read/write deadlines, cancellation for obsolete searches, explicit session-expiry recovery, and per-action retry policy. Preserve unsaved form state where appropriate. Distinguish forbidden access from expired sign-in.

### R5 — Medium: student promotion can turn loading failure into an empty cohort

Evidence: `app/students/promote/page.tsx` loads `studentService.fetchStudents()` and immediately calls `setStudents(res.data.filter(...))`, ignoring `res.error`. The service's backend failure contract is `data: [], isLive: false, error: ...`.

Impact: a failed request may appear to be no active students instead of a recoverable failure. In an end-of-session bulk workflow that is consequential misinformation.

Fix: explicit loading/error/empty states before presenting cohort actions; disable promotion until verified data is loaded; retain failed-row results after partial completion. Add a final preview of source session, destination, selected students and decisions.

### R6 — Medium: accessible zoom is explicitly disabled

Evidence: `app/layout.tsx` sets `maximumScale: 1` and `userScalable: false` with a native-app analogy. A PWA or web ERP still needs readable zoom and text-resizing support. Native resemblance is not a reason to prevent magnification.

Fix: permit zoom and test text scaling, 320px reflow, wide data grids, sticky controls and keyboard-open forms. Sticky student/subject columns are appropriate where a grid is genuinely required.

### R7 — Medium: shared dialog mechanics are incomplete

Evidence: `components/ui/SideDrawer.tsx` handles Escape and a portal, but the inspected implementation has no focus trap, initial focus or focus restoration, and its dialog is not linked to the visible title. `components/ui/modal.tsx` has a similar naming/focus gap; its cleanup sets body overflow to unset rather than restoring the previous value. Nested modal behaviour requires testing.

Fix: consolidate accessible dialog behaviour; label by heading ID, contain focus, restore focus, coordinate nested Escape and scroll locking, and protect dirty forms. Prefer shared primitives over repeated per-page fixes.

### R8 — Medium: logout UI can imply success after a failed server logout

Evidence: `authService.logout()` awaits `api.post` but ignores its `ok` result. `SignOutDialog` then clears display state and routes to login. Since the session cookie is httpOnly, the client cannot prove it was cleared when the server request fails.

Fix: return a logout result; explain/retry server failure rather than silently equating local display cleanup with session termination. Check back-button/private-cache behaviour after actual logout.

### R9 — Medium: admin identity is the default display state

Evidence: `useCurrentUser.ts` starts as Administrator and falls back to admin when localStorage lacks a role. `MobileTabBar` also defaults to admin. `fees/online/page.tsx` uses the display role to expose admin settings controls.

This is not proof of server privilege escalation: the backend has real role middleware. It is a misleading/over-permissive UI default. Use an unknown/loading identity until authenticated metadata arrives; frontend role values only control presentation. Verify backend enforcement on every sensitive read/write.

### R10 — Medium: duplicated fee calculation requires parity protection

Evidence: `lib/feeEngine.ts` explicitly says it is copied from the backend and must remain in sync. The backend is authoritative for ledger writes; the frontend calculates previews.

Fix: share a versioned calculation package or establish cross-repo parity fixtures for fee heads, concessions, grace days, fine caps, partial payment, excess credit, transport and rounding. Confirm the server recalculates instead of trusting client totals. No such cross-repo test was run here.

### R11 — Low/medium: production path coexists with obsolete data paths

Evidence: `usingRemoteBackend = true` in `apiClient.ts`; `studentService.ts` still contains Supabase and mock fallback branches. Those branches are currently unreachable through that constant. Do not falsely describe them as active production mock fallback.

Impact: maintainers have to reason about three competing data stories; comments reference a Next API transition even though API routing moved out. Extract domain types from `data/mockData` and remove/decommission dead paths after confirming intended demos. Demo mode must be an explicit build/runtime configuration, never an automatic response to school-data failure.

### R12 — Low/medium: credential suggestions use Math.random

Evidence: `lib/services/userService.ts` builds passwords from a small fixed word list and four-digit number using Math.random. This is inappropriate for secure generated credentials even if a server later hashes them.

Fix: cryptographic random generation, mandatory first-use change/expiry according to policy, and server-side validation. Never print credentials in logs or exports. This review did not assess the entropy requirements of deployed authentication or any compromised account.

### R13 — Delivery gap: application completeness and operational docs

Evidence: ComingSoon pages exist for calendar, birthdays, attendance/today, staff allocation, templates, settings/data, reports, copy-check and syllabus. This is more honest than fake data, but a long visible navigation can still imply production completeness. Some adjacent backend capabilities already exist while the ERP page is a placeholder.

README is only a project heading. Package scripts cover dev/build/start/lint but not tests. No project-owned test/spec files were found in the scoped file search; no CI conclusion is inferred solely from this scan.

Fix: publish a capability matrix: available, limited, planned. Keep unavailable actions out of the everyday task path or clearly labelled. Document local setup, backend origin/rewrite/cookies, session rules, database migrations, backups/restore, deployment and rollback.

## Authorization and backend boundary

Targeted backend reads found `requireAuth` and `requireRole`, including admin-only user management and admin/accountant-only fee claims. `src/routes/feeClaims.ts` distinguishes pending/verified/rejected; verification creates a transaction and attempts a notification separately. This is a sound business distinction.

The frontend middleware only checks cookie presence, by design. It is a navigation convenience, not the authorization boundary. Do not label it independently exploitable data access without an endpoint test. Production cookies are httpOnly and use SameSite=None in the inspected backend; inspect Secure, allowed-origin/CSRF enforcement and proxy configuration together. CORS allowlisting alone is not a full CSRF argument. No active CSRF exploit or complete mitigation audit was performed.

Required role matrix: admin, accountant, teacher, exam cell, parent, student. Test allowed and forbidden access to fees, payroll, student documents, user management, marks publication, WhatsApp and exports. Parent/student sessions must not become staff access by changing browser metadata. The backend inspected explicitly rejects them at the staff-auth boundary, but full route coverage remains unverified.

## UI direction: professional operations, not a copied parent app

The ERP is for repetitive school-office work. The parent app prioritises glanceable personal information; ERP users need dense comparison, accurate selection, fast entry and traceability. Reuse appropriate brand relationships, not the parent's photograph/hero layout.

Keep Plus Jakarta Sans for operational UI and tabular digits for money/counts. Use Fraunces only on the public website or intentional document headings. Use monospace only for actual identifiers/code where it helps. Preserve existing mobile rules in `docs/mobile-ui.md`; they already encode sensible stacked rows, sticky comparison columns and usable touch targets.

Proposed internal scale: 24–26px page heading on desktop, 21–22px on phones; 16px section heading; 14–15px body/table rows; 12–13px metadata. Inputs remain 16px on phones. Default 24px section spacing, 12–16px related spacing; 12–14px corners. Dense desktop tables should not inherit oversized consumer-app cards.

Use colour for action, selection and states. No gradient text, glass panels, decorative glow, generic achievement cards, invented school statistics, irrelevant sparkline decoration or a separate palette for every module. Charts must answer a stated comparison question, show units/date range, and provide numeric labels. Good empty states explain the next valid action; errors must not resemble zero activity.

For complex applications, meaningful controls and clear representations matter more than extra graphic decoration: https://www.nngroup.com/articles/complex-application-design/

## Module-by-module design and workflow contract

| Module | Recommended interface | Required operational checks |
|---|---|---|
| Dashboard | A few actionable summaries, explicit period and last update; unresolved work first | No zeros for failed requests; precise totals accessible behind lakh/crore abbreviations; respect role visibility |
| Students | Search/filter/results, stable selection, detail drawer; one primary admission action | Clear selection scope across pages; duplicate detection; failed import rows downloadable; errors retain form input |
| Admission/enquiries | Staged form with progress through real required fields, not decorative steps | Draft recovery, relation/contact validation, class capacity and duplicate identifiers; migration error cannot claim full save |
| Promotion/transfer | Cohort preview and review table | Source/destination session, detain/left decisions, per-row results, concurrency conflict and audit record |
| Student documents/photos | Compact status register and upload queue | File size/type, failed retries, missing files and actual upload state; no fake completeness |
| Certificates/ID cards | Template preview, identity check, issue register and explicit print action | School facts, numbering, cancellation/reissue, actual PDF/print margins; no unofficial content presented as authorised |
| Fee counter | Student identity left, payable breakdown and entry centre, receipt result after server commit | Idempotency, double-click/retry, partial allocation, fine waiver reasons, tender/change and cancellation permissions |
| Online payments | Pending queue, bank-reference comparison and verify/reject review | Never treat parent claim as collected money; duplicate UTR checks and server transaction atomicity; failed WhatsApp is not failed receipt |
| Dues/reminders | Filterable arrears list with amount/date and preview recipients | Missing-data error is not no dues; preview cost/phone validity; delivery state differs from queued state |
| Receipts/reports | Ledger-style register, period totals and export scope | Cancelled receipts remain visible as cancelled; reconcile per-mode totals, refunds and date cutoffs |
| Fee setup | Versioned fee-head/instalment editor with preview | Show impact on existing ledgers before save; preserve valid historic transactions; cross-engine parity tests |
| Attendance | Fast section roster, explicit mark state, submission summary | Unmarked is not absent; correction reason; correct India date; two teachers cannot overwrite silently |
| Register/leave | Date/class filters and actual comparison grid; request inbox | Sticky identifying column, text alternatives to colour, pending/approved separation and partial-load errors |
| Messages | Composer, recipient preview, delivery history | Consent/channel rules, duplicate suppression, retry semantics, cost before send; actual external sending requires intentional action |
| Meetings/chats | Time-slot workflow and threaded conversations | Confirmed versus requested, conflicts, unread/send failures, teacher/parent boundaries and timezone |
| Exams/marks | Keyboard-friendly subject/student matrix | Preserve unsaved marks; explicit absent/not-entered/zero; maximums; conflict protection; lock/publish separation |
| Report cards | Validation list before publication and official document preview | School-approved grade rules, missing subjects, print pagination, published-version identity |
| Timetable/homework | Section/day timeline and assignment diary | Teacher/class context, timetable collisions, actual due dates, attachment failures and release visibility |
| Staff/payroll | Directory and period-based payroll register | Restricted salary access; draft/approved/paid states; adjustments explained; exports restricted and audited |
| Transport | Route/stop assignment register, capacity and unassigned students | Route versions, effective dates, driver contact; live GPS freshness separate from pupil boarding evidence |
| School/settings/classes | Grouped settings with save scope and dependency warnings | Session changes, class mapping, deployment config and irreversible changes clearly separated |
| Users/roles | Role description, explicit permissions and account status | Server enforcement, no default admin assumptions, credential handling and account revocation |
| WhatsApp/settings | Connection health, account identity and delivery policy | Sensitive account actions restricted; real queued/sent/failed statuses; no token/session material in UI logs |
| Planned reports/calendar | Honest availability and explanation | Do not render success metrics or usable action affordances for missing features |

## Repository structure and maintainability

Keep app routes thin, components grouped by workflow and services responsible for API contracts. Domain types should live independently of mock data. Separate client and server imports explicitly. Consolidate date/money/error helpers rather than repeated browser-local implementations.

Move legacy migration code out of active service logic once decommissioned. Keep a single navigation/capability registry, with role-aware discoverability and actual route availability. Keep the existing redirect map under regression checks; it represents real legacy entry points rather than disposable clutter.

The `feeEngine` split needs a clearly owned source of truth. Avoid duplicated school configuration across frontend defaults, SQL and backend code without versioned migrations. Document configuration and service contracts before adding more dashboards.

Do not rewrite the entire ERP into a new framework merely to improve appearance. Shared tokens, accessible dialog primitives, proper error contracts and a small number of task-specific layouts will produce greater consistency with lower regression risk.

## Verification results and explicit gaps

- Frontend `tsc --noEmit --incremental false`: exit 0.
- Git status: failed; Git fsck: missing objects and broken links confirmed.
- Route inventory: saved alongside this report; it does not prove each route is functionally complete.
- Source findings: directly inspected files named above; targeted backend middleware/entry/fee-claim routes reviewed.
- Production build, configured ESLint run, dependency audit and transactional test suite: not completed in this pass. TypeScript success is not a replacement for these checks.
- Authenticated pixel-level desktop/mobile review: not completed. Do not treat the module recommendations as screenshot-certified visual findings.
- Server financial integrity, database constraints/RLS, restore drills, all authorization routes and external-provider failures: require dedicated integration verification.

## Recommended implementation order

1. Preserve the worktree and recover repository health in a separate healthy checkout.
2. Establish a patched dependency baseline and repeat build/type checks.
3. Fix network timeout/session handling, promotion error presentation and logout-result handling.
4. Consolidate semantic colours and accessible dialog/zoom behaviour.
5. Verify fee-engine parity, receipt idempotency and online-payment reconciliation end to end.
6. Roll out task-specific UI improvements: fee counter/students/attendance first; marks, payroll, transport and communication next.
7. Complete planned-feature visibility, operational documentation, restore procedure and regression checks.

Release evidence should include admin/accountant/teacher/exam-cell sessions; 1440px desktop and 390/360px phone screenshots; keyboard-only entry; resized text; failed/delayed API states; unsaved data; double submission; session expiry; cross-role denial; actual school-approved document output.

Suggested regression fixtures: fine grace day/cap, concession rounding, transport change, overpayment, duplicate UTR, cancellation, mixed partial bulk failures, concurrent marks edits, absent versus zero, class/session transitions, failed document upload and failed notification after successful transaction.

## Conclusion

The right direction is an operationally trustworthy ERP with a deliberate shared visual language. Repo corruption and published patch gaps take priority over polish. Keep the existing task structure, strengthen its error/permission/data contracts, then align its components. A full production-readiness sign-off must wait for the explicitly listed live and integration checks.
