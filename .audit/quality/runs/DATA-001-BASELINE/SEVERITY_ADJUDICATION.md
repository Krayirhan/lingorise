# DATA-001-BASELINE — Severity Adjudication

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (unchanged)
Scope: DATA-QA-002 severity only. No new findings, no source/test changes.

## DATA-QA-002

**Exact affected state:**
- **Cannot be lost** (confirmed by independent re-read of `src/services/firestore.ts:199-233`): `xp` (MAX), `streak` (MAX), `solvedQuestionIds`/`rewardedQuestionIds`/`unlockedBadges` (UNION), `learningProgress` (per-word richest-record merge via `domain/learning/mastery.ts: mergeLearningProgress`/`pickRicherRecord`).
- **Can be silently reverted to a stale value** (same file, same lines — absent from the explicit re-merge list, taken wholesale from `...remote`): `passedLevelExams`, `dailyQuests`, `questHistory`, `celebratedLevels`, `practiceHistory`, `dailyReviewXpIds`, `level`, `lastActiveDate`.

**Prerequisites (all three required together):**
1. A signed-in user changes one of the affected fields locally (most consequentially, passes a level exam).
2. The immediately-following fire-and-forget cloud sync (`state/useUserProgress.ts: updateAndPersist`, `Promise.all([...]).catch(console.warn)`, no retry queue) fails for any transient reason.
3. The app restarts (re-triggering `onAuthStateChanged` → `mergeAndSyncUserData`, confirmed to run on every cold start for a signed-in user, not only first login — `app/AppBootstrap.tsx:45-58`) before any other mutation happens to re-sync full state first.

**Breadth:** Authenticated users only (guests never call `mergeAndSyncUserData`). Within that population, only the specific state-combination above — not "every authenticated user, always," and not triggered by ordinary successful-sync operation.

**Recoverability:** Bounded, not irreversible. A lost `passedLevelExams` entry is restored by retaking the exam (~15–20 minutes). A reverted `level` self-corrects on the next successful full sync as the user continues. `dailyQuests`/`questHistory`/`celebratedLevels`/`practiceHistory` are cosmetic/history fields, not destructive to the user's actual vocabulary knowledge.

**Evidence level:** E2 (static, direct source read), independently re-verified twice now (original code-reviewer pass in DATA-001-BASELINE, and this adjudication's separate code-reviewer pass) against the same file/line ranges with consistent findings both times.

**Severity: P1**

**Reason:** The defect is real, reachable, and affects a meaningful, named achievement field (`passedLevelExams`) plus several secondary fields — squarely a "reachable serious progress loss/corruption" per the P1 definition. It does **not** meet the P0 bar: core progress (XP, streak, per-word learning mastery, solved/rewarded questions, badges) is architecturally protected by the same function's own MAX/UNION/richest-record logic and cannot be lost through this path; the loss is confined to derived/secondary state, not the product's fundamental persisted state; it requires a specific three-part timing combination rather than manifesting under ordinary operation; and a reasonable recovery path exists for every affected field. "Data loss exists" is not, by itself, sufficient for P0 — the loss here is real but bounded, matching the audit's own instruction that "a serious, reachable but bounded sync/data-loss bug should remain P1."

## Merge/conflict deduction justified: 15/25

(Lost 10 of 25 — reverted from the prior reviewer's P0-driven −14 back to the original breadth-based −10.) This reflects the actual scope of broken merge semantics — eight fields incorrectly replaced instead of unioned/reconciled, in the rubric's largest single dimension — independent of the P0/P1 label itself. No new breadth evidence emerged from this adjudication to justify a deduction beyond what was originally assessed for this defect at P1.

## Recommended DATA-001 final score: 74/100

Recomputed with only the disputed dimension changed; all other dimensions held at their prior values (not part of this dispute):

| Dimension | Max | Score | Lost |
|---|---|---|---|
| Local persistence & recovery | 15 | 14 | 1 |
| Schema migration & normalization | 15 | 14 | 1 |
| Cloud synchronization | 20 | 12 | 8 |
| Merge/conflict correctness | 25 | **15** | **10** |
| Offline & partial-failure safety | 15 | 14 | 1 |
| Data lifecycle / deletion / reset | 10 | 5 | 5 |
| **TOTAL** | **100** | **74** | **26** |

Findings severity count after this adjudication: **P0: 0, P1: 2** (DATA-QA-001 and DATA-QA-002), P2: 1 (DATA-QA-003), P3: 1 (DATA-QA-004).

## Independent adjudicator: ADJUST

The adjudicator (`code-reviewer`, given only source access, the finding's factual claims, and the audit's own severity definitions — no prior verdict, no expected score, no human preference disclosed) independently re-verified every factual claim against `firestore.ts`, `AppBootstrap.tsx`, `useUserProgress.ts`, and `mastery.ts`, and concluded **P1**, not P0, for the same reasons stated above: core progress fields are protected, the affected fields are secondary/derived, the trigger requires a specific combination rather than ordinary operation, and recovery is possible. This reverses the prior DATA-001-BASELINE reviewer's P0 escalation. The adjudicator did not have access to that prior verdict or any expected outcome when reaching this conclusion.
