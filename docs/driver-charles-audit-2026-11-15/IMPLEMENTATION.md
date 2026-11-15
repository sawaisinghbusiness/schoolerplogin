# Driver refinement implementation

This applies the audit in REPORT.md to the existing driver interface. No new visual identity, animation library or backend contract was introduced. No commit or push was requested.

## Applied

| Audit item | Change |
|---|---|
| Navigation state | Home receives its yellow fill only on Home. Other pages show one current destination. |
| Touch areas | Home language, notifications and profile controls have 44px areas; map controls are 48px; trip-card Back is 44px. Swipe fallback is 44px high and 12px text. |
| Swipe lifecycle | Removed the 170ms wait before invoking the action; duplicate activation stays locked. Pending spinner starts after 300ms. Checkmark appears only on accepted result; false/rejected results reset. Preserved concurrent feedback/hold edits. |
| History motion | Removed nested record entrance and automatic driver route entrance. One date-content transition remains; existing stale-response/date guard remains. |
| Empty Help | Hide Help entirely when a driver has neither an office phone nor another eligible action. |
| Long place names | Trip information wraps origin/destination. Simple direction arrow replaces the decorative dashed bus connector. Explicit opacity/transform transition replaces transition-all. |
| Location recovery | One contextual instruction for permission blocked, stale fix or unavailable location. School-delivery failure remains distinct. |
| Type and rhythm | Added driver caption/support/body/section roles; lifted 11/11.5px utility text to 12px within driver scope. History route/footer and Home manifest use 14px. Existing Inter/Noto and approved title hierarchy retained. |
| History meaning | Correct trip plural/count in both languages; clear boarding/drop-entry label and concise planned-distance qualifier. |
| Home hierarchy | Removed the redundant direction sentence. Kept greeting, departure sheet, endpoints, manifest, swipe and collapsed stops. |
| Stop alert | Arrival ripple runs once. Existing 3-second/manual setting and child identity remain. |
| Motion rules | Shared press/disclosure/page/settling values; removed unused entrance definitions. Added driver-shell focus and reduced-motion handling, including navigation. |

## Concurrent local work

Other edits appeared during this task in driver Home, Trip, SlideConfirm, lib/demo.ts and lib/slideFeedback.ts. They were preserved rather than reset. In particular, the latest Home swipe opens the pre-trip screen; its separate confirmation starts the trip. Feedback currently uses that local haptic/drag implementation rather than the older completion-tone implementation described in the initial audit. `hold` keeps an accepted start slider latched while navigation opens.

The current separate `PRETEND_BUS` edit enables simulated bus movement even with `NEXT_PUBLIC_DEMO=0`. Browser tests intercept API traffic and do not establish real GPS tracking. This refinement does not change or certify that telemetry policy.

## Verification evidence

See browser/result.json and browser/*.png for the executed synthetic scenarios. Browser source is retained in browser.cjs. The browser uses an isolated context, fixture users/routes, intercepted APIs and a blank synthetic basemap; no school records or live trips are changed.

- Typecheck passed.
- Production build passed with demo mode disabled: 94 pages generated/exported. Generated review-only TypeScript includes were removed afterward.
- Six existing role-isolation, persistence and received-motion regression tests passed.
- Fifteen main browser captures passed with zero runtime exceptions: 360/390px layouts, Hindi, single current navigation, 44px header targets, collapsed stops, rapid date selection, partial/full swipes, trip details, stop roster and reduced motion.
- Separate failed/slow-request checks passed: failed start stays on pre-trip and resets; no spinner in the first 100ms; sustained request shows pending; pending control is disabled; duplicate keyboard activation submits once. Two additional captures are retained with swipe-states.json.

Physical iPhone audio/haptics, outdoor readability, road-camera correctness and actual GPS/upload behavior still require device review. Existing screenshot evidence cannot establish those results. No assistant interface changes were made.
