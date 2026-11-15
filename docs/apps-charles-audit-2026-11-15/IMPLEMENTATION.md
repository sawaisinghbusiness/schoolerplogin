# Staff, ERP app and Parents — applied Charles review

The approved audit has been applied to operating screens and shared controls. The approved home compositions, Parent Calendar and Study identities, AI Assistant visuals, QR payment contract and existing Driver work are retained. Desktop ERP receives the shared workflow changes through its existing generator; this is not a new desktop-wide redesign.

[Screenshot gallery](implementation-gallery.html) · [Source comparison](implementation-manifest.json) · [Browser verification index](implementation-verification.json)

## Changes against the audit

| Finding | Applied result |
| --- | --- |
| C01 — draft loss | Shared bilingual leave confirmation for same-app links, local tabs and browser unload. Guards cover marks, admission, staff creation/allocation, fee setup, school settings, communication, homework, notes, copy checking and Parent leave/payment reference entry. Marks also recover unsaved values from memory after a soft route unmount; this memory is cleared with the app cache on sign-out. An explicit discard clears that marks draft. |
| C02 — false sent state | Opening WhatsApp only opens the prepared message. A separate “Yes, I sent it” records the operator's confirmation. Failed writes retain the recipient state. Completion copy describes the manual record, not delivery. Implemented in ERP app and desktop SendDrawer. |
| C03 — message overflow | Message search and copy controls stack at compact widths; the search field can shrink. |
| C04 — false empty search | Parent Search distinguishes unavailable homework/notices from no matches, preserves available results and offers retry. |
| C05 — invisible refresh failure | Shared resource failure notice identifies when saved information is on screen. Server failure and offline copy are distinct. |
| C06 — dues failure | Failed dues requests end loading; “All instalments due” is shown only with available summary data. |
| C07 — selector keyboard | Shared SelectBox has listbox focus, active option, Arrow/Home/End/Enter/Space/Escape behavior, optional search and focus restoration. Long values wrap. |
| C08 — album dialog | Parent viewer now uses the dialog lifecycle: modal semantics, focus containment, Escape, nested scroll locking and restoration to the previously focused control. |
| C09 — touch areas | Targeted controls enlarged to 44px: Calendar/Study controls, chat controls, template action, album save, ERP header notice/menu and menu language/sign-out actions. No blanket enlargement of decorative icons or print documents. |
| C10 — form labels | Persistent labels added to ERP agenda and message body. |
| C11 — action colours | Ordinary custom payroll, meeting and report actions inherit the existing evergreen action palette. Navigation remains navy. |
| C12 — navigation context | Personal destinations remain under Profile; report destinations under Report. Leave context updates when switching between My leave and student Requests. |
| C13 — names | Shared selectors and field boxes allow long chosen names to wrap rather than disappear into ellipses. |
| C14 — denominator | Attendance percentage is labelled “Present among marked”. |
| C15 — abbreviations | Copy-check C/I/N and marks AB have explanatory legends. |
| C16 — competing entrances | Nested teacher task entrances suppressed; page-level navigation motion remains. |
| C17 — search delay | Removed the long content stagger while retaining the approved glow and typed-hint treatment. |
| C18 — report card | Document rests flat; action is labelled Print / Save PDF. Official content, Front/Back and the detailed result remain unchanged. |
| C19 — assistant name | Entry labels aligned to AI Assistant. Assistant components and restored visuals are unchanged. |
| C20 — planned/test destinations | Planned ERP modules are grouped after working modules. Parent internal preview/test routes call notFound in production. Existing aliases remain. No pretend functionality added. |
| C21 — product copy | Removed platform-comparison language. Import instructions name the actual accepted Excel/CSV formats and retain preview-before-save. |
| C22 — grouping | Message templates use continuous divided lists instead of separate decorated cards. Other proposed container changes were reviewed selectively; approved fee, profile and identity compositions are retained. |
| C23 — bilingual/larger text | Narrow Hindi and enlarged-text checks are recorded separately below. Flat bottom-navigation labels wrap and the bar can grow; message audience labels wrap, the language selector can move below its heading, payroll totals change columns with text size instead of being ellipsised, and the admission photo caption wraps. These are Chromium checks, not certification of iOS/Android text settings. |
| C24 — retry truth | Reloads return success/failure, multi-resource callbacks return Promise.all, and retry awaits them. Artificial minimum delay and automatic internet diagnosis removed. |
| C25 — date contrast | Staff Present date green changed from #16A34A to #15803D (white numeral contrast approximately 5.02:1). |
| C26 — cashier status | Instalments use white surfaces, dark text and outlined Paid/Overdue labels with trailing green/red dots. Payment allocation is a separate outline and explanatory line. |

## Verification

- Production builds: Staff/ERP app, Parents and desktop ERP. Build results and source hashes are recorded with the final verification artifacts.
- Regression suite: 18 tests passed (`erp-parity.test.cjs` and `regressions.test.cjs`), including shared API payloads, marks reconciliation, Hindi spreadsheets and request cancellation/deadlines.
- Browser evidence: `implementation-browser/`. `final-interactions/` covers cancelled dirty-editor navigation, SelectBox keyboard/focus, delayed multi-resource retry, manual WhatsApp confirmation failure/success, Parent unavailable search and album focus restoration.
- Route captures distinguish the default English pass, `hindi/`, `text-200/`, and final verification runs. JSON results include runtime errors, unresolved fixture requests and viewport overflow; screenshots accompany measurements.
- All browser API responses are synthetic. External WhatsApp opening is stubbed in the confirmation test; synthetic writes are handled locally by the test. No real message, payment or school record was submitted.

## Boundaries

The leave guard covers link/tab clicks and full browser unload. Browser Back inside an SPA does not expose a cancellable navigation event; marks have memory recovery for this case. Draft recovery is intentionally not stored on disk and does not survive a full reload. Other editors do not have a general persistent-draft service.

Existing concurrent edits remain in all repositories. The implementation manifest compares audited source hashes and is not an ownership claim for every working-tree change. Physical-device keyboard, VoiceOver/TalkBack, native date-picker enlargement and real backend messaging/payment behavior remain outside the synthetic review.

The enlarged-text pass doubles computed font size and line height, independently of the ordinary 360px Hindi pass. Compact payroll roster names still use the existing ellipsis and open the individual record; enlarged admission headers can be constrained by the shared header. These limits are retained in the evidence rather than treated as a full accessibility conformance pass. The user-pinned viewport policy was preserved.
