Method: dual-agent (A: /root/home_colour_design; B: /root/home_colour_evidence)

# Staff ERP homepage: colour and surface review

15 November 2026. Report and proposed direction only. Application source, approved teacher homepage, parent app and desktop ERP were not edited.

## Decision

The current home does not need another decorative gradient. It needs stronger tonal hierarchy and a coherent relationship between its warm banner, cool canvas, illustrated shortcuts and operational information.

Recommended first preview: **warm mineral canvas + one navy masthead + quiet solid shortcut surfaces + one white Today register**. Keep the existing information, approved picture assets, routes, typography and four-column shortcuts. This direction is a design proposal, not a tested final treatment; the next step would be an isolated rendered preview before applying it.

## Exact target and evidence

The active ERP homepage is components/ErpHome.tsx, selected by app/(app)/page.tsx after ERP-mode detection. The separate erp-home-new route is not the review target. Its shared styles are components/staff-home.css. Teacher StaffHome also uses those styles, so a later implementation must be scoped specifically to ERP home.

- [Current homepage, 390px emulated viewport](current-app.png)
- Original360px capture was overwritten during implementation; see new implementation evidence for the updated360px view.
- [Computed surfaces and geometry](computed-styles.json)
- [Loaded image inventory](images.json)
- [Read-only browser result](result.json)
- [Proposed palette and measured contrast](proposed-palette.json)
- [Colour board](colour-board.html): swatches and hierarchy sample, not a revised app screenshot.

The captures use separate isolated browser contexts and synthetic school records, with every API request intercepted. No real account, school-record write or backend transaction was used. Both final captures have populated content, no missing API fixtures, no runtime exceptions and no document overflow. Native scrollbar gutters reduce the actual content widths; emulated390 gives375px page width, rather than390px of usable content. Product viewport settings were preserved.

A first360px capture was caught mid-entry-animation; it was rejected and replaced after a2.2second settle. The picture assets all loaded. Do not confuse animation timing with missing assets.

## What is actually causing the weak appearance

The background is not pure white. Computed styles confirm a gradient from #E8EFF7 at160px through #F1F5F9 at460px to #F7F9FC at900px. Its lower half approaches white, while Today rows are transparent, so distinction between page and information becomes weaker as the user scrolls.

The sticky header and search are white. Every shortcut repeats a second gradient, #F4F7FF to #DCE5FF. The banner itself uses cream, burgundy and teal; navigation and action identity use navy. These different families do not currently form a clear hierarchy. Adding more saturated backgrounds to all eight cards would increase competition with their already colourful illustrations.

Existing body and secondary text pairings measured by Assessment B pass the normal-text4.5:1 threshold. The main complaint is not proven text illegibility; it is a design issue involving separation, grouping and colour harmony.

## Two priority changes

### P1 ? Give each surface a clear role and one palette

**Evidence:** page gradient, white sticky header, pale lavender shortcut gradients and warm artwork coexist. White against the current canvas has only around1.16:1 contrast near the top and1.05:1 near the bottom. Those are not automatically accessibility failures, but they explain why sections merge visually.

**Proposed correction:** use a solid #ECEEEB warm mineral page background, with #F8F8F5 solid shortcut surfaces. Retain #0D2A5E as the existing staff brand anchor. Preview the64px greeting/menu/profile masthead in navy with white primary text and a measured lighter supporting-text tone; preserve its actual controls, positions and safe area. Keep the bottom navigation light with the existing navy active state, so it remains familiar on task pages.

The navy masthead is the one deliberate area of dark colour. Do not add a second dark KPI panel beneath the already prominent banner. If the masthead overpowers the banner in the preview, reduce its area or retain a mineral header with navy text; do not make all tiles blue as compensation.

This is a richer candidate than changing the existing background to yet another near-white pastel. Exact hex values are design choices, not colours scientifically proved to create trust.

Suggested implementation category: colorize, followed by polish on rendered output.

### P1 ? Separate shortcuts from today's operational information

**Evidence:** the current Today list is well aligned but transparent on the fading page. The banner receives the strongest visual weight; all operational rows then look equally quiet. Missing attendance and due enquiry follow-ups have useful warning text, which should be retained.

**Proposed correction:** group Today as one white continuous register with14px outer corners and quiet row dividers. Keep labels, counts and destinations unchanged. Use navy for its section heading; preserve amber text plus wording for genuine pending work. Keep rupee values in ink rather than colouring ordinary collections green. Do not turn the five rows into individual pastel or dark metric cards.

Keep the four-column shortcut grid compact. Use a consistent label role and solid surfaces, allowing existing illustrations to carry personality. Preserve enough horizontal padding for small-screen labels; measure wrapping at360px instead of reducing text until it becomes tiny.

Suggested implementation category: layout/colorize, followed by polish.

## Proposed colour roles

| Role | Candidate | Usage |
|---|---|---|
| Page canvas | #ECEEEB | Entire ERP home, consistent through the scroll |
| Brand/masthead/focus | #0D2A5E | Existing staff navy; one intentional top anchor |
| Work surface | #FFFFFF | Search and one Today register |
| Shortcut surface | #F8F8F5 | All eight shortcut tiles; artwork supplies colour |
| Primary ink | #242628 | Names, section labels, counts, currency |
| Supporting text | #5E666D | Secondary labels on light surfaces |
| Divider | #D5DAD5 | Structural grouping; not sole required control cue |
| Pressed light surface | #E2E7E2 | Clear tactile state, not a glow |
| Warning | #8A5200 | Real pending attention, accompanied by words |
| Success | #176447 | Actual completed/success state only |
| Error | #A62D38 | Actual errors only |

These roles should become ERP-home-specific variables, with ordinary control and portal semantics preserved. A neutral background does not mean every active control must also be grey.

## Research and reasoning

[IBM Carbon colour guidance](https://www.carbondesignsystem.com/building-blocks/foundations/color/overview) describes neutral layers as a way to organise content into zones, with a consistent primary action colour and additional colours used deliberately. That supports a separated canvas/surface model here; it does not prescribe our chosen mineral hex value.

[NN/g's visual-design principles](https://www.nngroup.com/articles/principles-visual-design/) explain hierarchy through scale, contrast, balance and grouping. Applied here, the goal is a recognisable top anchor and a clearly grouped Today section. Adding colours without changing their roles would not address that hierarchy.

[WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) requires4.5:1 for normal text and3:1 for qualifying large text. [WCAG non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) requires3:1 for necessary control/state cues. It does not require every decorative divider or card edge to reach3:1 when readable labels already identify the controls. The report therefore does not label weak decorative borders as automatic accessibility failures.

These are published guidelines plus a heuristic/source/render review, not user interviews or an experiment on SMS Barmer staff. No measured claim about increased trust, reduced workload or conversion is made.

## Measured current contrast

| Pair | Ratio | Interpretation |
|---|---:|---|
| #242628 body on #E8EFF7 |13.10:1| Strong normal-text contrast |
| #666A6E secondary on #E8EFF7 |4.70:1| Passes normal-text threshold |
| #666A6E secondary on #F7F9FC |5.17:1| Passes normal-text threshold |
| #9A5B00 warning on #E8EFF7 |4.68:1| Passes this sampled pairing |
| White against top canvas |1.16:1| Weak structural distinction, not by itself a WCAG failure |

The proposal's actual foreground/background ratios are calculated separately in proposed-palette.json. Header secondary text must be checked against navy in the actual implementation; do not reuse muted grey there. These calculations do not certify the raster banner's tiny text, every gradient location or all states.

## What already works

- Plus Jakarta Sans with Noto Sans Devanagari creates an established bilingual typography system; preserve it.
- Eight recognisable module illustrations and clear labels make destinations easier to identify than an icon-only menu.
- Today rows keep useful task context and right-aligned currency/counts. Change their surface hierarchy, not their business content.
- Existing focus styling and reduced-motion rules are present. Keep those rather than replacing them with effects.

## Other observations, outside the two main colour changes

- The banner has rasterised button shapes labelled View Dashboard and Fee Reports, but is rendered as a plain image. They are not actual separate controls. This is an interaction mismatch to resolve explicitly later; a colour update cannot make them work. Do not silently regenerate or recolour approved artwork.
- The banner's small embedded copy is hard to read at phone scale. Preserve its asset initially; a future content review could replace tiny image text with actual readable HTML, but that is a separate decision.
- AppShell has its own ERP-home base background (#e3ecec), mostly hidden by the home gradient. Align the two scoped backgrounds during implementation to avoid exposed seams during loading or around safe areas.
- Entry animations briefly made shortcuts appear incomplete. Review whether they should run once or be reduced on repeat visits; this report does not require new motion work.

## Persona checks

**Office operator, frequent visits:** fees/search/attendance are identifiable, but the large banner has more weight than the operational tasks. Do not add more promotional panels. Keep genuine pending attendance visible through words and status colour.

**First-time administrator:** module labels help; the apparent buttons baked into the banner can create a dead-end expectation. This needs explicit treatment outside palette work.

**Staff member in bright ambient light:** sampled text pairs have sufficient calculated contrast, but near-white surfaces and very small banner text still need a real-device review. The proposed mineral canvas and white register improve structural distinction; this is a design hypothesis to test, not a guaranteed performance gain.

## Scoped design-health assessment

This is a colour/homepage review, not a complete usability audit. Scores are qualitative and are not a WCAG conformance score.

| Nielsen heuristic | Score /4 | Evidence or limit |
|---|---:|---|
|1. System status |3| Pending work has explicit wording; loaded fixture state reviewed |
|2. Real-world match |3| Familiar school tasks, rupee amounts and section context |
|3. Control/freedom |n/a| Back/edit/undo flows outside this home-colour review |
|4. Consistency |2| Warm banner, cool gradient, lavender tiles and navy lack one surface hierarchy |
|5. Error prevention |n/a| Transaction/edit flows not tested here |
|6. Recognition |3| Illustrated, labelled shortcuts; banner faux controls weaken expectation |
|7. Efficiency |n/a| No timed task or comparative workflow test |
|8. Aesthetic hierarchy |2| Existing alignment is good, but surface levels merge |
|9. Error recovery |n/a| Retry exists in source; error state not exercised in this run |
|10. Help/documentation |n/a| Not part of this palette assessment |
|**Scoped total**|**13/20**|Five applicable heuristics; mixed result, improve colour hierarchy first |

## Specificity verdict and detector limits

The homepage has school-specific content and recognisable art. It is not a blank generic dashboard; its weakest point is the surrounding colour system. Preserve that character rather than replacing it with interchangeable metrics.

Independent Assessment B ran the real scoped CLI detector against components/ErpHome.tsx and returned zero findings. That is not proof that its palette is effective, nor a full CSS/accessibility audit. Colour and hierarchy findings above come from the actual source, computed styles and screenshots. The separate in-browser detector reported one flat-type-hierarchy heuristic. It reads the h1 container as16px while its child name is actually17px and the greeting12.5px; the18px section title is already part of the approved compact staff vocabulary. This is a limited/contextual signal, not a reason to replace approved typography or a proven accessibility failure. Overlay injection succeeded in an isolated diagnostic context, which was then disposed; no overlay remains visible to the user and its temporary server was stopped. See assessment-b/NOTES.md and detector.json.

## Implementation boundaries and acceptance checklist

No app changes are applied by this report. When implementing a selected preview:

1. Add an ERP-home-specific wrapper/token scope. Do not recolour shared .staff-home globally; teacher home must remain intact.
2. Preserve Plus Jakarta/Noto, art files, destinations, counts, menu, notification/profile controls and pinned viewport settings.
3. Use a consistent page background through loading, settled render, sticky header, scrolling and safe areas.
4. Check dark-header icons, secondary text, focus ring and avatar separately. White text should not depend on inheritance through existing text-ink utilities.
5. Verify360/390/430px, long names, English/Hindi, populated/empty/error states and scrolled header. Let animations settle or deliberately test reduced motion.
6. Check Today save/navigation overlap, keyboard focus and touch targets; no new data/API behavior is intended.
7. Compare the candidate next to the current screenshot and an adjacent ERP task page. Richer home identity must still feel like the same app.

No production build/test rerun was necessary for this report-only change. Browser evidence scripts and documentation were added only to the desktop repo. No live data write, commit, push or deployment was performed.

Questions skipped: 2 Priority Issues; this request is a research/report deliverable, with one recommended preview direction and explicit boundaries.
