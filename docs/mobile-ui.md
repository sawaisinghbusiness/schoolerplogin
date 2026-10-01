# Phone layout rules (ERP)

These rules cover screens below 640px wide (Tailwind's `sm` breakpoint). Desktop stays as it is. The numbers come from Apple's HIG, Material 3, WCAG 2.2 and NN/g, plus how Stripe, Linear and Shopify lay out their mobile admin screens.

Each rule names the shared piece that already does the work: a class in `app/globals.css` or a component in `components/`. Use that piece rather than rebuilding it in a page.

## Already handled by the app shell
- **Bottom tab bar** (`components/layout/MobileTabBar.tsx`): four everyday screens per role plus **Menu**, which opens the sidebar. Pages never add their own bottom navigation.
- **Top bar**: 56px, showing the page name only. The page's own `.page-title` is the big title.
- **Page padding**: 16px gutter, 16px top. The bottom leaves room for the tab bar and iPhone safe area.
- **`SideDrawer`**: becomes a full-screen sheet on phones, with a sticky footer and safe-area padding.
- **`Modal`**: becomes a bottom sheet on phones.
- **Inputs and buttons**: `.field` and `.field-sm` text is 16px on phones (iOS zooms into anything smaller). Fields are at least 44px tall (`.field-sm` 40px). `.btn` is at least 44px and `.btn-sm` 36px.
- **Page titles**: `.page-title` is 21px on phones and `.page-subtitle` is 13px.

## Numbers
| | Phone |
|---|---|
| Gutter / card padding | 16px (`px-4`, `p-4`); dense list cards `p-3` |
| Gap between sections / cards | 16–24px / 12px |
| Page title / section title | 21px bold / 15–16px semibold |
| Row title / body | 15px semibold / 14–15px |
| Meta text / badges | 13px / 12px; nothing below 11px |
| Money and counts in rows | 15px semibold, `tabular-nums`, right-aligned |
| Touch targets | at least 44×44, at least 8px apart; make the whole row one button or link |
| List row height | 1 line 48px, 2 lines 60–64px |

## Patterns to use

### 1. Headline numbers → `.kpi-grid`
Desktop shows tiles; phones show **one card with a row per number** (label left, number right, note under the label). Use this markup:
```tsx
<div className="kpi-grid" role="tablist">
  <button className="kpi rounded-2xl border bg-white p-4 shadow-card …desktop classes…" aria-selected={on}>
    <span className="kpi-label"><i className="h-2 w-2 rounded-full bg-rose-500" />Overdue now<Check className="kpi-desktop ml-auto …" /></span>
    <span className="kpi-value">₹84.8 L</span>
    <span className="kpi-note">632 students</span>
  </button>
  …
</div>
```
`aria-selected="true"` gets a left accent bar on phones. Anything inside a tile that only makes sense on desktop (tick, sparkline, progress bar) gets `kpi-desktop`, which hides it on phones. Keep it to **3–4 numbers**. Never show a 2×2 grid of big cards on a phone.

### 2. Lists of things → stacked rows, not a squeezed table
For students, dues, receipts, staff, enquiries, messages, users and certificates, show the desktop `<table>` from `sm` up (`hidden sm:block`). On phones show a `<ul className="divide-y divide-slate-100">` of `.m-row` items:
```tsx
<li><button className="m-row" onClick={open}>
  <Avatar … size="sm" />            {/* optional */}
  <span className="m-row-main">
    <span className="m-row-title">Anvi Chauhan</span>
    <span className="m-row-meta">11th-Commerce-Arts · Rajesh Chauhan</span>
  </span>
  <span className="m-row-value">₹12,500<span className="block text-xs font-medium text-rose-600">Q1 · 174d late</span></span>
</button></li>
```
Each row has one tap target, and its key number stays visible on the right. Bulk-select checkboxes can stay as a leading 44px hit area.

### 3. Grids people compare or fill in → sideways scroll
Marks entry, attendance registers and fee setup tables stay tables inside `overflow-x-auto`. On phones:
- The first column (name or roll) is `sticky left-0 bg-white z-10`.
- The header is sticky.
- Cells are at least 44px tall.

### 4. Header actions
The primary action stays a labelled button. Secondary actions (Refresh, Export, Import, Print) become **icon-only buttons on phones**: wrap the text in `<span className="hidden sm:inline">`, keep an `aria-label`, and make them `btn-secondary` at least 44px square. All actions sit on **one line** next to the title or right under it.

### 5. Tabs, chips and filters
- **Segmented tabs**: when there are more than 3, or they don't fit, put them in a `.scroll-row` (sideways scroll, no wrapping, no cut-off text). The container must not overflow the page.
- **Filters**: several `<select>`s go in **one** `.scroll-row` with `shrink-0` children, instead of one line each.
- **Search**: full width (`w-full sm:w-72`), 44px tall.

### 6. Cards and grids of choices
- Choice grids (sections to mark, classes) use compact chips or rows at least 44px tall, 3–4 per line, not tall cards 2 per line.
- Don't nest cards inside cards on phones. Use dividers.

### 7. Forms in drawers
- Single column on phones (`grid gap-4 sm:grid-cols-2`).
- Labels above fields.
- Set `inputMode`: `numeric` for SR/roll numbers, `decimal` for money, `tel` for mobiles, `email`.
- The Save button lives in the drawer footer, which is sticky already.

## Avoid
- 2-up stat grids.
- Desktop tables squeezed until text drops to 10–11px.
- Text cut off at the right edge.
- Buttons wrapping onto two lines.
- Tap targets under 44px.
- Several floating buttons.
- Hover-only actions.
- Long ₹ amounts wrapping.
- Numbers that aren't tabular.
- Everything boxed in its own card.

## Check
Run the screenshot harness at 390×844 and 360×740 (scratchpad `shots/mobile-audit.js`). For each page, check:
- No page-level horizontal scroll.
- No input under 16px.
- The first screen shows the real work (the list or form), not just stats.
