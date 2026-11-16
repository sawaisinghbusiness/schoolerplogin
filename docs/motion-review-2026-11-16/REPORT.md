# Loading and motion research — 16 November 2026

**Recommendation:** one shared motion language across ERP web, Staff/ERP, Driver and Parents, with different behaviour for first load, cached return, navigation, pagination and live updates. Do not put the Driver homepage entrance on every component or add fake waiting time.

This is the requested research stage. No application animation has been changed in this review. Earlier theme, forms, dialogs, driver map and slider work is outside this study.

## Concrete findings in this project

### All Students: the reported issue is reproduced

Staff ERP `app/(app)/erp/students/page.tsx` initially displays **30** students. “Load more” increases the visible count by **60**, using data already held in memory. It is not a new API request. Rows have stable IDs, but there is no arrival treatment on newly revealed rows.

With 140 synthetic students in an isolated browser at 390px, clicking the button changed the rendered list from **30 to 90 rows**. The newly added rows had **zero running animations** in the observation taken shortly afterwards. See [load-more-observation.json](load-more-observation.json) and the [before](screens/erpApp-erp-students-before.png)/[after](screens/erpApp-erp-students-after.png) captures. This is functional evidence, not a phone performance benchmark.

The appropriate correction is a quick press response plus animation on new records. An artificial spinner or deliberately delayed reveal would misrepresent a local operation.

### Other surfaces do different work

- **ERP web Students:** uses 25-row page replacement with previous/next controls, not append-style Load more. Animate the incoming table body as a short transition; preserve column widths, filters and stable table geometry. Do not convert pagination to infinite scrolling as a side effect.
- **Parents Notices:** genuinely requests another page. The current button becomes an ellipsis while busy. Keep its width/label meaningful, expose actual loading, retain existing notices and animate only the additional notices after success. Existing error feedback should remain available.
- **Staff/Parents page navigation:** existing helpers already distinguish forward, back and bottom-tab navigation. Current forward entry moves 32% of a screen and back entry 24%, with a 300ms duration. For a working ERP, a shorter travel distance can convey direction without pushing the whole workspace across the phone.
- **Staff task pages:** a shared rule disables `.animate-rise`. Simply adding more copies of that class will not solve appended-row motion; it also risks conflicting with the shell animation.
- **Web shell:** already has directional 280ms, 16px page entry. Its content boundary is keyed by pathname. Initial loading and data arrival are mostly page-specific; a route shell transition alone does not acknowledge an API response.
- **Driver homepage:** differentiates opening with missing data from opening with cached data. Its shaped placeholders and real content share a composition; the content does not repeat the full entrance after the loader has already entered. This is the useful pattern to carry over.
- **Caching:** Staff/Parents resource hooks can restore cached data while refreshing. Replacing that usable data with skeletons on every return would make the interface appear slower. View state such as shown-row count, filters and scroll position also needs explicit restoration where a page remounts; an animation alone does not preserve it.
- **Route boundaries:** the source census found no `loading.tsx` files in the three app directories. This does not mean there are no loaders: individual pages already render skeletons. Route-code waiting and client API waiting need separate treatment.

The census covered **284 web files / 72 page files**, **223 Staff files / 94 page files**, and **112 Parents files / 36 page files**. Driver is inside the Staff repository. These are source counts, not claims of visually checking every page. The broad text scan also finds `setShown` in assistant thinking components; those are **not pagination** and are excluded. Full file references/hashes are in [source-inventory.json](source-inventory.json).

## Research and interpretation

| Reference | Relevant principle | Decision here |
|---|---|---|
| [Material 3 motion](https://m3.material.io/styles/motion) | Its standard motion scheme is intended for functional products with minimal bounce; expressive motion is a different choice. | Routine records, forms and tabs settle without overshoot. Preserve the specifically approved Driver-home moment rather than copying its spring everywhere. |
| [NN/g animation duration](https://www.nngroup.com/articles/animation-duration/) | Motion needs a trigger, transformation and appropriate duration; excessive duration becomes an obstacle. | Make feedback immediate and entrances short. Use direction and small displacement rather than a long staged reveal. |
| [Carbon loading](https://www.carbondesignsystem.com/building-blocks/core/components/loading/guidelines) | Structured page loading favours skeletons; local actions can use local indicators; simultaneous loaders can overwhelm. | Page-family skeletons on a genuine cold load, inline status for remote Load more, no full-page takeover while adding rows. |
| [Apple loading](https://developer.apple.com/design/human-interface-guidelines/loading) | Show useful content early, replace placeholders as content arrives and allow other work while waiting. | Preserve the shell and existing records. No mandatory loading animation before usable data is shown. |
| [W3C reduced-motion technique](https://www.w3.org/WAI/WCAG22/Techniques/css/C39.html) | Respect the user's motion preference for nonessential movement. | Remove spatial entry, shimmer and staggering when reduced motion is requested; retain readable status and usable controls. |
| [Next loading convention](https://nextjs.org/docs/app/api-reference/file-conventions/loading) | Route-segment loading uses Suspense and can keep shared layout interactive. | Add scoped route fallbacks where useful, but retain explicit client-fetch states. A loading file alone does not observe our `useApi` fetch inside an effect. Validate against the installed Next 14/15 versions; do not introduce latest-only APIs from Next 16 docs. |

These references support principles, not a universal “best” easing curve or a claim that animation releases dopamine. The numeric settings below are product-specific starting values to validate in the real app.

## Proposed motion specification

| Event | Proposed behaviour | Starting timing |
|---|---|---|
| Button press | Immediate pressed state; do not animate the whole page | 80–120ms feedback |
| Newly opened ordinary page | Small forward movement plus opacity; title/shell remain stable | 220–260ms, 12–16px |
| Back to a populated page | Small reverse movement, restored content/scroll; no pretend loading | 180–220ms, 8–12px |
| Main-tab switch | Brief opacity transition; no large horizontal trip | 120–160ms |
| Initial data unavailable | Skeleton shaped for the page family, with matching row/card dimensions | Show relevant placeholder; data never waits for animation |
| Skeleton → content | Replace in place; one short content reveal | 180–240ms, at most 6px movement |
| Local “show more” | Existing rows stationary; new rows rise slightly into place | 220–280ms, 8–10px |
| Append stagger | Only the first 4–6 newly visible rows get a bounded sequence; never 60 delayed rows | 20–30ms spacing; cap total extra delay at 100ms |
| Remote Load more | Busy button/status while request is pending; appended content uses the same reveal | Immediate busy state; reveal after success |
| Filter/page replacement | Stable list/table region with a small transition; no replay of page chrome | 140–200ms |
| Background refresh | Existing data stays usable; quiet updating status if needed | No entrance replay |
| Error/retry | Stop loading, keep existing rows, show a readable retry action | Short status transition; no shaking or flashing |

Use a non-overshooting ease-out such as `cubic-bezier(.2,.8,.2,1)` for entry, and preserve direct finger tracking for gestures. These values are not copied requirements from a standard. The preview lab demonstrates the mechanism separately from the real app.

## Precise Load more flow

**Local Students reveal:** press → add the next batch immediately → animate only the first few new visible records → update count/status. Keep stable IDs; do not re-key the entire list or animate all previously visible students. Do not add a timeout to create a spinner. Retain scroll position. A short polite announcement can say how many records became available.

**Remote Notices pagination:** press → disable repeated submission and show “Loading older messages…” in a fixed-size control → keep current notices → append a successful batch with stable IDs → announce the result. On failure, preserve the list and expose Retry. No synthetic percentages. If the final page removes the button, maintain sensible keyboard focus and do not force pointer users to jump to another scroll position.

For hundreds of records, a bounded visible entrance is more useful than an elaborate waterfall down the entire list. Large lists still need rendering/pagination work if they are slow; animation must not disguise that cost.

## Where a shared treatment belongs

| Page family | First load | Return / later update |
|---|---|---|
| Students, staff, dues, receipts, notices | Realistic list/table skeleton, then short content reveal | Restore usable list; new rows only on append |
| Attendance and marks | Keep class/date selectors; roster/grid placeholder in data region | Retain entered values, selected context and keyboard focus |
| Admission, fee collection, staff forms, settings | Stable form labels and section structure; placeholder only for unavailable dependent data | No animation per keystroke, per validation update or per active field |
| Fees/payments/payroll | Stable labelled amount regions and relevant action feedback | Do not replay money counters on every render; keep payment confirmation deliberate |
| Calendar and date-based records | Stable header and grid; contextual loading where data is missing | Animate the changed period, not the whole application |
| Homework, documents and attachments | List/detail loading shaped to actual content | Upload/download status belongs to its attachment or button |
| Driver homepage | Retain its approved shaped loading/arrival logic | Prevent an extra global entrance on top of its own animation |
| Dialogs/sheets | Keep their existing entrance, focus handling and stacking | Do not animate the parent screen again when they open/close |

## Explicit exclusions

- **Live map:** preserve continuous marker/camera interpolation; no page/skeleton animation on every GPS update. Never return to a stale or simulated identity because of a presentation cache.
- **Chat and AI assistant:** preserve the user's approved assistant design and message/composer behaviour. A global entrance must not replay on each token/message or move the keyboard/composer.
- **Active form editing:** no remount to trigger animations, no focus jumps, no replay on typing or validation.
- **Study timer:** time updates do not cause whole-screen motion.
- **Print/PDF/receipt output:** no motion and no hidden content depending on an animation finishing.
- **Cached background refresh:** no blank screen or full-screen skeleton when useful data already exists.
- **Role/account/child switching:** loading feedback must follow the correct identity. Never expose the previous person's data to avoid a loader.
- **Driver gestures and safety prompts:** keep their existing deliberate action thresholds and feedback. This project must not turn navigation animation into trip-start confirmation.

## Implementation approach after this research

1. Define shared motion roles and reduced-motion fallbacks. Keep palettes and typography unchanged.
2. Implement append-aware list handling and button states for the actual Students and Notices flows first. Keep table semantics intact; don't put invalid wrapper elements around `tr`.
3. Reconcile existing shell transitions and page-level animation classes. One transition owner per region; prevent wrapper + child + skeleton from all entering in sequence.
4. Introduce page-family loading primitives and scoped route fallbacks. Client API loading remains an explicit resource state.
5. Preserve navigation view state where required, while keeping account/role/child isolation and unsaved-form protections. Avoid forced remounts as an animation technique.
6. Apply the page-family matrix across source routes; record inherited coverage separately from routes actually exercised in the browser.

Do not solve this with a global DOM observer that animates every inserted element. It would catch chat tokens, totals, form errors, map overlays and other unrelated changes.

## Required verification before calling implementation complete

- Students with >90 records: old rows do not replay, only appended IDs animate, repeated presses remain safe and scroll position is stable.
- Notices slow success/failure/last page: loading is truthful, existing content stays, no duplicate rows and retry works.
- Cold vs cached routes, forward/back/tab navigation and interrupted navigation: no blank frame, doubled entrance or forced delay.
- Form edits, open sheets, chats, map updates and timer ticks: exclusions remain intact.
- 360/390px phones and desktop/tablet ERP: inspect actual frames and usable controls, not just settled screenshots.
- Reduced motion: no spatial movement or animated placeholder sweep, with loading/status still understandable.
- Performance profiling on representative Android hardware is still required. Dev screenshots or a desktop Chromium fixture are not evidence of consistent 60fps on a phone.

## Delivered evidence

- [Source census](source-inventory.json)
- [Current Students Load more observation](load-more-observation.json)
- [Current browser run](rendered-current.json)
- [Interactive motion lab](index.html): proposal mechanics only; no real app or school data changes.

This report completes the research stage; it does not claim app-wide implementation or verification.
