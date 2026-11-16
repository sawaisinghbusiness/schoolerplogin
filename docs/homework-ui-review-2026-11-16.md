# Homework submission UI refinement

Reviewed Claude's latest committed feature in Parents and Staff after fast-forwarding both local repositories.

Parents: neutral sent summary, full-width attachment rows with readable filenames/type and 44px remove controls; clearer work/note hierarchy, separate send and review explanation, upload-aware close behavior, and photo viewer focus/Escape lifecycle.

Teacher: neutral received-work copy; separately expandable submitted work that does not toggle the review checkbox; no tinted nested submission panel; readable PDF filenames and neutral file icons. Note-only submissions do not show a zero-file counter. Existing API payloads and marking defaults are retained.

Both apps passed TypeScript checks. Rendered Parents send sheet and Teacher review list at 360px with synthetic API fixtures: no runtime exceptions or horizontal overflow. Evidence: `apps-charles-audit-2026-11-15/implementation-browser/homework-review/`. The rendered Teacher fixture contains a note-only submission, so PDF/image populated states were inspected in source, not exercised through real uploads. No live school data was changed. Changes are local, not pushed.
