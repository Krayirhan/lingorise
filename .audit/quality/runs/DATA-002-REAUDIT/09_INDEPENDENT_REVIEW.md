# DATA-002-REAUDIT — Independent Review

An independent `code-reviewer` was run against this reaudit's own draft conclusions (DATA-QA-001/002/003/004 closure claims, the proposed DATA-QA-005 finding, and a proposed dimension scorecard totaling 92/100). It was given the historical canonical Data result, the current working-tree diff, Sprint 1's relevant implementation, the draft finding statuses, and the draft score ledger — but was NOT told any expected score, closure count, improvement direction, or desired release-blocker verdict, per instructions.

## Verdict: ADJUST

## What the reviewer confirmed as accurate

- DATA-QA-001, DATA-QA-002, DATA-QA-003, DATA-QA-004 closures — all independently re-verified against the actual current source and confirmed correct, with specific line-level citations for each.
- The day-boundary fix (`mergeDailyScopedValue`) — confirmed logically correct and non-redundant.
- No atomicity overclaim anywhere in the account-deletion code or comments.
- Idempotency and A→B→A round-trip test coverage — confirmed meaningful.
- No backward-compatibility regression.
- "NOT VERIFIED" (Firestore emulator) correctly kept distinct from PASS.
- The `normalizeUserData`/`fillDefaults` characterization as spread-based-and-mostly-safe — confirmed accurate, with one refinement (see below).

## What the reviewer found and this reaudit's response

**1. A new, more consequential defect than this reaudit's own draft had found: streak resurrection (DATA-QA-006).** The reviewer traced that `AppBootstrap.tsx` merges the RAW output of `loadUserData()` (no streak-rollover applied) rather than a rolled-over value, and that `mergeUserData`'s `Math.max` for `streak` combined with `LATER_DATE_STRING` for `lastActiveDate` can independently combine a stale device's frozen-high streak with a fresh device's current date, producing a resurrected streak that `updateDailyStreak()` then cannot detect as anomalous (since its gap-detection logic trusts `lastActiveDate`, which the merge already "fixed" to look current). The reviewer additionally identified that this exact scenario would NOT be caught by the existing test suite, because `tests/testSuite.ts`'s two-device test pre-applies rollover to the local side before calling `mergeUserData` — a step production's actual `AppBootstrap` flow does not perform before merging.

**This reaudit independently re-verified this claim before accepting it** (see `07_FINDING_RECONCILIATION.md`'s DATA-QA-006 entry): confirmed `loadUserData()` contains no streak/rollover logic (direct read of `src/services/storage.ts`), confirmed `updateDailyStreak()`'s gap-detection is date-driven and does not validate the streak number against the actual gap (direct read of `src/domain/gamification/streak.ts`), and confirmed the test's pre-rollover step by direct reading of `tests/testSuite.ts` lines ~1599-1607 against `AppBootstrap.tsx`'s actual sequence. All three claims independently confirmed accurate. **Accepted as a new finding, DATA-QA-006, P2.**

**2. DATA-QA-005's severity was too low.** The reviewer's reachability correction — that Firebase's persisted-auth `onAuthStateChanged` fires on every cold start for a previously-signed-in user, not only literal first sign-in, making a single-device "downgrade level, restart before sync completes" sequence sufficient to trigger the defect — was independently verified against `src/services/firebase.ts`'s `initializeAuth(app, {persistence: getReactNativePersistence(AsyncStorage)})` configuration and accepted. **DATA-QA-005 upgraded from this reaudit's initial P3 assessment to P2.**

**3. A more concrete instance of the `normalizeUserData` residual.** The reviewer pointed to the specific two fields (`dailyQuests`, `learningProgress`) in `fillDefaults()` that use a truthy check rather than a real type/shape guard, unlike every other array-typed field in the same function. Independently confirmed by direct reading. **Incorporated as a refinement to the existing residual-risk note, contributing a small (−1) deduction to the Schema migration & normalization dimension** rather than elevated to its own Data finding (still assessed as maintainability-tier, no evidence of an actual malformed stored value in practice).

**4. Score was too generous.** The reviewer proposed ~86/100 against this reaudit's initial 92/100 draft, driven almost entirely by the Merge/conflict correctness dimension not having accounted for DATA-QA-005/006 at all. **Accepted** — the final scorecard in `08_SCORECARD.md` uses 86/100, with the ledger explicitly attributing the reduction to these two new findings plus the schema-migration refinement.

## What was NOT changed

- The reviewer did not dispute any of the four historical closures, the day-boundary fix's correctness, the reset/deletion lifecycle conclusions, or the overall CLOSED/CLOSED/CLOSED/CLOSED historical reconciliation — these stand as originally drafted.
- The reviewer did not find evidence of NOT VERIFIED being treated as PASS, duplicate deductions, or score inflation from test count — these draft conclusions stand unchanged.

## Final disposition

ADJUST fully applied. This reaudit's canonical score (`08_SCORECARD.md`, `FINAL_RESULT.md`) reflects 86/100, not the pre-review draft's 92/100, and records DATA-QA-005 as P2 (not the initially-drafted P3) and DATA-QA-006 as a new P2 finding this reaudit would not have surfaced without the independent challenge pass. This is recorded transparently, per instructions not to hide a reviewer-driven correction.
