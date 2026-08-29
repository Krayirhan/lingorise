# SPRINT-002 — Test Evidence (fresh post-review-fix run)

| Command | Purpose | Result | Count | Evidence level | Notes |
|---|---|---|---|---|---|
| `npm run typecheck` | TypeScript strict-mode compile | **PASS** (0 errors) | — | E3 | Fresh run, after all reviewer fixes applied |
| `npm test` | Full primary suite (Sprint 1 + Sprint 2) | **PASS — 422 passed, 0 failed** | 422 | E3 | Fresh run, after all reviewer fixes applied. Same total as pre-fix run (the two test-reviewer corrections were 1:1 replacements of existing assertions, not additions) |
| `npm run test:rules` (Firestore emulator) | Rules authorization/validation | **BLOCKED — NOT VERIFIED LOCALLY** | — | environment gap | Reconfirmed fresh: JDK 17.0.20.1 installed, `firebase-tools` requires 21+. `firestore.rules` unchanged by Sprint 2 (last touched by Sprint 1) — this is the same, pre-existing, unresolved-by-design gap already reported by Sprint 1 and both post-Sprint-1 reaudits. Not attempted to be worked around. |
| Build sanity | Android compile/runtime | **NOT RUN** | — | — | No native code, manifest, Gradle config, or dependency touched by Sprint 2 — same reasoning as Sprint 1's own evidence file. Typecheck + full JS suite are the relevant sanity checks for this change set. |

## DATA-QA-005 regression

`tests/testSuite.ts` §56 addendum, three scenarios, all calling the real `mergeUserData`:
- Intentional downgrade survives a stale-but-higher remote (`recentLocalDowngrade` vs `staleRemoteHigher`) — **PASS**.
- Legitimate promotion still works (recent remote promotion overrides stale local) — **PASS**.
- Legacy fallback (neither side has `levelSetAt`) falls back to higher-wins — **PASS**.

## DATA-QA-006 regression

`tests/testSuite.ts` §56 addendum, four scenarios:
- Layer 1 alone (merge-internal `normalizedStreak`) prevents resurrection from a raw, un-rolled-over stale local side — **PASS**.
- Both layers together (production's actual sequence) — **PASS**.
- Same-day reopen is a no-op (not treated as a gap) — **PASS**.
- Both sides equally stale, including the fetched remote document itself being stale — **PASS**, tightened to an exact `=== 1` assertion (not merely bounded) per the code-reviewer's independent verification that this specific case is what layer 1 uniquely closes.

## VERIFY-QA-003 protection: STRONG

Independently confirmed by both the code-reviewer and test-reviewer: the merge test's fixture now matches production's actual pre-merge state; DATA-QA-005/006 would both be caught if reintroduced (each reviewer manually traced a specific code reversion against the actual assertions and confirmed a resulting failure). One test-reviewer-flagged mislabeling (the two-device test's streak assertion) was corrected; the underlying coverage gap it could have implied does not exist (the real DATA-QA-006 scenarios are in dedicated, correctly-scoped tests).

## Sprint 1 regression protection

Re-run fresh as part of the full 422-assertion suite — all originally-Sprint-1 tests (two-device cold-start, named DATA-QA-002/RELEASE-QA-001 regression, `decideMergeAction` absent/failed/found, idempotency, A→B→A round trip, stale-cloud-snapshot, reset semantics structural checks, `favoriteWordIds` coverage) pass unchanged. Independently reconfirmed intact by the Sprint 2 code reviewer (no Sprint 1 invariant weakened).

## Core correctness (GLOBAL-QA-008)

`tests/testSuite.ts` §59: EXAM answer does not progress the daily practice quest (**PASS**); the identical answer in PRACTICE mode does progress it, confirming the branch is real (**PASS**); XP/rewarded-state/solved-state/`learningProgress` are provably identical between EXAM and PRACTICE for the same answer (**PASS**, 4 separate assertions — not merely "probably unaffected"); exam scoring thresholds independent of the fix (**PASS**).

## Reliability (GLOBAL-QA-020)

`tests/testSuite.ts` §59b: static source verification that `ErrorBoundary` tracks `restartKey`, applies it as a `key` on the recovered subtree, and increments it on every restart (**PASS**, 3 assertions). No React renderer available in this test environment (pre-existing, documented limitation) — this is E2 static evidence confirmed accurate by two independent reviewer passes, not E3/E4 on-device confirmation.

## Accessibility evidence

See `06_ACCESSIBILITY_EVIDENCE.md` for full detail. Executable: contrast calculation (`tests/testSuite.ts` §60, E3, genuinely computes the before/after WCAG ratio and would fail against the old color). Structural/manual: font-scale wrap behavior and touch-target `hitSlop` sizing — E2 code-level evidence, no on-device runtime confirmation performed this pass (honestly disclosed, consistent with the project's pre-existing accessibility-verification limitation).

## Localization evidence

`tests/testSuite.ts` §33 addendum: 7 new sampled-key existence assertions (E3); a corrected key-NAME parity check for both `game` and `profile` dictionaries (E3, strengthened this pass per test-reviewer finding); a distinct-translation check confirming the English Privacy Policy text is not the Turkish text reused verbatim (E3).

## Performance regression evidence

N/A — no performance-affecting change was made beyond the Phase A fixes' small, structurally-argued O(1) addition (see `07_PERFORMANCE_EVIDENCE.md`); no performance regression tests were needed or added.

## Environment limitations

Firestore emulator: NOT VERIFIED LOCALLY (JDK gap, pre-existing, unchanged). No React renderer: pre-existing, unchanged, documented in `VERIFICATION-ASSURANCE-001-BASELINE`. Neither was worked around or silently reported as PASS.
