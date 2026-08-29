# SPRINT-002 — Implementation Summary

## Working tree identity

Current HEAD / origin/main: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (unchanged baseline SHA — Sprint 1 and Sprint 2 both remain uncommitted on top of it, per every sprint's own "DO NOT COMMIT" instruction).

## Master findings handled

See `01_MASTER_SCOPE_MAP.md` for the complete table. Summary: 3 mandatory Phase A carry-over findings (DATA-QA-005, DATA-QA-006, VERIFY-QA-003) + 6 Master Sprint 2 Global findings (GLOBAL-QA-008, 012 [partial], 015, 020, 025, 026) implemented and closed. 12 Master Sprint 2 items explicitly deferred with documented justification (`01_MASTER_SCOPE_MAP.md`, `10_RESIDUAL_RISK.md`).

## Files changed this sprint

New: none (Phase A's new files — `src/domain/sync/progressMerge.ts`, `remoteSync.ts`, `clockAnomaly.ts` — were created in Sprint 1; Sprint 2 only modified the first of these).

Modified (Sprint 2's own edits, on top of the pre-existing Sprint 1 diff):
- `src/types/user.ts` — added `levelSetAt?: number`
- `src/domain/sync/progressMerge.ts` — `MOST_RECENTLY_SET_LEVEL` strategy + `pickLevelByRecency`; `normalizedStreak` for day-aware streak merging
- `src/domain/gamification/dailyRollover.ts` — new `rolloverToToday()` shared helper
- `src/app/AppBootstrap.tsx` — calls `rolloverToToday()` before merging
- `src/state/useUserProgress.ts` — `setLevel()` stamps `levelSetAt`; `init()`/`refresh()`/`reloadLocalOnly()` refactored to use `rolloverToToday()`
- `src/domain/practice/answer.ts` — `applyPracticeAnswer` skips `updateDailyQuests` for `sessionMode === "EXAM"`
- `src/features/practice/components/WordPrompt.tsx` — font-scale fix (`numberOfLines={2}`, `adjustsFontSizeToFit` removed), hint-chip `hitSlop`
- `src/screens/PracticeScreen.tsx` — "remind later" button `hitSlop`
- `src/theme/colors.ts` — `muted` token darkened for WCAG AA
- `src/i18n/profile.ts` — 12 new Privacy Policy / reset-dialog translation keys (EN + TR)
- `src/features/profile/components/DataManagementCard.tsx` — Privacy Policy modal wired through the locale system
- `src/components/ErrorBoundary.tsx` — `restartKey`-based forced remount; `getDerivedStateFromError` corrected to `Partial<State>` (reviewer fix)
- `tests/testSuite.ts` — Phase A regression tests, exam/practice test, ErrorBoundary static check, contrast test, localization dictionary tests, plus 2 reviewer-requested test corrections (key-name dictionary parity, accurate streak-test labeling)

Untouched by Sprint 2 (already correct from Sprint 1, not re-touched): `firestore.rules`, `src/services/firestore.ts`, `src/services/storage.ts`, `src/services/auth.ts`, `src/features/profile/components/AccountManagementCard.tsx`, `tests/firestoreRules.test.ts`, `src/domain/sync/remoteSync.ts`, `src/domain/sync/clockAnomaly.ts`.

## Core Correctness changes

`applyPracticeAnswer` now genuinely distinguishes PRACTICE from EXAM sessions: quest progression is skipped for EXAM answers; XP, rewarded/solved-state, and `learningProgress` mastery tracking are explicitly identical for both (a correctly-answered word is genuinely learned regardless of session type — no XP duplication or loss).

## Reliability changes

`ErrorBoundary`'s "Restart" action now forces an actual unmount/remount of the crashed subtree via a `restartKey`-keyed `React.Fragment`, instead of only clearing local state and re-rendering the same (possibly still-corrupted) tree.

## Accessibility changes

Core practice-prompt text now wraps instead of shrinking to fit the system font-scale setting; two touch targets (hint chip, remind-later button) gained `hitSlop` to reach platform guidance without visual change; the `muted` text color token was darkened to meet WCAG AA 4.5:1 contrast (from 4.10:1).

## Localization changes

The in-app Privacy Policy modal's ~9 hardcoded Turkish text blocks (plus the reset-dialog title) now route through the app's i18n system with real, distinct English translations, using a same-literal-fallback pattern that preserves current behavior if any key were ever missing.

## Performance changes

None. All four Performance Global findings were deliberately deferred this sprint (see `07_PERFORMANCE_EVIDENCE.md`, `10_RESIDUAL_RISK.md`). No performance regression was introduced by the Phase A carry-over fixes' small added computation (two calls to a pure, O(1) function per sign-in, not per answer).

## Maintainability changes

`rolloverToToday()`'s extraction removed a third near-duplicate copy of the streak-rollover pattern (previously independently inlined in `useUserProgress.ts`'s `init()`, `refresh()`, and Sprint 1's `reloadLocalOnly()`), consolidating it into one shared, tested function — a proportionate side effect of the DATA-QA-006 fix, not a separate cleanup initiative. No other Maintainability Global findings (auth boundary, dead code, `as any` cast) were touched this sprint (deferred, see `10_RESIDUAL_RISK.md`).

## Consumer changes

None (CD-005/CD-006 deferred — cosmetic, low-value per Master's own characterization).

## Reviewer-triggered changes

`ErrorBoundary.tsx`'s `getDerivedStateFromError` corrected to `Partial<State>` (code-reviewer LOW finding); two `tests/testSuite.ts` assertions corrected for accuracy (locale-dictionary key-name parity instead of length-only; two-device streak test's label corrected to not imply DATA-QA-006 coverage it doesn't actually exercise) — both test-reviewer MEDIUM findings. All three independently reconfirmed RESOLVED via a narrow post-fix review pass (`08_REVIEW_RESULTS.md`).

## Data-safety interaction

Both Phase A fixes touch the exact code path Sprint 1 established (`mergeUserData`, `AppBootstrap`'s sign-in flow) — independently re-verified by the Sprint 2 code reviewer that no Sprint 1 invariant (multi-device merge, DATA-QA-001/002/RELEASE-QA-001 regression protection, reset semantics, account deletion lifecycle) was weakened. The two-layer DATA-QA-006 design was independently confirmed non-redundant (each layer closes a distinct gap the other doesn't).

## Verification changes

VERIFY-QA-003 closed: the merge test matrix's fixture now matches production's actual pre-merge state (no longer artificially pre-rolling-over local data before calling `mergeUserData`, since `mergeUserData` now self-normalizes); new regression scenarios directly reproduce DATA-QA-005/006, all calling real production functions.

## Backward compatibility

`levelSetAt` is a new optional field — absent on existing persisted data, merge falls back to the pre-existing higher-level heuristic in that case (no migration required, no existing data invalidated). No other data-shape change.

## Firestore Rules changes

**NONE this sprint.** (`firestore.rules` was last modified by Sprint 1; Sprint 2 made no further edits to it.)

## User-facing changes

**YES**, minimal: practice-prompt text may wrap to a second line at large font scales (previously shrank); two touch targets have a larger invisible tap area; muted/secondary text is slightly darker; the in-app Privacy Policy modal renders in the user's selected language (previously always Turkish regardless of locale); an app crash's "Restart" button now genuinely restarts instead of silently doing nothing different.

## Known residual risks

See `10_RESIDUAL_RISK.md` for the complete list.

## Explicitly deferred Sprint 3 items

Sprint 3's own scope (public Privacy Policy hosting, EAS signing, Play Console, repository controls) — untouched, as required. Additionally deferred from Sprint 2's own original scope: see `01_MASTER_SCOPE_MAP.md`'s deferred table and `10_RESIDUAL_RISK.md`.
