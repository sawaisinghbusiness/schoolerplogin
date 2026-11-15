> Final design changed after user review. Read [REVISION.md](REVISION.md) first; it supersedes the first composition and documents the completed motion work.

# Transport experience: driver, family and school office

Implemented locally on 15 November 2026. This extends the previous driver lifecycle fixes with a replacement driver homepage and role-specific transport status. No push or deployment was requested for this work. The restored AI assistant is untouched.

## Research translated into decisions

[Transit distinguishes live information from the timetable and exposes the age of vehicle updates](https://help.transitapp.com/article/445-how-to-track-departures-on-your-transit-line). Here, a scheduled pickup never becomes a live arrival estimate; stale or unavailable GPS suppresses estimates. A recent position is described as an update, not proof that the bus is moving.

[Samsara separates fleet overview from operational functions and varies available views by role](https://kb.samsara.com/hc/en-us/articles/48621492984589-Dashboard-Menus). Here, the office gets all-route monitoring, while a parent receives only their own child's route and recorded status. These are task adaptations, not copies of either product.

[Nielsen Norman Group's system-status guidance](https://www.nngroup.com/articles/visibility-system-status/) informed explicit not-started, running, completed, delayed and unavailable states. A failed fetch is not interpreted as an idle bus. These are desk-research and implementation decisions; no driver interviews or outdoor usability study were conducted.

## What each person sees

| Role | First question answered | Information and actions |
| --- | --- | --- |
| Driver | Which run am I about to operate? | Vehicle, route, morning/afternoon, start/finish points, next stop, today's roster, Start or Resume |
| Parent | What is happening with my child's bus journey? | Own stop, driver-recorded boarding/drop, delay, age of location, qualified distance estimate and optional map; crew contacts remain available |
| Office admin/accountant | Which routes are running and which need attention? | All-route register with active/completed/not-started trips, delay, GPS freshness, stop completion, recorded child counts, driver contact and received-location link |
| General teacher | Existing route administration permitted by their role | Fleet monitor is absent; no fleet polling request is made |

## Driver homepage replacement

The former metric card and detached Start button have been replaced with one departure sheet and a continuous ordered itinerary. The vehicle strip, route title and first/next stop establish hierarchy. The school appears first on the afternoon run and last on the morning run. Running trips show recorded progress and Resume, rather than a second Start action.

Home uses warm paper #F4F3ED, white, ink #17251E, secondary #596158 and restrained green. Yellow #FFCB00 is reserved for the main action. Existing Inter/Noto fonts remain; route titles are 23px, primary headings 26px, stop names 15px, supporting text 12–14px, action 54px and gutters 16px. No ornamental bus motion, map animation or metric tiles were introduced on Home. Other driver tasks retain the compatible driver kit.

Both mobile maps now identify the received position with a bus symbol instead of an anonymous dot or arrow with a decorative halo. Driver route lines are quieter. Parent map motion respects reduced-motion preferences.

## Parent experience

- A compact child-specific status row joins the approved homepage without replacing its composition or illustrations.
- The bus page leads with the child's status and own stop. The map is optional and mounts when opened, avoiding a map initialized inside a hidden disclosure.
- Driver entries are explicitly described as recorded status. A stop passed without a child entry is an exception requiring contact with the crew, not an inferred successful pickup.
- Arrival estimates require a recent valid received location and complete location data for the relevant legs. They are labelled distance estimates without live traffic. Stale, unavailable, malformed or future-dated locations do not qualify.
- The idle screen is an honest timetable, replacing the blue illustration panel. Loading and failed tracking have explicit states; neither says the bus is idle.
- The old looping demo has been replaced with a deliberately static sample trip. The demo label says it is not a live location; demo notifications are disabled.
- Polling is serialized, refreshes on returning to the page, ignores late responses and scopes retained data to the selected child. Errors retain useful context and mark it unavailable.
- Trip identity resets per-trip alert state. Arrival alerts stop after a boarding/drop entry; failed tracking cannot trigger a fresh arrival claim.
- The timeline no longer places a bus between stops and claims “bus is here” based on completion records. Only recorded progress is shown there. Road lines on the map require road geometry from the server; missing geometry leaves stop markers, not a fabricated road route.

The backend parent endpoint retains its existing `childOf` authorization, route lookup and child-only mark. It adds trip identity and road-path provenance; it retains the timestamp even after the position is too old to display. Parent responses do not expose roster identities or office fleet data.

## Office monitoring

`GET /api/transport/live` is authenticated and restricted to admin/accountant. It projects today's existing `bus_trips` records and registered routes. No new migration, mock production data or tracking-history table was added. The read-only list option prevents monitoring from triggering the existing route auto-creation behavior.

The same `TransportLivePanel` and stylesheet are present in ERP web `/transport` and staff ERP `/erp/transport/`, using their respective API clients. It refreshes every 15 seconds while visible. The desktop view is a register; phone rows reflow, with expandable trip details. Refresh errors keep the previous snapshot explicitly labelled and disable received-location links until recovery.

Statuses distinguish trip activity from GPS freshness. A delayed route remains running; a stopped GPS feed is not treated as a completed trip. Completed trips do not expose a live-position link. Marked-on/off counts are labelled driver entries, never live occupancy. Location links open an explicitly received or last-known position, not a continuous navigation claim.

## Verification and evidence

- Automated suite: 28 passed, zero failed/skipped locally. New cases exercise actual parent estimate logic, backend route projection, active-trip precedence, missing/invalid/stale/future GPS, failed persistence, unavailable snapshots and read-only route loading.
- Driver browser harness covers delayed identity/OTP role handoff, Start/Resume, GPS permission loss, child marking, remaining-child confirmation, delay, failed-end retry and logout failure. Captures include narrow Home and Hindi Home.
- Transport browser harness covers desktop/staff fleet views, expanded stale/delayed route, failed refresh/recovery, teacher exclusion, parent fresh/stale/missing/unavailable GPS, boarding, passed-without-entry, delay, timetable, demo, sibling selection, homepage status and 360px layout. It also opens the map and verifies the bus symbol, and checks connection loss after an initially successful live response.
- Latest machine-readable results: [driver](../driver-review-2026-11-15/browser/result.json), [transport](browser/result.json). The transport result has zero observed runtime exceptions, missing fixture contracts, horizontal overflow and business writes.
- Backend compilation and isolated production exports validate the implemented contracts. See the final verification record for exact build outcomes.
- [Screenshot gallery](gallery.html) contains synthetic review names/positions. Parent maps may show public OpenStreetMap tiles; the positions are fixtures. Driver workflow maps use a synthetic blank basemap.

No real school trip, bus location, student entry, notification delivery or database seed was created. Physical-device GPS, app background suspension, outdoor readability and real family delivery still require live-device verification. The new office API and clients must be deployed together for the production monitor to be available; an older backend produces an explicit unavailable state.

## Source ownership and publication

Web: transport panel/API types, transport page integration, tests and this report. Staff: replacement DriverHome, dispatch CSS, map marker, shared office monitor and staff API wrapper. Parents: child-scoped polling, homepage row, bus status/timetable/map and static demo. Backend: read-only fleet projection/route, parent trip identity and road-path flag, read-only route-list option. Previous driver fixes remain in the same local working trees.

Concurrent changes in SideMenu/art or unrelated user files are preserved and are not attributed to this task. No commit, push, deployment, migration or live DB action was performed.
