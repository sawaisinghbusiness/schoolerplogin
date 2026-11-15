# Driver trip flow audit and refinements

Owned source: staff repo app/(app)/trip/page.tsx only. Root owns driver Home/sheets/shared shell/cache/backend fixes. This note records the trip contribution, not full-app completion.

## Findings before edits

1. GPS watch errors left old map position and speed intact, and the10second publisher kept posting old coordinates. Upload failures were swallowed. The apparent live state did not distinguish GPS from server delivery.
2. After initial route response, local route state was still null until an effect; the render briefly selected 'No route assigned' despite valid response data.
3. stop-location preflight and mark/done were separate busy cycles. Calibration failure was cleared by the following action; onTick did not await mark, and rapid calls could overlap.
4. A late screen-wake-lock promise could resolve after effect cleanup and leave a lock unreleased.
5. End trip required a second tap within4seconds. Its confirmation was transient, and the hidden trip card's End button stayed keyboard focusable.
6. DelaySheet received all route children as onBoard rather than the current trip's computed count.

## Implemented

- New GPS watch instance resets prior position/heading/speed. Invalid/old fixes are ignored; failure clears position and speed. Late callbacks from a stopped watch are ignored.
- A30second fix-age guard prevents publishing an old fix as current; the30seconds is an explicit local design guard, not a claim about physical accuracy. Retry still uses current browser permission behavior.
- Location uploads are serialized, retain existing10second cadence and endpoint, and surface failure/last successful send. Backend success:false is not treated as a published location. No new location coordinates or user data were invented.
- Wake-lock acquisition is guarded against duplicate requests and late completion; acquired lock is released after cleanup. Unsupported/battery-limited cases preserve the rest of the trip.
- One synchronous mutation ref guards optional stop-location calibration plus the intended mark/done call. Failure stops the sequence and leaves a recoverable error, avoiding a false success; onTick is awaited. Existing endpoints and backend operation policy are preserved.
- Persistent end-trip dialog replaces timed double tap. It reports recorded stop/child counts, asks for a bus check, traps/restores focus, supports Escape/cancel when idle and blocks close while pending. Ending early remains available, as before; no new backend policy was added.
- Busy/hidden End controls are not keyboard actionable, and pre-trip switch/back/retry hit areas were increased. Root's driver-specific stylesheet owns final visual tokens.
- Arrival-alert memory resets per trip. Delay uses current onBoard count. English/Hindi status/confirmation copy has verified decoded Unicode, not literal backslash-u strings.
- The first valid response no longer produces a false no-route message during local-state hydration.

## Research application

[Google interaction principles](https://developers.google.com/cars/design/design-foundations/interaction-principles) emphasise current, glanceable driving information and reducing unnecessary interactions. This supports truthful GPS/delivery state and deliberate persistent confirmation. This is a phone school-bus workflow, not an Android Automotive compliance claim; do not transplant in-car screen certification or numeric limits as requirements.

[MDN watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition) documents secure-context/permission requirements, error callback and clearWatch lifecycle. [MDN Screen Wake Lock](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Wake_Lock_API) documents visibility/system constraints and reacquisition. Cleanup and explicit unavailable states follow those mechanics; unsupported wake lock does not prevent trip work.

## Backend contract observations

Current bus endpoints infer the active trip for the authenticated driver's route. /bus/position accepts lat/lng; the frontend's historical tripId property is ignored by the route adapter. This pass does not change that contract. The backend returns success:false when there is no active trip; the new frontend treats that as not delivered. A location request already in flight cannot be recalled by clearing the timer; no stronger trip-ID transaction guarantee is claimed.

Root is separately fixing backend end error propagation after the audit found an unchecked Supabase update. This note does not claim that backend patch was authored/tested by this agent.

## Verification and limits

Staff full TypeScript check passed after the integrated trip edits. git diff --check on the owned trip file passed. Parsed the actual TSX string literals to verify new Hindi content decodes correctly (17escaped bilingual strings; no doubled Unicode escape literals).

No live GPS, bus, marks, parent notifications or database operations were run. Root owns integrated synthetic browser/interaction tests and final production build. Suggested cases: delayed identity gate, initial route hydration, permission denied, valid fix followed by error/staleness, failed upload and success:false, overlapping mark/done prevention, failed calibration, successful/failed finish confirmation and keyboard close while busy. Root GPS stubs must provide a current timestamp; mocked position success must return {success:true}.

No commit or push performed by this agent.
