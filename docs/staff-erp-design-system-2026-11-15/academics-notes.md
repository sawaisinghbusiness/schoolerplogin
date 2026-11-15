# Academic and communication task refinements

Scope: staff-app ERP mode only. Shared CSS, AppShell, home and primitive components belong to root; this pass made focused page corrections after source review. Business logic, roles, endpoints and print documents were preserved.

| Source route | Demonstrated issue | Correction |
|---|---|---|
| copy-check/sheet | Status columns fixed40px and names truncated; remarks34px | 44px tracks with minmax identity, wrapped names,44px all-complete and remark actions |
| exams/marks/sheet | Multipart label76px with11px truncation;40px entry inputs; tiny absence label | Flexible92?160px labels, wrapping12.5px text,44px inputs and reachable absence label; student names wrap |
| messages/new | Template chips36px, segmented audience40px, language34px and insert-token32px | Consistent44px targets and10px corners; variable tokens retain monospace because they are actual template syntax |
| syllabus/plan | Section chips36px tall | At least44px high/wide,10px corners |
| homework | Subject tabs38px tall |44px tabs,10px corners |
| timetable | Subject chips40px; tiny uppercase teacher subgroup labels |44px chips and normal-case13px secondary subgroup labels |
| parent-chats/chat | Literal old cool canvas and teal-tinted secondary text inside navy bubbles | Shared ERP canvas variable with mineral fallback; navy-tinted secondary bubble text |

Navy action identity, meaningful green/red/amber attendance/marking states, calendar holiday colour and labelled chart categories remain intact. WhatsApp handoff green was preserved as service identity, not ordinary primary action recolouring. No broad regex typography conversion was used across the route tree.

## Verification

TypeScript transpile checks on all seven changed source files report zero syntax errors; staff git diff --check passes. This is source/syntax verification only. Root owns final full type/build and rendered multi-route checks, including generated desktop workflow synchronization. No live school writes, commit or push performed.
