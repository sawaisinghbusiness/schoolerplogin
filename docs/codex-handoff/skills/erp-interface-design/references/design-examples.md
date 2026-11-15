# Design examples from the completed applications

Use these examples to understand the decisions. Adopt their values only when the current brief calls for that identity. Another product may need a different font, hue, density or layout.

## Desktop school-office ERP

Scene: office staff move through admissions, student records, fees, examinations and payroll on a wide screen. The useful visual analogy was a register and fee counter.

| Role | Implemented example |
|---|---|
| Interface font | Self-hosted IBM Plex Sans Variable; system Hindi fallback |
| Canvas / surface | #F4F5F7 / #FFFFFF |
| Ink / supporting text | #18252F / #5D6B75 |
| Dividers | #DCE2E7 |
| Primary action | Deep teal #12665E; hover #0E554F |
| Navigation | Light 236px rail; dark ink active row #21343D |
| Type | 27px task title, 13px support/register text; smaller contextual headers |
| Structure | Fluid content capped at1600px; joined metric bands; ruled registers |

Dashboard: one collection chart with a scale derived from the actual data, an office-attention list, outstanding balances and labelled payment categories. A school collecting thousands should not get a chart with an arbitrary minimum ten-lakh scale.

Student identity: conventional summary and contact details replaced a tilt/flip presentation. The same register number and aligned amounts remained recognisable in the list and details.

Settings: related fields on a continuous editor, with save/undo context and a separate document preview. Nested rounded sections inside a rounded editor were removed.

## Staff PWA and embedded ERP

Scene: a teacher works on a phone between classes. The new teacher homepage had already been approved. It pinned the visual identity; the assignment was to extend it, not replace it with the desktop teal theme.

| Role | Implemented example |
|---|---|
| Interface font | Plus Jakarta Sans Variable + Noto Sans Devanagari Variable |
| Canvas / surface | #F7F9FC / #FFFFFF |
| Ink / supporting text | #242628 / #666A6E |
| Dividers | #DCE4ED |
| Primary action | Navy #0D2A5E |
| Type | 18px page title, 17px section title, 14-16px working text |
| Shape | 14px work surfaces, 10px controls, 1px dividers |
| Navigation | Flat white bottom bar and navy current-state line |

The main issue was competing generations of UI: approved home typography alongside old teal haze, black-edged glass, display fonts on names, purple assistant decoration and a gradient-green send button. A scoped shared kit unified the task surfaces; workflow changes addressed actual space and interaction problems.

Phone patterns that mattered:

- Attendance: stacked class/date selectors when needed; one continuous roster, rather than a stack of separate rounded student cards.
- Homework and notes: selectors and form fields grouped together; class/student columns use minmax(0, ...) or stack, preventing intrinsic-width overflow.
- Marks: exam/class/subject first; full part labels and inputs below each student's identity on narrow screens. Invalid values have an explanation.
- Salary and fees: quiet numeric hierarchy, aligned amounts, shared semantic statuses; no celebratory treatment of routine records.
- ID-card preview: explicit Front/Back controls replaced 3D flipping. Official printed cards kept their document design.
- Personal calendar: readable legend, semantic attendance colours and totals; Hindi copy checked for wrapping.

Driver live-trip controls and official printed certificates had legitimate specialised requirements. Consistency did not require applying task-screen typography and proportions to those documents or erasing safety affordances.

## Why the result feels coherent

The useful psychology is concrete: stable identities reduce reorientation; consistent type roles reduce decoding; semantic colours make status predictable; proximity groups related fields; visible action placement reduces searching. Validate those effects through the real tasks instead of claiming a colour makes users trust the product.

Consistency comes from repeated decisions, not repeated page scaffolds. A fee counter, attendance roster and settings editor should look like one product while remaining recognisably different tools.
