# ERP web and staff ERP parity

Reviewed 15 November 2026. Scope: desktop ERP and ERP mode in the staff app. Approved homepages were excluded from this pass; teacher personal-mode workflows remain separate.

## Implemented

- One shared catalog defines 58 menu destinations: 46 available and 12 explicitly planned. Both clients expose the same planned capabilities without pretending they work.
- 28 staff ERP workflows now have desktop counterparts, with 55 shared dependencies and native desktop navigation, headers, sheets and responsive styling. This includes syllabus, chapter plans, copy checks, calendar, birthdays, templates, imports, detailed records and transport routes.
- Both report hubs link to actual operational reports. No invented dashboard totals were added.
- Payment QR upload, preview and removal in staff ERP use the latest backend QR contract; existing remote QR work was retained.
- Marks import accepts the same XLSX on both clients, matches stable student identities, rejects ambiguous or invalid records, and stages changes until explicit Save. Hindi text and leading-zero identifiers survive workbook round trips.
- Staff ERP gains fee exports, attendance export, payroll bank-sheet export and timetable printing. Desktop homework gains photo/PDF attachments and saved message templates.
- Attendance retains absence remarks and supports HalfDay; staff roll call adds all-present and absent-by-roll actions.
- Shared screens follow server roles. Cached local role labels no longer grant desktop edit controls. Unknown section counts cannot enable deletion.
- ERP app reads bypass persisted teacher offline caches; request sequencing prevents stale responses replacing the current filter. Requests time out and unsuccessful logout does not report success.
- Calendar, admissions, fees, certificates and reports use the configured academic session. Backend session defaults now share one definition, with the current 2026-27 value unchanged.

## Shared-source maintenance

The desktop catalog is lib/erp-system.json. The sync script copies it into the staff repo. Ported workflows are generated from staff ERP source; edit that source, then run:

~~~powershell
node scripts/sync-erp-workflows.cjs
node scripts/sync-erp-workflows.cjs --check
~~~

The first command needs write access to both repositories. Generated desktop files carry source notices. Native desktop workflows remain native where already implemented. The generator preserves mobile-specific layouts while adapting navigation and desktop frame styling.

See [route matrix](route-matrix.md), [shared workflow manifest](shared-workflows.json), [staff/settings findings](staff-settings-parity.md) and [paired screenshots](gallery.html).

## Verification

- 18 regression/parity tests pass, including catalog routes, availability, adapter contracts, marks reconciliation, workbook preservation and shared backend session use.
- Generator drift check passes for all 28 workflows and the catalog.
- Desktop and staff production builds pass with demo mode disabled. Backend TypeScript/build checks pass.
- Initial browser review captured 21 paired tasks / 42 screens. A missing attendance-reminders fixture was then supplied and affected tasks recaptured. Final targeted calendar, chapter-plan, attendance and QR captures show no runtime errors, missing fixtures or horizontal overflow.
- Additional transport detail checks cover two screens, with no errors, missing fixtures or overflow.
- Synthetic interactions verified web-to-app calendar creation, app-to-web event editing, QR upload/removal across clients, identical XLSX marks preview without automatic saving, and server teacher-role restrictions despite a forged cached admin label.
- A separate synthetic 2027-28 session check verified both calendars and event date limits update from server configuration.

Browser data and writes were isolated fixtures. These checks do not certify live payment, payroll, messaging or database transactions. No live school-record writes or migrations were performed. Screenshot coverage is representative, not every route/state/role.

## Deployment and preserved work

Changes span three repositories: desktop web, staff app and backend. Both frontend deployments must use the same backend/database and authenticated school context. ERP_BACKEND_URL is supported as an explicit configuration alias; production environment values were not changed or audited. Static staff hosting still needs its existing /api rewrite.

The authoritative backend checkout was fast-forwarded from origin/main before changes, retaining remote QR updates. Unrelated screenshots, preview assets and the separate homepage draft were preserved. No commit, push or deployment was performed in this parity task.
