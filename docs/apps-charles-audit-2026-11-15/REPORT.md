# Staff, ERP app and Parents: Charles skills review

15 November 2026 · Review only · No application UI changes made by this audit

## Interaction inventory

| Interaction | Trigger / frequency | Required feedback |
|---|---|---|
| Change destination or open a detail | Tap, keyboard; frequent | Stable parent context and one current destination |
| Pick class, section, subject, child or date | Tap, keyboard; frequent | Full selected identity; latest selection controls the displayed records |
| Enter attendance, marks or configuration | Form input; repeated and consequential | Unsaved, saving, saved and failed are distinguishable; navigation preserves work |
| Collect money or verify a parent claim | Form / confirmation; consequential | Correct student, amount, payment evidence and actual persisted outcome |
| Prepare and send a school message | Form / external WhatsApp; repeated | Preview audience; distinguish opening a messaging app from sending or delivery |
| Reply or book a meeting | Composer / slot selection; occasional | Pending and failure preserve the draft; booking reflects server acceptance |
| Open a selector, sheet or photo viewer | Tap / keyboard; frequent | Predictable focus, dismissal and focus restoration |
| Read calendar, homework, salary or reports | Navigation / disclosure; frequent | Readable records, intentional hierarchy, honest stale/unavailable state |
| Use study timer / minute ruler | Tap / hold-drag; repeated | Direct gesture feedback; no competing menu gesture; meaningful round progress |
| View bus summary / tracking | Navigation / polling; occasional | Route context, freshness and trip state stay separate |

## Decision

The strongest next improvements are trustworthy task states, draft protection and shared interaction quality. The existing type families, ordinary work surfaces, outlined status vocabulary and evergreen primary actions already form a usable system. A new theme across all pages would discard useful work.

Keep the approved homepages, Parent fee structure, calendar register and study timer identity. Keep the deliberately different ERP mineral canvas and Parent/teacher cool canvas. Preserve the user-requested Search opening reference and the restored assistant visuals. Do not classify every gradient, illustration, circle, status pill or progress bar as a defect merely because it appears on a generic anti-slop list.

The characteristic detail should come from the work: a clear fee ledger, a continuous attendance register, a legible lesson plan, a useful child context and a reliable completion state. Repeated icons, containers and explanations should earn their space.

## Coverage and evidence

- **127 page files inventoried:** 19 Staff pages, six Staff `/me` aliases, 64 ERP task routes, two driver routes and 36 Parent routes. Staff and ERP also share `/` and `/profile/`, which were rendered in both role contexts.
- **This review covers Staff, ERP mode inside the staff app and Parents.** The two driver routes point to the separate completed driver review. This is not a new exhaustive audit of the desktop ERP website. One identical desktop messaging defect was cross-checked in source and is called out below.
- **151 initial browser observations:** Staff 32, ERP 74, Parents 45. These include aliases, selected narrow widths and error variants; they are not 151 independent pages.
- Corrected fixture runs revisit two Staff details, eight ERP routes and three Parent routes. Initial invalid IDs and incomplete fixtures are not reported as product bugs. Corrected evidence takes precedence.
- Additional interactions cover marks editing/navigation, selector keyboard behavior, homework checking, leave requests, QR settings, calendar timetable, exam results, Pomodoro, actual login and the album viewer.
- Screens were captured in isolated Chromium contexts at 390px, with selected tasks at 360px. APIs were intercepted using synthetic/demo data. Mutating requests were blocked. No real messages, payments, enrolments or school records were changed.
- All initial runs reported **zero runtime exceptions**. After missing fixtures were corrected, ERP message detail measured **405px document width in a 390px viewport**. Initial successful width checks do not override this populated-state failure.
- Staff/ERP render evidence uses the production export generated in the preceding authorized driver task. Parent evidence uses an isolated local preview. Current source was inspected separately. Concurrent local RetryButton/settings changes are identified as source-only in C24; the older exported screenshots do not verify them.
- This is not a full backend integration test, physical-phone test, complete accessibility certification or frame-rate measurement. No numerical “design score” is assigned from incomplete device evidence.

Read [Staff page decisions](STAFF.md), [ERP app page decisions](ERP-APP.md), [Parent page decisions](PARENTS.md), and [visual gallery](gallery.html). Machine-readable route and browser evidence is retained beside this report.

`audit-baseline.json` records repository revisions, existing working changes and source hashes so a later implementation can detect concurrent edits. Source-only notes must be rechecked when those files change.

## Findings, ordered by impact

Severity uses the Charles animation review vocabulary: **broken** means wrong result/lost input; **friction** means avoidable difficulty; **polish** means presentation refinement. Priority is separate: P1 before wider rollout, P2 next implementation pass, P3 optional refinement. “Source” means verified in code, not an end-to-end live result.

### C01 — Marks drafts disappear during ordinary navigation

**P1 · broken · preserve input / completion.** Staff `app/(app)/marks/page.tsx:48,97,105,133`; ERP `app/(app)/erp/exams/marks/sheet/page.tsx:82`.

**Before:** in the Staff browser test, a blank mark changed to `13`, followed by **Change → Enter marks**, returned to blank. ERP has a `beforeunload` listener, but in-app **Home → Report** navigation from an edited sheet proceeded without a confirmation dialog. A full-page unload guard does not cover all client-side navigation.

**After:** keep drafts by exam/section/subject or explicitly offer Save / Discard / Stay before leaving a dirty sheet. Apply the same rule to date/class changes in working registers. Do not silently merge one class's draft into another.

**Evidence:** `browser/interactions-staff.json`, `browser/interactions-erp.json`, `browser/staff/marks-edited.png`.

### C02 — Opening WhatsApp is recorded as “sent”

**P1 · broken · honest success state.** ERP `app/(app)/erp/messages/detail/page.tsx:66`; desktop `components/messages/SendDrawer.tsx:69`.

**Before:** `window.open(whatsappUrl(...))` immediately calls `setStatus(..., "sent")`. A cancelled composer or blocked external window can still be recorded as sent. The completion text “Everyone has it” also implies delivery, and is shown when there is no next pending recipient—even if all rows were skipped.

**After:** separate Open WhatsApp from operator-confirmed Sent; use delivery language only with provider evidence. Show skipped/no-number recipients explicitly. Preserve undo. The same correction belongs in both copied ERP implementations.

**Evidence:** source-confirmed; no external WhatsApp send was performed in this audit.

### C03 — Message-detail toolbar overflows a phone

**P1 · friction · responsive task completion.** ERP `app/(app)/erp/messages/detail/page.tsx:143`.

**Before:** the populated recipient search plus non-shrinking Copy numbers button expands the document to **405px at 390px**. The right action is clipped and the page gains a horizontal scrollbar.

**After:** give the search container `min-width:0`, let the input shrink, and stack the copy action when the pair cannot fit. Keep the recipient list and external-send action fully visible.

**Evidence:** corrected browser inventory and `browser/erp/erp--messages--detail-390.png`.

### C04 — Search treats unavailable sources like zero matches

**P1 · broken · distinguish unavailable from empty.** Parents `app/(app)/search/page.tsx:63,108,163`.

**Before:** homework/notices use `(data || [])` filtering without a resource-level loading/error decision. Failed sources can end in “Nothing found in homework or notices.”

**After:** report which source could not be searched; show partial results where available; reserve “Nothing found” for successfully searched sources. Preserve the entered query and give a local retry.

**Evidence:** source and `browser/parents/search-unavailable-results.png`. The injected response was a synthetic service failure; no claim about the school's real service is made.

### C05 — Resource refresh failures are not consistently represented

**P1 · friction · visibility of system state.** Staff `lib/api.ts:128`, `components/ui.tsx:198`, attendance/homework consumers; Parents `lib/api.ts`, `components/AppShell.tsx:154`, `components/ui.tsx:103`.

**Before:** cached resources can continue to look current when their own refresh fails. The shell's OfflineNote follows the identity request rather than every page resource. When shown, its fixed “No internet” wording can also describe a server-side 503 despite a working network.

**After:** let each data-owning screen disclose saved/as-of information and refresh failure. Distinguish offline, timeout and server failure without clearing useful records. Keep pending edits separate from cached server data.

**Evidence:** error variants in the initial browser runs and source branches that only show an error when `!data`.

### C06 — Failed fee-dues load retains factual-looking copy

**P1 · broken · honest financial state.** ERP `app/(app)/erp/fees/dues/page.tsx:99–109`.

**Before:** after a failed load, the page still says it is working out dues and labels the unknown next-instalment state “All instalments are due.” The latter is a business conclusion without a loaded report.

**After:** end loading and show unavailable values with retry. Render “All instalments are due” only from a successful report that establishes it. Keep amounts unknown rather than zero.

**Evidence:** `browser/erp/erp--fees--dues-390-error.png` and source.

### C07 — Custom selector does not implement its keyboard model

**P2 · friction · predictable controls.** Staff/ERP `components/ui.tsx:109–169`.

**Before:** opening a SelectBox and pressing ArrowDown leaves focus on the trigger. Options are declared as `role="option"`, but there is no active-option keyboard handling or open-focus transfer. Tab can reach buttons, so this is not a claim that all keyboard selection is impossible.

**After:** use a native select where adequate, or complete one consistent listbox model: Arrow keys, Home/End, Enter/Space, Escape and focus restoration. Keep the existing searchable list where long rosters need it.

**Evidence:** `browser/staff/select-keyboard.png`, keyboard result in `interactions-staff.json`.

### C08 — Photo viewer lacks modal focus handling

**P2 · friction · focus continuity.** Parents `app/(app)/events/album/page.tsx:86–105`.

**Before:** the viewer has dialog semantics, scroll lock, Escape and arrow keys, but opening it left the active element at BODY in the executed check. The effect does not move/trap/restore focus or make the background inert.

**After:** use the app's established dialog lifecycle: focus Close initially, contain keyboard focus, restore the originating thumbnail, retain Escape/arrows and nested scroll-lock safety.

**Evidence:** `browser/interactions-parents.json`, `browser/parents/album-viewer.png`, source.

### C09 — Some primary controls still have compact hit regions

**P2 · friction · target acquisition.** Examples: ERP Home Menu **40×44**, Notices **36×40**, Profile **38×38**; class-setting chips **50×40**; Parent calendar tabs **168×40**, timer +/- **40×40**, teacher meeting-response buttons **133×40**. Photo Save overlays use a 36px box in source.

**After:** use 44px minimum phone hit regions, keeping compact visual icons and preventing overlap. Treat inline links and map attribution separately. These measurements are a usability review, not an automatic declaration that every sub-44 control violates WCAG AA's smaller-target exceptions.

**Evidence:** per-screen `controls` / `small` arrays in browser inventories. Do not turn counts of flagged elements into counts of accessibility violations.

### C10 — Form labels disappear into placeholders

**P2 · friction · recognition and accessible naming.** ERP meeting agenda `app/(app)/erp/meetings/new/page.tsx:122`; message body `app/(app)/erp/messages/new/page.tsx:234`.

**Before:** the fields lack an associated label/ARIA label; their immediate prompt is placeholder text. Once text is entered, the field's instruction is no longer visible. A nearby section heading is not a programmatic label association.

**After:** add persistent labels associated with the controls; keep placeholders as optional examples. Repeat the input/error-link check on sheets, not just initial pages.

### C11 — Evergreen actions are bypassed by custom markup

**P2 · polish · semantic colour consistency.** ERP Payroll actions at `app/(app)/erp/staff/payroll/page.tsx:151,483,629`; Parent Pick a time link at `app/(app)/meetings/page.tsx:17`; report PDF action at `app/(app)/report-card/page.tsx:110`.

**Before:** ordinary filled actions remain navy/blue while shared submit/pay/save actions are evergreen. The action stylesheet matches semantic button classes, but custom classes bypass it.

**After:** use the shared action role for operational primary buttons. Keep navy for navigation/selection, the approved study orange for its timer, and purposeful external-service branding where it conveys an actual destination. Do not globally recolour badges, charts or assistant UI.

### C12 — Current navigation loses its parent context

**P2 · friction · orientation.** Staff `components/AppShell.tsx:43,57,78,121` and `lit` calculation.

**Before:** All reports / Fee reports highlight Home, and School & Session reached from Profile also highlights Home. Personal My leave shares a route with teacher requests and always uses Home.

**After:** explicitly map report destinations to Report, account settings to Profile, and distinguish personal-leave context from operational requests. Keep one current destination. Do not add a new tab for every module.

**Evidence:** contact sheets and route inventories show the current highlighted tab; source specifies the mappings.

### C13 — Long selected identities are truncated

**P2 · friction · recognition over recall.** Shared SelectBox `components/ui.tsx:131,166`; ERP class teachers `app/(app)/erp/staff/class-teachers/page.tsx:97`; fee-collection selected identity.

**Before:** “Teacher - Neha Sharma · Teacher” is cut off in a narrow field; meeting class/audience choices and fee identity context are similarly compressed. These are selection decisions, not decorative descriptions.

**After:** move repeated field labels outside the selected value where useful; allow two-line values or stack related fields below 400px. Keep stable name/class/SR context while choosing the record.

### C14 — Attendance headline and bar use different denominators

**P2 · friction · quantitative clarity.** ERP `app/(app)/erp/attendance/today/page.tsx:96–106`.

**Before:** a fixture with nine present, three absent and twelve unmarked shows “Present today 75%”, while the coloured bar uses all 24 enrolled students. The count “12 / 24 marked” helps, but the headline and bar invite different readings.

**After:** label the headline “Present among marked” or show the marked denominator next to it. Keep unmarked visible; do not classify unmarked children as absent or change the school formula without a business decision.

### C15 — Bulk registers rely on unexplained abbreviations

**P2 · friction · reduce recall.** ERP Copy Check uses C/I/N column labels and save counts; marks sheet uses AB. Teacher attendance P/A/L is an established compact register, but uncommon workflows need a visible explanation.

**After:** add one compact legend for Complete / Incomplete / Not submitted and spell out Absent near its selector. Keep per-child accessible names. Do not duplicate the legend on every row.

### C16 — Repeated task entrances compete with frequent edits

**P3 · polish · motion frequency.** Staff attendance root and tab content both use `animate-rise`; marks Entry adds another entrance. `tailwind.config.ts:143` defines the rise as 280ms. Parent section helpers can animate multiple content groups.

**After:** retain one purposeful transition for a meaningful context change. Frequent filter/keyboard changes should respond immediately; do not replay whole-form arrival motion. Reduced motion must retain clear selected/saved states.

### C17 — Search content waits for an ornamental sequence

**P3 · polish · completion before choreography.** Parents `app/(app)/search/page.tsx:121,208–229`.

**Before:** suggested questions and subsequent groups have a 1.3s-plus stagger. This is separate from the user's explicitly requested PhonePe-style opening glow and typed hint.

**After:** preserve the requested reference effect, while making available results/actions usable immediately. Shorten or remove content-delay staging on frequent visits; keep reduced-motion behavior. The glow is not proposed for automatic deletion.

### C18 — The report document needs a reading-first resting state

**P3 · polish · legibility.** Parents `app/(app)/report-card/page.tsx:110–138`, captured report-card frame.

**Before:** the A4 card is tilted in its opening frame and scaled to a phone; it has no readable HTML summary on that route. The PDF-labelled action calls `window.print()`.

**After:** consider a flat resting document, clear Front/Back state and an optional readable summary before the print sheet. Label the action Print / Save PDF if that is the actual browser behavior. Keep official document typography, both printed sides and the existing detailed result route. This is a proposal, not a change to the school's report format.

### C19 — Assistant naming is inconsistent across apps

**P2 · polish · consistent vocabulary.** Staff shell/profile still say School Sahayak; Parents uses AI Assistant.

**After:** align entry-point copy with the approved AI Assistant name during a copy pass. The restored assistant visual design remains protected. Its 36px question-list control is noted for a later accessibility-only pass, not a visual redesign.

### C20 — Planned/internal pages need a deliberate place

**P2 · friction · choose what to show.** ERP `/erp/soon/`, `/erp/settings/data/`; Parents `/motion-test/`, `/preview/id-card/`.

**Before:** working-navigation destinations include planned capability explanations, and test/alternative-design routes remain addressable. This is not proof that they are all linked from production navigation or a security vulnerability.

**After:** separate Planned from working tasks; hide developer/test routes from ordinary production builds or clearly guard their availability. Do not invent Library/Data functionality to fill an empty screen. Preserve alias redirects for existing links.

### C21 — User-facing copy exposes implementation comparisons

**P3 · polish · product language.** ERP `/erp/reports/` says to open the same reports as ERP web; Data says it is planned on ERP web and app. Import screens mix “Excel”, CSV conversion and file-picker wording.

**After:** describe the actual reports and accepted file formats. Put platform parity notes in engineering docs. Keep the important preview-before-save/import warnings and exact limits.

### C22 — Dense information needs fewer competing containers

**P3 · polish · grouping and subtraction.** Selected ERP templates, fee setup and staff-detail sections; Parent Profile header.

**After:** use continuous rows for related records and a short preview/disclosure for long template bodies. Keep one work surface per meaningful group. Preserve approved fee cards, the real school photograph and the Home child/staff identity block. This is a route-specific refinement, not a blanket “remove all cards” request.

### C23 — English/Hindi and larger-text coverage must be completed

**P2 · friction · legible content.** The new all-page pass is predominantly English. Existing Hindi implementations, prior Hindi captures and no-overflow results do not certify every new form or menu at enlarged text.

**After:** verify changed labels, long names and 200% text separately, especially audience selectors, payroll, admission, error copy and document actions. Keep the established Plus Jakarta / Devanagari families; consolidate by semantic roles rather than replacing the fonts.

### C24 — New local RetryButton needs a pending-contract check

**P2 · friction · asynchronous truth.** Current working source `components/ui.tsx:226–267`; homework retry callback at `app/(app)/homework/page.tsx:86`.

**Before:** RetryButton awaits `onRetry`, then stops after a minimum 700ms and increments its failed count while still mounted. Some existing callers start multiple reloads inside a callback that returns `undefined`, so their actual requests may still be pending. It then says “Still not working. Check the internet”.

**After:** return/await the actual reload promises or accept explicit loading/error state; distinguish pending, server error and offline. Count an attempt as failed after it resolves unsuccessfully. Preserve the useful visible retry feedback.

**Evidence:** source-only. This local edit appeared during the audit and was not part of the production export captured above. Verify it on the current preview before implementation is called complete.

### C25 — White date numerals on Staff present-green lack contrast

**P2 · friction · readable status information.** Staff `components/MyMonth.tsx:22,105`.

**Before:** 14.5px semibold white numerals on `#16A34A` have a calculated contrast ratio of **3.30:1**. That is below the 4.5:1 criterion for this normal-sized text. The calendar screenshot confirms this green/white presentation; this calculation is not a whole-app contrast certification.

**After:** retain the user's green Present / red Absent / yellow Leave / blue Holiday vocabulary. Deepen the Present fill, for example `#15803D` gives **5.02:1** against white, then verify all states in the actual render. Do not remove the approved filled circles or reintroduce unwanted letters/half-day legend entries.

**Reference:** [W3C contrast minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### C26 — Fee-state tiles bypass the approved neutral status language

**P2 · polish · semantic status consistency.** ERP `app/(app)/erp/fees/collect/page.tsx:258–273`.

**Before:** the loaded cashier view uses pale green Paid tiles and pale red late tiles with matching coloured text. This differs from the approved white/dark-text/outline/trailing-dot Paid and Overdue treatment. The selected payment allocation also adds blue ring/text, mixing an existing state with a proposed allocation.

**After:** keep each instalment tile white with dark readable amounts and a labelled semantic status/dot. Show proposed payment allocation with a separate selection outline and explicit preview wording. Preserve the fee calculations, dates and payment split; do not imply that a proposed allocation is already paid.

**Evidence:** corrected `browser/erp/erp--fees--collect-390.png`. This recommendation applies to state presentation, not to genuine chart-category colours or the approved Parent fee header.

## Shared design rules for the implementation pass

| Role | Rule |
|---|---|
| Interface type | Retain Plus Jakarta Sans and Devanagari fallback. Use existing 18px app titles; task section roles 17–20px; body/control 16px; supporting 14px; captions around 12px. Do not mechanically resize official print documents. |
| Surface | Teacher/Parent cool canvas and ERP mineral canvas are intentional contexts. White work surfaces, thin quiet dividers and limited shadow remain. |
| Action | Evergreen `#294E43` for ordinary operational primary actions. Navy `#0D2A5E` for selection/navigation. Study orange and driver identity stay scoped. |
| Status | White, dark text, dark outline, trailing semantic dot. Preserve approved colour meanings and written labels. Unread notification counters are a distinct attention pattern. |
| Spacing | Continue 4/8 rhythm: 16px usual gutter/work-surface inset, 12px within related groups, 20–24px between separate tasks. Existing Home-specific gutters stay pinned. |
| Touch | Prefer 44–48px controls; icon artwork may stay smaller. No overlapping invisible targets. |
| Motion | Existing CSS/RAF stack; no new library. Named press/disclosure/context-change timings. No content-blocking decorative delays. Preserve user-requested gestures and reference effects. |
| State | Preserve drafts; show resource-specific refresh status; never turn unknown into zero, not-found or delivered. |

## Recommended implementation sequence

1. C01–C06: protect work and correct misleading states; reproduce with the supplied synthetic fixtures.
2. C07–C15, C25 and C26: selectors, modal focus, overflow, hit areas, form labels, colour inheritance, contrast, status presentation and navigation context.
3. C16–C22: restrained motion and route-specific copy/composition refinements, respecting pinned exceptions.
4. C23–C24: current-source retry verification, Hindi/large-text pass and physical-device checks before release.

No new install, commit, push or deployment was performed for this review. Existing unrelated local edits were retained.

## Sources and method

The repeated GitHub links identify one repository. The applicable methods are [Charles Unslop](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-unslop/SKILL.md), [Polish](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-polish/SKILL.md), [UX & Animation](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-ux-animation/SKILL.md) and [Unreasonable Craft](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-unreasonable-craft/SKILL.md). They supply review procedure, not evidence that a particular app element is wrong. Findings above come from this project's source, rendered screens and listed interactions. No remote scripts were installed or executed.
