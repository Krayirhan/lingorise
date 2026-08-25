# 11 — Finding Protocol

A finding is a validated project weakness, not a generic suggestion.

## Finding IDs
Use stable domain-prefixed IDs, e.g.:
- `CORE-001`
- `DATA-001`
- `ARCH-001`
- `SEC-001`
- `TEST-001`
- `PERF-001`
- `UX-001`
- `REL-001`

Never reuse an ID for a different root issue.

## Required finding fields

```text
ID
Title
Status: OPEN | PARTIAL | CLOSED | ACCEPTED_RISK | INVALIDATED
Severity: P0..P4
Domain
Evidence IDs
Confidence
Affected user promise
Problem
Why it matters
Concrete impact/failure mode
Affected files/components
Root cause (if known)
Recommended direction
Acceptance criteria
Verification method
First seen run
Last verified run
```

## Finding quality test
A valid finding must answer:
1. What is wrong?
2. Where is it supported?
3. Why does it matter for this product?
4. How can closure be objectively verified?

If those cannot be answered, downgrade to observation or verification gap.

## Duplicate policy
Merge duplicates that share the same root cause. Cross-reference impacted domains rather than creating inflated finding counts.

## Closing findings
A finding is `CLOSED` only after evidence verifies its acceptance criteria. Code changes alone do not close it.

## Accepted risk
If user/product owner intentionally accepts a material issue:
- preserve finding;
- status `ACCEPTED_RISK`;
- retain severity;
- record rationale;
- release verdict may still be affected depending on P0/P1 policy.
