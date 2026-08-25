# 12 — Action Protocol

Actions convert findings into bounded implementation work.

## Action ID
Use `ACT-<DOMAIN>-NNN`.
An action may address one or multiple related findings, but mappings must be explicit.

## Required action fields

```text
Action ID
Status: PROPOSED | APPROVED | IN_PROGRESS | DONE | VERIFIED | REJECTED
Priority
Source finding IDs
Goal
Scope
Out of scope
Likely files/components
Implementation guidance
Acceptance criteria
Verification commands/tests
Regression risks
Dependencies
Estimated effort: XS/S/M/L/XL
Expected quality impact
```

## Prioritization
Prefer this reasoning:

```text
Priority ∝
(severity × user impact × likelihood × architectural leverage)
/ implementation cost
```

Do not use the formula mechanically; explain exceptions.

## Work lanes

### STABILIZATION
Prioritize:
- P0/P1;
- data loss;
- crashes;
- broken core flows;
- authorization/security defects;
- corruption/consistency risks.

### QUALITY
Prioritize:
- test coverage where risk justifies it;
- maintainability;
- performance;
- UX/accessibility;
- controlled refactors.

### RELEASE
Prioritize only when release preparation is in scope:
- signing;
- store/package metadata;
- release build;
- policies/compliance;
- monitoring/analytics where appropriate.

Do not mix release cosmetics ahead of fundamental product stability unless release context explicitly demands it.
