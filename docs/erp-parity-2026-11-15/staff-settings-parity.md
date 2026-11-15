# Staff, payroll, transport and settings parity

## Verified contracts

Both interfaces use the same backend routes for staff directory/profile/update/relieve/rejoin/login/photo, class-teacher and subject assignments, payroll structures/generate/slip adjustments/pay/undo-pay, transport route CRUD/stops/rider assignment, school profile/holidays/classes/users/WhatsApp. The existing mobile /erp prefix is a client adapter to /api; it does not define a second data store.

An AST comparison found identical field sets in eight corresponding interfaces: StaffMember, SalaryStructure, Payslip, PayrollRow, Stop, BusRoute, Rider and SchoolProfile. Backend origin/main route definitions confirm staff/transport/school/class writes are admin-only, payroll is admin/accountant with undo-pay admin-only, and WhatsApp retry is admin/accountant while link/logout/settings/test are admin-only.

| Divergence found | Resolution |
|---|---|
| Web staff, payroll, transport and staff attendance derive UI privileges from editable localStorage while app reads auth/me | Web now uses the existing server-confirmed useCurrentUser roleKey; legacy add-staff links wait for admin identity |
| Web school profile, holidays, classes and WhatsApp show mutation controls to roles the backend rejects; app already gates them | Web controls and mutation handlers follow the same role rules; read access remains available |
| Web section drawer treats unavailable student counts as zero and can offer deletion; app already blocks unknown counts | Unknown remains null, deletion is blocked and UI explains count recovery |
| Web payroll exports bank sheet; app had no equivalent | App now exports an XLSX bank sheet with the same seven columns/all prepared slips using shared spreadsheet helper; strings retain bank account leading zeros |
| Web school-session service invents 2026-27 on a failed call; app falls back similarly and claims next2027-28 | Web service returns null with recovery; app requires configured response and removes invented next-session prose |

## Integration ownership

Root owns missing web allocation/class-teacher/staff Excel/settings-template routes, shared session hook, navigation and API runtime. Those missing entries should expose the existing backend workflows, not new stores or mock data.

## Verification

Owned sources were transpile-checked and corresponding interface keys compared. Full typechecks initially found only report SESSION references under a parallel fee-agent refactor; final integrated typecheck/build and fixture browser checks remain root responsibilities. Recommended role check: return teacher from auth/me while localStorage says admin; staff/class/transport/WhatsApp mutation controls must stay unavailable. No payroll, transport, user, WhatsApp or school writes were executed against a live backend.
