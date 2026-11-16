# Ink + Oxide implementation — 16 November 2026

User approved Ink + Oxide after rejecting Petrol. Applied to desktop ERP and ERP mode inside Staff app. The earlier research galleries remain historical colour comparisons; they do not show the final carousel.

## Changes

- Introduced identical `app/erp-colours.css` in both repositories, imported after action defaults and before status badges. Removed the previous Petrol + Sand override blocks. Existing typography and task layouts remain.
- Shared semantic roles: cool canvas `#EEF1F5`, white surfaces, ink `#202938`, oxide actions `#A43F20`, dark rail `#242D3C`. Fixed light text on light sidebar controls. Financial green/red retained, with dark normal links/headings and outlined status semantics.
- ERP-app fee instalments now form a native horizontal scroll-snap deck. The next card peeks at the right. Left swipe brings it into place and moves the previous card left; right swipe reverses this. These are actual adjacent cards, not a text replacement in one card.
- Opens at the first outstanding instalment. Includes position, previous/next buttons, arrow-key browsing, end boundaries and reduced-motion handling. The `data-swipe` marker uses the existing AppShell gesture exclusion, preventing sidebar opening during card swipes.
- Browsing leaves amount, fee calculation and allocation unchanged. Skeleton is one card rather than four grid placeholders.
- Scoped screen styles leave personal staff, assistant, driver and official print styling outside the theme. No Parent repository changes or backend contract changes.

## Verification

Both repositories passed TypeScript checks. `git diff --check` passed. Seven populated web routes and five ERP-app routes were rendered with synthetic read-only API fixtures; no fixture/request/runtime errors or document overflow were reported in these captures.

`carousel-checks.json` records Quarter 2 initial → Quarter 3 by arrow → Quarter 2 by native right swipe → Quarter 3 by keyboard → Quarter 4 with reduced motion. The final next arrow is disabled. Amount remained `20,750` through the exercised states and sidebar remained closed. Narrow 360px capture has no page overflow. Also captured the opened ERP menu at 390px.

Evidence:

- [Dashboard](screens/web-dashboard-live.png)
- [Fee card deck](screens/erpApp-erp-fees-collect-live.png)
- [Narrow deck](screens/erpApp-erp-fees-collect-narrow.png)
- [Web measurements](rendered-web.json)
- [ERP-app measurements](rendered-erpApp.json)
- [Carousel interaction measurements](carousel-checks.json)

Scope of evidence: shared source changes cover ERP descendants, but representative captures do not prove every route/state is tested. Real payment writes were blocked; no live financial transaction was performed. Existing dashboard count/donut work was preserved. No push was requested for this implementation.
