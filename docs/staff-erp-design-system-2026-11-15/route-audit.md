# Staff ERP route source inventory

Checkpoint:15 November2026. Read-only source inventory, by /root/erp_visual_inventory. No application files were edited by this agent. Root shared theme **not implemented at this checkpoint**; the table records baseline structure and risks, not a completed per-page redesign.

## Coverage and limits

-64 page.tsx files under app/(app)/erp were read by the inventory scanner. Route categorisation and high-risk components were inspected in source.
-62 non-redirect page files;2 compatibility redirects (attendance/mark/section and transport/students). Planned route templates remain explicit; their existence is not a functional feature count.
-The active ERP homepage is components/ErpHome.tsx selected by app/(app)/page.tsx; it is outside the64 ERP directory pages. It therefore needs its own review/implementation.
-Browser coverage in this inventory task: **0 routes**. Existing screenshots from previous tasks are historical evidence; root must record current rendered coverage separately after the theme lands.
-No live backend operations, source mutations, commit or push.

## Proposed shared rules supplied by root

ERP-only .erp-interface wrapper on shell plus portalled sheets/Save bars/menu. Mineral canvas #ECEEEB, white work surfaces, navy #0D2A5E, ink #242628, secondary #5E666D, divider #D5DAD5. Plus Jakarta Sans/Noto Sans Devanagari.14px work-surface and10px control corners,44px touch targets,16px inputs/gutters and20?24px group separation. These are the implementation direction, not claims about current computed styling. Teacher personal mode, driver surfaces and official printed documents are excluded.

## Important integration risks

1. Existing .staff-workspace and .staff-home styles serve teacher and ERP modes. New values must be scoped to .erp-interface; changing shared selectors globally would recolour the approved teacher UI.
2. Shared Sheet and StickyBar are portalled under body with their own staff-workspace class. Descendant-only shell styles will miss them. SideMenu and official print portals likewise need deliberate scope decisions.
3. Parent chat has explicit light canvas, navy teacher bubbles, white text and pale #d3e9eb secondary text. Broad secondary-text overrides can destroy contrast in dark bubbles.
4. Summary bands currently use flex1 1 90px. Three-cell transport summaries and four-cell metrics need explicit variants; forcing one grid count everywhere recreates holes/wrapping.
5. Avoid colour replacement by regex. Financial payment-mode categories, attendance status, calendar holiday and capacity warnings have real meanings. Keep labels and distinguish states; a brand navy replacement must not erase them.
6. Several custom chip/calendar controls are smaller than44px and bypass shared .btn rules. Root should inspect rendered target dimensions before broad minimum-height changes, since six-column calendars/timetables have different geometry.
7. Form/save spacing must be validated with the real64px bottom navigation, safe area and portalled Save bar. Normal page padding should not be imposed on full-screen conversations or official previews.
8. Report chart11px SVG axis text #8A93A6 requires actual-background contrast/readability review; deterministic colour scan alone does not establish chart usability.
9. Existing task headers/menu/actions use direct utility classes. A stylesheet limited to .btn/.field misses those controls and must not assume all64 routes are visually complete.

## Every ERP route file

All paths below are under app/(app)/erp; route trailing slash omitted for readability. Primitives lists are direct source imports, not exhaustive transitive component graphs. Risk notes are source evidence/verification targets, not confirmed browser defects.

| Route | Workflow pattern | Direct shared primitives | Risk / justified exception |
|---|---|---|---|
| /erp/attendance/leave | Approval register | Empty, ErrorCard, LineTabs, ListSkeleton, Status, type Tone | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/attendance/mark | Roll call workspace | ErrorCard, ListSkeleton, SelectBox | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/attendance/mark/section | Compatibility redirect | ListSkeleton | Redirect/loading inherits shell; not a standalone redesign |
| /erp/attendance/register | Attendance report / print | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet | Official print typography/layout must remain separate; Portalled sheet styling/focus independent of shell ancestry |
| /erp/attendance/today | Absence and follow-up register | Avatar, Empty, ErrorCard, LineTabs, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/birthdays | Date-filtered people register | Avatar, Empty, ErrorCard, LineTabs, ListSkeleton | 36px category chips |
| /erp/calendar | Calendar + event editor | Empty, ErrorCard, SelectBox, Sheet, Skeleton | Holiday #2563eb semantic; 32px day controls need measured touch review; Portalled sheet styling/focus independent of shell ancestry |
| /erp/copy-check | Copy-check summary register | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/copy-check/sheet | Roster entry + fixed Save | Empty, ErrorCard, ListSkeleton, SelectBox, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/exams/marks | Marks context selector | Empty, ErrorCard, ListSkeleton, SelectBox | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/exams/marks/sheet | Marks entry + Excel preview | Empty, ErrorCard, ListSkeleton, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/exams/report-cards | Report-card selection + official preview | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet, StickyBar | Official print typography/layout must remain separate; Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/exams/setup/edit | Exam configuration editor | ListSkeleton, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area |
| /erp/exams/setup | Exam setup register | Empty, ErrorCard, LineTabs, ListSkeleton, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/fees/collect | Fee counter / transaction | Avatar, Empty, ErrorCard, ListSkeleton, Skeleton | Cash/UPI/Cheque palette is labelled data categories; preserve distinctions |
| /erp/fees/dues | Dues register + reminder sheet | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/fees/online | Claim register + QR settings | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/fees/receipts | Receipt register + print / cancellation | Empty, ErrorCard, ListSkeleton, SelectBox, Sheet | Cash/UPI/Cheque palette is labelled data categories; preserve distinctions; Portalled sheet styling/focus independent of shell ancestry |
| /erp/fees/reports | Financial report / labelled categories | Empty, ErrorCard, LineTabs, ListSkeleton | Cash/UPI/Cheque palette is labelled data categories; preserve distinctions |
| /erp/fees/setup | Fee configuration / installment editor | ErrorCard, ListSkeleton, SelectBox, Sheet, StickyBar | 3-column fine inputs at narrow width; installment grid remains local-scroll workflow; Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/homework | Homework register + file editor | Empty, ErrorCard, ListSkeleton, SelectBox, Sheet | 38px subject tabs; attachment editor shared; Portalled sheet styling/focus independent of shell ancestry |
| /erp/meetings/new | Meeting composer | Empty, ErrorCard, ListSkeleton, SelectBox | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/meetings | Meeting register + response detail | Empty, ErrorCard, LineTabs, ListSkeleton, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/messages/detail | Delivery detail / sending controls | Empty, ErrorCard, LineTabs, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/messages/new | Audience + message composer | Empty, ErrorCard, ListSkeleton | 4-column audience segment; 32px token insertion controls; long Hindi labels |
| /erp/messages | Delivery register | Empty, ErrorCard, LineTabs, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/parent-chats/chat | Read-only conversation thread | Avatar, Empty, ErrorCard, ListSkeleton | Explicit #F7F9FC thread canvas; preserve navy/white message bubbles and light secondary text |
| /erp/parent-chats | Read-only conversation register | Avatar, Empty, ErrorCard, LineTabs, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/report | Operational dashboard / charts | ErrorCard, Skeleton | SVG 11px labels, #8A93A6 axis text; compare on real chart background |
| /erp/reports | Report destination hub | No direct ui import | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/settings/classes | Class/section configuration | Empty, ErrorCard, ListSkeleton, SelectBox, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/settings/data | Explicit planned module | No direct ui import | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/settings | School configuration editor / document settings | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/settings/templates | Message template register/editor | Empty, ErrorCard, ListSkeleton, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/settings/users | Account access register/editor | Empty, ErrorCard, LineTabs, ListSkeleton, Sheet, Status | Literal #28d72a messaging-service colour; avoid using as generic action; Portalled sheet styling/focus independent of shell ancestry |
| /erp/settings/whatsapp | Messaging integration settings | Empty, ErrorCard, ListSkeleton, Sheet, Status | Literal #28d72a messaging-service colour; avoid using as generic action; Portalled sheet styling/focus independent of shell ancestry |
| /erp/soon | Explicit planned-module explanation | Empty | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/staff/allocation | Subject/teacher allocation grid | Empty, ErrorCard, ListSkeleton, SelectBox, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area |
| /erp/staff/attendance | Staff attendance roster/register | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet, Status, StickyBar | Official print typography/layout must remain separate; Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/staff/class-teachers | Class-teacher allocation grid | Empty, ErrorCard, ListSkeleton, SelectBox, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area |
| /erp/staff/detail | Staff record editor | Avatar, Empty, ErrorCard, ListSkeleton, SelectBox, Sheet, Status | Portalled sheet styling/focus independent of shell ancestry |
| /erp/staff/excel | Excel round trip / review | ErrorCard, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/staff/new | Staff registration form | Empty, ErrorCard, ListSkeleton, SelectBox | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/staff | Staff register | Avatar, Empty, ErrorCard, LineTabs, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/staff/payroll | Payroll register + payslip preview | Avatar, Empty, ErrorCard, ListSkeleton, SelectBox, Sheet, StickyBar | Official print typography/layout must remain separate; Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/students/admission | Admission form + crop/photo | Avatar, ErrorCard, ListSkeleton, SelectBox, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/students/certificates/issue | Certificate form + official preview | Avatar, SelectBox | Official print typography/layout must remain separate; Portalled sheet styling/focus independent of shell ancestry |
| /erp/students/certificates | Certificate register + official preview | Empty, ErrorCard, LineTabs, ListSkeleton | Official print typography/layout must remain separate; Portalled sheet styling/focus independent of shell ancestry |
| /erp/students/detail | Student record / gate pass | Avatar, Empty, ErrorCard, LineTabs, ListSkeleton, Status | Portalled sheet styling/focus independent of shell ancestry |
| /erp/students/enquiries/detail | Enquiry detail + follow-up | Empty, ErrorCard, ListSkeleton, Status | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/students/enquiries/new | Enquiry form | SelectBox | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/students/enquiries | Enquiry register | Empty, ErrorCard, LineTabs, ListSkeleton, Status | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/students/excel | Student workbook round trip | ErrorCard, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/students/id-cards | ID-card selection + official print | Avatar, Empty, ErrorCard, ListSkeleton, SelectBox, StickyBar, LineTabs | Official print typography/layout must remain separate; Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/students | Student register | Avatar, Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Status | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/students/photos | Photo workflow + crop sheet | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/students/promote | Promotion selection + review | Avatar, Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet, StickyBar | Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/syllabus/excel | Syllabus workbook round trip | ErrorCard, ListSkeleton | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/syllabus | Syllabus summary | Empty, ErrorCard, ListSkeleton, SelectBox | Inherits shell/shared primitives; inspect actual populated state, not source coverage alone |
| /erp/syllabus/plan | Chapter plan editor | Empty, ErrorCard, ListSkeleton, SelectBox, Sheet | Portalled sheet styling/focus independent of shell ancestry |
| /erp/timetable | Day/period grid + slot editor | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet | 6-column days; 40px subject chips; current-period distinction; Portalled sheet styling/focus independent of shell ancestry |
| /erp/transport | Route register + capacity summary | Empty, ErrorCard, ListSkeleton | 3-cell summary and route capacity state; no arbitrary4-cell rule |
| /erp/transport/route | Route/rider register + edit/print | Empty, ErrorCard, LineTabs, ListSkeleton, SelectBox, Sheet, StickyBar | Official print typography/layout must remain separate; Portalled Save bar must inherit ERP scope and clear64px navigation/safe area; Portalled sheet styling/focus independent of shell ancestry |
| /erp/transport/students | Compatibility redirect | ListSkeleton | Redirect/loading inherits shell; not a standalone redesign |

## Recommended rendered sample set

Homepage, student register, admission form, fee counter, online QR sheet, dues/receipts, attendance mark, marks sheet with Save bar, calendar, timetable, parent thread, message composer, payroll, report dashboard, school settings and planned module. Exercise360/390/430px, long names, Hindi, populated/error/empty states, open sheets/menu and print preview. Final report must distinguish this representative sample from the64-file source inventory.
