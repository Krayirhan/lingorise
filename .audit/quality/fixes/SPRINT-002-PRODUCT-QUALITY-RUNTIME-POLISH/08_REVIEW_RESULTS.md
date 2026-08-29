# SPRINT-002 — Review Results

Both reviewers were given only the findings/criteria/diff/tests (no disclosed expected verdict). Neither concern was hidden or minimized below.

## Independent Code Reviewer

**Original verdict: ADJUST**

**Concerns raised, in full:**

1. **(Meta/process, not a code defect)** The reviewer noted that the actual `git diff` includes Sprint 1's own changes (e.g. `firestore.rules`'s `isValidUserDoc`, `auth.ts`'s `PartialAccountDeletionError`, `firestore.ts`'s `RemoteStateUnknownError`) alongside Sprint 2's, and that this could not be distinguished from `git log` alone since neither sprint has been committed. It recommended committing Sprint 1 separately before layering Sprint 2 on top.
   **Disposition:** Acknowledged, not actioned. Every sprint prompt in this effort — Sprint 1 and Sprint 2 both — explicitly forbids committing ("Commit: DO NOT COMMIT" / "Do NOT commit. Do NOT push."), so the reviewer's suggested remediation is not available within this workflow's own constraints. This is a structural property of running multiple uncommitted sprints in sequence on the same working tree, not a defect introduced by Sprint 2's implementation. Each sprint's own `FINAL_RESULT.md`/`04_IMPLEMENTATION_SUMMARY.md` documents exactly what that sprint changed, providing the traceability the reviewer was asking for, independent of git history. No code or test change resulted from this item — it is recorded here transparently rather than silently dropped.
2. **(LOW)** `ErrorBoundary.tsx`'s `getDerivedStateFromError` unnecessarily reset `restartKey: 0` on every new error — confusing relative to the counter's actual owner (`handleRestart`), though not functionally broken (the crashed screen never renders the keyed Fragment, so the stray reset had no observable effect).
   **Disposition: FIXED.** Changed the method's return type to `Partial<State>` and removed `restartKey` from its return entirely — only `handleRestart` ever sets it now.
3. **(LOW)** `pickLevelByRecency`'s tie-break (`>=`) favors local on an exact `levelSetAt` timestamp collision — reviewer explicitly characterized this as a near-impossible edge case, not a real risk.
   **Disposition:** Not actioned — reviewer's own assessment was that this doesn't warrant a fix; recorded in `10_RESIDUAL_RISK.md` for completeness.
4. **(LOW, observed but explicitly out of Sprint 2 scope)** `DataManagementCard.tsx`'s `PRIVACY_POLICY_URL` points to a `claude.ai` artifact link — the reviewer flagged this should be reported to Master. This is RELEASE-QA-003's exact subject (public privacy policy hosting), already assigned to Sprint 3 in `MASTER-001-CONSOLIDATION`; not a new discovery, not touched by Sprint 2's localization fix (which only translated the in-app modal's TEXT content, not the linked URL).
   **Disposition:** No action needed — already correctly scoped to Sprint 3.

**Verification claims independently confirmed by this reviewer (AGREE-level, no dispute):** all 9 Sprint 2 items' core logic (DATA-QA-005 recency merge, DATA-QA-006 two-layer fix including its non-redundancy, VERIFY-QA-003 test realism, exam/practice quest-skip with no XP duplication, font-scale wrap, touch-target hitSlop, contrast token, localization fallback safety, ErrorBoundary remount mechanism), plus confirmation that all Sprint 1 invariants (multi-device merge, DATA-QA-002/RELEASE-QA-001 regression, `reloadLocalOnly` reset semantics, `rolloverToToday`'s telemetry-preserving extraction) remain intact.

**Files changed in response:** `src/components/ErrorBoundary.tsx`.

**Verification after fix:** `npm run typecheck` PASS; `npm test` PASS (422/422, unchanged count — a like-for-like type-signature correction, no new test needed).

**Final disposition: RESOLVED** (items 2 fixed; items 1, 3, 4 acknowledged/already-scoped with no code action required, per the reasoning above).

## Independent Test Reviewer

**Original verdict: ADJUST**

**Concerns raised, in full:**

1. **(MEDIUM)** The locale-dictionary "1:1 parity" assertions (for both `game` and `profile`) compared only `Object.keys(...).length`, not actual key names — a misspelled/missing key paired with an unrelated extra key would still pass, and `en.ts`'s `tr: tr as unknown as Copy` cast means the compiler does not independently guarantee key parity either.
   **Disposition: FIXED.** Both assertions now use a `sameKeySet()` helper comparing sorted, joined key-name strings.
2. **(MEDIUM)** The two-device merge test's streak assertion label ("streak protection [MONOTONIC_MAX]") implied DATA-QA-006 coverage, but the scenario only used a 1-day-old local device (a normal continuing streak, not a genuine multi-day stale gap) — so it doesn't actually exercise the resurrection-prevention fix, even though the label suggested it did. The reviewer noted this is a documentation/labeling issue, not a functional gap (the real DATA-QA-006 scenarios are correctly covered by dedicated tests elsewhere in the same file).
   **Disposition: FIXED.** Corrected the assertion label to "Merged streak reflects the higher of two normally-continuing cross-device streaks [MONOTONIC_MAX]" and added a code comment explicitly pointing to where DATA-QA-006 is actually tested.
3. **(LOW, informational — no action requested)** The DATA-QA-005 "legacy fallback" test only exercises the `higherLevel` fallback branch, not the recency logic itself — but the reviewer confirmed the recency logic IS independently and correctly covered by the separate downgrade/promotion scenarios, so this is a scope clarification, not a gap.
   **Disposition:** No action needed, per the reviewer's own conclusion.
4. **(LOW, informational)** One of the two DATA-QA-006 sub-tests ("layer 2," exercising both fix layers together) is redundant with the "layer 1 alone" and "both stale" tests — reverting the merge-internal fix alone wouldn't be caught ONLY by that specific sub-test, but WOULD be caught by the other two in the same block.
   **Disposition:** Not actioned — the reviewer explicitly confirmed this is not a coverage gap at the suite level (the same reversion is independently caught by sibling assertions in the same test block); recorded in `10_RESIDUAL_RISK.md` for completeness, not treated as an open item.
5. **(LOW, informational)** An unrelated, pre-existing test elsewhere in the same file (the DATA-QA-002 regression test) still uses a hardcoded literal date (`"2026-08-27"`) rather than a dynamically-computed one — inconsistent style with the newly-added dynamic-date tests, though the reviewer confirmed no assertion there currently depends on streak/date-gap behavior, so there is no practical breakage.
   **Disposition:** Not actioned this sprint (style-only, zero functional risk, confirmed by the reviewer) — noted in `10_RESIDUAL_RISK.md`.

**Verification claims independently confirmed (AGREE-level):** no hand-copied production algorithm anywhere; DATA-QA-005/006 regressions would genuinely be caught if reintroduced (reviewer manually traced specific reversions); Sprint 1's original regression tests (multi-device merge, failed-sync-then-restart, `decideMergeAction` absent/failed/found) remain present and unweakened; the exam/practice test's oracle is real (independent expected values, not implementation-echoing); the ErrorBoundary static check, contrast calculation, and localization distinct-translation check are all genuine, non-tautological, E3-executable evidence.

**Tests changed:** `tests/testSuite.ts` (2 assertions corrected — the dictionary-parity checks and the two-device streak label; no new test files).

**Verification after fix:** `npm run typecheck` PASS; `npm test` PASS (422/422 — same count, 1:1 corrections of existing assertions).

**Final disposition: RESOLVED** (items 1–2 fixed; items 3–5 explicitly require no action per the reviewer's own stated conclusions, and are tracked in `10_RESIDUAL_RISK.md` for transparency, not silently dropped).

## Narrow post-fix confirmation

A follow-up narrow confirmation pass (not a full re-review, since both original verdicts were ADJUST, not REJECT) was run against an independent `code-reviewer` agent, given only the three applied fixes (ErrorBoundary, dictionary-parity, streak-label) and asked to verify each is RESOLVED with no new P0/P1/P2 regression, without being told the expected answer.

**Result: all three RESOLVED, no new regression.**
1. `getDerivedStateFromError`'s `Partial<State>` return correctly leaves `restartKey` untouched via React's shallow-merge semantics; `restartKey` can never become `undefined` (initialized to `0`, only otherwise written by `handleRestart`).
2. `sameKeySet` genuinely compares sorted key names (not counts) and would catch a misspelled/missing key paired with an unrelated extra key — the original blind spot is closed.
3. The corrected assertion label accurately describes the 1-day-continuing-streak scenario and explicitly points to the correctly-scoped dedicated DATA-QA-006 block elsewhere in the file.

Both Sprint 2 reviewer passes and this narrow confirmation are now fully closed with no outstanding actionable items.
