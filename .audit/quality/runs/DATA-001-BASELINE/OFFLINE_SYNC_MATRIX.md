# DATA-001-BASELINE — Offline / Sync Matrix

Revision: 16b9aab

| # | Scenario | Local data safe? | User can continue? | Cloud eventually consistent? | Data loss possible? | Status |
|---|---|---|---|---|---|---|
| 1 | Fresh guest + offline | YES | YES | N/A (no account) | NO | PASS (E2+E4) |
| 2 | Existing guest + offline | YES | YES | N/A | NO | PASS (E2+E4) |
| 3 | Existing authenticated session + offline | YES (local write unaffected) | YES | Deferred until reconnect | NO (single-mutation case; see #6/#9 for the merge-specific risk) | PASS (E2) |
| 4 | Practice completed offline | YES (AsyncStorage write has no network dependency) | YES | Cloud sync fires and fails silently; self-heals on next successful sync since writes are whole-object, not delta | NO for a single dropped write | PASS (E2) |
| 5 | App killed after local save, before cloud sync | YES (local already persisted) | YES on relaunch | Cloud catches up on next mutation *or* the next cold-start merge — but see #9, the merge itself can regress specific fields | Only for the DATA-QA-002 field set, on the *next* merge, not from the kill itself | PARTIAL (E2 — the kill is safe; the subsequent merge is the actual risk) |
| 6 | Cloud write fails after successful local mutation | YES (local unaffected) | YES | Eventually, via the next successful mutation's full-object write — **unless** a cold-start merge runs first and the failed field is one of DATA-QA-002's set, in which case the local-only progress can be overwritten by stale remote | YES, specifically for `passedLevelExams` and the other DATA-QA-002 fields | **FAIL** (DATA-QA-002, E2) |
| 7 | Network restored later | YES | YES | YES for MAX/UNION fields; NOT reliably for DATA-QA-002's field set | Same as #6 | PARTIAL |
| 8 | Login attempted offline | YES (guest/local state untouched) | YES (guest mode remains functional; login itself would fail/retry via Firebase Auth's own handling, not independently re-verified this pass) | N/A until reconnect | NO | NOT VERIFIED (login-while-offline UI behavior not directly re-traced this pass) |
| 9 | Remote fetch fails during login/cold-start merge | Local data itself is not corrupted, but... | YES | **NO — local (possibly weak/blank) data is pushed to remote as if the user were new, potentially overwriting genuinely stronger remote progress** | **YES — the headline risk of this audit** | **FAIL** (DATA-QA-001, E2) |
| 10 | Firestore partially unavailable (e.g. one collection reachable, another not) | YES (each sync call is independently try/caught) | YES | Partial — `syncUserData`/`syncUserProgress` are independent `setDoc` calls; one can succeed while the other fails with no cross-dependency, which is safe (no partial-document corruption since each targets a different document) | NO beyond the already-identified single-write-drop case (self-heals) | PASS (E2) |

## Multi-device conceptual matrix (static/executable evidence only — no fabricated device tests)

| Scenario | Evidence | Assessment |
|---|---|---|
| Device A newer progress, Device B stale, both add different learned words | E3 (existing DATA-001-area test in `testSuite.ts`, reimplements the merge formula inline) + E2 | PASS for `solvedQuestionIds`/`rewardedQuestionIds`/`learningProgress`/`xp`/`streak` (all correctly unioned/maxed) |
| Both devices answer the same word independently | E2 + E3 (`mergeLearningProgress`/`pickRicherRecord` test coverage: lines 934-987 in `testSuite.ts`) | PASS — richer record wins atomically |
| Device A earns XP then Device B syncs | E2 (MAX strategy) | PASS |
| Device A progresses streak then Device B opens stale state | E2 (MAX strategy for `streak`; `lastActiveDate` itself is REPLACEMENT — see Merge Matrix) | PARTIAL — streak value is safe, but the *date* driving the next rollover calculation is not explicitly reconciled |
| Different settings changed on two devices | E1/E2 (remote-wins by omission) | Acceptable — settings are reasonably last-write-wins |
| Interrupted synchronization | E2 (`withRetry`, 2-3 attempts with backoff) | PASS for transient blips; FAIL for the specific merge-timing scenarios above |
| Repeat alternating login/sync | E2 (each `mergeAndSyncUserData` run is independent and stateless) | PARTIAL — repeated runs do not self-correct the DATA-QA-002 field set; a lucky remote-ahead state can mask the bug, an unlucky one reproduces it every time |

**Historical real two-device evidence:** The project history records a real, project-owner-performed two-device signed-in sync test (referenced in `.audit/state/FINDING_REGISTRY.md`'s DATA-001 entry) confirming basic sync worked for the fields that test's scenario covered (xp/streak/solved/learningProgress/onboardingCompleted). That test's own scenario did not exercise `passedLevelExams` or the other DATA-QA-002 fields, so it does not constitute evidence against this audit's findings — it simply never tested the affected fields.

## Legend

PASS = invariant holds under this scenario. PARTIAL = holds for some fields/paths, not others. FAIL = a concrete, evidenced defect. NOT VERIFIED = genuinely not established either way this pass (not treated as FAIL).
