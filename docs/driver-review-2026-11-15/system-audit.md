# Driver app: independent system and UI/UX source audit

15 November2026. Reviewer: /root/driver_system_review. Read-only audit; no application or backend source edits, no live trip/GPS/parent-message actions. Root owns rendered integration evidence and fixes. This document describes source findings at review time; root may already be correcting them.

## Scope and evidence

Reviewed components/driver/{DriverHome,StopSheet,DelaySheet,DropAlert,parts}.tsx, app/(app)/trip/{page,history/page}.tsx, profile/page.tsx driver branch, AppShell DriverNav/role shell, lib/{staff,api,bus,driverPrefs}, driver styles in app/globals.css and actual routes/staffApp.ts + services/busService.ts backend contracts. The driver is a separate role inside the staff PWA, not another ERP dashboard.

Rendered screenshots were not available to this independent reviewer at completion. No claim about screenshots, actual device glance times, outdoor usability, GPS accuracy, notification delivery or all-state accessibility is made. Root will provide isolated synthetic captures and interaction results separately.

## Research applied, with boundaries

[Google interaction principles](https://developers.google.com/cars/design/design-foundations/interaction-principles) emphasise brief, current information, timely feedback and interruptible tasks. Applied to this phone workflow, route/start setup belongs before departure; boarding/drop actions belong at stops; progress must remain recoverable after interruptions. This is adaptation of automotive guidance, not Android Auto compliance or a safety certification.

[Google visual principles](https://developers.google.com/cars/design/design-foundations/visual-principles) support legibility, deliberate information hierarchy and spacious targets. Its car-display dp values should not be copied as CSSpx into a small phone screen. For this PWA, keep essential information prominent, preserve the established driver visual identity, and verify phone targets at actual CSS widths rather than claiming a vehicle-screen standard is met.

[MDN watchPosition](https://developer.mozilla.org/en-US/docs/Web/API/Geolocation/watchPosition) documents explicit permission, secure-context requirements, error callbacks and clearWatch cleanup. The app therefore needs separate tracking, unavailable/denied and stale states, not a single reassuring live label based only on a past position.

[WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) supports4.5:1 ordinary text and3:1 qualifying large text. [WCAG target minimum](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html) defines24CSSpx AA with exceptions; preferred44-48px phone targets here are a usability design choice, not a claim every32px button is an AA violation.

## Role and workflow inventory

| Surface | Actual job | Current contract | Review decision |
|---|---|---|---|
|Login and role resolution|Identify current staff role before showing shell|Staff OTP/verify then GET/me, ERP adapter uses auth/me|Do not render cached/remembered ERP navigation before authoritative identity; test delayed response and stale cached identity|
|Driver Home|Confirm bus/route, current run or plan morning/afternoon|GET/bus/route|Route identity and genuine running state first; keep yellow start/continue action; no irrelevant ERP chrome|
|Trip preview|Inspect route and planned direction before starting|GET/bus/route, POST/bus/trip|Start is a deliberate action; no route assignment fabricated on missing/error state|
|Running trip/map|Next stop, actual tracking and progress|watchPosition, POST/bus/position every10s|Currentness and send failure must be visible; no stale coordinate silently presented as live|
|Stop roster|Mark actual children on/off and move to next stop|POST/bus/mark, POST/bus/stop-done|Identity must fit; clear server-save state; unfinished children remain explicit|
|First-time stop/school location|Save position while physically at the place|POST/bus/stop-location, POST/bus/school-location|Never save stale or poor-quality GPS as an accurate stop; distinguish location save from child mark failures|
|Near-stop alert|Short reminder of next child/stop|Local distance threshold; auto/manual preference|No misleading completed-state action, no decorative ripple competing with essential name/stop; respect pacing|
|Delay editor|Record actual reason/duration for parent live view|POST/bus/delay|48px reason choices; duration and clear action reachable; precise visibility wording rather than unverified notification promises|
|Trip completion|Finish server run deliberately|POST/bus/trip/end|Review incomplete stops/marks, clear confirm/cancel, preserve running UI on failure|
|History|Inspect selected day's started/ended runs|GET/bus/history?date|Do not show old data under new date; distance is derived route estimate, not travelled telemetry|
|Driver profile|Identity, language, alert preference, school contact, account logout|GET/me, POST/logout|Wrap identity; consistent driver affordances; failed logout must remain recoverable|
|Notices/personal salary/attendance/leave|Occasional staff tasks, not driving flow|Existing staff endpoints|Accessible from profile/history context; do not crowd active trip UI|

## Prioritised concrete findings

### P1: shell can flash the previous interface before identity resolves

Home guards me, but AppShell originally calculates ERP/teacher tabs before me is present. useApi previously initialised from persisted /me cache. This creates both chrome-before-role and cached-role risks. Root is fixing the shared identity boundary. Success means no role-specific shell or content in any animation frame before the current identity is accepted; a neutral loading/error state is appropriate.

### P1: current location and successful sharing are different states

The source trip watch sets gps=on on any successful position callback. The10s position sender ignores failures and reuses lastPos even after GPS errors. This can keep showing/sending an old fix without a visible currentness boundary. The trip agent owns this fix. Test permission denial, position timeout, repeated stale timestamps, network failure, visibility changes and a request still in flight when trip changes.

### P1: saved child marks have unreadable white-on-mint labels

Measured relative-luminance contrasts from the actual token values:

| Foreground/background | Ratio | Interpretation |
|---|---:|---|
|White/#4DCB7F mint|2.07:1|Fails normal button text; required white check icon also falls below3:1|
|White/#12896C driver green|4.36:1|Below4.5:1 for small ordinary text; inspect actual use rather than applying a blanket verdict|
|#111111/#FFCB00 yellow|12.40:1|Strong primary action contrast|
|#9A9A9A/white|2.81:1|Too faint for meaningful small text; decorative use differs|
|#6B6B6B/white|5.33:1|Passes ordinary text threshold|
|#A07800/white|4.05:1|Below4.5:1 for small meaningful supporting text|

StopSheet Got on/off currently uses12.5px white text on mint. Prefer a darker green control with white text or retain mint with dark ink/check. Keep words and state indication; colour alone should not imply a child was actually saved.

### P1: finishing a stop can hide unresolved children

StopSheet always enables Stop done when not busy, even with children left; the backend only appends the stop name and does not mark remaining children. This may be intentional operational flexibility, so do not invent a policy that every child must board. Make remaining children explicit and require deliberate confirmation before proceeding when unresolved. A generic success label must not imply all got on/off. Root/trip agent should agree ownership for this interaction.

### P2: history displays derived distances as actual distance

History currently multiplies one route-path distance by the number of trip rows and labels it Distance, including running/incomplete runs. Backend supplies route geometry length, not recorded vehicle mileage. Label it an estimate and base it on a stated method, or show per-route distance without an unsupported total. A null road path must remain unknown, not zero.

History also uses data directly without checking data.date===selected day. useApi may retain old data for a render while a different day loads. Filter response by selected date to avoid showing yesterday's trips under today's heading; explicit loading/error is more honest.

### P2: small targets, truncation and modal behaviour

-StopSheet child actions32px, back40px, fixed56px rows and truncated child/stop labels. Prefer44-48px control hits, minimum rather than fixed row heights, wrapped names and visible class/time.
-Delay duration chips38px and remove-message text without a minimum height. Preserve one clear update action and a distinct lower-emphasis clear action.
-Home morning/afternoon options38px; long Hindi text needs real narrow inspection.
-StopSheet and DelaySheet declare modal semantics but lack the shared dialog/focus/scroll handling. DropAlert only focuses its confirm button. Trap/restore focus and handle topmost Escape without disrupting nested dialogs.
-Profile alert-setting controls38px; long labels and identity truncate. Driver profile uses generic ERP-adjacent rows/colours and links AI help despite driver separation elsewhere. Root should decide appropriate driver contact/help treatment without changing the explicitly protected AI assistant design itself.

### P2: logout failure is hidden

Profile logout catches all errors, then clears local state and redirects regardless of server outcome. This may leave the server session active while claiming local logout success. A failed logout should show retry and keep useful state;401 already-expired may be treated as signed out. Root owns profile; do not broaden this into credential/session redesign without evidence.

### Copy/contract caveat: parent visibility is not proven delivery

Backend mark/stopDone/delay update bus_trips. There is no push/WhatsApp queue in these methods. Parent live response reads the saved records. Use wording such as Update delay / Visible on parents' bus screen; avoid guaranteeing Send to N parents or instantaneous delivery unless an actual delivery contract is verified. Counts must reflect the data actually supported by the view, not guessed recipient count.

## Recommended driver visual system

Retain the established Inter/Noto, green/yellow/black identity and light driver work surfaces. This is a driver tool, not another mineral ERP register.

- Yellow is one start/continue emphasis with dark text; dark ink for a working confirm/finish action. Green encodes saved/online status, paired with explicit text; red indicates actual errors/destructive state. Do not apply the newly shared evergreen normal-app palette to driver mode.
- Route/bus and next stop carry the hierarchy. Put required location/network status near the live task; keep settings/history secondary.
- Candidate phone scale:18-20px route/next-stop names,15-16px working labels,13-14px supporting context. Use one type vocabulary, tabular numeric times/distances, readable Hindi line-height. Exact values should follow rendered constraints, not automotive dp claims.
-16px page gutters,12-16px working-surface padding,20-24px between distinct tasks. Keep stops/roster continuous rather than isolated glossy cards. Use14px surface corners and10-12px control corners.
-48px ordinary actions,52-56px start/finish and stop-roster actions where appropriate. Small glyphs may sit inside large transparent hit areas. Avoid wrapping the sole primary action offscreen; use settled viewport/keyboard geometry.
- No decorative gradients, repeated bounce/ripple or fake activity. A simple clear next-stop line beats ornamental metric cards. Distance estimates and last-update times must be labelled honestly.

## Focused synthetic verification plan

1. Login cold/warm with obsolete sa:erp and cached /me values; delay true identity; record every DOM mutation/animation frame. Driver must never show ERP/teacher chrome.
2. Identity503/401 and retry; no cached role or wrong shell.
3. Driver with no route403/404, route-fetch503, assigned route, running trip and long bilingual stop/child names at360/390px.
4. Morning and afternoon ordering; deliberate start; server rejection does not show a running trip.
5. GPS allowed/denied/unavailable/stale plus network failure; position requests stop after trip ends; no invalid or misleading live state.
6. Mark/unmark synthetic child success/error; mark is not shown saved before server confirmation. Stop done with unresolved children requires deliberate choice and does not mutate their marks.
7. Delay set/update/clear success/error; no invented notification delivery.
8. Trip finish cancel/confirm/failure; backend running state remains when finish fails.
9. History rapid day switches/delayed responses; correct dates, running labels and route-derived distance explanation.
10. Driver profile preference/language/contact/logout failure; keyboard focus/Escape/restoration for every modal.

Use isolated browser contexts and intercept all API writes/GPS. A synthetic trip test cannot establish live GPS quality, parent push delivery, backend concurrency safety, outdoor driving usability or real vehicle safety compliance. No live school trips/locations should be started or seeded for a design review.
