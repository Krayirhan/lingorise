# FIX-2026-08-25-01

MODE: FIX
APPROVED_ACTIONS: ACT-CORE-001, ACT-DATA-001
Source run: RUN-001-BASELINE

## ACT-CORE-001 — Fix streak reset on backward/non-+1-day clock diff

Status: **VERIFIED**

### Change
`src/domain/gamification/streak.ts` — added an explicit `diffDays <= 0` branch that preserves the current streak (`isNewDay: false`) instead of falling through to the reset-to-1 branch that previously handled it together with genuine multi-day gaps.

### Verification
- New test added: `tests/testSuite.ts` §4 ("A device clock moving backward across a date boundary does not reset the streak" / "A backward clock reading is not treated as a new day").
- `npm test` — **285/285 pass** (283 baseline + 2 new), 0 failed.
- `npx tsc --noEmit -p tsconfig.json` — 0 errors.
- Acceptance criteria from `CORE-001` (RUN-001-BASELINE/09_FINDINGS.md) fully met: the new test exercises exactly the specified scenario (`lastActiveDate` one day ahead of computed "today").

## ACT-DATA-001 — Eliminate cold-start local-storage race

Status: **DONE, not fully VERIFIED** (see gap below)

### Change
`src/state/useUserProgress.ts` (`init()`) — the effect's local-only `saveUserData(updated)` write is now conditional on `!auth.currentUser`. When a user is already signed in at cold start, `init()` still hydrates in-memory state immediately (no UI delay) but skips persisting, leaving `AppBootstrap.tsx`'s `onAuthStateChanged` → `mergeAndSyncUserData` → `saveUserData(mergedData)` → `userProgress.refresh()` flow as the sole writer for that cold start. The guest path (`auth.currentUser` null) is unchanged — persists exactly as before.

### Why this closes the race
The only scenario that could still race is `init()` observing `auth.currentUser === null` (assumes guest, persists) followed immediately by `onAuthStateChanged` firing with a user. In that ordering, the merge is inherently triggered *after* `init()`'s guest-assumption save (since the auth event is what makes `currentUser` non-null in the first place), so the merge's write always lands last and wins — the race is converted into a deterministic ordering rather than papered over with a timing-sensitive flag/lock.

### Verification performed this pass
- `npx tsc --noEmit -p tsconfig.json` — 0 errors.
- `npm test` — 285/285 pass (no regression in existing merge/rollover-adjacent tests).
- Release build (`gradlew assembleRelease`) — BUILD SUCCESSFUL.
- On-device: installed on Pixel_9_Pro emulator, app launched, guest-mode active session (2/20, "happy") restored correctly with no data loss and no crash — confirms the guest path is unaffected by this change.

### Verification gap (disclosed, not hidden)
`DATA-001`'s original acceptance criteria (RUN-001-BASELINE/09_FINDINGS.md) calls for a real multi-device signed-in test (progress made on device B, opened on device A, confirmed present and not reverted). That test was **not** performed this pass — it requires two authenticated sessions, out of scope for this single-emulator verification pass. The fix is implemented and reasoned through explicitly above, and does not regress any existing test or the guest cold-start path, but should be marked `CLOSED` only after that multi-device scenario is actually exercised, per `13_FIX_PROTOCOL.md`'s "Completion status: DONE means implementation completed... only REAUDIT can update authoritative project scores" and "if implementation cannot [yet] satisfy full acceptance criteria... keep finding open" — hence `DATA-001` is marked `PARTIAL`, not `CLOSED`, in `FINDING_REGISTRY.md`.

## Scope discipline
No unrelated files were touched. No rubric/scoring changes were made in this FIX pass (only REAUDIT may update authoritative scores, per `13_FIX_PROTOCOL.md` and `01_OPERATION_MODES.md`).

## Files changed
- `src/domain/gamification/streak.ts`
- `tests/testSuite.ts`
- `src/state/useUserProgress.ts`
