> Later refinement: primary operational button fills now use evergreen across the product family; see [latest action-colour report](../action-colour-2026-11-15/REPORT.md). This report/gallery retains the earlier UI-system stage as evidence.

# Staff ERP design system - implemented

15 November2026. Research-based refinement is now applied to staff-app ERP mode, with additional report-based teacher task improvements requested by the user. The user resumed implementation after the research-first pause. No commit, push or deployment performed.

## What changed

- Scoped mineral canvas #ECEEEB, white working surfaces, navy #0D2A5E brand/action/focus, consistent ink and secondary roles. Existing teacher personal and driver identities remain separate.
- ERP home: one navy greeting masthead, quiet solid illustrated shortcuts, white continuous Today register. Approved art, typography, destinations and actual figures retained; repeated shortcut entrances removed in ERP mode only.
- Task screens: white header with navy title,16px side gutters,20px task top, consistent field/button corners,16px field text, readable persistent labels and deliberate summary grids. Registers, forms and conversations keep their own composition.
- React appearance context carries the ERP scope through Sheet and StickyBar portals. SideMenu retains ERP appearance independently of DOM ancestry. Bottom navigation and64px safe-area geometry preserved.
- Focused page corrections cover attendance/copy-check/marks action sizes and labels, homework/syllabus/timetable chips, message composer controls, record/admission upload/actions, narrow payroll adjustments, birthdays/calendar controls and report chart-label contrast.16ERP route source files have local refinements; other routes inherit shared primitives where applicable. This is not a claim all64pages were individually rewritten.
- Meaningful attendance/payment/chart categories and official print layouts were retained. Staff DESIGN.md records scoped rules and exceptions. Backend contracts/records were not changed by this design pass.
-28generated desktop workflow equivalents were synchronized, with56shared dependencies. Desktop's approved homepage and existing visual frame were preserved.

## Research traceability

[Research specification](RESEARCH.md) describes the role palette, type/spacing/sizing scale, screen families, state requirements and external primary sources. [Source inventory](route-audit.md) covers64ERP directory page files (62non-redirect,2redirect), plus active home separately. [Research route map](research-route-matrix.md) gives the intended treatment by task.

Those inventories were written before implementation and retain historical checkpoint language. This report is the current implementation/verification authority. Fonts remain Plus Jakarta Sans and Noto Sans Devanagari; no generic font-detector warning overrode the approved identity.

## Verification

-18web regression/parity tests pass; generated workflow/catalog check reports no drift.
-Desktop production build passed. Staff actual static-export production build passed in an isolated same-drive source snapshot, demo disabled. Final CSS label correction was included in a second successful static export. A final comparison then detected concurrent WebP asset-reference updates in ErpHome, StaffHome and demo data; these were preserved and incorporated into a latest snapshot for validation.
-Initial staff build failed because build output shared the default .next location with a running dev server, leaving a partial dev manifest. Isolated source build resolved this without stopping the user's services or changing the route. A cross-drive snapshot attempt also hit Windows module-path resolution; using a same-drive temporary snapshot resolved it. These failed attempts are recorded, not hidden.
-[Source match](build-source-match.json) compares actual app/components/lib files with the snapshot. This prevents claiming an older checkout validated new code.
-48screen captures across representative paired tasks, home sizes, Hindi marks/reports/home, teacher isolation and error/empty states; three additional sheet/menu/teacher-entry views. These are synthetic records with every API intercepted, no live writes. See [gallery](gallery.html) and [machine-readable result](final-evidence.json).
-Final screenshot runs report no runtime exceptions, missing fixtures or document overflow. The first supplemental attempt exposed stale fixture dates; collection-report fixture now honors the requested range, and attendance review uses its configured fixture date. Real app freshness checks were preserved.
-Portal checks assert ERP Sheet/menu scope; marks Save bar clears bottom navigation within the1px border tolerance (bottom936px, navigation top935px). Keyboard Escape closes the review menu. This is not a comprehensive assistive-technology or nested-dialog certification.
-Teacher home is rendered without any .erp-interface scope, preserving its original background/type. Hindi360/390screens have no document overflow. Error home exposes Retry; empty birthdays explains absence of records.

## Practical limits and remaining separate issues

Source inventory covers all64ERP route files; rendered coverage is representative, not every route/state/role. Live payment verification, payroll posting, bulk messaging, DB writes and production deployment were not exercised. Full accessibility conformance and user-study performance are not claimed.

The banner's raster View Dashboard/Fee Reports button shapes remain noninteractive art. This was documented during research; changing approved artwork or behavior needs a separate deliberate task, not an invisible colour fix. Unrelated homepage draft/assets and prior GitHub QR work were preserved.

## Files and maintenance

Staff theme: app/erp-interface.css. Provider: lib/erpAppearance.tsx. Integration: AppShell, ui Sheet/StickyBar, SideMenu, ErpHome, app/layout and DESIGN.md. Keep ERP styling scoped; do not globally recolour .staff-home/.staff-workspace. Official print documents remain separate.

Generated desktop files must be changed through their staff source, then scripts/sync-erp-workflows.cjs. Web .verification directory contains an ignored diagnostic snapshot and is excluded from TypeScript source discovery; actual successful build used a temporary same-drive snapshot. User dev servers were left running.

Final source typechecks passed for web and staff. Staff typecheck was run with --incremental false after the normal command hit a sandbox write permission on tsconfig.tsbuildinfo; no TypeScript source error was reported. Concurrent user WebP source/asset changes were not authored by this design pass.

## Personal staff scope added by the user

See [teacher refinements](teacher-notes.md). Attendance status hit areas/names, multipart marks, homework delete targets, narrow leave dates and shared input/label readability were refined. Teacher homepage composition and its palette remain intact. Personal-mode screenshot checks are recorded separately; the first missing homework-submission fixture was supplied in the final run.

Final teacher-inclusive static export passed. The source-snapshot comparison later detected two concurrent assistant changes (app/(app)/assistant/page.tsx and components/SahayakThinking.tsx), outside this design pass. The user confirms the assistant old design was restored and explicitly says not to touch it. Those current files were preserved; the successful build validates the design snapshot before those unrelated assistant edits, not an assurance about subsequent assistant work. All files authored by this pass matched the successful snapshot.
