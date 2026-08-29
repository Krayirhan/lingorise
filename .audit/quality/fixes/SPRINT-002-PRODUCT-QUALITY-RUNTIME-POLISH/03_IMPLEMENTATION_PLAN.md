# SPRINT-002 — Implementation Plan

Written before broad implementation; reflects the actual plan executed (Phase A detail is in `02_CARRYOVER_PLAN.md`).

## GLOBAL-QA-008 — Exam vs. practice reward/quest accounting

- **Current source behavior:** `applyPracticeAnswer` (`src/domain/practice/answer.ts`) accepts `_sessionMode` but never reads it; `updateDailyQuests` runs identically for PRACTICE and EXAM answers.
- **Root cause:** the parameter was threaded through the entire call chain (`AppNavigator` → `useUserProgress.recordAnswer` → `applyPracticeAnswer`) but never consulted at the one point that matters.
- **Minimal remediation:** rename `_sessionMode` → `sessionMode`; skip `updateDailyQuests` when `sessionMode === "EXAM"`. XP/rewarded/solved/`learningProgress` unchanged for both modes (a correctly-answered word is genuinely learned regardless of context).
- **Affected files:** `src/domain/practice/answer.ts`.
- **Regression risk:** LOW — the branch only removes a side effect for a previously-unused code path (session mode was never actually distinguished before).
- **Tests:** new §59, calling the real function with both modes and asserting quest progression differs while XP/rewarded/solved/learningProgress do not.
- **Non-goals:** no change to level-exam pass/fail scoring itself (`levelExam.ts`, untouched), no tagging of exam-sourced XP as visually distinct (not required by the finding).

## GLOBAL-QA-015 — Font-scale resistance

- **Current source behavior:** `WordPrompt.tsx`'s prompt `<Text>` uses `numberOfLines={1}` + `adjustsFontSizeToFit`.
- **Root cause:** shrink-to-fit actively resists the OS font-scale multiplier instead of respecting it.
- **Minimal remediation:** `numberOfLines={2}`, drop `adjustsFontSizeToFit` — text wraps instead of shrinking.
- **Affected files:** `src/features/practice/components/WordPrompt.tsx`.
- **Regression risk:** LOW-MEDIUM — a genuinely very long word could now wrap to 2 lines at large font scales instead of shrinking; judged acceptable (wrapping preserves legibility, shrinking defeats the accessibility setting entirely). No component-level rendering test is possible in this test architecture (no React renderer) — manual verification documented in `06_ACCESSIBILITY_EVIDENCE.md`.
- **Non-goals:** no practice-screen redesign; no dynamic word-length-aware sizing logic (out of proportion for this fix).

## GLOBAL-QA-025 — Touch targets

- **Current source behavior:** hint chip (~18dp) and "remind later" button (~36dp) both below platform touch-target guidance.
- **Minimal remediation:** `hitSlop` on both `Pressable`s, expanding the tappable area without enlarging the visual chip/button.
- **Affected files:** `src/features/practice/components/WordPrompt.tsx`, `src/screens/PracticeScreen.tsx`.
- **Regression risk:** LOW — `hitSlop` cannot overlap a sibling's own hit area unless the layout is extremely tight; visually spot-checked against each component's surrounding layout, no adjacent interactive elements close enough to conflict.

## GLOBAL-QA-026 — Contrast

- **Current source behavior:** `C.muted = "#7A7672"`, 4.10:1 against `C.canvas` — below WCAG AA 4.5:1.
- **Minimal remediation:** darken to `#6B6763` (~5.10:1 against canvas, ~5.61:1 against surface) — same hue family, one token change.
- **Affected files:** `src/theme/colors.ts`.
- **Regression risk:** LOW — a single shared token; verified computationally (new test) rather than by eye.

## GLOBAL-QA-012 (partial) — Localization: in-app Privacy Policy

- **Current source behavior:** `DataManagementCard.tsx`'s Privacy Policy modal has ~9 hardcoded Turkish text blocks (title, 4 section titles, 4 section bodies, web-link label/text) plus a hardcoded reset-dialog title.
- **Minimal remediation:** add real English translations to `src/i18n/profile.ts` (`profileEn`/`profileTr`), wire the JSX through `copy.profile?.xxx` with the original Turkish literal preserved as the fallback (zero behavior change if a key were ever missing).
- **Affected files:** `src/i18n/profile.ts`, `src/features/profile/components/DataManagementCard.tsx`.
- **Regression risk:** LOW — fallback pattern matches every other localized string in this codebase; Turkish rendering is unchanged (same literal text, now sourced from the dictionary).
- **Tests:** dictionary-completeness assertions (English key exists, is non-empty, is a real distinct translation) plus a profile-dictionary 1:1 key-count parity check.
- **Non-goals:** avatar picker, word-detail modal, and word-notebook hardcoded strings are explicitly NOT addressed this sprint (documented in `10_RESIDUAL_RISK.md`) — Master's own text specifically called the Privacy Policy content out as "most consequentially" hardcoded, so it was prioritized within the available budget.

## GLOBAL-QA-020 — ErrorBoundary restart

- **Current source behavior:** `handleRestart` only clears `hasError`/`error` state, re-rendering the same crashed subtree with whatever internal state it already had.
- **Root cause:** no mechanism forces an actual unmount/remount.
- **Minimal remediation:** a `restartKey` counter in state, incremented on restart, applied as the `key` of a `<React.Fragment>` wrapping `children` — the standard React idiom for forcing a subtree remount.
- **Affected files:** `src/components/ErrorBoundary.tsx`.
- **Regression risk:** LOW — `React.Fragment` with a `key` is transparent to layout/styling; no visual change.
- **Tests:** static source-verification (no React renderer available in this test environment) confirming the mechanism is wired correctly, not merely present as a string.
- **Manual verification:** documented as NOT PERFORMED this pass in `05_TEST_EVIDENCE.md` (would require triggering a real render-time exception on-device) — the code-level mechanism is standard and low-risk enough that this reaudit-recommended manual step is deferred, not silently skipped.
