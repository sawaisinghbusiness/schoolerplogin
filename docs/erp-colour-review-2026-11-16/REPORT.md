# ERP colour research — 16 November 2026

> **Superseded:** User rejected Petrol. Read [second-round research and three new directions](round-2/RESEARCH.md). This first report is retained as historical evidence, not the current recommendation.

**Recommendation: Petrol + Cool Slate.** Cream canvas हटाएँ; cool neutral workspace, white work surfaces, dark neutral text और एक consistent petrol action system रखें। पूरे app को colourful cards में बदलने की जरूरत नहीं है। यह research और preview है; production theme अभी बदली नहीं गई है।

## अभी क्या गलत है

1. Canvas `#F2EEE7`, ivory paper `#FFFEFA`, literal white sections और cool grey fields एक साथ हैं। User को cream पसंद नहीं है; इस operational workspace के लिए warm layer हटाना उचित है। Cream को universally खराब या unprofessional कहना research से supported नहीं है।
2. Desktop dashboard पर computed primary button `#294E43` है, जबकि sidebar `#163F49` है। Source में office teal links, old blue focus/selection और multiple action scopes भी मिले। अलग generations के tokens साथ चल रहे हैं।
3. Sidebar का broad text override light controls तक पहुँचता है। Dashboard में search का computed typed-text colour `#DCE8E7`, background `#F7F8FB`; school initials भी pale text on ivory हैं। Exact measured ratios `measured-findings.json` में हैं। Search placeholder और typed text अलग states हैं; यह finding typed foreground की है। Initials branding को text accessibility failure कहने के बजाय visual readability defect मानें।
4. `erp.css → parity.css → action-palette.css → status-badges.css` cascade में competing scopes हैं। Staff ERP में selector specificity अलग होने से समान component web जैसा colour नहीं लेता। केवल एक और override block जोड़ना स्थायी समाधान नहीं है।
5. Existing DESIGN documentation में historical neutral, evergreen और Petrol/Sand instructions जमा हैं। Implementation के समय एक authoritative current specification रखें, बाकी को historical mark करें।

## Research से निकला निर्णय

[Atlassian colour](https://atlassian.design/foundations/color/) की role-based approach के अनुसार neutrals content और work surfaces संभालें; saturated colour action या meaning बताए। [Carbon colour tokens](https://www.carbondesignsystem.com/building-blocks/foundations/color/tokens) के अनुसार background, layer और interaction states को अलग roles दें। इसका अर्थ किसी दूसरे product की palette copy करना नहीं है।

[Carbon left-panel specification](https://www.carbondesignsystem.com/building-blocks/core/components/ui-shell-left-panel/specifications) navigation के hover, focus और selected states अलग रखती है। इसलिए dark petrol rail उचित है, लेकिन उसके search, identity और footer controls का अपना contrast चाहिए। [Atlassian elevation](https://atlassian.design/foundations/elevation/) के आधार पर unnecessary raised containers के बजाय whitespace/dividers इस्तेमाल करें।

Colour से universal trust या dopamine पैदा होने का दावा नहीं किया गया है। Direction का आधार user preference, existing product identity, information hierarchy और measured readability है।

## पूरे ERP के colour roles

| Role | Colour | प्रयोग |
|---|---|---|
| Workspace canvas | `#F2F5F7` | Page background; cream replacement |
| Surface | `#FFFFFF` | Cards, forms, top bar, drawers, dialogs |
| Subtle surface | `#F7F9FA` | Table headings, quiet grouped rows |
| Hover surface | `#EDF2F5` | Hovered rows and secondary actions |
| Selection | `#E6F0F2` | Selected tab/filter/row; petrol label plus indicator |
| Main text | `#18232D` | Headings, names, amounts, entered values |
| Secondary text | `#52616E` | Supporting copy and persistent labels |
| Hint/placeholder | `#647582` | Hints on white; not a substitute for labels |
| Divider | `#DCE3E8` | Decorative grouping; not the only field boundary |
| Control boundary | `#7B8C99` | Inputs and outlined actions |
| Primary action | `#185766` | Main task per work area |
| Hover / pressed | `#164A56` / `#123B45` | Primary action interaction |
| On-primary | `#FFFFFF` | Button text/icons |
| Focus | `#23677A` | 2px outline with 3px offset on light surfaces |
| Disabled | `#E7ECEF` / `#667681` | Disabled surface/text; genuinely disabled behaviour |
| Sidebar | `#183D48` | Desktop navigation and ERP menu panel |
| Sidebar hover | `#244E5B` | Rail hover and search surface |
| Rail text / support | `#E7F0F2` / `#B5CDD3` | Navigation and secondary information |
| Rail control border | `#7E9FA9` | Search outline on rail hover surface |
| Collected / paid | `#15803D` | Financial positive text; success dot |
| Due / failed / delay | `#B42332` | Due amount, error/delay dot and meaningful error copy |
| Warning | `#8A570B` | Genuine caution; no broad amber wash |
| Running | `#7052A3` | Existing transport running semantic dot |
| Information | `#255E8B` | Information that actually needs a distinct semantic role |

## Component and state specification

| Component | Required treatment |
|---|---|
| Primary button | Petrol fill, white label; hover/pressed above. Loading keeps width and readable label/spinner. One main action per task area; no coloured button for every row. |
| Secondary button | White, dark text, control-border outline; neutral hover. Icon inherits text. |
| Tertiary/link | Petrol label; underline for inline prose links. Keyboard focus visible. Navigation links need selected marker, not only a hue change. |
| Destructive action | Default neutral or clear red text; solid due-red only for deliberate final destructive confirmation. Do not style routine cancellation as dangerous. |
| Cards | White, neutral divider, existing restrained radius. Avoid a shadow plus border on every nested block; related details can be rows separated by dividers. |
| Sidebar | Light navigation text on dark rail. Selected white row with dark petrol label; submenu selected state explicit. Search is dark rail-hover, pale readable value/placeholder, sufficient border. White identity/avatar uses dark text. Rail keyboard focus needs light contrasting outline, not dark main-content focus colour. |
| Top/bottom navigation | White surfaces, dark inactive labels, petrol active label plus existing indicator. No extra Menu tab if top menu already exists. |
| Inputs/selects | White, dark values, persistent secondary label, distinct boundary. Focus ring separated from control; error red boundary plus explanatory text/icon. Required markers and validation never rely on colour alone. |
| Tabs/filter chips | Quiet neutral defaults; selected petrol label plus underline or check/indicator. Selection fill is allowed for controls, not for colouring every status label. |
| Tables/registers | Subtle neutral header, dark labels, white rows, neutral hover. Selected rows need checkbox/indicator. Numeric columns right aligned and tabular. Zebra only if the specific dense register benefits. |
| Status badges | White, thin neutral outline, dark text, coloured dot on the right. Paid green, overdue/delay red, running purple. Text carries meaning; never pastel background plus same-hue label. |
| Financial summaries | Requested collected green and due red remain. Keep explicit labels and amounts. Top-four count animation and collection donut remain; no new animation on every metric. |
| Charts | Brand petrol for collection series; neutral comparison series. Paid/due green/red with labels and totals. Decorative grid lines can be low contrast; essential data and controls need separate checks. |
| Sheets/dialogs | White surface, dark title/body, neutral separators, petrol main action. Portal scope must receive tokens even outside ERP root. Backdrop subordinate, not another tinted surface. |
| Alerts/toasts | White/neutral surface, dark message, semantic icon and concise action. Avoid large coloured banners for routine success. |
| Empty/loading/error | Quiet neutral skeleton; useful empty action; error explanation and retry. Do not encode loading with a blue wash. Respect reduced motion. |
| Browser states | Match caret, text selection, checkbox/radio accent and focus to palette. Preserve native affordances and visible focus in forced-colour mode. |

## Typography, spacing and density

Retain IBM Plex Sans on desktop and existing Plus Jakarta/Noto Devanagari in ERP app. Consistent hierarchy and roles matter more than replacing working font families. Desktop page title 26–28px/600; section title 16–18px/600; body/table 13–14px; supporting labels 12–13px. ERP app body 14–16px, title 20–24px, supporting labels 12–13px. Avoid 10px operational data and over-bold rows.

Use 4/8px rhythm: label-to-field 6–8px; related rows 8–12px; section padding 16–20px; section separation 20–24px; desktop page gutters 24–32px, mobile 16px. Desktop fields 38–40px where density needs it, mobile controls/touch areas around 44px or larger. Preserve workflow-specific table density. Cards 10–12px where existing product uses them; fields/buttons 6–8px. Avoid giant pills for normal buttons and decorative empty space around small content.

These are implementation targets, not claims that every current screen already meets them. Long Hindi labels, keyboard, large text, errors and narrow devices need testing during migration.

## Page-family application

- **Dashboard:** cool canvas, white summary strips; existing composition, green/red money and donut retained. Do not paint each metric card a different colour.
- **Students, staff, attendance, exams:** white registers/forms with neutral toolbar; selected rows and tabs use the same interaction roles. Attendance/marks meanings stay explicit in text.
- **Fees, receipts, dues, payroll:** same work surfaces and controls; collected/due colours reserved for actual financial meaning. Print receipts and payslips keep their document-specific treatment.
- **Messages, homework, meetings, calendar:** same headers, attachments, fields, controls and metadata hierarchy; no colourful tile redesign. Calendar selection and event semantics remain distinct.
- **Transport:** same neutral panels and actions; running/delay use labelled dot badges. Do not let transport status colour become the whole card background.
- **Settings and admission:** quiet section groups, visible labels and validation, clear primary save action. Sidebar and app menu use the same module naming and selected-state logic.

## Evidence and limits

Source census: **285 web files / 72 page files**, **95 ERP-app/shared files / 66 ERP page files**. This is a file inventory, not 138 unique workflows reviewed visually; web census also contains public/print routes. Exact files and hashes are in `source-inventory.json`.

Rendered evidence: 7 desktop web routes and 4 narrow ERP-app routes, each current/proposed. Additional ERP-app menu captures were attempted, but named sidebar measurements are absent; do not treat that menu attempt as complete menu verification. Read-only synthetic fixtures were intercepted; no real school records were changed. Captures reported no missing fixture endpoints or request errors. See `index.html` for actual-screen comparisons.

The preview intentionally preserves layout and shows the colour direction. Legacy inline/component colours remain on some screens, especially ERP-app secondary controls, selected fee cards and progress elements. The screenshots are **not** a finished app-wide migration. Desktop mobile navigation, real dialog states, all keyboard/hover states, large-text/forced-colour mode and every page still need rendered verification when implemented.

`contrast.json` checks 19 proposed opaque token pairs. They pass their specified thresholds, including main text 15.94:1, secondary 6.38:1, placeholder 4.76:1, primary-button text 8.10:1, field boundary 3.47:1. These token tests do not certify whole-app WCAG compliance. [WCAG text contrast](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html) specifies 4.5:1 for normal text and 3:1 for qualifying large text. [Non-text contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html) applies 3:1 to essential control/graphical information, not every decorative divider. [Use of colour](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html) requires another way to convey meaning.

## Implementation order

1. Consolidate scoped ERP role tokens and remove competing historical overrides. Update current DESIGN authority. Do not ship `proposed.css` as a permanent global override.
2. Fix sidebar text/control contrast and coherent primary actions first; migrate canvas, surfaces, text and boundaries in shared components.
3. Map legacy Tailwind/inline colours by semantic role across page families. Preserve financial, attendance and transport meanings. Include portal dialogs and browser states.
4. Verify desktop and narrow ERP routes, menus, dialogs, selected/hover/focus/disabled/loading/error/empty states, keyboard and reduced motion. Use actual workflows, not token tests alone.
5. Recheck Parents/Staff personal/Driver/assistant and print routes for accidental cross-scope changes. This study does not propose redesigning them. Existing AI assistant design remains untouched.

No application theme was applied or pushed as part of this research. The previous dashboard work remains intact.
