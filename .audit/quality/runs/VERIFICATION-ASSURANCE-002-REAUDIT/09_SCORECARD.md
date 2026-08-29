# VERIFICATION-ASSURANCE-002-REAUDIT — Scorecard

## Dimension scorecard

| Dimension | Max | Baseline | Current | Delta | Reason |
|---|---:|---:|---:|---:|---|
| Critical domain behavior coverage | 20 | 15 | **15** | 0 | The baseline's two named gaps (exam-mode reward differentiation, interrupted-session-restore) are CORE-QA-001/CORE-QA-002 territory — untouched by Sprint 1 (correctly out of scope, Sprint 2's mandate). No change. |
| Negative / edge / failure coverage | 20 | 10 | **14** | +4 | Raised from an initial +3 draft after independent review credited the genuine breadth of new adversarial scenarios: `decideMergeAction`'s `failed` branch, the day-boundary cross-device quest/review-XP guard, idempotency, A→B→A round-trip, stale-cloud-snapshot, and migrated-v1-shape-participates-in-merge. Still missing: `AsyncStorage` failure simulation, malformed-data-at-load-path, sync-write failure, account-deletion failure (both phases), and no dedicated assertion for the 9 `REMOTE_AUTHORITATIVE`-strategy fields — unchanged from baseline or newly noted. |
| Data / sync / security executable coverage | 20 | 10 | **13** | +3 | Reduced from an initial +5/15 draft after independent review: the dominant historical driver of this dimension's loss — VERIFY-QA-001's oracle coupling — is genuinely fixed with strong E3 evidence for the *sync* half. However, this dimension also nominally covers *security*, and the new `firestore.rules` validation (`isValidUserDoc`) plus its 6 new test assertions exist only as unexecuted (E2) source — zero E3 execution evidence anywhere (neither local nor CI) for this exact revision. Crediting full executable-coverage marks onto a combined sync+security dimension while the security half remains entirely unexecuted was judged too generous; capped at 13/20. |
| Integration boundary verification | 10 | 4 | **5** | +1 | `decideMergeAction`'s extraction creates a cleaner, more testable seam for future integration-boundary tests (a proportionate architectural credit), but no new durable automated integration test for `auth.ts`/`firestore.ts`/`storage.ts`'s real I/O was actually added. |
| Critical-journey E2E coverage | 10 | 3 | **3** | 0 | `.maestro/smoke.yaml` confirmed byte-identical to baseline. No credit given or expected — E2E was out of Sprint 1's mandate. |
| Regression protection | 10 | 6 | **8** | +2 | The historically-significant merge-related fix now has strong, real, named regression protection (previously the baseline's own worst example of missing regression durability). Still unchanged: the unrelated historical `DATA-002`(registry)/silent-save-failure gap the baseline cited persists, and the newly-discovered DATA-QA-003/004/005/006 all lack executable regression tests. |
| CI repeatability / gating evidence | 5 | 4 | **3** | −1 | The CI system itself (workflow files) is unchanged and still repeatable in principle, but zero CI evidence exists anywhere for this exact, modified working-tree revision (Sprint 1 is uncommitted) — a thinner evidentiary basis than baseline's own already-executed-and-green HEAD state. |
| Test oracle quality / determinism | 5 | 3 | **4** | +1 | Both named oracle problems (VERIFY-QA-001's coupling, VERIFY-QA-002's tautology) are genuinely resolved. Held short of full marks by the newly-discovered fixture/production-sequencing mismatch (VERIFY-QA-003) — a real, if narrower, oracle-construction quality issue. |
| **TOTAL** | **100** | **55** | **65** | **+10** | |

## Severity counts (CURRENT open/partial findings only)

| Severity | Count | Findings |
|---|---:|---|
| P0 | 0 | — |
| P1 | 0 | — |
| P2 | 1 | VERIFY-QA-003 (severity raised from an initial P3 assessment after independent review) |
| P3 | 0 | — |
| P4 | 0 | — |

## Confidence: HIGH

The core historical findings' closure (VERIFY-QA-001/002) rests on direct, unambiguous source tracing plus genuine E3 executable evidence, independently re-run for this reaudit. The new finding (VERIFY-QA-003) was itself discovered through direct, verifiable code comparison (test setup vs. production call site), not speculation, and its severity correction (P3→P2) came from a well-evidenced independent challenge, not guesswork. The only material uncertainty is the Firestore-rules/CI evidence gap for this exact revision — explicitly disclosed and factored into the relevant dimensions' scores (notably the downward correction to Data/sync/security), not hidden, and not a source of LOW confidence given how well-understood and bounded it is.
