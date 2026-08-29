# MASTER-001 — Release Dependency Map

**Current Release Gate: NO-GO** (unchanged — MASTER-001 does not rescore Release; canonical source `RELEASE-001-BASELINE/FINAL_RESULT.md`, FINAL LOCK, incorporates `P1_GATE_ADJUDICATION.md`)
**Current Diagnostic Release Readiness: 61/100** (unchanged)

## Proven release blockers

| Blocker ID | Underlying technical root cause | Responsible Global finding | Responsible sprint | Closure evidence required |
|---|---|---|---|---|
| RELEASE-QA-001 | No canonical progress schema → merge silently discards `passedLevelExams`/history fields (DATA-QA-002) | GLOBAL-QA-001 (+ GLOBAL-QA-002 for evidence) | Sprint 1 | Per the Release Blocker Closure Standard: (1) the exact historical lost-progress scenario no longer loses progress, (2) failed/transient sync + restart is safe, (3) damaged merge state is not re-persisted, (4) real production merge logic is exercised by tests, (5) `passedLevelExams` survives relevant multi-device/cold-start scenarios, (6) related history/state fields are handled intentionally, (7) existing core XP/streak/mastery behavior does not regress. Static inspection alone is NOT sufficient. |
| RELEASE-QA-003 | Configured privacy-policy URL doesn't anonymously expose app-specific content | GLOBAL-QA-011 (fed by GLOBAL-QA-012) | Sprint 3 (content produced in Sprint 2) | A fresh anonymous HTTP check confirming durable, app-specific policy content loads without authentication at the configured URL |

## Conditional / not-verified release requirements

| Condition | Responsible Global finding | Responsible sprint | Verification needed | What constitutes PASS | What constitutes FAIL |
|---|---|---|---|---|---|
| EAS production AAB signing / Play App Signing | GLOBAL-QA-010 | Sprint 3 | Generate and inspect an exact-revision EAS production AAB; verify persistent production credentials and Play App Signing provenance | Verified production signing distinct from the repo debug key | Confirmed use of debug/insecure signing for the actual distributable artifact — would become a NEW proven P1 blocker if found, not merely close this condition as FAIL |
| EAS production Firebase environment | GLOBAL-QA-028 | Sprint 3 | Confirm all six required `EXPO_PUBLIC_FIREBASE_*` values are present in the EAS production environment; test production-like Firebase initialization | Environment confirmed complete and functional | Missing/incorrect values confirmed — would become a new blocker |
| Play Console version/listing/Data Safety/account-deletion web declaration | GLOBAL-QA-029 | Sprint 3 | Play Console versionCode acceptance, listing completeness, Data Safety submission, functional account-deletion web declaration | All four confirmed complete | Any confirmed incomplete/incorrect — would need remediation before submission |

## Non-gating but release-relevant items

| Item | Responsible Global finding | Responsible sprint | Note |
|---|---|---|---|
| Repo/CI debug signing hygiene | GLOBAL-QA-009 | Sprint 3 | Informs (does not itself resolve) GLOBAL-QA-010's verification |
| Production observability | GLOBAL-QA-030 | Sprint 3 | FIX IF CHEAP, not gating |
| Branch protection | GLOBAL-QA-016 | Sprint 3 | Repository control, not a Play submission gate |
| Secret scanning | GLOBAL-QA-017 | Sprint 3 | Repository control, not a Play submission gate |

## Blocking logic — path from current NO-GO to final GO

```
Current: NO-GO (2 proven blockers: RELEASE-QA-001, RELEASE-QA-003)
  │
  ├─ Sprint 1 closes GLOBAL-QA-001/002 with executable evidence
  │    → RELEASE-QA-001 may be recommended CLOSED (subject to the Closure Standard above)
  │
  ├─ Sprint 2 (GLOBAL-QA-012) produces canonical bilingual privacy-policy content
  │
  ├─ Sprint 3 (GLOBAL-QA-011) hosts that content durably and publicly, re-verified anonymously
  │    → RELEASE-QA-003 may be recommended CLOSED
  │
  ├─ Sprint 3 (GLOBAL-QA-010, 028, 029) verifies the three CONDITIONAL release requirements
  │    → each independently PASSES or newly reveals a proven defect
  │
  └─ IF both proven blockers are closed with executable evidence
     AND all three conditional requirements PASS
     AND a targeted Release reaudit confirms no new blocker
     THEN Release Gate may become GO — this determination belongs to a future
     targeted Release reaudit, NOT to MASTER-001.
```

MASTER-001 does not change the Release Gate. It only maps every current Release item to a Global finding and a sprint, per the Section 17 requirement.
