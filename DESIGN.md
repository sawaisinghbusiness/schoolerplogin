# SchoolDesk ERP interface

Scope: authenticated school-office web application. Mode: Operate. The public website, parent app, login illustration and printed school documents have separate visual requirements.

## Direction

Product: admissions, attendance, fees, examinations and staff administration for a school office.
Character: orderly, legible, dependable.
World: a school register and fee counter, translated into a working desktop application.
Content moments: collection trends and attendance completion, with actual numbers and labelled states.
Signature: persistent student register numbers and aligned Indian-currency amounts; records stay identifiable across lists and transactions.

## Working rules

- Neutral canvas `#f6f7f9`, white work surfaces, dividers `#dfe3e9`, dark navigation `#171b23`.
- Indigo identifies actions, focus and selection. Green means paid/present/completed; amber means a real warning; red means due/error/absence. A person's initials do not need a random colour.
- Use the operating-system UI face (Segoe UI on Windows, with Nirmala UI for Hindi). Keep the public-site type and official document typography separate.
- Titles name the task and remain visible. Desktop title 24px, mobile 21px; supporting text 13px. Avoid shouting weights and widely tracked capitals.
- Sidebar 244px; content fluid, capped at 1440px; desktop gutters 24–28px and mobile 16px. Keep natural vertical scrolling.
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
