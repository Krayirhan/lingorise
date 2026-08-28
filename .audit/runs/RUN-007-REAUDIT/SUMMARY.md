# RUN-007-REAUDIT (lean/scoped)

Revision: **working tree on top of `5e09358`** (main) — the CORE-004 fix is committed to
disk but **not yet committed to git** (`git status` shows 13 modified product/test files,
uncommitted, per user instruction not to stage/commit/push during the fix). This run
audits that working tree, not a git revision — the distinction is disclosed explicitly
per the framework's "never certify a different revision than evaluated" rule. Once
committed, a future run should record the resulting commit hash.

Rubric: v1.0 (locked, reused) · Prior run: RUN-006-REAUDIT (80.6/100)

**Scope note:** same lean approach as RUN-004/005/006 — only the domains touched by
the CORE-004 fix are re-scored; everything else carries forward unchanged.

## Change surface since RUN-006-REAUDIT

One targeted fix for CORE-004 (the P1 opened by RUN-006): 14 files, product code +
regression tests, no unrelated refactor. `.audit/state/*` was already modified in the
prior turn (RUN-006's own updates) and is not part of this change surface.

## Independent re-verification

Before scoring, the fix was re-read fresh against CORE-004's acceptance criteria rather
than trusting the FIX turn's own summary. This caught one real gap the FIX turn missed:

**Found and fixed during this audit:** `useHomeViewModel.ts`'s `greetingTitle`/
`greetingSubtitle` branch chain had its own separate `practiceState === "completed"`
case carrying the exact same false promise CORE-004 flagged ("Yarın yeni kelimelerle
öğrenmeye devam edeceksin" — come back tomorrow for new words), checked *before* the
newly-added `isLevelFullyLearned` branch. A learner who exhausts a level on the same
day their daily quest completes would have seen this false promise in the Home
screen's greeting text, directly above a `GardenHeroCard` correctly showing the
level-done state — a visible self-contradiction on one screen. Reordered so
`isLevelFullyLearned` is checked first (`useHomeViewModel.ts`), and added a regression
assertion (Birim 58) that checks the branch order in source, the same technique used
for the rest of this fix's UI-layer coverage. Re-ran both gates clean after this
correction; test count is 342 (not the 341 the FIX turn reported), reflecting this
one additional assertion plus the original 13.

No other gaps found. `PracticeHubScreen.tsx`'s hero-becomes-exam-CTA / disabled
informational-card logic, `GardenHeroCard.tsx`'s `showLevelDoneLayout` gating, and
`useAppSession.ts`'s `startPractice`/`startExam` boolean returns were all re-read and
are logically sound and consistent with the acceptance criteria CORE-004 specified.

## CORE-004 — status change: OPEN → CLOSED

Acceptance criteria (as written in RUN-006): *"a test drives `solvedInLevel ===
levelQuestions.length` terminal state and asserts the hub screen no longer offers a
practice CTA that produces an empty session, and that a distinct message/state is
shown... verified either by unit test around the view-model/session functions or a
Maestro flow."* The unit-test route was explicitly listed as sufficient — met:

- `buildDailySession` returns `[]` for a fully-learned level (E2_TEST, direct).
- `PracticeHubScreen`/`GardenHeroCard` no longer render the old always-armed CTA in
  that state (E3_STATIC source read + E2_TEST source-consistency assertions — this
  project's test harness has no component renderer, so structural source assertions
  are the established pattern here, same as ACC-001/Birim 44/57).
- In-progress-level and exam-availability behavior confirmed unchanged (regression
  check, E2_TEST).
- Defensive guard at the session-entry level (`startPracticeSafe`/`startExamSafe` in
  `AppNavigator.tsx`) added so a missed call site fails loud (toast) instead of silent.

**Not yet done:** an on-device/Maestro visual pass (text fit, actual tap behavior,
locale rendering) — CORE-004's acceptance criteria explicitly allowed closing on the
unit-test path alone, so this doesn't block closure, but it is carried forward as a
disclosed evidence gap, same treatment DATA-001 got before its device pass in
RUN-005.

## Gates re-confirmed this pass

- `npx tsc --noEmit`: 0 errors.
- `npm test`: **342/342 passing** (341 after the original FIX turn, +1 from the
  greeting-order regression test added during this audit's re-verification).
- GitHub Actions CI on `5e09358` (the last **pushed** commit — does not include the
  uncommitted CORE-004 fix): all 3 jobs (`verify`, `android-build`, `e2e-smoke`) now
  fully green — this was still in progress during RUN-006 and is now confirmed.

## Scorecard

| Domain | Weight | RUN-006 | RUN-007 | Δ | Weighted | Confidence |
|---|---:|---:|---:|---:|---:|---|
| Core product correctness | 16 | 6.8 | 8.8 | **+2.0** | 14.08 | HIGH — CORE-004 root cause resolved on both entry surfaces (Home + Practice Hub) with a defensive fallback; held slightly below the pre-regression 9.0 pending an on-device confirmation pass |
| Data integrity & persistence | 15 | 8.8 | 8.8 | 0.0 | 13.20 | HIGH (carried forward, no change surface) |
| Reliability & lifecycle mgmt | 10 | 8.5 | 8.5 | 0.0 | 8.50 | HIGH (carried forward) |
| Testing & verification | 10 | 7.6 | 8.3 | **+0.7** | 8.30 | HIGH — the exact gap that caused the RUN-006 deduction (no test for the empty-session/terminal path) is now closed with 14 targeted assertions, and a second latent instance of the same bug class was caught by this pass's own re-verification; held below 9 because the harness still has no component/render-level testing capability (structural, project-wide, not specific to this fix) and no device confirmation |
| Security | 10 | 8.6 | 8.6 | 0.0 | 8.60 | HIGH (carried forward) |
| Privacy | 6 | 7.5 | 7.5 | 0.0 | 4.50 | MEDIUM (carried forward) |
| Architecture & maintainability | 10 | 8.8 | 8.8 | 0.0 | 8.80 | HIGH (carried forward; the fix reused existing patterns — no new abstractions — consistent with the RUN-006 assessment) |
| UX/usability | 8 | 7.4 | 7.9 | **+0.5** | 6.32 | MEDIUM — dead CTA and misleading copy both fixed on every surface found (including the greeting-text gap caught in this pass); held just below the pre-regression 8.0 pending a real device/Maestro pass to confirm the new copy and layout actually render well |
| Accessibility | 5 | 9.0 | 9.0 | 0.0 | 4.50 | HIGH (carried forward; new hero states reuse existing `accessibilityRole`/`accessibilityState`/`accessibilityLabel` patterns, spot-checked in source) |
| Deployment/release engineering | 6 | 8.5 | 8.5 | 0.0 | 5.10 | HIGH — upgraded from RUN-006's MEDIUM: `android-build`/`e2e-smoke` (unconfirmed at RUN-006 time) are now both green for `5e09358` |
| Dependency/supply-chain health | 4 | 7.5 | 7.5 | 0.0 | 3.00 | HIGH (carried forward; no manifest changes) |

## Overall

**84.9 / 100** (RUN-006-REAUDIT: 80.6 → **Δ +4.3**)

Cumulative: Baseline 71.3 → RUN-002 78.5 → RUN-003 82.5 → RUN-004 83.2 → RUN-005 83.8
→ RUN-006 80.6 (CORE-004 regression) → **RUN-007 84.9** (CORE-004 fixed, new project
high — Testing and Architecture both sit above their pre-regression RUN-005 levels on
their own merits: real new regression coverage and a genuine net simplification from
the exam redesign, not score recovery alone).

*Note on RUN-005's own arithmetic: re-summing RUN-005's published per-domain weighted
column (`14.40+13.20+8.50+8.00+8.60+4.50+8.50+6.40+4.50+5.10+3.00`) totals 84.70, not
the 83.8 that run's document states as "Overall." This is a pre-existing inconsistency
in an immutable prior run (not touched here per the framework's immutability rule) and
does not affect this run's own arithmetic, which was independently verified to sum
correctly. Flagged for transparency only.*

## Findings register delta

- **CORE-004 (P1): OPEN → CLOSED.** See above.
- No new findings.
- DEPLOY-002 (P4) and SEC-003 (P4) unchanged, still OPEN, not in this pass's scope
  (GitHub repo-settings items, no code change surface).

## Regression check

Re-read every changed file in the CORE-004 diff line-by-line rather than trusting the
FIX turn's report. Found and closed the greeting-text gap described above. No other
regression found — `startPractice`/`startExam`'s new boolean return type doesn't
change behavior for any caller that ignores it (all existing callers were updated to
use it or the `*Safe` wrappers), and the `showExamOptionCard`/`heroIsExamCta` gating
in `PracticeHubScreen.tsx` was traced through all four state combinations (level not
done; done + exam pending; done + exam passed; done + exam unavailable) against the
actual conditional logic, not just the intended design.

## Release verdict

**Upgraded from CONDITIONAL GO back to GO** — CORE-004 was the one open condition
named in RUN-006's verdict, and it is now closed against its stated acceptance
criteria. No P0/P1 findings remain open. The two open P4 items (branch protection,
secret scanning) remain hardening opportunities, not blockers.

**Caveat specific to this run:** this GO is against the **working tree**, not a
committed/pushed revision — CI has not run against the CORE-004 fix itself. Before
this verdict should be treated as applying to what ships, the fix needs to be
committed and pushed so CI (and ideally a real device/Maestro pass, per the disclosed
evidence gap above) confirms it on the actual revision that goes out.
