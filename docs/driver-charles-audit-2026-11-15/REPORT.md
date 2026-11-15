# Driver app: Charles skills review

Date: 15 November 2026. Scope: recommendations only; no application code changed.

Implementation subsequently authorized and applied: see [implementation and verification](IMPLEMENTATION.md). The findings below retain the original audit state for comparison.

The four supplied URLs refer to one repository. Relevant methods are Charles Unslop, Polish, UX Animation and Unreasonable Craft. Storage cleanup, arcade assets and store screenshots do not justify changes to this operational app.

## Evidence and limits

Reviewed current staff/driver source under `C:/Users/ADMIN/Desktop/folder for staff app erp project`, following published baseline `904bbedc54e65f164000b8db42263e761beced04`. Visually inspected existing synthetic browser captures: Home with stops collapsed, Trip record and Profile in `docs/driver-review-2026-11-15/browser/`. These are existing captures, not a new browser run. Findings below distinguish source-confirmed issues from proposals requiring rendered or physical testing. No new performance, accessibility certification or device testing is claimed.

## Interaction inventory

| Interaction | Frequency | Feedback that should matter |
|---|---|---|
| Switch Home / Trip record / Profile | Frequent | One selected destination; immediate response |
| Select morning / afternoon | Daily | Clear selected run and matching route data |
| Expand Today's stops | Occasional | Inline disclosure; arrow and content move together |
| Swipe Start / At the stop | Repeated, consequential | Direct finger movement, latch, then honest action outcome |
| Open map controls / trip information | Repeated | Reachable controls; route remains understandable |
| Receive stop alert | Per stop | Recognizable child/stop, clear next action, no accidental marking |
| Mark children / complete stop / end trip | Consequential | Pending, saved and failure states distinguishable |
| Report delay | Exceptional | Reason and duration clear before submission |
| Switch history date | Repeated during review | Distinct date context without stacked animation |
| Expand salary / change settings | Occasional | Quiet disclosure and persistent selected state |

## Design direction and boundaries

Product: a working driver's route companion. Character: calm, readable and decisive. World: warm neutral surfaces, dark green structure and yellow primary action. Moment: a quick glance while safely stopped. Signature: the departure sheet and deliberate swipe confirmation.

Improve the existing product rather than add a decorative dashboard. Preserve the driver identity, collapsed Today's stops, right-swipe actions, quiet completion sound, upright yellow bus and road-ahead map direction. Preserve outlined status labels with dark text and a coloured right dot. The generic anti-pill advice does not override that approved system. Keep the restored AI assistant design untouched.

## Findings and proposed changes

### 1. Two destinations look selected — friction / priority 1

**Evidence:** `components/AppShell.tsx:138–152`. The middle Home tab receives a yellow fill unconditionally through `mid`; other active destinations also become yellow. Existing History and Profile captures show both emphasized.

**Before:** Home looks selected even while another page is open.

**After:** exactly one current destination receives the selected treatment. Home retains its normal identity when inactive. Keep the existing black navigation surface and yellow accent.

**Principle:** hierarchy and state clarity before cosmetic polish.

### 2. Small controls need larger touch areas — friction / priority 1

**Evidence:** `components/driver/DriverHome.tsx:52` uses 28 × 30 CSS-pixel language buttons; line 57 uses a 40 × 36 notification link. `components/BusMap.tsx:185` specifies 40 × 40 map buttons. These are source dimensions, not fresh measurements of computed layout.

**Before:** compact visual controls also have compact hit regions.

**After:** use at least 44 × 44 phone touch areas, preferably 48 for frequently used map controls. Keep small icons inside those areas. Check spacing between adjacent language options and the swipe fallback; invisible hit areas must not overlap.

**Principle:** target acquisition. This is a usability target, not a claim that every control fails a particular accessibility standard.

### 3. Swipe feedback needs a clearer action lifecycle — friction / priority 1

**Evidence:** `components/driver/SlideConfirm.tsx:15–17` starts pending feedback and plays the cue, then waits 170 ms before calling `onConfirm`. The same path handles keyboard activation. The handle immediately becomes a spinner.

**Before:** even a local next step waits; a fast operation can flash a spinner. The sound acknowledges the gesture before the operation has succeeded.

**After:** retain the requested smooth latch and custom sound as gesture acknowledgement. Distinguish that acknowledgement from saved success. Begin the operation promptly where safe; let settling run alongside it. Avoid an artificial keyboard delay. Delay the spinner for short operations; show explicit failure and preserve retry state. Measure the actual swipe before changing its curve.

**Acceptance:** full swipe triggers once; partial/cancelled swipe stays silent; slow and failed requests never display saved success. Fallback controls remain usable without dragging.

### 4. History has overlapping transitions — polish / priority 2

**Evidence:** `app/(app)/trip/history/page.tsx:52,58` keys both the date wrapper and loaded records. `app/driver-dispatch.css:54` animates both wrappers, with separate vertical movement. `components/AppShell.tsx:289` also applies route entry to driver pages.

**Before:** a date change can animate an outer wrapper and then animate its loaded content again.

**After:** one coordinated date-content transition. Keep the date strip stable; reserve content space while loading. Latest selected date wins on rapid taps. Preserve the user's request that different dates feel distinct. Do not add entrance movement to content already resting on first paint.

**Principle:** one purpose per movement; frequency and interruption matter more than animation count.

### 5. Profile can render an empty Help section — polish / priority 2

**Evidence:** `app/(app)/profile/page.tsx:91–93` always renders Help, but its office row depends on a phone number and its assistant row excludes drivers. `components/erp/ErpProfile.tsx:55` renders Group even when no children remain. The synthetic Profile capture shows this empty heading.

**After:** render the entire group only when at least one actionable row exists. Do not invent a phone number or restore an unwanted assistant entry.

### 6. Trip information loses long route names — friction / priority 2

**Evidence:** `app/(app)/trip/page.tsx:508,515` truncates both origin and destination. The information panel at line 491 uses a broad `transition-all` declaration.

**After:** allow two-line place names or an explicit full-name expansion. Put the next meaningful stop before decorative connection graphics. Animate only the intended opacity/transform/disclosure properties so unrelated size changes do not acquire accidental animation.

**Verification needed:** long Hindi and English names at narrow widths, with the map controls and bottom action visible.

### 7. Location recovery copy repeats itself — polish / priority 2

**Evidence:** `app/(app)/trip/page.tsx:552–557` displays a problem-specific explanation and a generic permission instruction beneath it. Separate server delivery failure already exists at lines 565–566.

**After:** one clear problem and one matching recovery: permission blocked, stale fix, or delivery failure. Preserve the important distinction between the phone having a location and that location reaching the school. Keep honest last-sent timestamps and automatic retry information.

### 8. Typography and component rhythm need consolidation — polish / priority 2

**Evidence:** `app/driver-dispatch.css` contains many closely spaced font sizes and weights; Home, History and shared Profile components use different small-text conventions. History includes 11 px status styling and several 12 px supporting roles.

**After:** define a small semantic scale: caption around 12, supporting text 14, body/action 16, section 20 and page title 24–26 CSS pixels. Treat these as starting roles, not a blanket replacement. Essential instructions need body-level readability; large journey times remain prominent and tabular. Preserve the established font family and test Hindi line height.

Use a shared spacing rhythm around 4/8/12/16/24/32. Adjust by information relationship, not by making every page the same card grid. Remove redundant separators before adding surfaces or shadows.

### 9. History copy needs precise meaning — polish / priority 2

**Evidence:** `app/(app)/trip/history/page.tsx:55` renders `1 trip records`. The existing capture labels the aggregate `On / off` and includes a prominent route-distance disclaimer.

**After:** singular/plural correctly; use a clear boarding/drop-entry label rather than imply unique children. Keep estimated route distance distinct from GPS distance. Consider a short inline qualifier instead of a large repeated explanatory paragraph. Match the meaning in Hindi, including record counts.

### 10. Home can lose one redundant layer — polish / priority 3

**Evidence:** `components/driver/DriverHome.tsx:124` repeats journey direction below the route title even though morning/afternoon and origin/destination already communicate it.

**Proposal:** compare the departure sheet with that sentence removed. Keep it only where it resolves genuine ambiguity. Preserve the small identity greeting, route endpoints, manifest and collapsed stops. Do not replace the approved Home with a new hero or additional metrics.

### 11. Stop alert motion needs a real-use check — polish / priority 3

**Evidence:** `app/globals.css:502–510` defines a repeating 2.4-second alert ripple. Reduced-motion handling already exists.

**Proposal requiring device review:** compare a single arrival pulse with the repeating ripple across several consecutive stops. Keep child identity and the stop instruction dominant. Retain the user's 3-second/manual-close preference; do not silently change that duration. Check whether longer names and Hindi instructions remain understandable during the timed alert.

### 12. Share motion rules, not more animation — polish / priority 3

**Evidence:** route, date, disclosure and swipe timing currently live in separate CSS/component declarations.

**After:** define purpose-based timings for press, disclosure, route change and action settling. Write a short swipe storyboard: drag → latch → pending when needed → saved or retry. Use the existing CSS/RAF approach; no additional animation package is warranted. Reduced motion must preserve every action and state without travel or pulsing.

## Implementation order

1. Fix selected navigation, touch areas and swipe/action feedback.
2. Fix empty states, long place names and location recovery hierarchy.
3. Consolidate type, spacing and precise bilingual copy.
4. Refine date/disclosure motion and remove redundant decoration.
5. Verify the complete journey before considering additional visual ideas.

## Verification before implementation is called complete

- Test 360/390 px widths, short screen heights, long names, Hindi and enlarged text.
- Check keyboard focus, non-drag confirmation and reduced motion.
- Exercise rapid date switching and interrupted disclosure transitions.
- Check immediate, slow and failed API responses; no duplicate trip/stop actions.
- Review GPS blocked/stale, offline upload, empty route, no trips and missing office phone.
- Verify map smoothness and road-heading camera on a physical phone; existing synthetic captures cannot establish real-world frame rate, navigation quality or outdoor readability.
- Review sound on a physical iPhone, respecting browser audio activation and device settings. Keep the approved custom tone; do not substitute a generic effect.
- Re-check role isolation on sign-in; the previous ERP flash fix must not regress.
- No driving safety claim follows from a desktop screenshot review. Perform interaction tests while safely stopped.

## References

- [Charles Unslop](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-unslop/SKILL.md): preserve product character, reduce generic decoration and competing hierarchy.
- [Unslop signs](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-unslop/references/signs.md): diagnostic prompts, interpreted against the approved design rather than used as automatic prohibitions.
- [Charles Polish](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-polish/SKILL.md): inspect actual states, spacing, controls and interrupted motion.
- [Charles UX Animation](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-ux-animation/SKILL.md) and [recipes](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-ux-animation/references/recipes.md): start with interactions; prioritize purposeful, responsive feedback.
- [Unreasonable Craft](https://github.com/LemonFace0309/charles-skills/blob/main/skills/charles-unreasonable-craft/SKILL.md): improve concrete weak details and verify the result rather than claim a subjective score.

These sources were reviewed as design references. No remote scripts were executed and no skills were installed.
