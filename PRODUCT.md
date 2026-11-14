# SMS Barmer ERP

The web application supports school-office staff handling admissions, student records, attendance, fees, examinations, communication, payroll and transport. Desktop registers and repeatable administrative tasks are the primary use case; phone layouts support access to the same records.

The public school website, authenticated ERP, parent application and official printed documents have distinct contexts. This redesign concerns the ERP and its shared public web shell; the separate parent-app repository is outside this change.

Existing API contracts and permissions remain the source of truth. Planned modules must remain explicitly labelled. Visual sample data is restricted to local browser review tooling and does not enter application code. See DESIGN.md for visual rules.
