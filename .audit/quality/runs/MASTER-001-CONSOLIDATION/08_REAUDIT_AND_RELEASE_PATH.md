# MASTER-001 — Reaudit and Release Path

```
MASTER-001 (this run — planning only, no product changes)
   │
   ▼
SPRINT-001-INTEGRITY-VERIFICATION
   │  Gate: no new P0/P1; DATA-QA-001/002, VERIFY-QA-001 closed with
   │        executable evidence; RELEASE-QA-001 closure evidence produced;
   │        typecheck + suites pass; reviewers AGREE/resolved-ADJUST
   ▼
Targeted reaudit: DATA-002-REAUDIT, VERIFICATION-ASSURANCE-002-REAUDIT
   │  Gate: reaudits confirm closure; no regression found
   ▼
SPRINT-002-PRODUCT-QUALITY-POLISH
   │  Gate: no new P0/P1/P2; each addressed finding has test or documented
   │        manual verification; typecheck + suite pass
   ▼
Targeted reaudit: CORE / ACCESSIBILITY / COMPATIBILITY / PERFORMANCE
                  (only for domains whose findings were actually touched)
   │  Gate: reaudits confirm improvement, no regression
   ▼
SPRINT-003-RELEASE-REPOSITORY-HARDENING
   │  Gate: RELEASE-QA-003 closure evidence produced; the three CONDITIONAL
   │        release requirements each resolve to PASS or a newly documented
   │        defect; branch protection + secret scanning enabled
   ▼
Targeted reaudit / release preparation: RELEASE blocker-only recheck,
                  SUPPLY CHAIN targeted recheck
   │  Gate: both proven blockers closed with evidence; conditional items PASS
   ▼
Exact-revision Release Candidate selected (clean working tree, reviewed)
   │
   ▼
EAS production AAB generated
   │
   ▼
Artifact/signing verification (GLOBAL-QA-010 evidence)
   │
   ▼
Firebase production config verification (GLOBAL-QA-028 evidence)
   │
   ▼
Critical runtime smoke on the RC build
   │
   ▼
Play Console requirements verified (GLOBAL-QA-029 evidence)
   │
   ▼
RELEASE-002 (targeted or full Release reaudit against the RC revision)
   │  Gate: no proven blocker remains; all mandatory conditions verified
   ▼
FINAL MASTER update (post-Sprint-3 consolidation, reflecting closed items)
   │
   ▼
GO / CONDITIONAL / NO-GO determination (by RELEASE-002, not by MASTER-001)
   │
   ▼
Production submission — ONLY if the gate at RELEASE-002 is GO
```

## Gate conditions between stages

| Stage boundary | Gate condition to proceed |
|---|---|
| MASTER-001 → Sprint 1 | None (MASTER-001 is complete; Sprint 1 may begin) |
| Sprint 1 → targeted reaudit | Sprint 1's own exit gate (see `07_THREE_SPRINT_PLAN.md`) must be met |
| targeted reaudit → Sprint 2 | DATA-002-REAUDIT and VERIFICATION-ASSURANCE-002-REAUDIT must not find a regression or an unclosed MUST-FIX item |
| Sprint 2 → targeted reaudit | Sprint 2's own exit gate must be met |
| targeted reaudit → Sprint 3 | No regression found in any domain actually touched by Sprint 2 |
| Sprint 3 → release prep | Sprint 3's own exit gate must be met; both proven blockers have closure evidence |
| release prep → RC generation | Working tree clean/reviewed at the intended release revision |
| RC → RELEASE-002 | All of: artifact signing verified, Firebase env verified, critical smoke passed, Play Console requirements verified |
| RELEASE-002 → FINAL MASTER | RELEASE-002 completed regardless of outcome (even a NO-GO result must be consolidated) |
| FINAL MASTER → production submission | Gate = GO. A CONDITIONAL or NO-GO gate at this stage returns to the responsible sprint, not to a new Sprint 4 — remediation of a newly found defect is scoped as an addendum to whichever of the three sprints owns that surface. |

No step in this path is executed by MASTER-001 itself — this file is a plan only.
