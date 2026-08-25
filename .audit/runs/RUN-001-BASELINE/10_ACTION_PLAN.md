# 10 — Action Plan

Run: RUN-001-BASELINE · Lane assignment follows `12_ACTION_PROTOCOL.md` (STABILIZATION before QUALITY before RELEASE).

## STABILIZATION lane (P0/P1 — should fix before/soon after release)

### ACT-CORE-001
- Status: PROPOSED · Priority: P1 · Source finding IDs: CORE-001 · Effort: XS
- Goal: Stop the daily streak from resetting on a backward/non-`+1`-day clock reading.
- Scope: `src/domain/gamification/streak.ts` (`updateDailyStreak`) only.
- Out of scope: the broader server-date-anomaly telemetry (already handled separately, `18-srs-flow-hardening.md` §5) — this action is purely the streak-math fix, not a duplicate of that telemetry work.
- Likely files/components: `src/domain/gamification/streak.ts`, `tests/testSuite.ts`.
- Implementation guidance: add an explicit `diffDays <= 0` branch returning `{ newStreak: Math.max(1, currentStreak), todayFormatted, isNewDay: false }` before the final catch-all reset branch.
- Acceptance criteria: see `CORE-001` finding.
- Verification: new test in `tests/testSuite.ts`; `npm test` green; `npx tsc --noEmit` clean.
- Regression risks: must not affect the existing `diffDays === 1` (streak+1) or `diffDays > 1` (reset to 1) branches — both already covered by existing tests, re-run to confirm no change.
- Dependencies: none.
- Expected quality impact: closes CORE-001; raises Core product correctness domain score.

### ACT-DATA-001
- Status: PROPOSED · Priority: P1 · Source finding IDs: DATA-001 · Effort: M
- Goal: Eliminate the cold-start race between `AppBootstrap`'s auth-merge and `useUserProgress.init()`.
- Scope: `src/app/AppBootstrap.tsx`, `src/state/useUserProgress.ts` (`init`).
- Out of scope: the Firestore merge algorithm itself (`mergeAndSyncUserData`) — that logic is not in question, only the sequencing of who writes local storage first.
- Likely files/components: `src/app/AppBootstrap.tsx:26-40`, `src/state/useUserProgress.ts:47-81`.
- Implementation guidance: introduce a shared signal (e.g., a ref or a state flag exposed from `useUserProgress`) that `init()` checks before performing its own unconditional `saveUserData`; skip or defer `init()`'s local-only save when a sign-in-driven merge is in flight. Alternatively, restructure so only one of the two effects owns the cold-start-for-signed-in-user path.
- Acceptance criteria: see `DATA-001` finding.
- Verification: manual two-device test (progress made on device B, opened on device A, confirmed present and not reverted); if the fix is expressed as a testable pure function, add a targeted test for both write orderings.
- Regression risks: guest-mode (no signed-in user) cold start must be unaffected — verify `init()`'s normal local-only path still runs correctly when `auth.currentUser` is null.
- Dependencies: none.
- Expected quality impact: closes DATA-001; raises Data integrity & persistence domain score, the highest-weight domain in this rubric.

## QUALITY lane (P2/P3 — schedule soon)

### ACT-CORE-002
- Status: PROPOSED · Priority: P2 · Source finding IDs: CORE-002 · Effort: S
- Goal: Add direct test coverage for `computeXpReward`/`computeDifficulty`.
- Scope: `src/content/questions/difficulty.ts`, `tests/testSuite.ts`.
- Verification: `npm test` green with new assertions.

### ACT-DATA-002
- Status: PROPOSED · Priority: P2 · Source finding IDs: DATA-002 · Effort: S
- Goal: Surface a user-visible signal when `saveUserData` fails repeatedly.
- Scope: `src/services/storage.ts`; minimal UI hook to display a warning (exact UI is a product call, not prescribed here).
- Out of scope: automatic retry-with-backoff infrastructure — a single retry plus a visible warning is sufficient to close this finding; do not over-build.
- Verification: manual test with the storage write path mocked to fail.

### ACT-REL-001
- Status: PROPOSED · Priority: P2 · Source finding IDs: REL-001 · Effort: XS
- Goal: Wrap `refresh()`'s final Firestore sync call in the same try/catch pattern used elsewhere in the file.
- Scope: `src/state/useUserProgress.ts:113-138` only.
- Verification: manual test with Firestore calls mocked to reject; `refresh()` resolves rather than rejects.

### ACT-ARCH-003
- Status: PROPOSED · Priority: P2 · Source finding IDs: ARCH-003 · Effort: M
- Goal: Split `AuthScreen.tsx` and `AccountManagementCard.tsx` into single-responsibility sub-components.
- Scope: the two named files only; no behavior change.
- Out of scope: any visual redesign — this is a pure extraction refactor.
- Verification: `npx tsc --noEmit` clean; manual pass through all four auth flows + account management actions confirming unchanged behavior.

### ACT-CORE-003
- Status: PROPOSED · Priority: P3 · Source finding IDs: CORE-003 · Effort: S
- Goal: Add direct tests for `archiveDailyQuests` and `bringForward`.
- Scope: `tests/testSuite.ts` only (no source changes required).
- Verification: `npm test` green with new assertions.

### ACT-ARCH-001
- Status: PROPOSED · Priority: P3 · Source finding IDs: ARCH-001 · Effort: XS
- Goal: Delete the one confirmed dead duplicate file.
- Scope: `src/i18n/formatters.ts` — deletion only. **Correction (2026-08-25): `src/services/spacedRepetition.ts` is a live re-export shim used by `tests/testSuite.ts` — it must NOT be deleted; the original scope naming it was based on an incomplete search (see `09_FINDINGS.md` → ARCH-001 correction note).**
- Verification: `npx tsc --noEmit` and `npm test` remain clean after deletion.

### ACT-ACC-001
- Status: PROPOSED · Priority: P3 · Source finding IDs: ACC-001 · Effort: M
- Goal: Execute the five already-scoped accessibility DoD items from `docs/roadmap/09-accessibility.md`.
- Scope: manual verification work (TalkBack pass, dynamic-type test, Accessibility Scanner run, `reduceMotion` coverage audit); code fixes only as issues are found during verification.
- Verification: per that document's own Definition of Done.

## RELEASE lane (relevant given the declared public-store release target)

### ACT-DEPLOY-001
- Status: PROPOSED · Priority: P3 · Source finding IDs: DEPLOY-001 · Effort: S
- Goal: Add a CI job that runs the Maestro smoke test and/or performs an Android release-build compile check.
- Scope: `.github/workflows/ci.yml` (new job, can run on a slower/optional trigger to avoid blocking every PR if emulator cost is a concern).
- Verification: intentionally break the smoke-test-relevant UI or a Gradle config value on a throwaway branch; confirm the new CI job fails.

### ACT-ARCH-002
- Status: PROPOSED · Priority: P4 · Source finding IDs: ARCH-002 · Effort: XS
- Goal: Redirect the two identified layering-inversion imports to their direct domain-layer source.
- Verification: `npx tsc --noEmit` clean; no behavior change.

### ACT-ARCH-004
- Status: PROPOSED · Priority: P4 · Source finding IDs: ARCH-004 · Effort: XS
- Goal: Remove the unused `getDailyTaskCollection` helper and the corresponding `dailyTasks` Firestore rule, or wire up real usage if cloud-synced daily quests are actually intended.
- Verification: `npx tsc --noEmit` clean; `firestore.rules` tests still pass.

### ACT-SEC-002
- Status: PROPOSED · Priority: P4 · Source finding IDs: SEC-002 · Effort: XS
- Goal: Replace real Firebase identifiers in `.env.example` with clearly-fake placeholders.
- Verification: visual check; app still runs after a developer copies the file and fills in real values.

### ACT-DEP-001
- Status: PROPOSED · Priority: P4 · Source finding IDs: DEP-001 · Effort: XS
- Goal: Run `npm audit`, triage any findings.
- Verification: audit executed; HIGH/CRITICAL findings (if any) get a documented accept/fix decision.

## Prioritization note
`ACT-CORE-001` and `ACT-DATA-001` are ranked first because they are the only two findings that directly threaten the product's core promise (accurate streak, no silent progress loss) with a realistic, non-contrived trigger condition — both also score XS-M effort, giving them the highest priority-per-cost ratio in this plan. `ACT-ARCH-003` (the two large screens) is ranked QUALITY rather than STABILIZATION deliberately: it is a real maintainability cost but has caused no observed defect, per Constitution C6/C7 — complexity/size alone is not scored as urgent without demonstrated impact.
