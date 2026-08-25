# 04 — Scope and Risk Protocol

Risk determines audit depth, not arbitrary project size.

## Risk dimensions
Rate each `LOW / MEDIUM / HIGH / CRITICAL / N/A`:

1. Data-loss impact
2. Privacy sensitivity
3. Authentication/account risk
4. Authorization / tenant isolation risk
5. Financial impact
6. Regulatory/legal impact
7. Network attack surface
8. Availability criticality
9. Concurrency/consistency risk
10. External dependency risk
11. Device/platform lifecycle risk
12. Release/reputation impact

## Suggested aggregate classes

### R1 — Low-risk utility/prototype
Examples: calculator, simple offline utility, throwaway demo.

### R2 — Consumer/local persistence
Examples: notes, habits, local-first personal tracker.
Typical emphasis: correctness, lifecycle, persistence, UX, local privacy, testing.

### R3 — Connected authenticated product
Examples: cloud app, SaaS, sync app, account-based mobile product.
Additional emphasis: auth, authorization, API security, concurrency, resilience, observability.

### R4 — High-impact/regulated/financial
Examples: payments, sensitive health/financial workflows, high-value multi-tenant systems.
Requires substantially deeper security, integrity, auditability, recovery and release evidence.

The aggregate class is guidance only; dimension-level reasoning has priority.

## Applicability mapping
Every candidate audit category must be labeled:
- `REQUIRED`
- `IMPORTANT`
- `SUPPORTING`
- `N/A`

Do not include an N/A category in scoring.

## Output
Create `03_AUDIT_SCOPE_AND_RISK.md` containing risk table, applicability rationale and excluded concerns.
