# Rendered verification and delivery

## Capture valid evidence

Use the project's existing test/preview facilities where possible. For visual review, prefer an isolated local preview with demo or synthetic fixture data. Keep fixtures out of application code and record their provenance. Intercepting writes in a review browser must not change the real backend.

Use a separate browser context for roles whose login modes live in localStorage. Separate tabs can share storage: staff and ERP tabs then silently contaminate each other. Confirm the actual URL, role and populated content before accepting a capture.

Reject blank pages, unresolved loading states and wrong-route screenshots. Wait for hydration and relevant data, then inspect body content and task controls. Zero overflow or zero exceptions on a blank page is not a successful review. Recapture missing fixture states with the correct contract; do not hide legitimate errors with invented success responses.

When an app has a user-pinned viewport scale, device width can differ from CSS layout width. Record both. Use strict CSS-width captures for narrow-layout stress tests while preserving the product's approved viewport setting. Do not repair apparent overflow by changing a user-pinned zoom.

Give reruns separate evidence directories or deliberately merge inventories; a failed partial rerun must not silently replace a complete manifest. Mark superseded captures so the report uses the corrected version.

## Choose checks that can find actual failures

| Surface | Inspect in the real render |
|---|---|
| Desktop register | Stable identity, amount alignment, useful filters, long labels, reachable row action |
| Tablet workspace | Width remaining after sidebar, fixed column tracks and gaps, inner clipping |
| Phone marks | Identity and full part labels, input wrapping, primary action visible without undisclosed horizontal scrolling |
| Form | Related fields grouped, native controls, validation feedback, dirty/save state |
| Three-metric band | Exactly three useful cells; no inherited four-column hole or unexpected third-cell wrap |
| Chat / assistant | No inherited task-page top gap; composer and keyboard space; readable conversation |
| Sheet / side menu | Initial focus, forward/reverse Tab wrap, topmost Escape, focus restoration, nested scroll lock |
| Fixed save action | Actual nav top and safe area; assistant/save overlap; settled geometry and reduced motion |
| Error state | Loading ends, data is unavailable rather than zero, recovery action is meaningful |
| Hindi / long copy | Font fallback, line height, label wrapping and preserved text encoding |

Inspect overflow inside containers as well as document width. A page can have zero document overflow while its only Enter marks button sits out of view in a horizontally scrolling table.

Inspect computed component geometry when fixed controls interact. A correct-looking margin class does not establish that an assistant clears a save bar. Include state changes such as opening the marks sheet or inserting a sticky footer; wait for any transition to settle and respect reduced motion.

## Review workflow

Source review establishes scope and likely risks. Rendered screenshots establish composition. Interaction checks establish behavior in the exercised states. Build/type checks establish code validity. Backend integration checks establish the exercised server operations. Keep those conclusions distinct.

Run the repository's checks appropriate to the changes. For Next.js projects, keep dev and production build directories separate when running concurrently, and disable demo mode in the production build. Do not commit generated build artifacts or test-only TypeScript include changes. Limit parallel capture/build work when it causes cold-navigation timeouts; retry the affected evidence after resources settle.

If a mechanical design tool flags an approved homepage font as common, record the justified exception. Do not silently replace the user's chosen identity to satisfy the detector. Likewise, do not call a detector warning proof that the application is bad or a clean detector proof that it is good.

For a separate finish review, supply the built interface, intended scope and practical tasks. Ask for prioritised concrete findings with evidence. Resolve demonstrated issues; do not churn the design based on generic taste suggestions.

## Useful report

For a multi-page redesign, include:

- Authority and implemented design rules, including legitimate role/document differences.
- Route inventory distinguishing page edits, shared inheritance, redirects and planned modules.
- A small gallery of populated representative screens plus relevant narrow/bilingual states.
- Concrete issues found and corrected through review.
- Checks run and the precise limits of what they establish.

Do not equate screenshots with verified payment cancellation, payroll posting, approval, message delivery or GPS correctness. Keep the user-facing final concise and link the review artifacts when they exist.
