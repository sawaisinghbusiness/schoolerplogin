# ERP visual direction — second review

> **Implementation update:** User subsequently approved Ink + Oxide. It is now applied to ERP web and ERP mode in Staff, including the requested sliding quarter-card deck. See [implementation and actual verification](../implementation/IMPLEMENTATION.md). The research text below records the proposal stage.

16 November 2026. This supersedes the first round's Petrol + Cool Slate recommendation. Petrol was rejected by the user. None of these directions is approved or applied to app source.

## What the first review missed

The first round improved contrast and consistency but kept the same dominant petrol navigation and essentially the same visual identity. It answered an engineering cleanup question more successfully than the user's request for a stronger design. Passing contrast is necessary; it does not establish visual quality or user preference.

The revised research separates three decisions: shell character, action emphasis and neutral work surfaces. Three materially different treatments were rendered on the same real dashboard, student register and fee-counter routes, with the same data and layout. This makes the colour comparison fair. These are colour-direction studies, not three redesigned navigation systems.

## Relevant research and what it changes here

| Primary reference | Finding | ERP application |
|---|---|---|
| [Adobe Spectrum: colours](https://spectrum.adobe.com/foundations/color/colors) | Purposeful colour guides attention and meaning; brand and interface colours need not be identical. | Sidebar identity and main action need not use the same hue. Keep state colours independent. |
| [Adobe Spectrum: background layers](https://spectrum.adobe.com/foundations/color/background-layers) | Surface hierarchy depends on the working context; elevated surfaces deserve a specific role. | Neutral workspace, white records/forms, restrained overlay elevation. A pastel background for every group is unnecessary. |
| [SAP Fiori: colours](https://www.sap.com/design-system/fiori-design-web/v1-154/foundations/visual/colors-overview) | Enterprise colour systems distinguish primary, accent, grayscale and semantic roles, mapped through theme parameters. | One semantic role system across web/app; no raw brand colour sprayed over titles, icons and status labels. |
| [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) and [non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) | Text and essential controls have measurable contrast requirements. | Check specific pairs, separately from subjective style. Don't claim an entire app is accessible because its palette passes. |
| [WCAG use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) | Colour cannot be the only means of conveying meaning. | Keep Paid/Overdue/Running labels and selection indicators; colour supports them. |

These sources support the method, **not the claim that a specific burnt orange or plum is objectively best for school ERP**. The exact palettes and ranking below are design proposals for this product. No staff usability test or preference study has been performed.

## Three directions compared

| Direction | Shell / canvas / action | Character and trade-off |
|---|---|---|
| **Ink + Oxide — recommended for further development** | `#242D3C` / `#EEF1F5` / `#A43F20` | Cool ink navigation and a concentrated burnt-orange action give more separation from the rejected petrol system. White records remain clear. Risk: orange can resemble warning; restrict its use and keep ordinary links/headings neutral. |
| Aubergine + Porcelain | `#302A3D` / `#F0F1F5` / `#674477` | More tonal and subdued, while retaining a dark shell. Risk: transport Running already uses purple, so status labels must stay independent; avoid lavender-filled panels or gradients. |
| Light Slate + Sapphire | `#F8FAFC` / `#EEF1F6` / `#2854A6` | Light navigation reduces the dominant dark block; blue actions remain clear. Risk: familiar admin-template character, and the user previously disliked extensive blue. Useful comparison, not the recommended direction. |

All three remove cream. None turns the main work area dark. None replaces the approved financial green/red or changes backend workflows.

### Why Ink + Oxide is the recommendation

In the rendered screens it gives the strongest separation between navigation, action and content without making the tables colourful. The dark rail has a cool blue-grey cast, the action has a warm contrasting hue, and the remaining screen is quiet enough to carry amounts and names. This is a visual assessment of these captures, not proof of improved task completion.

The first test painted too many links orange. That looked warning-like, so the final comparison keeps the sampled ordinary report links dark and reserves orange for primary controls and active navigation icons. The ERP-app page heading is dark as well. A production migration must catch all remaining legacy links, rather than relying on this preview stylesheet's selectors.

## Recommended role specification

| Component/role | Treatment |
|---|---|
| Workspace | `#EEF1F5`; a deliberate cool blue-grey ground. White work surfaces, no cream, textured backdrop, gradient or coloured haze. |
| Main text | `#202938`; names, headings, entered values and ordinary labels. |
| Supporting text | `#536071`; not pale blue. Hints `#647582` on white only where contrast permits. |
| Main action | `#A43F20`, white text. Hover `#87341B`, pressed `#6D2916`. One dominant action per task area. |
| Secondary action | White, dark label, visible `#7B8C99` outline; neutral hover. Don't fill Export, Cancel, Change and every row action with the brand colour. |
| Ordinary links | Dark ink, clear placement; inline links underlined. Focus visible. Brand orange is not the default text-link colour. |
| Navigation | `#242D3C` rail; readable `#F1F4F8` text, `#C4CDDA` support. Hover `#354155`. Selected white row, dark label, oxide icon. |
| Rail search | `#354155` surface, readable pale value and hint; `#91A0B6` boundary. Search and white identity controls must override broad rail text rules. |
| Cards/sections | White; `#D6DDE6` grouping line. Related items share sections and dividers rather than nested cards. Existing restrained radii remain. |
| Fields | White, dark value, explicit label. `#7B8C99` boundary. Oxide focus ring on light surfaces; white focus ring in the dark rail. Error includes text and red indicator. |
| Tables | White rows, neutral headers and hover; selected checkbox/indicator. No coloured row fill simply because an amount is due. |
| Tabs/selection | Dark defaults. Selected text/underline or check gives a persistent indicator. A small muted selection surface may be used for controls, not status badges. |
| Paid/collected | `#15803D`; labels, figures and trailing success dot where appropriate. |
| Due/error/delay | `#B42332`; explicit label and trailing dot. Destructive confirmation uses this role, not oxide. |
| Warning | `#8A570B`, explicit warning icon/copy. Avoid amber filled buttons or pills so warning does not compete with oxide actions. |
| Running | Existing semantic purple `#7052A3` dot with dark Running label. |
| Status badges | White surface, dark text, thin neutral outline, trailing coloured dot. No same-hue pastel background/text treatment. |
| Charts | Existing collected/due donut keeps green/red and text labels. Collection series may remain green because it represents collected fees; don't recolour it orange just to match buttons. Comparison series neutral. |
| Dialogs/sheets | White, ink headings, neutral separators, task-specific primary action; token scope must reach portals. |
| Loading/empty/disabled | Neutral skeleton; useful empty message/action; disabled surface `#E7ECEF`, text `#667681`. Loading retains label and width. No decorative shimmer throughout the app. |
| Browser state | Match caret, selection and checkbox/radio accent. Focus must work on both rail and light work surfaces and in forced-colour mode. |

## Colour cannot fix these hierarchy issues

- In the payroll app capture, **Recalculate** is the filled action while **Pay many** is secondary. The intended operator task should determine prominence; a palette replacement alone cannot decide that workflow.
- Dashboard metrics need the requested financial green/red and aligned amounts, not four different coloured tiles. Preserve the existing top-four counting behaviour and donut.
- Some data screens contain legacy tiny metadata and differently coloured headings/controls. Migrate role by role; stronger brand saturation cannot compensate for weak type hierarchy.
- Permanent sidebar, mobile menu, sheets and print documents have different contexts. Consistency means common roles and naming, not identical backgrounds everywhere.

Retain self-hosted IBM Plex Sans on desktop and existing Plus Jakarta/Noto Devanagari in ERP app. Keep the first report's practical type and spacing specification: 26–28px desktop title, 13–14px working text, 12–13px support; 4/8px spacing rhythm; compact desktop controls and comfortable mobile touch targets. This round changes the visual direction, not every approved composition.

## Actual coverage and checks

- Three directions on three web routes at 1440px: dashboard, student register, fee counter. Nine proposed web screenshots and their current comparisons.
- Recommended direction additionally on ERP-app fee counter, payroll and an opened menu at 390px. Menu is visually captured; it is not a complete keyboard/focus audit.
- Source census from round one remains available. Its route totals are not claims of visual verification for this round.
- `contrast.json` contains pair checks for each direction. `rendered-*.json` records actual computed colour samples, route, fixture errors and viewport widths. Passing these samples does not establish every state/page is correct.
- Actual screen data is synthetic, API writes were blocked, and styles were injected into isolated browser pages. **No production theme, assistant, parent app, driver app or business logic was changed.**

Preview limitation: old inline/component-specific colours remain in some secondary app controls, step indicators, avatars and fee selection areas. These are migration targets, not evidence of a finished unified system. There is no claim that every desktop breakpoint, dialog, error or keyboard state has been tested.

## Implementation boundary

After selecting a direction, consolidate the shared semantic tokens and remove conflicting historical overrides. Then migrate shared controls, rail/menu and page families with actual-state verification. Do not append the preview CSS to production as a permanent fix. Preserve the previous dashboard changes, financial semantics, assistant design, permission checks and API contracts.
