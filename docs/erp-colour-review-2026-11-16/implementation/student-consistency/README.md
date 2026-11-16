# Student register and photo consistency — 16 November 2026

The ERP staff register and the ERP web phone register use 96px student cards: name with class/section in brackets, father name on the second line, and an outlined fee badge at the lower right. Staff class/section selectors share a fixed 64px height and stacked labels. The shared teacher roster uses the same card component, retaining roll number because its role-scoped API does not expose father name or financial details.

The header's Add student badge is visually 32px high inside a 44px touch target. The staff ERP side menu restores the original light background; the desktop ERP rail retains its approved dark treatment.

Web and staff share the new crop editor implementation: drag, pinch or slider zoom, circular profile crop and optional 3:4 ID crop, a live avatar preview, cancellation, keyboard focus management and unchanged data-URL return contract. Profile output is 360×360; ID output is 360×480. Shared avatar/upload/ID views in ERP, staff and parents use consistent portrait positioning. Previously cropped-away pixels require uploading the original photo again.

The register API provides a balance, not an overdue date; positive balances are labelled Due rather than inventing Overdue status.

Verification: web, staff and parents TypeScript checks pass. The read-only Chromium fixture review covers 390px and 360px registers, equal row/filter sizes, no horizontal overflow, the light menu, drag and button zoom, native two-finger pinch, both export dimensions and cancellation preserving the prior image. The desktop web register was visually checked. All test photos and student data are synthetic; no database writes were made. This is not a physical iPhone performance or whole-app accessibility certification.

See `results.json` and the adjacent screenshots. Reproduce with `node docs/erp-colour-review-2026-11-16/review-student-consistency.cjs` while the review servers and isolated Chromium CDP instance are running.
