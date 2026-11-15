# Repository snapshot - latest design-system handover

Captured 2026-11-15T09:25:39.373Z. Historical evidence only: refresh before acting. Includes unrelated user files; NOT a staging list.13 targeted staff page edits landed after parity builds; shared theme not implemented.

## web

Path: F:\folders of web\SMS BARMER

HEAD: ddee01e633e69ca84c5b4d087b0b9aabe194765c

Branch: main

```text
 M .gitignore
 M app/academics/copy-check/page.tsx
 M app/academics/homework/page.tsx
 M app/academics/syllabus/page.tsx
 M app/academics/timetable/page.tsx
 M app/attendance/leave/page.tsx
 M app/attendance/mark/page.tsx
 M app/attendance/register/page.tsx
 M app/attendance/today/page.tsx
 M app/birthdays/page.tsx
 M app/calendar/page.tsx
 M app/exams/setup/page.tsx
 M app/fees/collect/page.tsx
 M app/fees/receipts/page.tsx
 M app/fees/reports/page.tsx
 M app/fees/setup/page.tsx
 M app/layout.tsx
 M app/meetings/page.tsx
 M app/messages/new/page.tsx
 M app/messages/page.tsx
 M app/reports/page.tsx
 M app/settings/classes/page.tsx
 M app/settings/data/page.tsx
 M app/settings/messaging/page.tsx
 M app/settings/page.tsx
 M app/settings/templates/page.tsx
 M app/staff/allocation/page.tsx
 M app/staff/attendance/page.tsx
 M app/staff/new/page.tsx
 M app/staff/page.tsx
 M app/staff/payroll/page.tsx
 M app/students/page.tsx
 M app/students/print/page.tsx
 M app/students/promote/page.tsx
 M app/transport/page.tsx
 M app/transport/students/page.tsx
 M components/certificates/CertificateDocument.tsx
 M components/certificates/IssueCertificateDrawer.tsx
 M components/exams/MarkSheetDrawer.tsx
 M components/homework/HomeworkDrawer.tsx
 M components/layout/Navbar.tsx
 M components/layout/Sidebar.tsx
 M components/layout/navConfig.ts
 M components/messages/ComposeDrawer.tsx
 M components/settings/classes/SectionDrawer.tsx
 M components/students/AdmissionDrawer.tsx
 M components/timetable/TimetableDocument.tsx
 M lib/apiClient.ts
 M lib/services/homeworkService.ts
 M lib/services/schoolProfileService.ts
 M next.config.mjs
 M tailwind.config.ts
 M tsconfig.json
?? .claude/
?? 7429ddb6-2c0e-4e85-9c67-68b5642dfd7e.png
?? CODEX_HANDOFF.md
?? app/academics/copy-check/sheet/
?? app/academics/syllabus/excel/
?? app/academics/syllabus/plan/
?? app/exams/marks/sheet/
?? app/exams/setup/edit/
?? app/meetings/new/
?? app/messages/detail/
?? app/parent-chats/chat/
?? app/parity.css
?? app/planned/
?? app/staff/class-teachers/
?? app/staff/detail/
?? app/staff/excel/
?? app/students/admission/
?? app/students/certificates/issue/
?? app/students/detail/
?? app/students/enquiries/detail/
?? app/students/enquiries/new/
?? app/students/excel/
?? app/transport/route/
?? components/homework/HomeworkFiles.tsx
?? components/parity/
?? docs/codex-handoff/
?? docs/erp-parity-2026-11-15/
?? docs/staff-erp-design-system-2026-11-15/
?? docs/staff-home-colour-review-2026-11-15/
?? lib/csv.ts
?? lib/erp-system.json
?? lib/marksWorkbook.ts
?? lib/parity/
?? lib/spreadsheet.ts
?? lib/useErpSession.ts
?? scripts/
?? tests/erp-paired-browser.cjs
?? tests/erp-parity.test.cjs
?? tests/fixtures/parity.cjs
```

## staff

Path: C:/Users/ADMIN/Desktop/folder for staff app erp project

HEAD: 4703b1b0b486c4e6fa1c3356a0c198b114805b5b

Branch: main

```text
 M app/(app)/erp/attendance/register/page.tsx
 M app/(app)/erp/calendar/page.tsx
 M app/(app)/erp/copy-check/sheet/page.tsx
 M app/(app)/erp/exams/marks/sheet/page.tsx
 M app/(app)/erp/fees/collect/page.tsx
 M app/(app)/erp/fees/dues/page.tsx
 M app/(app)/erp/fees/online/page.tsx
 M app/(app)/erp/fees/receipts/page.tsx
 M app/(app)/erp/fees/reports/page.tsx
 M app/(app)/erp/fees/setup/page.tsx
 M app/(app)/erp/homework/page.tsx
 M app/(app)/erp/meetings/new/page.tsx
 M app/(app)/erp/meetings/page.tsx
 M app/(app)/erp/messages/new/page.tsx
 M app/(app)/erp/parent-chats/chat/page.tsx
 M app/(app)/erp/settings/page.tsx
 M app/(app)/erp/staff/payroll/page.tsx
 M app/(app)/erp/students/admission/page.tsx
 M app/(app)/erp/students/certificates/issue/page.tsx
 M app/(app)/erp/students/detail/page.tsx
 M app/(app)/erp/students/id-cards/page.tsx
 M app/(app)/erp/students/photos/page.tsx
 M app/(app)/erp/students/promote/page.tsx
 M app/(app)/erp/syllabus/excel/page.tsx
 M app/(app)/erp/syllabus/plan/page.tsx
 M app/(app)/erp/timetable/page.tsx
 M app/(app)/page.tsx
 M components/AppShell.tsx
 M components/HomeworkFiles.tsx
 M components/SideMenu.tsx
 M components/erp/ErpRollCall.tsx
 M components/erp/ExcelRoundTrip.tsx
 M components/erp/certs/CertificateDocument.tsx
 M lib/api.ts
 M lib/erpMode.ts
 M lib/erpNav.ts
 M lib/erpSoon.ts
 M lib/erpStudents.ts
 M next.config.mjs
 M package-lock.json
 M package.json
?? 0257be57-388e-4462-b303-14df84297139.png
?? 0b04f6f1-ac2b-4b0e-b82b-9d606fc5c3a0.png
?? 1386b4e9-5c5c-479a-b100-dab803db9ff6.png
?? 225a4020-b06f-4fc0-b6bd-26aa052e4c92.png
?? 25b5d5f6-d1ca-49c9-8a43-d57f80d6d94b.png
?? 3aa5af0f-ac91-478b-8c16-30b4550e4daf.png
?? 445ef951-7edc-41ae-802c-67654be07d8a.png
?? 4a6f9707-49bb-441d-8490-c37dafc8f4f6.png
?? 50970ee5-378a-4144-90fd-c0b3a42aa9f3.png
?? 5494b0e0-423a-4c32-9eb5-fef4b674f938.png
?? 6523a52e-ba5e-47c0-9c07-7ff84ab85034.png
?? 66b67c08-fcd1-45ae-a336-e7ce3033e295.png
?? 706c0c44-557c-4971-9114-bf01992ce869.png
?? 76c80ae5-ceb4-4bed-a595-44cc97390ad7.png
?? 76f254a8-f6f8-4291-8a5d-e3ca65feb745.png
?? 8011c391-980d-4cbd-8144-aeb7a9c6f0b6.png
?? 896f146e-3c77-412d-be3e-e55c9b3cfb58.png
?? 9708bca0-491c-4a1e-ba3b-1186cb6cd874.png
?? 9f1d2688-968a-4c09-997d-61cc0a7f0172.png
?? ac89df89-db7b-400b-b4bd-64e6a60c26d9.png
?? app/(app)/erp/reports/
?? app/(app)/erp/settings/data/
?? b624e819-e950-483e-88ec-338576817e6c.png
?? bb0cf198-6464-4100-884f-0c5b4e7972c0.png
?? be0e0a50-e473-4126-b140-cd29194a37e0.png
?? c0943281-6d89-476a-bf34-100393a49ffe.png
?? cbe997e9-65c9-4587-ad91-cf5f646b2fbb.png
?? components/ErpHome.tsx
?? components/erp/timetable/
?? d6018ffb-4cc5-4f89-8437-5b1dba0d4a2f.png
?? d7dc5fc6-cac9-4440-9892-012c6ebf8c0a.png
?? dd71a607-37f1-4709-94e1-f5a9d6782ecc.png
?? dea02e2f-9056-42ae-bfb8-34196a3660fe.png
?? fb7c1c84-67ed-464a-895f-b13c471dd40f.png
?? lib/erp-system.json
?? lib/marksWorkbook.ts
?? lib/sahayakPreference.ts
?? lib/spreadsheet.ts
?? lib/useErpSession.ts
?? public/img/tiles/erp/
?? public/preview/
```

## backend

Path: F:/folders of web/sms backend

HEAD: cc64abd6e56ba9881175b74046d2c80c95d75645

Branch: main

```text
 M src/routes/certificates.ts
 M src/routes/fees.ts
 M src/routes/school.ts
 M src/services/attendanceService.ts
 M src/services/calendarService.ts
 M src/services/dashboardService.ts
 M src/services/examService.ts
 M src/services/feeService.ts
 M src/services/feeSetupService.ts
 M src/services/studentImportService.ts
 M src/services/studentService.ts
?? scripts/demo/
?? src/config/
```
