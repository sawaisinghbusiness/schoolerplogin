# SchoolDesk ERP interface

Scope: authenticated school-office web application. Mode: Operate. The public website, parent app, login illustration and printed school documents have separate visual requirements.

## Direction

Product: admissions, attendance, fees, examinations and staff administration for a school office.
Character: orderly, legible, dependable.
World: a school register and fee counter, translated into a working desktop application.
Content moments: collection trends and attendance completion, with actual numbers and labelled states.
Signature: persistent student register numbers and aligned Indian-currency amounts; records stay identifiable across lists and transactions.

## Working rules

- Neutral canvas `#F4F5F7`, white work surfaces, dividers `#DCE2E7`, ink `#18252F`. Light navigation with dark ink active rows.
- Deep evergreen `#294E43` identifies filled operational primary actions; existing teal `#12665E` retains selection and supporting brand roles. Green means paid/present/completed; amber means a real warning; red means due/error/absence. A person's initials do not need a random colour.
- Use self-hosted IBM Plex Sans Variable in the ERP, with system fallbacks for Hindi. Keep the public-site type and official document typography separate.
- Titles name the task and remain visible. Desktop title 27px, mobile 24px; supporting text 13px. Avoid shouting weights and widely tracked capitals.
- Sidebar 236px; content fluid, capped at 1600px; desktop gutters 24–28px and mobile 16px. Keep natural vertical scrolling.
- Controls use compact corners, bordered surfaces and visible keyboard focus. Fields are at least 40px on desktop and 44px with 16px text on phones. Preserve icon padding when applying field rules.
- Tables are registers: quiet headers, stable row dividers, clear selected/focused states, identity first, amounts aligned. On phones retain the essential record and action; allow local scrolling for genuinely wide grids.
- Use drawers for editing a record while keeping list context. Keep the title and close control visible and the footer actions available. Trap and restore focus, handle the topmost Escape, and preserve nested scroll locks.
- Show numbers before decoration. Compact dashboard summary, one primary collection chart, secondary categorical breakdown and an actionable attention list. Do not repeat sparklines or progress bars in every row.
- An API failure is neither an empty list nor a zero balance. Stop loading indicators, show a persistent recovery action, and avoid inventing saved/sent/verified states.
- Do not show a notification bell claiming that everything is up to date without a notification source. Session names must come from configured data.
- No ornamental gradients, glowing controls, floating cards or bounce in office workflows. Respect reduced motion. The explicitly requested login pointer effect is confined to its left visual panel.

## Verification

Review rendered desktop and phone layouts, populated and empty/error states, keyboard focus, nested dialogs and long labels. Fixture captures must be labelled synthetic and kept separate from evidence of live backend behavior. Payment verification, payroll, sending messages and destructive writes need their own integration checks; screenshots do not prove those operations.

## References

Design review used the incumbent application, Impeccable's Operate guidance, and [Unslop by Damir Sokolovsky](https://github.com/heydamir/unslop), licensed CC BY 4.0. The product-specific rules above are an application of its spacing, quiet-chrome, typography and honest-state principles, not a replacement theme copied from its examples.


## Operational action palette

Primary actions across web, staff and parent products use deep evergreen #294E43, hover #203F36, pressed #18332B, white labels; disabled #D7DFD8 with #43564C. Secondary actions stay quiet; destructive/status/chart/navigation roles remain distinct. app/action-palette.css is scoped to authenticated operational shell/dialogs and ported workflow roots. Public website, login and explicitly excluded AI assistant designs retain existing treatment. See docs/action-colour-2026-11-15/REPORT.md.


## Driver app authority

Driver remains green/yellow/neutral, scoped by .drv and .driver-shell in the staff checkout. No ERP reskin. See docs/driver-review-2026-11-15/REPORT.md for tokens, workflows and rendered verification. Trip owns its full screen, without the general header or bottom tabs; never obscure operational controls.


## Transport monitoring by role

ERP web and staff ERP share the office TransportLivePanel register. Trip activity and GPS freshness are separate; failed polling is unavailable, not an empty fleet. Office location data requires admin/accountant authorization. Parent views are child-scoped and show recorded child status first. Driver Home is a departure sheet in warm neutral #F4F3ED, ink #17251E and yellow #FFCB00 for Start/Resume. See docs/transport-experience-2026-11-15/REPORT.md.


Transport flow revision: parents Bus overview links to /bus/tracking/; tracking does not repeat the route/crew register. ERP activity overview is compact; detail opens in an upper bounded native dialog. Driver transitions are180-220ms, no spring overshoot, with reduced motion respected. See docs/transport-experience-2026-11-15/REVISION.md.


## Status labels

Operational status badges use white, dark text, thin dark outline and a trailing semantic dot (red delay/rejection, purple running, green settled/approved/completed, amber waiting, neutral inactive). app/status-badges.css is shared across web/staff/parents and excludes assistant/public contexts. Functional chart/calendar/action colours remain distinct. See the final section of docs/transport-experience-2026-11-15/REVISION.md.
