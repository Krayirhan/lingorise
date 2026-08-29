# VERIFICATION-ASSURANCE-002-REAUDIT — Failure-Path Coverage

Each item independently checked by reading actual test files — not assumed present from any summary.

| Failure path | Current executable coverage | Evidence level |
|---|---|---|
| Remote read rejects (network/service error) | `decideMergeAction`'s `failed` branch — the DECISION consuming this outcome is tested (`tests/testSuite.ts` §56); the actual `getDoc` throwing is NOT exercised (would require a live/mocked Firestore SDK) | E3 for the decision, E2 for the trigger |
| Remote NOT_FOUND | `decideMergeAction`'s `absent` branch — tested directly | E3 |
| Remote write rejects (`syncUserData`/`syncUserProgress` throwing) | NOT COVERED — no test exercises a failing write; `updateAndPersist`'s `.catch()` handler (which now calls `noteCloudSyncOutcome(false)`) is unexercised by any test | NONE (E2 code-read only) |
| Failed sync → restart | COVERED — see `06_DATA_REGRESSION_PROTECTION.md`, rated STRONG for the decision/merge logic | E3 |
| Local persistence rejection (`AsyncStorage` throwing) | NOT COVERED for the merge/sync paths. `clearAllLocalData()`'s new `{success: false}` branch (triggered when `AsyncStorage.multiRemove` throws) has no test simulating that throw — confirmed by grep, no test imports or mocks `AsyncStorage` to force a rejection | NONE (E2 code-read only) |
| Auth unavailable / auth transition | NOT COVERED by an executable test — `auth.currentUser` truthiness gates are read directly in source, not exercised via a test double | NONE (E2 code-read only) |
| Reset while signed in | NOT COVERED by an executable test — `reloadLocalOnly()`'s never-touches-Firestore guarantee is a structural code-reading fact (no `auth`/Firestore import in its body), not something a test asserts by exercising the function | NONE (E2 structural code-read; strong but not E3) |
| Account-delete Firestore failure | NOT COVERED by an executable test | NONE (E2 code-read only) |
| Account-delete Auth failure (`PartialAccountDeletionError`) | NOT COVERED by an executable test — no test constructs a scenario where `deleteUserData` succeeds and `deleteUser` throws | NONE (E2 code-read only) |
| Partial account deletion (retry convergence) | NOT COVERED by an executable test — idempotency of `deleteUserData` on already-empty collections is argued from documented Firestore SDK semantics, not exercised | NONE (E2 reasoning only) |

## Assessment

This dimension improved specifically and only where Sprint 1's actual mandate targeted it (remote-fetch failure's decision logic — a real, meaningful addition). Every other historically-cited gap in this dimension (`AsyncStorage` failure, malformed data at the real load path, partial account-deletion failure) remains exactly as uncovered as at baseline — consistent with Sprint 1 not having introduced any test mocking/fake-seam infrastructure for Firebase/AsyncStorage (a proportionate choice per its own instructions, not an oversight), and consistent with these specific gaps belonging to fields (`storage.ts` failure paths, `auth.ts`/`firestore.ts` I/O failure paths) that were touched by Sprint 1's production code but not matched with new executable failure-path tests for the parts requiring real/mocked I/O.

**Failure-path coverage improved for:** the remote-fetch failure DECISION (not the I/O trigger itself).
**Failure-path coverage unchanged (still absent) for:** local storage failure, sync-write failure, auth-transition failure, account-deletion failure (both phases), reset failure at the storage layer (though the `{success}` return type itself is a code-quality improvement independent of test coverage).
