---
name: erp-interface-design
description: Design and unify operational ERP interfaces across desktop web and staff apps. Use for school or business registers, fees, attendance, marks, payroll, settings, and multi-page consistency reviews, especially when extending an approved homepage. Covers workflow-specific layouts and rendered verification rather than a generic dashboard reskin.
---

# ERP interface design

Build an interface staff can trust while working through records, amounts and repeated tasks. This method comes from the SMS Barmer desktop ERP and staff-app ERP redesigns: a consistent visual vocabulary, distinct layouts for distinct jobs, and inspection of populated screens.

## Establish the visual authority

Inspect the actual repository, route map, role boundaries, shared components and rendered screens before editing. Confirm which application is being discussed when desktop ERP, staff PWA and parent app coexist. Record existing local changes before work.

If the user approves a homepage or reference screen, treat its font, palette, rhythm and component language as the authority. Extract its rules; do not redesign the reference as a side effect. A generic font-popularity detector does not override an explicitly approved typeface.

For an existing app, read its PRODUCT.md and DESIGN.md if present. If missing, document only product facts supported by the repository and user. Ask only when a consequential choice cannot be inferred. Do not invent school claims, configuration, metrics or roles.

Choose a coherent direction from the actual operating scene: desktop office work, a teacher between classes, or another confirmed context. Existing brand authority takes precedence over the examples below.

Read [the project examples](references/design-examples.md) when extracting tokens or choosing task patterns. These are two successful implementations, not universal colours or required fonts.

## Map the work before styling

Make a route inventory with each route's job, primary action, data density, states and role. Distinguish a route-specific update from shared-system inheritance, a redirect and a planned feature. A route count is not a feature-completion count.

For each screen, identify what the operator must recognise first, decide next and do. Use that to choose its composition:

- Registers: stable identity, useful filters, quiet headers, aligned amounts and explicit row actions.
- Fee counter: find the correct student, understand the ledger, then collect; keep outstanding balances and today's activity secondary.
- Attendance: section completion followed by a continuous roster with reachable status controls.
- Marks: exam/class/subject context, student identity and full part labels, then entry and save.
- Settings: a continuous editor with related fields together; separate official-print preview from editing.
- Communication: audience, readable message, delivery state and reply action in a predictable order.

Use the same visual language across these screens without forcing every task into the same arrangement of cards.

## Encode one shared system

Extract semantic tokens for canvas, paper, ink, muted text, divider, primary action and status. Define type roles, spacing, control heights and corner families. Prefer one interface font family plus the required script fallback; keep labels, numbers, buttons and names in that vocabulary.

Brand colour means action or selection. Green, amber and red should carry actual states. Identity initials do not need arbitrary rainbow colours. Preserve necessary chart category distinctions with labels; do not erase useful semantics to make a page monochrome.

Put shared rules in components or a deliberately scoped stylesheet. Give three- and four-metric bands explicit variants rather than forcing one grid onto all uses. Apply normal page padding only to task-page containers; full-screen chat and document previews have different constraints. Give portalled menus, sheets and save bars the same font and tokens explicitly.

Refactor repeated patterns before accumulating per-page overrides. Preserve icon padding and native date/select affordances. Check cascade specificity when a shared class coexists with flex-column or utility-grid classes.

Operational surfaces generally earn their character through alignment, typography, dividers, grouping and clear states. Remove decoration when it obscures those: indiscriminate glass, glow, gradient save buttons, 3D identity flips, random pastel avatars, ornamental rings or repeated entrances. An approved homepage illustration, requested login effect or official document is contextual evidence, not permission to spread that treatment throughout the app.

## Make it fit the task and device

Use available content width, not viewport labels alone. A persistent sidebar can make a tablet's content narrower than a phone layout assumes. Keep compact rows until the full register actually fits.

On phones, keep student identity and the primary action visible. Stack related selectors before labels become ellipses. Wrap multipart marks beneath identity. Local scrolling is appropriate for a real grid, but does not excuse hiding the only action offscreen.

Render summary bands with the correct number of cells. Put official preview behind disclosure when it would bury working fields. Keep a stable register identity and tabular currency values across list, drawer and transaction views.

Validate save bars against the real tab bar and safe area. Check floating assistants and other fixed controls against save actions, keyboard and sheets. Avoid moving an approved floating control on the homepage unnecessarily.

Treat a failed API request as unavailable data, not an empty register or zero balance. End loading, preserve useful context and expose recovery. Do not imply that a message was sent, a receipt verified or a count known without supporting state. Keep existing permissions and backend contracts while redesigning presentation; a payment-contract change is separate work unless authorised.

## Verify the rendered result

Read [verification and delivery](references/verification.md) before browser review. Review representative populated tasks, narrow widths, long labels, bilingual copy where relevant, and the important empty/error/loading states. Source inspection and successful compilation cannot establish visual quality.

If delegation is authorised and useful, split ownership by workflow and avoid concurrent edits to the shared kit. Give each contributor the same visual authority and tokens. Have a fresh review look for concrete failures in the integrated result, rather than asking contributors to praise their own changes. Without delegation, perform a separate evidence-driven pass.

Fix observed problems, then rerun the affected checks. Do not keep repeating broad checks after they pass without a new reason. Keep backend transactions out of a local visual-review harness.

## Finish with reviewable evidence

Document the implemented design rules in DESIGN.md and give the user a route inventory, concise review report and selected rendered evidence appropriate to the scope. Explain important changed behavior and any verification limits. Preserve unrelated working files. Commit, push or deploy only when the user's request authorises that action.

A good handoff distinguishes source coverage, rendered coverage, interaction checks and backend integration evidence. Never call every route redesigned or fully tested solely because it inherits a stylesheet.
