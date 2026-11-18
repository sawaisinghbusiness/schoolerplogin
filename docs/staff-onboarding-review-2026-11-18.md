# Staff onboarding: research and implemented flow

18 November 2026. Scope: ERP web Add staff drawer, direct Add staff page, and staff app ERP Add staff. Existing homepage identity and backend contracts retained.

## Research conclusion

Employee creation should establish an identifiable person and their job; onboarding then completes payroll, access, assignments and supporting documents. Frappe HR separates personal/employment/contact information from salary/payment details, while greytHR supports configurable mandatory fields and document review. These are product patterns, not a claim that every school has identical statutory requirements.

Primary sources: [Frappe employee master](https://docs.frappe.io/hr/employee), [employee onboarding](https://docs.frappe.io/hr/employee-onboarding), [salary payments and bank fields](https://docs.frappe.io/hr/reports/salary-payments-via-ecs), [greytHR onboarding configuration](https://www.greythr.com/greythr-help/admin/answers/149132917/).

## Implemented

Four stages: **Profile → Job & joining → Contact → Review**. The current API's mandatory name, designation and ten-digit mobile are checked at the relevant stage. Employee code is suggested by the existing endpoint. Back retains input. The review stage makes creation deliberate instead of presenting an unexplained long settings-style list. Existing edit flow and admin permission checks remain.

| Stage | Collected information |
| --- | --- |
| Profile | Full name, employee code, date of birth, gender |
| Job & joining | Teaching/non-teaching category, designation, department, joining date, qualification, previous experience |
| Contact | Mobile, optional alternate mobile, optional email, address |
| Review | Identity/job/contact summary and office notes; explicit create action |

Desktop uses a contained drawer with an anchored action footer, four-part progress indicator and a two-column field grid where space allows. Mobile uses the same four stages, bilingual progress labels and bottom actions. Completed stages are identified separately from the current stage. No new payroll or identity-document data is pretended to save through an unsupported API field.

## Information to add to the product next

| Information | Recommendation / current boundary |
| --- | --- |
| Employment type | Permanent, probation, contract, part-time; add backend field and probation/contract dates before adding UI. |
| Emergency contact | Separate name, relationship and phone. An alternate mobile alone is not an emergency-contact record. Requires backend support. |
| Teaching responsibilities | Class teacher and subject/class allocations already have a separate profile workflow; set after creation. |
| Salary | Salary structure, effective date, payment mode, applicable deductions and pay schedule belong in payroll setup after creation. Do not equate base pay with take-home salary. |
| Bank details | Account holder, account number, bank and IFSC where bank payment is used; collect in protected payroll setup, not as a universal creation requirement. |
| App access | Explicitly provision role/access after creation using existing login flow; designation is not authorization. |
| Documents | Qualification/experience certificates, appointment letter and required identity checks need private upload, permission, verification and retention support. No decorative upload box without persistence. |
| Driver-specific records | Licence category, number, validity and verification; add a transport-specific profile extension rather than burdening every teacher. |
| Sensitive/statutory IDs | Collect PAN/PF/ESI or other identifiers only where the actual employment/payroll process requires them. Do not make Aadhaar a blanket UI requirement based on a competitor form. Confirm institutional/legal needs separately. |
| Photo | Use the established profile-photo workflow if available; a new upload input must include real upload/crop/save behavior. |

Follow-up priority: employment type and emergency contact first; document verification and role-specific fields next. Keep a profile-completion checklist tied to actual missing data rather than an invented completeness score.

## Verification boundary

Local changes only. No staff record is created as part of verification and no production writes are authorized by a UI check. TypeScript checks and rendered review should be reported separately from actual create/update API integration. Existing staff permissions and request payload fields are retained.

Verification completed: ERP web and staff app TypeScript checks passed. An isolated rendering of the actual desktop form component, with write-disabled service stubs, exercised the required-name error, all four stages, populated review and narrow-screen overflow check (390px, no horizontal overflow). This is component evidence, not a claim that a live staff record was created or that the new mobile workflow received a full authenticated end-to-end check.
