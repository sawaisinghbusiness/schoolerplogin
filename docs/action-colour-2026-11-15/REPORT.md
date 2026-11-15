# Operational primary actions: colour research and implementation

15 November2026. Scope: ordinary primary-action backgrounds in staff app (ERP and personal mode), authenticated desktop ERP and parents app. User explicitly excluded AI assistant; assistant source and route appearance were protected. No commit/push/deployment.

## Choice and evidence

Selected deep evergreen #294E43 for Save, Submit, Apply, Pay and equivalent operational actions. It has visible colour without another saturated blue panel; it sits alongside the staff mineral canvas, parents cool neutrals and desktop white/grey work surfaces. Existing fonts, sizing, layouts, data and navigation identity remain in place.

Candidate comparison:

| Candidate | White-text contrast | Decision |
|---|---:|---|
|Deep evergreen #294E43|9.27:1|Selected for the common operational action role|
|Warm charcoal #303D36|11.37:1|Works technically; less colour character against already subdued canvases|
|Muted burgundy #6C3544|9.42:1|Distinctive but competes more with warm banner and destructive/warning family|

These are product-specific design judgments, not evidence that a hue universally increases trust or conversion. All three pass normal-text4.5:1 in this sampled white-label pairing. The contrast calculation does not establish whole-app accessibility.

[Comparison board](comparison.html) gives actual swatches and button examples. [Rendered views](gallery.html) show actual components with synthetic records.

## Research -> implementation

[NN/g button-state guidance](https://www.nngroup.com/articles/button-states-communicate-interaction/) distinguishes enabled, disabled, hovered, focused and pressed states from primary/secondary visual emphasis. The implementation therefore defines a complete state family, rather than changing only the default fill.

[Carbon button guidance](https://www.carbondesignsystem.com/building-blocks/core/components/button/guidelines) assigns different functions to primary, lower-emphasis and danger variants. Ordinary Save is the filled action; Cancel/Back/secondary actions do not all become green filled buttons. Danger actions retain their explicit destructive treatment.

[GOV.UK button guidance](https://design-system.service.gov.uk/components/button/) recommends clear action labels and avoiding several competing primary actions on one screen. Its use of green is a reference for a functional button system, not a reason to copy its shade or typography. This pass keeps existing action wording and business flows.

[WCAG contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) informs label contrast; [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) informs required control and focus cues. No full conformance or user-study claim is made.

## State specification

- Default #294E43, white label.
- Hover #203F36; pressed #18332B, white label retained.
- Focus: visible2px action-colour outline with3px offset, preserving native keyboard operation.
- Disabled #D7DFD8 with #43564C label, full opacity. Disabled no longer looks like an active navy Save. Existing disabled behavior is preserved.
- Existing loading/saving labels continue to communicate state. No save request is triggered by styling.

Dark evergreen is the operation colour. Success states remain labelled statuses with their own semantics; one hue alone does not mean a record is saved or paid. Calendar, charts, notices, payment categories and navigation selection are separate roles.

## Implementation

Staff and parents add lib/actionPalette.tsx, a small React appearance context. AppShell opts ordinary routes into data-action-theme=evergreen. AI assistant routes opt out; staff driver mode opts out. Sheet and staff StickyBar carry the context through portals, so styling is not lost under document.body.

app/action-palette.css styles .btn-primary/.btn-go and explicit .action-primary marks within that scope. It does not change the Tailwind brand palette globally. Parent shared kit Button and specific fee/payment/leave/report-card/teacher-chat CTA controls use the action marker; sent chat bubbles, selected days, badges and route-progress marks keep their own semantics. Assistant source/components are untouched.

Desktop uses the same state tokens within its authenticated shell/dialogs and ported workflow roots. Native shared Button's default variant is marked as an action; public website and login keep their current fallback. Generated Sheet/StickyBar dependencies were synchronized:28workflows/57shared files, no drift.

## Verification and limits

- Browser assertions confirm computed evergreen fills on native desktop Save, staff portalled Save, parent Apply and parent payment CTA.
- Separate isolated browser contexts intercept every API request; no payment, marks save, leave submission or message was sent. Native marks were edited locally only to enable the preview button.
- Six cross-app/state views have no runtime exceptions, missing fixtures or document overflow. Staff teacher marks preview separately verifies the user's Save example.
- Staff/parents assistant routes are asserted to have no operational action-theme scope. Eight assistant-related source files have unchanged before/after hashes; see assistant-preservation.json. The assistant's restored purple/blue design remains as it was.
-18web regression/parity tests pass; source typechecks and generated drift checks are recorded with build results below.
- The parent payment QR in these screenshots is a deliberately synthetic1px test image, not a real payment code or QR-content validation. No live transaction is certified.
- Coverage is representative. Explicit primary controls and shared primitives were updated; selected radio buttons, nav states, notifications and charts are not reclassified as primary actions simply because they were blue.

All three production builds completed successfully: desktop web and actual static exports of isolated staff/parent snapshots, demo disabled. Web18tests, all three source typechecks and the generated drift check pass. Disabled, enabled and hover colours were also asserted in the native desktop marks editor; no Save was submitted. Existing concurrent QR/WebP/user work is preserved. Research and earlier full-system evidence are in ../staff-erp-design-system-2026-11-15/.
