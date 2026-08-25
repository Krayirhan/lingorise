# AUDIT MASTER — Project-Aware Evidence-First Audit Controller

## 0. Authority

This file is the single entry point for this repository's audit framework.
Before auditing, read every engine document marked **MANDATORY** below.
The framework is project-aware: it must evaluate the repository against its actual product purpose, risk, platform and release expectations — not against arbitrary enterprise practices.

## 1. Mandatory engine order

Read in this order:

1. `engine/00_AUDIT_CONSTITUTION.md`
2. `engine/01_OPERATION_MODES.md`
3. `engine/02_PROJECT_DISCOVERY_PROTOCOL.md`
4. `engine/03_PURPOSE_ANALYSIS_PROTOCOL.md`
5. `engine/04_SCOPE_AND_RISK_PROTOCOL.md`
6. `engine/05_CONTEXTUAL_RUBRIC_BUILDER.md`
7. `engine/06_EVIDENCE_POLICY.md`
8. `engine/07_TOOL_DISCOVERY_AND_GRAPH_ANALYSIS.md`
9. `engine/08_SECRET_ZERO_EXPOSURE_POLICY.md`
10. `engine/09_EXECUTION_SAFETY.md`
11. `engine/10_SCORING_PROTOCOL.md`
12. `engine/11_FINDING_PROTOCOL.md`
13. `engine/12_ACTION_PROTOCOL.md`
14. `engine/13_FIX_PROTOCOL.md`
15. `engine/14_REAUDIT_PROTOCOL.md`
16. `engine/15_DELTA_AND_REGRESSION_PROTOCOL.md`
17. `engine/16_RELEASE_CERTIFICATION_PROTOCOL.md`
18. `engine/17_REPORTING_CONTRACT.md`
19. `engine/18_STACK_ADAPTER_GUIDANCE.md`
20. `engine/19_FALSE_POSITIVE_AND_OVERENGINEERING_POLICY.md`

## 2. Supported modes

Exactly one mode must be active:

- `DISCOVER` — understand repository only; no score.
- `BASELINE` — full first audit, contextual rubric creation + lock, score, findings, actions.
- `PLAN` — generate/update actions from existing valid findings; no source modifications.
- `FIX` — modify only explicitly approved action IDs.
- `REAUDIT` — score again with the locked rubric and compare against prior valid run.
- `CERTIFY` — run release gates and issue GO / CONDITIONAL GO / NO-GO.

If no mode is specified, default to `DISCOVER`, never `FIX`.

## 3. Read-only default

All modes except `FIX` are read-only with respect to project source/configuration. Audit artifacts under `.audit/runs/` and `.audit/state/` may be created/updated where the environment permits.

Never change product code to make an audit pass unless the user explicitly selected `FIX` and approved concrete action IDs.

## 4. Required state handling

Before work, inspect when available:

- `state/CURRENT_PROJECT_PROFILE.md`
- `state/CURRENT_PURPOSE.md`
- `state/RUBRIC_LOCK.md`
- `state/FINDING_REGISTRY.md`
- `state/ACTION_REGISTRY.md`

Do not trust stale state blindly. Validate repository identity / branch / revision where possible.

## 5. Run immutability

Every completed audit must create a new run directory:

```text
runs/RUN-001-BASELINE/
runs/RUN-002-REAUDIT/
runs/RUN-003-CERTIFY/
```

Never overwrite or retroactively rewrite an earlier completed run. If a previous run is invalid, mark it invalid in a newer run and explain why.

## 6. Required BASELINE output

A baseline run must contain:

1. `01_PROJECT_UNDERSTANDING.md`
2. `02_PROJECT_PURPOSE.md`
3. `03_AUDIT_SCOPE_AND_RISK.md`
4. `04_CONTEXTUAL_RUBRIC.md`
5. `05_TOOL_AND_GRAPH_ANALYSIS.md`
6. `06_EVIDENCE_INDEX.md`
7. `07_DETAILED_AUDIT.md`
8. `08_SCORECARD.md`
9. `09_FINDINGS.md`
10. `10_ACTION_PLAN.md`
11. `11_RELEASE_VERDICT.md`

## 7. Required REAUDIT output

A re-audit must additionally contain:

- `12_DELTA_REPORT.md`
- `13_REGRESSION_REPORT.md`

## 8. Non-negotiable rules

- Purpose must be understood before scoring.
- Applicability must be determined before weighting.
- N/A items do not reduce score and are excluded from denominator.
- Missing optional tooling is not automatically a defect.
- Every scored conclusion needs traceable evidence.
- Inference must be labeled as inference.
- A theoretical improvement is not automatically a finding.
- Complexity is not quality.
- More layers are not automatically better architecture.
- Score and release verdict are separate mechanisms.
- Secrets must never be intentionally exposed to model context, terminal logs, or reports.
- Re-audits use the locked rubric unless a documented material scope/risk change requires a new rubric version.
