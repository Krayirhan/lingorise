# FIX-2026-08-25-03

MODE: FIX
APPROVED_ACTIONS: ACT-ARCH-001, ACT-CORE-003
Source run: RUN-001-BASELINE

## ACT-ARCH-001 — Delete the one confirmed dead duplicate file

Status: **VERIFIED**

### Change
Deleted `src/i18n/formatters.ts` (dead duplicate of `src/utils/formatters.ts`, zero importers anywhere in the repository — confirmed both before and after deletion). `src/services/spacedRepetition.ts` was left untouched, per the correction recorded in `RUN-001-BASELINE/09_FINDINGS.md` (it is a live re-export shim used by `tests/testSuite.ts`, not dead code).

### Verification
- `npx tsc --noEmit -p tsconfig.json` — 0 errors (no importer broke).
- `npm test` — 300/300 pass.
- Release build (`gradlew assembleRelease`) — BUILD SUCCESSFUL (Gradle correctly reported the packaging task as UP-TO-DATE, since the deleted file was never part of the JS bundle to begin with — consistent with it having been genuinely dead).
- On-device: installed on Pixel_9_Pro emulator, launched, no crash, no logcat error/exception/fatal.

## ACT-CORE-003 — Test archiveDailyQuests and bringForward

Status: **VERIFIED**

### Change
`tests/testSuite.ts` — new §55 "Daily Quest Archiving & Manual Reschedule" with 6 direct assertions:
- `archiveDailyQuests`: only completed quests are archived; the archived entry carries the correct quest id and closing date (not "today"); nothing is archived when no quest was completed.
- `bringForward`: a far-future review is pulled in to exactly `now + RELEARN_DELAY_MS`; an already-soon item is left untouched (the function never pushes a review *later*, only earlier or unchanged).

### Verification
- `npm test` — 300/300 pass (294 prior + 6 new).
- `npx tsc --noEmit` — 0 errors.
- Acceptance criteria from `CORE-003` (RUN-001-BASELINE/09_FINDINGS.md) met: both functions now have direct assertions.

## Scope discipline
No files other than the ones named above were touched. No rubric/scoring changes were made in this FIX pass (only REAUDIT may update authoritative scores).

## Files changed
- `src/i18n/formatters.ts` (deleted)
- `tests/testSuite.ts` (new imports + §55)
