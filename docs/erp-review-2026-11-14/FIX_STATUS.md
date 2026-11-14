# Remediation record — 14 November 2026

This record supplements the original source-led review. It does not claim every proposed UI redesign or production integration test has been completed.

## Completed

- Created a pre-change worktree and .git archive (excluding generated/dependency/archived folders) at the OS temporary path, with a durable Git-ignored copy at `_archive/recovery/sms-barmer-before-fixes-20261114.tar`.
- Restored missing Git objects from the configured origin using refetch. No reset/rebase/checkout or global safe-directory change. Existing staged and unstaged work remains intact.
- Updated Next.js to npm's available 15.5 maintenance patch 15.5.29, with corresponding lockfile. React 18 retained. Build/type compatibility checked separately.
- API deadlines cover fetch and body consumption; GET/POST can override timeout and cancel via AbortSignal. No automatic write retries.
- Protected API 401 emits a session-recovery event; the shell shows guidance without discarding current drafts. Login/public API failures and 403 are not treated as expired sessions.
- Promotion load errors render retry guidance, not an empty cohort. Bulk actions are not rendered while data is unavailable.
- Failed backend logout preserves the current session/display state and presents an error. Already expired sessions can sign out locally.
- Current user metadata comes from the backend, with an unknown/loading state instead of assumed Administrator. Role-specific phone navigation no longer defaults to admin.
- Browser zoom restriction removed.
- Shared modal/drawer/sign-out behaviour: accessible title relationship, initial focus, keyboard trapping, top-layer Escape, focus restoration and reference-counted scroll lock.
- Primary/accent/focus CSS tokens aligned to the ERP indigo action palette, leaving positive-state green independent.
- Password suggestions use 16 random characters, rejection sampling and a cryptographic shuffle instead of the small word/digit combination; transcription groups preserve the required letter/digit rules.
- Added repeatable regression test and typecheck scripts; updated local/deployment/rollback documentation and frontend environment example.
- Frontend and adjacent backend fee calculator sources currently match after newline normalisation; regression check guards drift.

- Production dependency remediation: DOMPurify/source-map-js updated; unused Zod removed; SheetJS upgraded from the official documented CDN to 0.20.3; PostCSS 8.5.33 is explicitly overridden under Next and validated by npm ls. Final production npm audit reports zero vulnerabilities (point-in-time advisory result, not a security certification).

## Verification

API/session/logout/fee parity and XLS/XLSX Hindi/identifier/amount round-trip tests plus caller-cancellation coverage: nine passing (including strong generated-password validation). Browser DOM effect harness: eleven passing focus, Tab/Shift+Tab, nested Escape/restoration/scroll assertions. This exercises the actual hook effect against browser DOM; it is not a complete real-user screen-reader audit or a full React interaction test.

Final frontend TypeScript and production build passed after all dependency fixes; all 54 pages generated successfully. Production payments, notification delivery and restore drills were not performed.

## Remaining separate work

The review's module-by-module designs are specifications, not code defects that can be fixed by a global rewrite. Planned features, full role/transaction integration checks, production CSRF/configuration review, database recovery procedures, full authenticated visual testing and eventual dead-fallback removal remain explicit follow-up work. They must not be represented as completed merely because typecheck/build succeeds.

No change was pushed or deployed. Do not revert the user's pre-existing staged work when reviewing this change set.

Final smoke check: the Next.js 15.5.29 production server rendered the login screen, and an anonymous dashboard request redirected to /login. School data was unavailable in that screenshot, so the school-name fallback is not treated as real data. The final password-strength enhancement was regression-tested and typechecked after the successful production build.
