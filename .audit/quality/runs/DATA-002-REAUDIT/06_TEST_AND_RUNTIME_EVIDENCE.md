# DATA-002-REAUDIT — Test and Runtime Evidence

Per instructions, test count increases are NOT treated as evidence of quality by themselves. Every claim below is backed by direct inspection of what the test actually asserts and calls, independently re-verified during this reaudit (not merely re-stated from Sprint 1's own report).

## Executable commands run during this reaudit

| Command | Purpose | Result | Notes |
|---|---|---|---|
| `npm run typecheck` | TypeScript strict-mode compile, including the `Record<keyof UserData, FieldStrategy>` exhaustiveness check | **PASS** (0 errors) | Re-run fresh during this reaudit, independent of Sprint 1's own report |
| `npm test` (`tests/testSuite.ts`) | Full suite including Sprint 1's merge/clock-anomaly/decision-logic tests | **PASS — 392 passed, 0 failed** | Re-run fresh during this reaudit |
| `npm run test:rules` (Firestore emulator) | Rules authorization + field-validation rules | **BLOCKED — NOT VERIFIED LOCALLY** | Re-confirmed fresh: `java -version` → OpenJDK 17.0.20.1; `firebase emulators:exec` fails with "firebase-tools no longer supports Java version before 21." Identical failure mode to Sprint 1's own report and to the original DATA-001-BASELINE audit — a pre-existing environment constraint, not something this sprint or reaudit can resolve without installing a JDK 21+ runtime, which was correctly not attempted (do not alter project/environment Java requirements merely to obtain a PASS). |

## Data-relevant test quality — independently assessed, not merely counted

**Does the merge test call real production logic?** Yes, directly verified by reading `tests/testSuite.ts`'s imports (`import { mergeUserData, PROGRESS_FIELD_STRATEGY } from "../src/domain/sync/progressMerge"`, `import { decideMergeAction, RemoteUserDataResult } from "../src/domain/sync/remoteSync"`) and confirming every assertion in §56 calls `mergeUserData(...)` or `decideMergeAction(...)` directly — no second, hand-written copy of either algorithm exists anywhere in the test file (grep-confirmed: `mergeUserData` and `decideMergeAction` each appear only as imports + call sites, never as a redefined local function).

**Does it cover meaningful negative paths?** Yes for the decision logic (`absent`/`failed`/`found` all exercised with distinct assertions). Partially for the underlying I/O: the actual `getDoc` failure path (a live network error) is not exercised, since doing so would require a live or mocked Firestore SDK — correctly disclosed as a gap, not silently omitted, in Sprint 1's `05_TEST_EVIDENCE.md`, and independently re-confirmed as still true.

**Could it actually fail if production breaks?** Spot-checked by reasoning about specific mutations:
- Deleting `passedLevelExams: "UNION_STRING_ARRAY"` from the registry → compile error (E — see `02_CURRENT_DATA_INVARIANTS.md`).
- Reverting `mergeUserData`'s `passedLevelExams` line to fall through to the `{...remote}` baseline (keeping the registry entry, but breaking the implementation) → the dedicated named regression test ("cold start after failed cloud sync preserves passed level exam progress") would fail, since it explicitly asserts `.passedLevelExams.includes("A1")` against a scenario where only local has it.
- Reverting the day-boundary fix (removing `mergeDailyScopedValue` and returning to plain per-id merge) → the specifically-named cross-day regression test would fail (independently confirmed by reading its assertion: `merged.dailyQuests.every((q) => q.completed === false)` against a scenario engineered to catch exactly this).
- This reasoning was independently performed during this reaudit, not copied from Sprint 1's own claims.

**Specifically protects DATA-QA-001/002?** Yes — see the two points above plus the three `decideMergeAction` assertions.

## Confidence impact (this section informs CONFIDENCE, does not itself add/remove Data score points)

The pure decision/merge logic (`mergeUserData`, `decideMergeAction`) has strong E3 executable evidence, independently re-verified this reaudit. The underlying Firestore I/O (`fetchUserDataResult`'s actual network call, `syncUserData`/`syncUserProgress`'s actual writes, `deleteUserData`'s actual batched deletes, `firestore.rules`'s actual enforcement) remains E2 (direct code read) only, for the stated, unavoidable local-environment reason. This reaudit does NOT treat NOT VERIFIED as FAIL for any of these, and does NOT inflate confidence to HIGH-with-no-caveats for the I/O layer specifically — overall Data confidence is set at HIGH given the depth and directness of the E2 trace (short, unambiguous code paths) combined with strong E3 coverage of the actual defect-prone logic, with the I/O-layer gap explicitly noted rather than hidden.
