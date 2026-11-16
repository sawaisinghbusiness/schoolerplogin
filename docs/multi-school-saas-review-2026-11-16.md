# Multi-school SaaS: current findings and proposed setup

This is a proposal, not an applied tenant migration. The user clarified that the requested rollback concerned class placement on student list cards. Class is back below the name; compact neutral notifications are reapplied. The ERP web profile identity card remains compact with the Settings logo.

## What the inspected code supports today

- Backend `src/lib/session.ts`: SessionPayload carries sub, name, role and identifier, without school/tenant membership.
- `src/services/authService.ts`: office credential lookup queries users by phone/admission/employee code without school scope.
- `src/services/schoolService.ts`: institution settings read uses order(created_at).limit(1), rather than an authenticated school scope.
- `supabase/schema.sql`: inspected classes, academic sessions and users definitions are single-institution structures, including globally unique identifiers.
- `src/lib/supabase.ts`: backend uses an elevated service-role client. Adding RLS policies alone will not constrain queries through this client.
- Staff public manifest has a fixed St. Paul name/icons. Staff Next config uses one configured backend destination; browser-picked API hosts are not a tenant isolation boundary.

These findings establish that the inspected core authentication/settings path is not ready to distinguish unrelated schools. They do not certify every table, attachment, job or payment integration.

## Recommended product arrangement

One shared desktop ERP, one shared Staff app (including driver role), one shared Parents app, and a common API/database platform. School administrators receive their own accounts. School code or trusted school subdomain identifies the intended institution at sign-in; successful authentication establishes authorized school membership server-side. School code is an identifier, not a password or authorization grant.

Within the app, show the selected school's name, logo, academic session and data. Use a common product name/icon for the economical shared app. A separately branded store app can be an optional paid service; it is not necessary for each school. A parent with children in two schools needs a verified school/child switcher that refreshes data and clears the prior school cache.

Existing apps are Next web apps with manifest metadata. Complete and verify installability, HTTPS, service worker/push behavior and platform-specific installation flows before promising native-equivalent behavior. PWA installation avoids store distribution fees; it does not eliminate hosting costs or give reliable background GPS tracking. Driver background tracking needs a separate device/native-platform feasibility decision.

## Required implementation sequence

1. Inventory tables, services, file access, exports, caches, queues, WhatsApp sessions, scheduled jobs, push recipients and school payment destinations. Back up and establish restore tests.
2. Introduce schools, school memberships and scoped settings. Backfill the current institution. Scope business tables, composite uniqueness and cross-table relationships. Design global login identities separately from tenant memberships, including parents/staff associated with multiple schools.
3. Resolve authenticated tenant membership on the server; add it to trusted sessions/request context. Scope reads, writes, counts, joins, aggregates, reports, downloads and object paths. Never authorize a school ID merely because it arrived in a browser header or query string. Use tenant-aware database enforcement; replace or tightly constrain the privileged service-role query paths. Do not claim RLS protects service-role calls.
4. Add school onboarding/settings, branding, membership-aware login/switching and school-specific bank/QR/gateway configuration. Partition cached data and notification recipients. Clear previous-school state on switches/sign-out. Configure file quotas, backup policy, billing and administrative audit access.
5. Seed two synthetic schools with overlapping roll/admission/receipt numbers and the same parent phone. Test all roles against other-school record IDs, files, reports, update/delete operations, notifications and payment callbacks. Pilot with limited schools, then expand based on measured concurrency/storage/CPU and support load.

The existing live data must not simply be combined with a second school's records before this work. No schema, auth model or production data was changed during this review.

## Pricing references checked 16 November 2026

| Component | Published starting point | Important qualification |
| --- | --- | --- |
| Supabase Pro | From US$25/month, first project included | Additional projects start from US$10/month; compute/usage can increase. https://supabase.com/pricing |
| Vercel Pro | US$20/month platform fee for one paid developer seat | Shared usage across frontends is metered; extra seats/usage cost more. Hobby is personal/non-commercial. https://vercel.com/docs/plans/pro-plan and https://vercel.com/pricing |
| Render API | Starter US$7/month | Per service; 512 MB is an entry configuration, not a capacity guarantee. Worker/Chromium/WhatsApp workloads may require more. https://render.com/pricing |
| Firebase Cloud Messaging | Messaging product at no cost | Dispatch backend, storage, SMS/WhatsApp, OTP and other Google services are separate. https://firebase.google.com/products/cloud-messaging |
| Google Play developer registration | US$25 one-time | Developer account fee, not per-school fee; other requirements and native-app development remain. https://support.google.com/googleplay/android-developer/answer/6112435 |
| Apple Developer Program | US$99/year | Distribution membership, not implementation/review approval. https://developer.apple.com/programs/whats-included/ |

One illustrative managed-hosting baseline is $25+$20+$7 = **US$52/month before tax, currency conversion, additional seats/services and usage**. This is a configuration cost, not evidence it supports a particular number of schools. A tentative low-traffic launch hosting allowance of **₹6,000–₹12,000/month** is an engineering planning range, not a vendor quote or exchange-rate conversion. Validate it with workload measurements before committing a customer price.

Excluded from that allowance: development/migration, onboarding and ongoing support labor, SMS/WhatsApp/OTP, AI usage, maps/routing, payment provider charges, large attachment storage/egress, extra workers/backup retention and app-store publication work. Shared database compute is not linear per school; attachments and peak attendance/homework load can dominate. Actual cost per school is total platform/service/support costs divided by paying schools, plus school-specific usage.

Budget school subscription design should cover support and onboarding rather than price from infrastructure alone. Set storage/student/message allowances and transparent overage handling; avoid promising unlimited file uploads. Dedicated infrastructure/white-label builds can be separate packages.

## Platform references

- RLS and privileged access: https://supabase.com/docs/guides/database/postgres/row-level-security
- PWA installation: https://web.dev/learn/pwa/installation
- iPhone web push requires a supported Home Screen web app and user-granted permission: https://webkit.org/blog/13878/web-push-for-web-apps-on-ios-and-ipados/

## UI validation

The reverted notification experiment was verified in ERP web and staff. Browser fixtures blocked database writes. Adjacent `erp-colour-review-2026-11-16/implementation/notifications/` contains historical captures of that experiment, not the currently restored design. Student card/crop/menu verification is under `implementation/student-consistency/`.
