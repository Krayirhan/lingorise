# RUN-006-REAUDIT (lean/scoped)

Revision: `5e09358` (main, 2026-08-27 20:51 +0300) · Rubric: v1.0 (locked, reused) · Prior run: RUN-005-REAUDIT (83.8/100)

**Scope note:** same lean approach as RUN-004/RUN-005 — only domains with a real
change surface since the prior run's base commit (`211fde9`) are re-scored;
every other domain carries forward unchanged.

## Change surface since RUN-005-REAUDIT

15 commits, 64 files, +2139/-818 lines. Two categories:

1. **Product/learning-flow changes** (`c9a7937`, `1d8372d`, `0964e58`, `877fe9c`, `a8656eb`) —
   the substantive surface for this run.
2. **Dev-tooling-only changes** (`12d63ac` through `5e09358`: `.claude/` skills/hooks/agents,
   `.serena/`, `CLAUDE.md`, CI retrigger) — no product code touched, no rescoring needed.

### The product change, in one line
Per-word spaced-repetition review inside daily practice was **fully retired and
replaced with a single 60-question level-completion exam** (`domain/learning/levelExam.ts`,
new). This is a deliberate, well-documented design reversal (see commit `1d8372d` and
`docs/roadmap/18-srs-flow-hardening.md`), not an accidental regression — `mastery.ts`,
`spacedRepetition.ts`, leech detection, and interval jitter remain in the codebase and
still drive badges, the garden growth stage, storage migration, and the "remind me
later" bookmark feature. They no longer drive daily practice or level promotion.

**Purpose-statement conflict (Purpose Analysis Protocol §"Purpose conflict rule"):**
`state/CURRENT_PURPOSE.md`'s primary user promise "SRS scheduling actually spaces
reviews; known words stop cluttering practice, hard words come back" is now **false**
for the shipped app — daily practice never resurfaces a word, by design. Scored
against current shipped behavior (the authoritative source), not the stale promise
text. `CURRENT_PURPOSE.md` is updated by this run to reflect the exam-based model;
this is a documentation correction, not a rubric-weight change — the underlying user
need ("finishing a level reflects real command of it, not luck") is still served, just
by a different mechanism, so domain weights are unchanged (v1.0 rubric still valid;
no new rubric version warranted per §05 "material justification" bar).

### Also verified in this pass
- `fix(garden)` (`877fe9c`): garden-stage thresholds rescaled to align with the
  30-word unit size — a real bug (two unexplained denominators reading as broken),
  cleanly fixed, test updated.
- `fix(content)` (`a8656eb`): remote Firestore catalogue rows that lack teaching-
  enrichment fields (example sentences, hints, etc.) no longer blank out the bundled
  fallback — confirmed live on-device per commit message, backfill-merge logic read
  directly and is correct.

## New finding: CORE-004 (P1)

**Daily-practice hero CTA silently no-ops once a level's word pool is exhausted.**

- `buildDailySessionCore` (`src/state/useAppSession.ts`) filters a level's questions
  down to `freshWords` (not yet in `rewardedQuestionIds`). Once every word in a level
  has been learned, `getLevelUnitInfo` (`src/content/questions/index.ts:173-188`) falls
  back to the last unit with `learnedInUnit === questions.length`, so `freshWords` is
  always `[]` from that point on.
- `startPractice()` (`useAppSession.ts:117-137`) and `startExam()` both do
  `if (qList.length === 0) return;` — a silent no-op, no navigation, no toast, no
  message.
- `PracticeHubScreen`'s hero card (the screen's primary, always-rendered,
  always-enabled CTA — `src/screens/PracticeHubScreen.tsx:139-176`) has no
  disabled/empty state tied to `freshWords` and calls `onStartDailyPractice` →
  `startPractice()` unconditionally.
- `useHomeViewModel.ts:56-58`'s `practiceRecommendation` copy for this exact
  state ("Bugünlük yeni kelimen kalmadı — yarın devam edelim" / "no new words
  today — let's continue tomorrow") is reused for **both** "today's quota is
  filled but words remain" and "the entire level is permanently exhausted" —
  actively misleading in the second case, since there is no tomorrow with more
  words in that level.
- **Reachability:** this is not an edge case. It is the exact terminal state of the
  mainline "finish a level" success path every engaged learner reaches — e.g. ~16
  practice-hero presses at the default 20-word session size for A1's 320 words.
  Thinner levels (B1-C2, already flagged content-thin elsewhere) reach it faster.
- **User-promise violated:** `CURRENT_PURPOSE.md` — "The practice loop never
  crashes or dead-ends."
- **Evidence level:** E3_STATIC (direct source read across `useAppSession.ts`,
  `content/questions/index.ts`, `PracticeHubScreen.tsx`, `useHomeViewModel.ts`) +
  E6_INFERENCE for the exact on-screen behavior (not run on-device this session —
  no emulator/build step taken; the silent-return code path is unambiguous, so
  confidence is HIGH despite not being device-observed).
- **Not the same root cause as anything already tracked** — this is new to the
  exam-redesign commits, not a carryover of a previously-closed finding.

**Recommended direction:** gate the hero CTA (and, ideally, `startPractice`/
`startExam` themselves, defensively) on `freshWords.length > 0`; when a level is
fully exhausted, replace the hero card with a distinct "level fully learned — take
the exam" state (the exam card already exists on the same screen when
`isExamAvailable`) instead of leaving an always-pressable button that does nothing.
Fix the reused copy in `useHomeViewModel.ts` to distinguish "more words tomorrow"
from "this level's words are done."

**Acceptance criteria:** a test drives `solvedInLevel === levelQuestions.length`
(all words in the level rewarded) and asserts the hub screen no longer offers a
practice CTA that produces an empty session, and that a distinct message/state is
shown. Verified either by unit test around the view-model/session functions or a
Maestro flow that completes a thin level and checks the resulting screen state.

## Scorecard

| Domain | Weight | RUN-005 | RUN-006 | Δ | Weighted | Confidence |
|---|---:|---:|---:|---:|---:|---|
| Core product correctness | 16 | 9.0 | 6.8 | **-2.2** | 10.88 | HIGH — new mainline dead-end (CORE-004); exam mechanics themselves (band-balanced 60-question draw, idempotent pass recording, promotion gate) are sound and tested |
| Data integrity & persistence | 15 | 8.8 | 8.8 | 0.0 | 13.20 | HIGH (carried forward, no change surface) |
| Reliability & lifecycle mgmt | 10 | 8.5 | 8.5 | 0.0 | 8.50 | HIGH (carried forward) |
| Testing & verification | 10 | 8.0 | 7.6 | **-0.4** | 7.60 | HIGH — exam/promotion unit tests are thorough (Birim 52 etc.), but no test at any level catches the empty-session/dead-end path CORE-004 describes |
| Security | 10 | 8.6 | 8.6 | 0.0 | 8.60 | HIGH (carried forward; new `.claude/` dev-tooling config is not shipped app surface, out of scope per purpose non-goals) |
| Privacy | 6 | 7.5 | 7.5 | 0.0 | 4.50 | MEDIUM (carried forward) |
| Architecture & maintainability | 10 | 8.5 | 8.8 | **+0.3** | 8.80 | HIGH — net simplification: `ReviewCard.tsx` and review-debt/leech daily-practice wiring removed, `levelExam.ts`/`promotion.ts` are small and pure, garden-stage magic-number mismatch fixed |
| UX/usability | 8 | 8.0 | 7.4 | **-0.6** | 5.92 | MEDIUM — same root cause as CORE-004 (silent CTA + misleading "come back tomorrow" copy in the terminal state); scored here for the feedback/messaging angle specifically, not double-counting the functional break itself |
| Accessibility | 5 | 9.0 | 9.0 | 0.0 | 4.50 | HIGH (carried forward; spot-checked new exam-card/level-switcher UI for `accessibilityLabel`/`Role` — consistent with existing pattern, no regression found) |
| Deployment/release engineering | 6 | 8.5 | 8.5 | 0.0 | 5.10 | MEDIUM — `verify` CI job green on current HEAD; `android-build`/`e2e-smoke` still in progress at time of this run (not yet confirmed), no score change made on an unconfirmed gate |
| Dependency/supply-chain health | 4 | 7.5 | 7.5 | 0.0 | 3.00 | HIGH (carried forward; `package.json`/`package-lock.json` unchanged since RUN-005) |

## Overall

**80.6 / 100** (RUN-005-REAUDIT: 83.8 → **Δ -3.2**)

Cumulative: Baseline 71.3 → RUN-002 78.5 → RUN-003 82.5 → RUN-004 83.2 → RUN-005 83.8 → **RUN-006 80.6**

This is the first regression in the run history. It is attributable to one real,
newly-introduced P1 defect (CORE-004), not measurement noise or rubric drift — see
above for the evidence chain.

## Gates re-confirmed this pass

- `npx tsc --noEmit`: 0 errors.
- `npm test`: 328/328 passing.
- GitHub Actions CI on `5e09358`: `verify` job ✅ green (45s); `android-build` and
  `e2e-smoke` still running at time of this audit — **NOT EXECUTED/confirmed** for
  this exact revision. Immediately preceding commit (`a1b26a1`) is fully green
  end-to-end. Disclosed as a limitation, not scored as a failure.
- Dependency manifest diff: none since RUN-005 (`npm audit` not re-run; no new
  dependencies introduced, DEP-001's prior triage stands).

## Findings register delta

- **New: CORE-004 (P1, OPEN)** — see above.
- All previously-closed findings unaffected by this change surface; none reopened.
- **DEPLOY-002 (P4, OPEN)** and **SEC-003 (P4, OPEN)** — not rechecked this pass
  (GitHub repo-settings items, no code change surface); carried forward as-is.

## Regression check

Searched the full diff for behavior regressions beyond CORE-004: promotion/exam
logic, garden-stage math, and content-merge logic were read against their own tests
and are internally consistent; no other new defect found. CORE-004 is the one
regression this run identifies, and it is scoped precisely to the exhausted-level
terminal state — it does not affect any in-progress level, which is the state the
overwhelming majority of current users are in pre-launch.

## Release verdict

**Downgraded from GO to CONDITIONAL GO.**

CORE-004 is a P1, not a P0 — no data loss, no crash, no security exposure, and it
only manifests after a learner exhausts an entire level's word pool (a real but
narrow-window state, not the default new-user path). Per the Release Certification
Protocol this does not force NO-GO, but a silently-dead primary CTA hit by exactly
the most engaged, most successful learners (the ones who finish a level) is a
condition that should be closed before a public store release, not shipped as a
known gap. Recommended condition: fix CORE-004 (or, at minimum, ship a non-silent
fallback — a toast/message — as an interim mitigation) before promoting this
revision to the public release target.

No other blockers identified. DEPLOY-002/SEC-003 remain P4 hardening items, not
blockers.
