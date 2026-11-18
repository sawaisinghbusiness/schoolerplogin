# Staff form release fix and fee receipt stationery

The previous staff onboarding update passed syntax checks but introduced a mismatch in the desktop-generated workflow: it passed `slow` to a generated ErrorCard that did not accept it. A fresh ERP typecheck reproduced the error. ErrorCard now supports the timeout state and the ERP production build completes. This is evidence of a build-blocking defect; no hosting-provider deployment log was inspected.

The actual production `/staff` page was opened in isolated Chrome with synthetic, read-only API fixtures. Clicking Add staff rendered **New staff member**, all four stages and the Director label without runtime exceptions. No real employee was created or updated. The previous screenshot shows the older drawer.

User-facing admin labels in ERP login, account metadata and user-role selection now read **Director**. The staff ERP role metadata is kept consistent. The authorization value remains `admin`.

Fee receipts now share the report card's printed-school vocabulary: navy double-rule border, serif school letterhead, configured school logo/contact/affiliation, clear receipt title and date, student and admission identifiers, itemised fee table, total, amount in words, remarks and signature lines. Parent/school copies and cancelled watermark are preserved. The receipt does not invent a payment status, signature or balance not supplied by the transaction.

Verification: ERP production build succeeded; staff app typecheck succeeded. Synthetic receipt was rendered at900px and390px and exported through Chrome print; two ordinary copies fit one A4 page. Receipts with many fee heads or long notes may require additional space; no financial content is truncated merely to force a single page. No real fee was collected or cancelled during verification. Desktop/staff receipt layout changes match.
