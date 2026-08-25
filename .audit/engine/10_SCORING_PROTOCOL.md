# 10 — Scoring Protocol

## Scale
Score each applicable domain from `0.0` to `10.0`.

### Anchors
- `0–2` — absent, broken, unsafe or fundamentally incorrect.
- `3–4` — serious weaknesses; works only under narrow conditions.
- `5` — functional but fragile/incomplete.
- `6` — acceptable for intended scope with meaningful weaknesses.
- `7` — good; reliable with manageable gaps.
- `8` — strong; robust evidence and few material weaknesses.
- `9` — production-grade for the stated scope/risk with excellent evidence.
- `10` — exceptional; little meaningful improvement remains within stated scope.

Do not inflate 9/10 merely because no obvious issue was noticed.

## Overall formula
For applicable categories only:

```text
Overall = Σ(domain_score × domain_weight) / Σ(applicable_domain_weight)
```

Baseline rubric weights should normally total 100, but denominator normalization remains mandatory if an item later becomes N/A for a valid reason.

## Confidence-adjusted reporting
Do not secretly alter the numeric score using confidence. Report score and evidence confidence separately.

Example:
```text
Data Integrity: 8.2/10
Confidence: HIGH
```

## Critical blocker rule
A P0 may produce `NO-GO` regardless of overall score.

## Severity definitions
- `P0 BLOCKER` — credible severe data loss/security/correctness/release failure; must fix before intended release.
- `P1 HIGH` — material user/product risk; should fix before release or requires explicit accepted risk.
- `P2 MEDIUM` — important quality weakness; schedule soon.
- `P3 LOW` — localized improvement with limited impact.
- `P4 NOTE` — observation/opportunity, not a defect.

## No double counting
One root cause should not reduce multiple domain scores excessively unless it genuinely affects multiple independent product outcomes. Explain cross-domain impact.

## Score traceability
Each domain score must include:
- rationale;
- supporting evidence IDs;
- material deductions;
- uncertainty.
