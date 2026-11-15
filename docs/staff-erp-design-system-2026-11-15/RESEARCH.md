> Update: the user subsequently authorized implementation. See [current implementation and verification](IMPLEMENTATION.md). Research findings below are the retained decision record; its partial-state/build-failure section is historical.

# Staff ERP: full-app UI/UX research and design specification

Status: RESEARCH FIRST. User explicitly requested research before further implementation. Existing local partial implementation is retained for review; no further app edits were made after that correction. No push/deploy.

## 1. Recommendation

Use one operational interface system across staff-app ERP mode: a mineral neutral canvas, white work surfaces, navy action/selection identity, one bilingual type vocabulary, predictable spacing and reachable controls. Vary page composition according to the actual job. A fee counter, roster, marks sheet, conversation and settings editor should be recognisably related without becoming copies of a generic dashboard.

The candidate palette remains #ECEEEB canvas, #FFFFFF surface, #0D2A5E navy, #242628 ink, #5E666D secondary and #D5DAD5 divider. These exact hex values are our product design choice informed by the current art and identity, not externally proven 'psychology colours'. Preserve meaningful semantic/chart colours and labels.

## 2. What was researched and what was not

Evidence includes64 ERP page.tsx source files (62 non-redirects,2 compatibility redirects), the active ErpHome outside that directory, shared AppShell/ui/SideMenu/staff-workspace styles, homework/marks/roll-call and records source, actual current and partial-proposal screenshots, independent design/evidence reviews, and primary design-system/accessibility guidance below.

This is desk research, source inventory and heuristic visual inspection. No staff interviews, timed usability study, production analytics, device lab or live transaction validation was performed. Source coverage does not equal rendered coverage. A global stylesheet is not evidence all64 screens have been finished.

User scene supported by product context: mobile staff ERP access to school operations; bilingual English/Hindi; repeated attendance, fees, records and communication tasks. Treat outdoor light and one-handed use as practical verification scenarios rather than measured user-study findings.

## 3. Research -> decision -> boundary

| Primary source | Relevant finding | SMS Barmer application | Boundary |
|---|---|---|---|
|[Carbon colour](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview)|Role-based neutral layers establish content zones; primary colour has a stable role|Mineral canvas/white surfaces; navy for action/selection|Does not dictate our hex values or require a navy header|
|[Carbon spacing](https://www.carbondesignsystem.com/building-blocks/foundations/spacing/overview)|Named spacing scale supports consistent relationships and density|Use4/8/12/16/20/24/32px tokens with explicit jobs|Not every gap must be identical;20px is a local decision|
|[NN/g consistency](https://www.nngroup.com/articles/consistency-and-standards/)|Predictable words/actions and conventions support understanding|Same Save, Back, search, selection, status and error vocabulary across ERP|Consistency does not mean every page has one layout|
|[Carbon data tables](https://www.carbondesignsystem.com/building-blocks/core/components/data-table/guidelines)|Table toolbar groups search/filter/actions; rows support contextual operations|Register identity first; filters together; clear row and bulk actions|Phone may use a continuous list when a desktop grid does not fit|
|[GOV.UK text inputs](https://design-system.service.gov.uk/components/text-input/)|Visible labels and appropriate input types support forms|Labels persist; numeric inputmode for IDs/amounts; no placeholder-only critical fields|Do not copy government typography or force one-question-per-page ERP forms|
|[GOV.UK error summary](https://design-system.service.gov.uk/components/error-summary/)|Summary links errors to the relevant answers, alongside local messages|Long admission/settings forms should expose a top recovery summary and field errors|Adopt the recovery pattern, not unrelated framework markup|
|[WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)|4.5:1 normal text;3:1 qualifying large text|Measure actual foreground/background, including placeholders and dark-header support text|No whole-app conformance claim from a few pairs|
|[WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html)|Required cues for controls/states need sufficient contrast|Focus/check/selected indicators must remain distinguishable|Decorative dividers do not automatically require3:1 if readable content identifies the control|
|[WCAG target minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum)|AA minimum24CSSpx, with exceptions; enhanced target44CSSpx|Prefer44px minimum hits;48px common field/search/action rows|Do not falsely call every32px target an AA failure|
|[Android touch guidance](https://support.google.com/accessibility/android/answer/7101858?hl=en)|48dp touch areas may surround smaller visual icons|Use padding to keep a small icon within a generous hit region|dp is a native unit, not a universal equivalence to CSSpx|

These sources support role consistency, grouping, legibility and recovery. They do not prove that a school operator will trust navy or work faster with mineral grey. That needs real task testing.

## 4. Current diagnosis

- The old home already had a blue-grey page gradient and repeated lavender tile gradients. Similar lightness flattened hierarchy; a warmer cream/burgundy/teal banner competed with the cool surroundings. Adding more gradients would not address this.
- Shared task primitives already establish a useful foundation. The main systemic risk is leaking ERP changes into teacher home or driver screens because .staff-home/.staff-workspace are shared.
- Hardcoded40px/38px/32px actions and small/truncated labels bypass shared controls. Page-specific corrections are necessary; a palette swap alone is insufficient.
- Some three/four-cell summaries inherit flexible widths, causing composition to depend on accidental wrapping. Summary count should be deliberate.
- Portalled sheets, menu and Save bars sit outside DOM shell ancestry. The system must travel through component context, not assume descendant CSS will reach everything.
- Error/empty/loading states need their own review. A missing fee response must not appear as a zero balance, and no stylesheet proves transaction correctness.
- Banner buttons are baked into a noninteractive raster asset. Colour work cannot fix this misleading affordance. Record separately; don't invent links or regenerate approved assets silently.

## 5. Colour role map

| Role | Candidate | Where it belongs | Where it should not spread |
|---|---|---|---|
|Canvas|#ECEEEB|ERP page background, long scroll, loading shell|Certificates/official receipt paper|
|Surface|#FFFFFF|Continuous register, form group, sheet, search|Every fragment nested inside another card|
|Quiet shortcut|#F8F8F5|Eight home illustration tiles|Semantic status chips|
|Brand|#0D2A5E|Primary action, selected state, focus, navigation identity|All amounts, all icons, all report series|
|Ink|#242628|Working labels, names, currency|Secondary text on a dark bubble|
|Secondary|#5E666D|Support text on light surfaces|Navy header or sent-chat bubble|
|Divider|#D5DAD5|Grouping and row rules|The only identifying cue for a required control if too faint|
|Pressed light|#E2E7E2|Tactile feedback on light surfaces|Permanent decoration everywhere|
|Warning candidate|#8A5200|Actual pending/problem state plus words|Routine fee total just because fees are important|
|Success candidate|#176447|Actual completed/paid/approved status|Ordinary rupee numbers before action|
|Error candidate|#A62D38|Error/absence/rejected state plus words|Noncritical section headings|

Keep Cash/UPI/Cheque as labelled distinct categories; retain calendar holiday and attendance meanings. Chart category colour is justified data encoding. Official stamps/letterheads and third-party service identity can differ. All exceptions need purpose, not taste.

Home may use one navy greeting masthead. Operational task headers should remain light with navy titles for denser work; do not make every tool a dark hero. This is a proposal supported by partial previews, not final whole-app signoff.

## 6. Typography and dimensions

| Role | Proposed spec | Reason/check |
|---|---|---|
|Font|Plus Jakarta Sans Variable + Noto Sans Devanagari Variable|Existing approved staff authority; no arbitrary new display face|
|Task title|18px,600,~1.35-1.45 line-height|Compact orientation inside56px task header|
|Section title|17px,600,1.45-1.5|Visible grouping without competing with data|
|Record name/main value|14-16px,500/600|Wrap names; identifiers remain readable|
|Body/control|14-16px,400/500|Avoid a forced13px universal shrink|
|Support/label|12.5-13px,400/500|Readable context; Hindi may need more line-height|
|Field entry|16px,1.4-1.5|Stable editing scale; check native date/select padding|
|Money/measurements|Tabular numerals, right aligned where comparative|Keep Indian currency and digit grouping consistent|
|Chart axes|Around12px candidate with contrast check|Do not grow labels into collisions; inspect real plots|
|Control hit area|>=44px preferred; ordinary fields48px|Small visual icons can sit in a larger hit box|
|Surface/control corners|14px /10px|One compact family; circles reserved for suitable controls|
|Task header/nav|56px header content/64px bottom nav, existing safe areas|Keep Save bar above real nav geometry|

Do not reinterpret these as a CSS global h1/h2/input takeover affecting printed documents. Actual values need computed-style checks on representative components.

## 7. Spacing system

| Token|Use|
|---|---|
|4px|Label/helper relationships within a field or compact icon/text adjustment|
|8px|Related controls/chips and close metadata|
|12px|Compact row inner grouping, paired controls|
|16px|Page side gutter, main surface padding, related form groups|
|20-24px|Different task sections; more above a heading than below it|
|32px|Rare major transition, not a default gap between all cards|

Keep enough density to scan rosters. Use one continuous register with row padding12-16px according to content, not giant spaced identity cards. Work surfaces can have16px padding; the outer page already has16px gutter, so avoid automatic extra nested16px padding that needlessly compresses phone content.

Grouping principle: closer within a question; farther between unrelated questions. A16px token alone is not a design rationale. For example, marks student identity and its part inputs form one unit; the next student needs a boundary, not another card shadow.

## 8. Screen-family specification

| Family / routes | Colour and structure | Spacing and sizing | Critical checks |
|---|---|---|---|
|Home|One navy orientation region; existing artwork; quiet solid shortcuts; one white Today register|16px gutters;20-24px section gaps;4-column shortcuts with wrapping labels|Hindi/name length, safe areas, no repeated incomplete entrance, actual banner affordance|
|Students/staff register|White ruled list on canvas; ink identity, muted SR/class/designation; navy selection/actions|Filters grouped8-12px;48px search; rows expand for identity|Stable IDs, long names, action reachability, no fake count on error|
|Student/staff detail|Identity/contact then sections; one surface per meaningful group|16px group padding;20px separation; document actions on wrapped row|No tiny remove/upload, no overflow from filenames, preserve privacy/role gates|
|Admission/enquiry/setup editors|Grouped white forms, navy current step; understated remaining steps|48px fields;16px entry text; visible labels; paired fields only if real space|Required field errors, step progress, dirty state, photo/document targets|
|Fee collection|Student finder -> correct identity -> ledger -> amount/mode -> confirmation|Amount prominent but not giant;48px input;44-48px actions|No colouring routine totals as warnings; receipt/duplicate/error flows unchanged|
|Dues/receipts/fee reports|Aligned currency and IDs, date context, actual semantic status; labelled mode categories|Explicit2/3/4summary cells; useful filters; avoid decorative charts in rows|Selected report range, export identity, cancellation roles, numeric alignment|
|Attendance/leave/copy-check|Continuous roster; words/icons plus real status colour; navy task actions|44px status hits; wrapped identity; remarks reachable|Bulk actions, remark retention, Save/nav clearance, inactive/disabled states|
|Marks/exam setup|Exam/class/subject context; ruled entry rows; white fields on quiet canvas|Full multipart labels;44px input/hit areas; identity above parts on narrow phone|AB state, ranges, Excel preview before Save, keyboard movement, long labels|
|Syllabus/homework/timetable|Clear section/class/subject context; completion status has meaning|44px chips; selectors stack when needed; calendar/grid local scroll only for real tabular content|Attachment error/busy state, long subjects, six-column day grid and sticky selectors|
|Calendar/birthdays|White calendar surface, explicit legend; holiday/event distinction retained|Generous cell hit region;44px category chips;16px gutters|Dense7-column hit areas, month/session bounds, list/calendar relationship|
|Messages/meetings/parent chat|Readable message hierarchy and audience; navy sent bubbles, light incoming; pale navy text within dark bubbles|44px composer/actions; comfy paragraph line-height; full-screen conversation exceptions|Composer keyboard, timestamps contrast, audience scope, delivery vs sent truth|
|Payroll|Neutral ruled records; clear period/state and currency; no playful celebration|Narrow adjustment fields stack;44px actions; stable aligned amounts|Sensitive account digits as strings, draft vs posted status, preview vs save|
|Transport|Route identity then stops/riders; capacity warning only if real|44px select/assign; wrapped school/class; flat operational lists|Print driver list separate, local actions/roles, route form empty/error|
|School/classes/users/templates/WhatsApp settings|Continuous grouped configuration; navy Save; service green only for actual service identity/state|16px inner padding; label4-6px; section20-24px;48px fields|Admin permissions, unknown counts, validation/recovery, destructive affordances|
|Reports overview/hub|Real metrics/charts/links; one primary analytical focus; restrained labelled categories|Explicit metric count;12px readable axes candidate; enough chart height|Scale from data, not arbitrary minimum; no made-up aggregate totals|
|Planned modules|Honest planned state using same canvas/type/nav|Simple readable explanation and Back/related links|No fake working buttons or conflating route existence with features|
|Official documents|White paper, official typography, required marks/colours|Document-specific dimensions and print rules|Never globally reskin as an app card; preview/print separate|

## 9. State, accessibility and interaction rules

- Loading retains page context and skeleton proportions, without displaying someone else's role home or old filtered response.
- Empty explains the absence of records; error describes unavailable data with Retry. Preserve filters and unsaved work when possible.
- Required fields need a persistent label; placeholder may be an example only. Long form error summary should link to fields alongside local messages.
- Every mutation has an explicit pending/success/failure state. Colour alone is insufficient. Do not automatically save a marks spreadsheet after import.
- Focus visible on both white and navy. Sheet/menu preserve focus trap, Escape and restoration; form scroll and keyboard do not hide the primary action.
- Portalled Sheet/StickyBar/menu must use ERP context and readable tokens; no global body recolouring that affects teacher/driver.
- Compare320/360/390/430CSSpx and wide app frame where practical. Preserve user-pinned viewport; do not fix clipping by silently changing zoom.
- Hindi long names/labels, realistic large fees, zero records, failed API and permission-restricted states need separate evidence.

## 10. What to validate with real users before final visual signoff

A small formative study should use real school operators, not fabricated personas as evidence. Suggested tasks: find a student by SR; identify pending attendance; enter two multipart marks and correct an error; inspect a fee ledger and choose payment mode without submitting; find a receipt/report; locate a school setting. Observe confusion, wrong taps, missed information, text legibility and task completion. Ask which information is needed most often on home. Do not claim a numerical improvement without a baseline study.

Questions that remain research gaps: actual phone widths/ambient lighting; usage frequency; long Hindi naming patterns; preferred home shortcut order; current staff's comfort with a dark header. Existing user approval is the visual direction; these gaps should inform later refinement, not block all implementation.

## 11. Current partial implementation and verification - candid state

Before 'research first' correction, local changes had begun: ERP appearance context, scoped app/erp-interface.css, ERP shell/menu/home/sheet/save-bar integration, plus targeted touch/label changes in16 staff route files (13 delegated plus birthdays/calendar/report). Teacher/driver styles were not deliberately reskinned. These are partial reviewable changes, not complete app signoff. See earlier agent notes and git diffs.

Shared generation synced28 desktop workflows and56 dependencies. Web18regression tests passed. Staff typecheck passed after initial shared-theme integration. New screenshot pass covered8paired tasks/16web+app screens plus2home sizes with no missing fixtures/runtime exceptions/document overflow. Those browser checks used synthetic records and no data writes.

A supplemental pass captured students and fee counter but then timed out opening fee reports while builds were active; it is INCOMPLETE and does not prove that report works. Portal geometry/focus checks after that point did not execute. Do not cite an absent result.json as success.

Staff production build compiled/typechecked but FAILED collecting /erp/transport/route with PageNotFoundError/ENOENT. This has not been diagnosed; do not call it a successful build or assume a cause. Web production build completed successfully (exit0). New controls/chart labels added after the initial typecheck require final verification when implementation resumes.

No app source edits were made after the user's research-first correction. No live payment/payroll/message/DB writes, no commit/push/deploy. This research does not certify accessibility or all64 routes. Next action is review this specification and produce a focused implementation/verification plan; do not silently continue styling in the research stage.

## 12. Related evidence and route-by-route mapping

- [Source inventory64routes](route-audit.md)
- [Every route mapped to proposed treatment](research-route-matrix.md)
- [Homepage research](../staff-home-colour-review-2026-11-15/REPORT.md)
- [Partial proposal home](home-after/current-app.png)
- [Academic source refinements](academics-notes.md)
- [Records source refinements](records-notes.md)
- [Paired browser result](browser/result.json)

Implementation priority after review: settle global surface/type/spacing tokens -> validate shell/portals/teacher isolation -> money/marks/attendance form and control patterns -> remaining route-specific exceptions -> full build and state/device evidence. Do not start by changing every hex literal across the repo.
