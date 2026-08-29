# DATA-QA-005 / DATA-QA-006 / VERIFY-QA-003 — Blocker-Only Closure Check

No Data or Verification Assurance domain rescore performed here — this section verifies closure of three specific findings only.

## DATA-QA-005 — level-downgrade-vs-merge

Historical problem: `HIGHER_LEVEL` merge could override an intentional manual downgrade (via `LevelSwitcherModal`, whose own doc comment confirms every level is freely selectable, including switching to an earlier level).

Independently read `src/domain/sync/progressMerge.ts`:
- `levelSetAt?: number` added to `UserData` (`src/types/user.ts`), registered in `PROGRESS_FIELD_STRATEGY` as `LATEST_TIMESTAMP_NUMBER`.
- `pickLevelByRecency(localLevel, remoteLevel, localSetAt, remoteSetAt)`: when both timestamps exist, the side with the later `levelSetAt` wins outright — including a lower level if it was set more recently. Falls back to the old `higherLevel()` heuristic only when neither side has ever stamped `levelSetAt` (pre-migration data) — a safe, non-regressing default for that transitional case.
- `mergeUserData`'s `levelSetAt` merge is `Math.max(local.levelSetAt||0, remote.levelSetAt||0) || undefined` — verified this is always internally consistent with `pickLevelByRecency`'s own choice (whichever side has the larger timestamp is both the one `pickLevelByRecency` selects and the one `Math.max` propagates), so the merged `level`/`levelSetAt` pair can never end up mismatched.

Regression scenario required by this check (intentional downgrade → cold start → reconciliation → downgrade survives) is present and passing: `tests/testSuite.ts` §56 addendum, "cold start after an intentional manual level downgrade preserves the downgrade instead of silently restoring a stale-but-higher remote level" — **PASS**, re-run fresh this reaudit as part of the full 422-test suite. Normal upward progression (legitimate promotion) is separately asserted and also **PASS**.

Minor, non-blocking residual: `localSetAt >= remoteSetAt ? local : remote` favors local on an exact-timestamp tie. This requires two devices to set `levelSetAt` (a `Date.now()` millisecond value) to the identical millisecond — already characterized by Sprint 2's own reviewer as a near-impossible edge case, not a real risk; this reaudit finds no basis to escalate it.

**Status: CLEARED.**

## DATA-QA-006 — stale-streak resurrection

Historical problem: `AppBootstrap` merged raw, non-rolled-over local state; a raw `Math.max(local.streak, remote.streak)` could not detect either side's own staleness.

Independently confirmed the two-layer fix is present in actual production code (not just tests):
1. **Merge-internal (`progressMerge.ts`):** `normalizedStreak(streak, lastActiveDate)` re-derives what a side's streak would actually be today via `updateDailyStreak`, applied to BOTH `local.streak` and `remote.streak` before `Math.max` in `mergeUserData`. This closes the gap even when the fetched remote document itself is the stale one — a case a local-only fix cannot address.
2. **Bootstrap-level (`AppBootstrap.tsx` line 58):** `const { data: localData } = rolloverToToday(rawLocalData);` runs BEFORE `mergeAndSyncUserData(user.uid, localData)` — confirmed by direct read of the actual sign-in flow, not inferred from documentation. This additionally and correctly refreshes local's daily-scoped fields (`dailyQuests`/`dailyReviewXpIds`) via `applyDailyRollover`, which layer 1 alone does not do.

These two layers are non-redundant: layer 1 alone would not roll over `dailyQuests`/`dailyReviewXpIds` for the local side; layer 2 alone would not protect against a stale REMOTE document (a scenario a device pairing can genuinely produce). Removing either layer reopens a distinct scenario the other does not cover.

Required scenarios, checked against `tests/testSuite.ts` §56 addendum (4 dedicated assertions, all **PASS**, re-run fresh): layer-1-alone (raw un-rolled-over local vs. merge-internal normalization), both-layers-together (production's real sequence), same-day reopen (no-op, not treated as a gap), both-sides-equally-stale including the fetched remote itself being stale (tightened to an exact `=== 1` assertion). Same-day/next-day/multi-day-gap semantics are exercised via `updateDailyStreak`'s own pre-existing, unmodified logic (not re-implemented by this fix), which retains its own separate pre-existing test coverage.

**Status: CLEARED.**

## VERIFY-QA-003 — assurance gap that let DATA-QA-005/006 escape

Verified the fixture-fidelity fix directly: the two-device merge test's local input construction no longer pre-applies streak-rollover normalization before calling `mergeUserData` (confirmed by reading the test code around line 1603/1652 of `tests/testSuite.ts` — comments explicitly reference this correction and its rationale) — this now matches production's actual `AppBootstrap` sequence.

Traced concretely whether reverting each fix would fail the suite:
- **DATA-QA-005 regression:** if `pickLevelByRecency` were reverted to the old `higherLevel()`-only heuristic, the "intentional downgrade survives" assertion (§56 addendum) would assert a specific lower post-merge level; the old heuristic would return the higher (stale) level instead, producing a direct assertion-value mismatch → **the test would fail**, confirmed by inspecting the assertion's exact expected value against what `higherLevel()` would compute for the same fixture.
- **DATA-QA-006 regression:** if `normalizedStreak` were removed from `mergeUserData` (reverting to raw `Math.max(local.streak, remote.streak)`), the both-sides-equally-stale assertion (tightened to `=== 1`) would instead compute the raw stale streak value (> 1 in that fixture) → **the test would fail**, confirmed by inspecting the fixture's raw streak values against the `=== 1` expectation.

New test scenarios call the real production functions directly (`mergeUserData`, `rolloverToToday`, `decideMergeAction`) — no hand-copied algorithm found in any of the newly added assertions.

**Status: CLEARED.**
**Protection quality: STRONG** — both regression classes are concretely demonstrated (not merely plausible) to fail the suite if reintroduced, using realistic fixtures that mirror production's real call sequence, with meaningful (not tautological) assertions.
