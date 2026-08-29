# VERIFICATION-ASSURANCE-002-REAUDIT — Runtime, E2E, Rules Evidence

## Executable commands run fresh during this reaudit

| Command | Result | Evidence level | Notes |
|---|---|---|---|
| `npm run typecheck` | PASS (0 errors) | E3 | Includes the `Record<keyof UserData, FieldStrategy>` exhaustiveness guarantee |
| `npm test` | PASS — 392 passed, 0 failed | E3 | Re-run independently for this reaudit, not copied from Sprint 1's or DATA-002's own report |
| `java -version` | OpenJDK 17.0.20.1 | — | Reconfirms the pre-existing environment gap |
| `npm run test:rules` (attempted) | BLOCKED — "firebase-tools no longer supports Java version before 21" | NOT VERIFIED LOCALLY | Identical failure mode reconfirmed a third time (Sprint 1, DATA-002-REAUDIT, this reaudit) — a stable, unresolved-by-design local environment constraint. Not attempted to be worked around (no JDK install, no project tooling change), per instructions. |

## Firestore Rules assurance

**Local: NOT VERIFIED (environment gap), reconfirmed.**
**CI: NOT VERIFIED for this exact revision.** The `firestore.rules` file itself was modified by Sprint 1 (uncommitted) — no CI run anywhere has ever executed `tests/firestoreRules.test.ts` against this modified rules file, unlike baseline where the (then-unmodified) rules file at least had CI evidence from the original DATA-001/CORE-001-era audits. This is a genuine reduction in available evidence strength for the rules portion specifically, compared to baseline, independent of whether the new rules are correct.

**Static (E2) review:** the new `isValidUserDoc()` validation logic and the new `dailyTasks` cross-user test were read directly and reasoned through in `DATA-002-REAUDIT/07_FINDING_RECONCILIATION.md` (confirmed no legitimate write is rejected) — this is solid E2 evidence, but this reaudit does not upgrade it to E3, per instructions ("do not pretend E2 static review equals E3 emulator execution").

## CI assurance

CI workflow files (`.github/`) confirmed byte-identical to baseline (`git diff --stat -- .github` returns empty) — the CI system's own repeatability property is unchanged.

**CURRENT SPRINT-1 REVISION CI: NOT VERIFIED.** Sprint 1's changes are uncommitted; no CI run of any kind has executed against this exact working-tree state. The historical baseline's "CI green on HEAD" evidence refers to the pre-Sprint-1 code at the same SHA — it says nothing about whether the current, modified working tree would pass CI (though the local `npm run typecheck`/`npm test` runs strongly suggest it would, for the `verify` job specifically; the `android-build`/`e2e-smoke` jobs were not locally re-executed and remain unconfirmed for this revision).

No product points were deducted for this — per instructions, this affects only the CI-repeatability-evidence dimension's *evidence strength for the current revision*, not a claim that the code itself is broken.

## E2E assurance

**Unchanged from baseline.** `.maestro/smoke.yaml` confirmed byte-identical to baseline (no diff). The single existing flow (launch → onboarding → guest-start → navigate-to-Practice-Hub) does not exercise sign-in, cloud sync, merge, reset, or account deletion — none of Sprint 1's actual changes are touched by any E2E flow. Sprint 1 did not add E2E coverage, and none was expected of it (E2E work is out of this sprint's mandate). Rated the same as baseline: WEAK/narrow in absolute terms, but not a regression, and not penalized further here — the baseline's own 3/10 score already fully reflects this narrow scope.
