# Teacher/personal staff screens - additional refinements

The user expanded this pass to useful report-based improvements in the personal staff app. The approved teacher homepage composition and cool/navy identity remain intact; the ERP mineral theme is not applied to personal mode.

| Source | Improvement |
|---|---|
|app/(app)/attendance/page.tsx|44px status tracks, shrinkable identity column and wrapped long student names|
|app/(app)/marks/page.tsx|Wrapped long names, flexible multipart fields, readable12.5px part labels instead of tiny constrained labels|
|app/(app)/homework/page.tsx|44px deletion target instead of36px|
|app/(app)/leave/apply/page.tsx|Date fields stack under400px; paired on wider phone layouts|
|app/staff-workspace.css|Persistent in-field labels use readable existing supporting colour; working inputs/selects/textareas16px|

No new API/business logic, roster-state meanings, role gates, Save behavior or print design was introduced. Existing WebP asset work from outside this design pass was preserved.

Synthetic browser coverage includes teacher home, populated roster with a long name, marks context and actual multipart entry, leave editor, homework check and submissions at390/360CSSpx. No school record was saved, homework deleted or leave submitted. The first capture lacked a homework-submission fixture; final evidence supplies its actual contract and supersedes that error-state screenshot. This is not an all-personal-route usability or live integration certification.

Current results and build status are recorded in IMPLEMENTATION.md and final-evidence.json. No commit/push/deployment.
