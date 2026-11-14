# ERP visual review and applied changes

14 November 2026. This supplements the earlier repository/system review. The earlier report alone was not a complete visual review.

## Method and evidence

The actual Next application was rendered at localhost:3007, using an isolated Chrome tab and synthetic school/student/staff fixtures. Every API request in that tab was intercepted; mutations returned 403 and unknown GET endpoints returned 503. No school records were created, edited, paid, messaged or deleted. These screenshots demonstrate layout and UI states, not authenticated backend correctness.

Desktop captures use 1440×1000; phone captures use 390×844. The evidence gallery records each capture and route. Where a fixture is unavailable, the captured state is an error/empty/setup state, not a populated workflow. Initial fixtures had question marks in the synthetic school/session labels; those characters are fixture artifacts, not a claim about stored school data. Some intermediate captures precede the final typography/error-state pass.

Open the [screenshot gallery](visual/index.html). The desktop sweep contains 45 route entries, including redirect/legacy entries and the public `/academics` route encountered during enumeration; this is not 45 separate implemented ERP capabilities. Seven core routes were captured at phone width with no document-level horizontal overflow. The admission drawer was exercised in the real application: it opened, held initial focus inside, and closed on Escape. A short initial test wait missed its render; the final check waits for the dialog to exist before asserting its behavior.

The review consulted [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop) (CC BY 4.0), including its signs and token references, alongside Impeccable's Operate guidance. Its advice was applied to this school's working registers and transaction screens rather than treating a showcase dashboard as the goal.

## What was actually wrong

| Finding | Effect on staff | Applied correction |
| --- | --- | --- |
| Global CSS hid page titles and subtitles | Lost task context; buttons appeared detached | Removed the hiding rules; restored page hierarchy |
| Purple-grey canvas, pill-like cards and repeated shadows | Every container competed for attention | Scoped neutral office canvas, bordered 10px surfaces and quieter controls |
| Geometric display-like type throughout office work | Dense forms and registers felt less utilitarian | System UI typography within ERP and shared dialogs |
| Amber navigation beside indigo controls | Two competing selection languages | One indigo selection/action family; semantic warnings retained |
| Dashboard greeting headline and decorative sparkline | Context and figures competed with decoration | Dashboard title/date, compact joined summary and restrained monthly chart |
| Parent name repeated below student name and in its own column | Slower identity checks in a register | Register/admission number below the desktop student name |
| Fee progress bar repeated in every student row | Excess marks around the same amount | Amount plus numeric paid percentage; no repeated bar |
| Randomly coloured initials | Colour implied distinctions with no operational meaning | Neutral initials by default; explicit colour remains possible |
| Fee search had a thick glow and automatic focus | Distracting first render and unwanted mobile keyboard | Compact border/focus treatment; removed automatic focus |
| Hardcoded shell session/year | Context could become stale | Session from configured API; sidebar uses school city |
| Notification placeholder claimed all caught up | Unverified status appeared authoritative | Removed disconnected notification control |
| Exam API failure appeared as no configured exams | Operator could mistake outage for missing setup | Persistent error/retry; setup help uses operator language |
| Online fee error left a loading spinner | No clear end state | Explicit unavailable/retry state; clear rows between status tabs |
| Payroll failure appeared as ₹0 and no staff | Misleading financial information | Persistent error/retry in place of false summary/list |
| Chat failure appeared as no parent messages | Could miss a communication outage | Error/retry inside conversation list |
| Timetable section failure looked like an empty timetable | Blank periods could be mistaken for unassigned work | Persistent grid error/retry; printing disabled during failed load |
| Transport, exam setup and parent leave failures looked like empty records | Outages looked like missing routes/exams/requests | Persistent error/retry instead of the false empty state |
| Dues and attendance-class failures left perpetual loading placeholders | Failed requests still looked in progress | Stopped the dependent loading state and directed staff to retry |
| Planned screens exposed development phases and green completion marks | Internal roadmap language looked like available capability | Plain unavailable state, planned capability list and existing alternatives |
| Several setup screens exposed SQL migration commands to office staff | Recovery required developer knowledge | Changed the plain-text setup instructions to contact the school administrator; older WhatsApp/report-card setup helpers still contain technical instructions |

## Module direction

| Area | Appropriate interface | Assessment and next validation |
| --- | --- | --- |
| Dashboard | Brief overview, actual collection trend, actionable exceptions | Summary and chart hierarchy refined; populated fixture reviewed |
| Students/admissions | Searchable register, IDs, consistent filters, editing drawer | Desktop and phone list reviewed; registration number restored; long forms retain grouped fields |
| Promotion/certificates/photos/ID cards | Explicit selection and preview, clear scope before changes | Shared controls/header treatment applies; printing and promotion require dedicated integration verification |
| Fee collection | Find record → review dues → enter split/payment → review receipt | Search and visual hierarchy refined; no payment submitted in review |
| Dues/receipts/reports/setup/online | Amounts and dates first, controlled verification, readable statements | Shared table styling; online failure corrected; reconciliation and receipt printing remain separate tests |
| Attendance | Date and section completion before individual marking | Populated section grid and phone layout reviewed; meaningful present/absent/leave colours retained |
| Exams | Exam context, class/subject progress, keyboard marks sheet | Populated marks grid reviewed; partial completion made neutral; failed-load state corrected |
| Timetable/homework/syllabus/copy checks | Work grids and dated lists with clear class/teacher context | Shell consistency applied; timetable failure corrected; not all underlying teaching records were populated |
| Staff/payroll/allocation/leave | Staff register, structured edit drawer, auditable payroll month | Populated register/payroll fixture and add-staff drawer reviewed; false payroll empty state fixed |
| Messages/PTM/chats | Audience and delivery state, readable conversation split | Populated message list reviewed; chat failure corrected; no message/meeting was sent |
| Transport | Route and student assignment registers, real capacity states | Shared shell/control treatment; live route assignment and capacity need integration verification |
| Settings/classes/users/data | Grouped forms, role-aware actions, clear saved/error feedback | School form and document preview reviewed; shared controls/dialogs aligned; actual settings not changed |
| Calendar/birthdays/reports/legacy entry routes | Specific task context, honest empty/setup states | Route sweep included; do not count placeholder capabilities as complete products |

## Scope limits

This is a broad UI refinement and route review, not a claim that every workflow is production certified. Unknown fixture endpoints expose error states; they do not establish how a full live dataset behaves. Payment/receipt correctness, salary calculations, bulk imports/promotions, role authorization, message delivery, printed output and screen-reader use still require scenario-specific end-to-end validation against a test backend. Public website and the separate parent app were outside this change. The requested login pointer visual remains intact.

Outstanding follow-up: populate transport, online claims, homework, meetings, enquiries and certificate registers with test-backend scenarios before certifying their full workflows; replace the two older technical setup helpers; exercise long names, large classes and record-level permission combinations. Planned capabilities remain planned. Their layouts have been reviewed, but they were not implemented as part of a visual refinement.

## Checks

- Production build passed on Next.js 15.5.29, including generation of all 54 static pages.
- TypeScript check passed after the UI/state edits.
- Nine existing regression tests passed, covering API recovery/deadlines, credentials, spreadsheet formats and fee-calculator source parity.
- Eleven browser assertions passed for the shared dialog hook's focus, Escape and nested scroll-lock behavior. This harness checks the hook in a browser; it is not a screen-reader certification.
- Three additional assertions passed against the actual admission drawer: open, focus inside, Escape close.
- Seven phone-width route captures had document width equal to viewport width (390px).
- The design detector reported no findings on the specifically scanned shell, dashboard, student, fee-collection, marks and ERP-style sources. Automated detection does not establish visual quality or whole-app accessibility.

Use [DESIGN.md](../../DESIGN.md) as the continuing contract so new modules do not drift back into competing colours, oversized cards and placeholder status claims.
