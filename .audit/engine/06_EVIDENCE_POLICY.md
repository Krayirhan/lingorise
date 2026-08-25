# 06 — Evidence Policy

Every scored conclusion must be traceable.

## Evidence levels

- `E1_RUNTIME` — directly observed runtime behavior or reproducible runtime check.
- `E2_TEST` — automated test evidence with relevant assertions and execution result.
- `E3_STATIC` — direct source/AST/config inspection.
- `E4_TOOL` — linter/scanner/graph/build tool output.
- `E5_DOC` — authoritative project documentation/specification.
- `E6_INFERENCE` — reasoned inference from incomplete evidence.
- `E7_UNVERIFIED` — insufficient evidence.

## Confidence
Assign:
- `HIGH`
- `MEDIUM`
- `LOW`

## Strong evidence preference
For critical claims prefer combinations such as:
- runtime + test;
- test + source;
- source + static analyzer;
- config + build verification.

## Absence-of-evidence rule
Do not claim a control is absent merely because one search did not find it. Search relevant aliases/patterns and inspect architecture context.

## No fabricated execution
Never state that a test/build/scanner passed unless it was actually executed in the current environment or supported by a trustworthy captured artifact.

## Evidence index
Every run must include `06_EVIDENCE_INDEX.md` mapping evidence IDs to:
- command/check;
- files/locations;
- result summary;
- evidence level;
- limitations.

## Scoring under uncertainty
If an applicable criterion cannot be verified:
- do not silently award full credit;
- do not automatically assign zero;
- use a conservative evidence-limited score appropriate to risk;
- explicitly state verification gap.
