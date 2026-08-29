# CORE-001-BASELINE

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (main = origin/main, matches Shared Discovery revision — shared maps valid, no re-verification needed)

## FUNCTIONAL CORRECTNESS SCORE: 88/100

Confidence: HIGH

Status: STRONG

## Audit Identity

- Mode: DEEP
- Independent pass performed WITHOUT reading `.audit/state/FINDING_REGISTRY.md` first (anti-anchoring rule followed) — historical findings reconciled only after the score/findings below were drafted.
- Tracked application source clean at start (only `.audit/consumer/*` state docs from a prior unrelated task were modified — not application source; recorded, not touched).
- No Consumer Design score used as a quality prior.

## Scorecard

| Dimension | Max | Score | Lost | Reason | Evidence level | Confidence |
|---|---|---|---|---|---|---|
| Practice/session correctness | 20 | 17 | 3 | CORE-QA-002: a narrow session-restoration window can duplicate an answer submission | E2 | MEDIUM |
| Learning/progression correctness | 20 | 20 | 0 | No concrete defect found; mastery/garden-progress/status derivation all consistent and correctly wired | E2 | HIGH |
| XP/reward/gamification correctness | 15 | 12 | 3 | CORE-QA-001 (part A): exam answers on new words silently mint identical practice-XP/rewarded-state | E2/E3 | HIGH |
| Daily quest/streak correctness | 15 | 11 | 4 | CORE-QA-001 (part B, same root cause): exam activity can silently progress/complete the daily practice quest; streak/rollover logic itself is fully correct | E2/E3 | HIGH |
| Level/exam/promotion correctness | 20 | 19 | 1 | Minor confidence gap: content-thin-pool leftover-fill branch of `buildLevelExam` has no direct test evidence | E1/E2 | MEDIUM |
| Terminal/edge-state correctness | 10 | 9 | 1 | Minor confidence gap: exam-failed `SessionSummaryCard` render path not re-verified this pass | E1 | MEDIUM |
| **TOTAL** | **100** | **88** | **12** | | | |

## 100 → 88 Score Loss Ledger

- **3 points (Practice/session):** CORE-QA-002 — session-restoration duplicate-answer edge case. Independent root cause from CORE-QA-001.
- **7 points (XP/reward: 3, Daily quest/streak: 4):** CORE-QA-001 — a single root cause (`applyPracticeAnswer`'s `sessionMode` parameter received but never used) produces two independent, user-visible symptoms: (a) exam-taught new words are indistinguishable from practice-taught words in the reward economy, and (b) the daily practice/review quest can be silently completed by exam activity alone. Split across two dimensions because each symptom is independently observable and violates a distinct stated product invariant — but explicitly **not** double-counted as two separate defects (see Findings). Independent reviewer (test-reviewer) confirmed the split is legitimate but flagged the original 10-point total as slightly high for a single-line root cause; reduced to 7 per that adjustment.
- **1 point (Level/exam/promotion):** confidence gap only, not a defect — the leftover-fill branch of `buildLevelExam()` (used when a difficulty band can't fill its third) has no direct test exercising it.
- **1 point (Terminal/edge-state):** confidence gap only, not a defect — exam-failed result screen not re-verified this pass.

No points were deducted for architecture style, missing analytics, visual design, or generic test-count concerns, per audit scope.

## Findings

| ID | Title | Severity | Confidence | Evidence level | Status |
|---|---|---|---|---|---|
| CORE-QA-001 | Level-exam answers are not distinguished from daily-practice answers in reward/quest accounting | P2 | HIGH | E2 (static) + E3 (absence of contrary test coverage confirmed) | OPEN |
| CORE-QA-002 | A session interrupted between answer-submit and "Devam Et" can restore into a duplicate-answerable state | P3 | MEDIUM | E2 (static only, not runtime-verified) | OPEN |

### CORE-QA-001

**Title:** Level-exam answers are not distinguished from daily-practice answers in reward/quest accounting
**Severity:** P2
**Impact:** A learner can silently complete their daily "20 kelimeyi doğru bil" practice quest (and earn its +30 XP bonus) purely by taking a level-completion exam, without ever entering the daily-practice flow the quest is designed to measure. New words encountered for the first time during an exam are rewarded (XP + `rewardedQuestionIds`) identically to a normal practice answer, with no attribution difference.
**Confidence:** HIGH
**Evidence level:** E2 (static, direct source read) reinforced by E3 (no test in `tests/testSuite.ts` exercises `applyPracticeAnswer` with `"EXAM"` differently — every call is parameterless or explicit `"PRACTICE"`)
**Evidence:**
- `src/domain/practice/answer.ts` — `applyPracticeAnswer(previous, question, picked, xpReward, _sessionMode: PracticeSessionMode = "PRACTICE")`: the `_sessionMode` parameter is received (leading underscore signals it's unused) and never referenced in the function body (lines 20–100).
- `src/domain/learning/levelExam.ts` (`buildLevelExam`, lines 30–37): explicit design comment — the exam draws from "the level's full word pool — not just words the learner has already met."
- `src/domain/gamification/badges.ts` (`updateDailyQuests`, `createDailyQuests` comment lines 7–8): the practice quest target is sized to "the number they actually have to answer" in a daily session — not designed to be satisfied by exam activity.
- Call chain confirmed end-to-end: `AppNavigator.tsx:166` (`recordAnswer(..., session.sessionMode, ...)`) → `useUserProgress.ts:215` (`applyPracticeAnswer(prev, question, picked, xpReward, sessionMode)`) → parameter silently dropped.
**Reachability:** Every level-exam attempt that includes at least one first-encounter-correct answer (near-certain given exams draw from the whole level pool, including unseen words for a mid-level learner). No special conditions needed — this is the default exam experience, not an edge case.
**Root cause:** `sessionMode` is threaded correctly through the entire call chain but never consulted inside the one function that applies its reward/quest side effects.
**User-visible behavior:** Taking a level exam can complete or progress the day's practice quest banner on Home/Practice Hub, and award XP/rewarded-state for words the learner has never practiced in the normal daily-practice flow.
**Why it matters:** Breaks the stated separation between "daily practice" and "level exam" as two distinct product mechanics (this separation is the explicit subject of the project's own recent redesign history), and lets the gamification economy be satisfied by an activity it wasn't designed to measure.
**Minimal remediation:** Branch on `_sessionMode` inside `applyPracticeAnswer` (or a thin wrapper) so `"EXAM"` answers update `learningProgress`/mastery/telemetry as today but skip `updateDailyQuests` and (if intended) tag exam-sourced rewards distinctly from practice-sourced ones.
**Status:** OPEN

### CORE-QA-002

**Title:** A session interrupted between answer-submit and "Devam Et" can restore into a duplicate-answerable state
**Severity:** P3
**Impact:** A learner who has an app kill/crash occur in the narrow window after submitting an answer (added to `sessionAnswers`) but before tapping "Devam Et" (which advances `currentIndex`) will, on restore, see the same question again with a blank/unanswered UI state. Answering it a second time appends a second `sessionAnswers` entry for the same question and can trigger a stray review-XP or quest-progress increment on the second submit (not a duplicate *first-encounter* XP payout, since `rewardedQuestionIds` was already updated on the first submit).
**Confidence:** MEDIUM
**Evidence level:** E2 (static reasoning only — not runtime-verified; exact process-kill timing is impractical to simulate in this audit)
**Evidence:** `src/state/useAppSession.ts` — `picked`/`submitted` local state is always initialized to `null`/`false` (lines 79–80) and is never part of the restored-session reconstruction (lines 67–77); `currentIndex` only advances inside `nextQuestion()` (lines 165–179), which runs strictly after a submit's feedback screen, not at submit time itself.
**Reachability:** Requires the app process to be killed in a specific, narrow timing window during active practice/exam. Low real-world frequency; not reproducible deterministically within this audit.
**Root cause:** Session-restoration persists `sessionAnswers`/`currentIndex` but not the local per-question UI state (`picked`/`submitted`), leaving a gap between "answer recorded" and "question index advanced."
**User-visible behavior:** A previously-answered question reappears as unanswered after an app restart mid-session; answering it again is possible.
**Why it matters:** A bounded, low-frequency data-integrity edge case in session bookkeeping — not a blocker, but a real gap in the restoration contract.
**Minimal remediation:** Either persist `picked`/`submitted` as part of `ActiveSessionState`, or advance `currentIndex` at submit time instead of at "next" time, so restoration cannot land between the two.
**Status:** OPEN

## Independent Reviewer Result

Reviewer: `test-reviewer` (independent, did not see an expected score in advance).
**Verdict: ADJUST.**
Both findings were independently re-verified by the reviewer directly against source (`answer.ts`, `levelExam.ts`, `useUserProgress.ts`, `AppNavigator.tsx`, `useAppSession.ts`, `badges.ts`, `testSuite.ts`) and confirmed accurate, correctly evidenced, and not a product-design misunderstanding. The reviewer's one adjustment: the original 10-point split for CORE-QA-001 (4 XP + 6 Daily-quest) was flagged as slightly high for a single-line root cause; reduced to 7 (3 + 4) per the reviewer's recommendation. All other severity/confidence/evidence-level judgments (P2 for CORE-QA-001, P3+NOT VERIFIED for CORE-QA-002, 20/20 for Learning/progression, −1 for Level/exam/promotion, −1 for Terminal/edge-state) were explicitly confirmed as reasonable and evidence-consistent.

## Strongest Correctness Areas

- **Streak/rollover logic** (`domain/gamification/streak.ts`, `dailyRollover.ts`) — explicitly handles same-day, +1-day, multi-day-gap, and backward/anomalous-clock cases without punishing the learner; matches the historical CORE-001 fix and shows no regression.
- **Level-completion exam mechanics** (`domain/learning/levelExam.ts`, `promotion.ts`) — idempotent result recording, correct pass threshold, honest content-availability gating (no promise the catalogue can't keep), manual level-switch never creates a silent dead end.
- **Terminal "level fully learned" state** (CORE-004 area) — consistent across Home and Practice Hub, backed by 14 regression assertions and repeated real-device confirmation across this session's other work.

## Weakest Correctness Areas

- **Practice/exam reward-economy separation** — CORE-QA-001 is the single most consequential finding: the codebase has the plumbing (`sessionMode`) to separate these two mechanics but never consults it at the one point that matters.
- **Session-restoration exactness** — CORE-QA-002 shows the restoration contract covers session-level state but not question-level UI state, leaving a narrow but real gap.

## Do Not Change

- The intentional, disclosed design that daily practice never resurfaces an already-rewarded word (`buildDailySessionCore`'s filter) — this is working as intended and is load-bearing for several other correct behaviors (CORE-004's terminal state, quest sizing).
- The intentional, disclosed content-completeness gate (`isLevelReady` >=100 questions) that keeps B1–C2 out of auto-promotion and manual-switch until they have real content — removing this would let learners "complete" a 3–5-question level, which is a worse outcome than the current honest gate.
- Streak's backward/anomalous-clock no-op behavior — this is a deliberate, well-reasoned fix (historical CORE-001), not a bug to "simplify."

## Known Limitations

- B1/B2/C1/C2 currently have only 3–5 questions each (vs. A1's 320 and A2's 254) — far below both the exam-availability threshold (50) and the level-ready threshold (100). This is a **content-completeness** limitation, not a logic defect; the code correctly and honestly gates on it rather than pretending these levels are complete. Not scored as a functional-correctness defect.
- Signed-in two-device merge (DATA-001 area) was not re-run this pass; historical E4 evidence (project-owner-performed two-device test) was accepted as still valid since the relevant code (`useUserProgress.ts` init guard) is unchanged at this revision.
- CORE-QA-002's exact runtime reproduction was not attempted (requires precise process-kill timing); classified NOT VERIFIED rather than confirmed, per audit rules (UNKNOWN != FAIL, but also not used to inflate confidence).
- Firestore Rules test could not be run locally this session (JDK 17 present, `firebase-tools` requires 21+); CI's own JDK-21 run for this exact revision is green (see Shared Discovery `04-VERIFICATION_STATE.md`) and was treated as authoritative.

## Historical Reconciliation (CORE_* findings in `.audit/state/FINDING_REGISTRY.md`)

Read only after the independent score/findings above were finalized, per audit rule. The old registry was **not modified**.

| Historical finding | Old status | Independent rediscovery this pass | Reconciliation |
|---|---|---|---|
| CORE-001 (P1) — streak resets on non-+1-day clock diff | CLOSED (FIX-2026-08-25-01) | `streak.ts` independently read fresh; backward/anomalous-clock handling confirmed present and correct | **Still closed** — current code is consistent with the historical fix, no regression |
| CORE-002 (P2) — XP/difficulty formulas untested | CLOSED (FIX-2026-08-25-02) | `answer.ts`/`applyPracticeAnswer` XP mechanics independently traced; `testSuite.ts` confirmed to exercise multiple XP scenarios | **Still closed** — consistent with current test evidence |
| CORE-003 (P3) — `archiveDailyQuests`/rollover untested | CLOSED (FIX-2026-08-25-03) | Not independently re-verified for test coverage this pass (out of the traced critical call chains) | **Not re-verified this pass** — no contrary evidence found, no regression signal |
| CORE-004 (P1) — daily-practice hero CTA silent no-op on fully-learned level | CLOSED (RUN-007-REAUDIT) | Independently re-traced this pass (`isLevelFullyLearned`, `GardenHeroCard`, `PracticeHubScreen`) and repeatedly re-verified on real device across this session's other work (CD-001/002/003, Home/Profile polish) | **Still closed, no regression** — strongest-evidenced area in this audit |
| DATA-001 (P1) — cold-start race can clobber merged progress | CLOSED (RUN-005-REAUDIT) | `useUserProgress.ts` init() guard independently re-read; logic and comment unchanged, consistent with the historical fix description | **Still closed** — consistent with current code, two-device runtime evidence not re-run (historical E4 accepted) |
| DATA-002 (P2) — silent `saveUserData` failure | CLOSED (FIX-2026-08-25-02) | Not in this audit's traced critical call chains (save-failure UI notice exists per `useUserProgress.ts` lines ~55–63, seen incidentally) | **Not re-verified this pass** — no contrary evidence found |
| REL-001 (P2) — `refresh()` sync call lacks try/catch | CLOSED (FIX-2026-08-25-02) | Not independently re-verified this pass | **Not re-verified this pass** — no contrary evidence found |

**No historical finding was found to have regressed.** CORE-QA-001 and CORE-QA-002 are genuinely new — neither appears in the historical registry under any prior ID. Historical statuses did not retroactively change the independent baseline score (per audit rule); the score above stands entirely on this pass's own evidence.
