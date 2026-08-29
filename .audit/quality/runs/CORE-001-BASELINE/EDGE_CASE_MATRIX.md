# CORE-001-BASELINE — Edge Case Matrix

Revision: 16b9aab

| Edge case | Status | Evidence |
|---|---|---|
| Fresh install (no prior AsyncStorage data) | STATICALLY VERIFIED | `services/storage.ts: DEFAULT_USER_DATA` / `normalizeUserData()`; E4 real-device confirmed repeatedly this session (`pm clear` + relaunch flows) |
| Guest user, full session (onboarding → practice → exam → profile) | RUNTIME VERIFIED | E4, this session and prior CD-00x work, real emulator |
| Signed-in user cold-start merge | NOT VERIFIED (this pass) | Historical E4 (two-device test per project history, not re-run) |
| 0 learned words in current level | RUNTIME VERIFIED | E4 (Home/Practice Hub fresh state, this session) |
| Some learned words, level in progress | RUNTIME VERIFIED | E4 (Home/Practice Hub active-progress state, this session) |
| All words in current level learned (`isLevelFullyLearned`) | RUNTIME VERIFIED + SUPPORTED BY TEST | E4 (repeated real-device confirmation) + E3 (Birim 58, 14 assertions) |
| Level exam available (>=50 questions in pool) | STATICALLY VERIFIED | E2 (`isExamAvailable`), confirmed A1=320/A2=254 both qualify |
| Level exam passed | STATICALLY VERIFIED + PARTIAL RUNTIME | E2 (`isExamPassed`/`markLevelExamPassed` idempotent); pass-path UI not re-triggered end-to-end this pass (prior sessions triggered exam entry, not a full 50/60 pass) |
| Level exam failed | NOT VERIFIED | No runtime trigger this pass; `SessionSummaryCard`'s fail-path rendering not re-read line-by-line (design intent only, per commit history) |
| First CEFR level (A1) | RUNTIME + STATICALLY VERIFIED | E4 (all onboarding/Home/Practice flows this session used A1) |
| Middle CEFR level (A2) | STATICALLY VERIFIED | E2 (`getQuestionsByLevel("A2")`=254, `isLevelReady`=true) — not runtime-triggered this pass |
| Final CEFR level (C2) / content-thin levels (B1–C2) | STATICALLY VERIFIED (DEFECT-ADJACENT, BY DESIGN) | E2 — B1/B2/C1/C2 have 3–5 questions each, `isLevelReady`(<100) = false, `isExamAvailable`(<50) = false; `LevelSwitcherModal` explicitly disables these rows (`disabled={!ready}`), not a silent dead end. Not a defect — a disclosed content-completeness boundary. |
| Practice session interrupted (exit-practice dialog) | RUNTIME VERIFIED | E4 (CD-001 work, this session — exit dialog + `session_abandoned` telemetry path) |
| Practice/exam session interrupted mid-feedback (submit done, "Devam Et" not yet tapped) | NOT VERIFIED — DEFECT FOUND (CORE-QA-002) | E2 static only; process-kill timing not practically simulable in this audit |
| Repeated answer/reward attempt on the same word (normal practice) | SUPPORTED BY TEST | E3 (testSuite.ts — `applyPracticeAnswer` called twice on the same question, XP not duplicated) |
| Repeated answer/reward attempt via level exam re-encountering an already-rewarded word | STATICALLY VERIFIED — DEFECT-ADJACENT (CORE-QA-001) | E2 — falls into the `wasDue` review-XP branch or no-op, not double-rewarded as a *first* encounter again, but the encompassing exam/practice non-differentiation is the defect |
| Day rollover +1 day | SUPPORTED BY TEST + STATICALLY VERIFIED | E3 + E2 (`updateDailyStreak` diffDays===1 branch) |
| Multiple-day gap | STATICALLY VERIFIED | E2 (`updateDailyStreak` diffDays>1 → streak resets to 1) |
| Backward/anomalous clock | STATICALLY VERIFIED | E2 (`updateDailyStreak` diffDays<=0 → explicit no-op, does not punish streak) |
| Empty/insufficient candidate question pool for daily practice | STATICALLY VERIFIED | E2 (`buildDailySessionCore` → `pickNewWords` returns `[]` when no fresh words) + E3 (Birim 58) + E4 (toast fallback, CORE-004 work) |
| Empty/insufficient candidate pool for exam | STATICALLY VERIFIED | E2 (`buildLevelExam` returns `[]` implicitly when pool too small combined with `isExamAvailable` gate; `startExamSafe` shows toast on `false`) |
| Previously completed daily quest (same day) | STATICALLY VERIFIED | E2 (`updateDailyQuests`: `if (quest.completed) return quest` — no re-increment) |
| Previously rewarded question re-answered in a *normal* practice context | NOT REACHABLE | `buildDailySessionCore` filters it out by construction; only reachable via bookmark replay or exam (see above) |
| Previously celebrated/promoted level | STATICALLY VERIFIED | E2 (`evaluatePromotion.shouldCelebrate` checks `celebratedLevels`, `markLevelCelebrated` presumed idempotent — not re-read this pass in full) |

## Not evaluated (impractical or out of reachable scope this pass)

- Exact process-kill-timing reproduction for CORE-QA-002 (would require instrumented device testing beyond this audit's scope)
- Signed-in two-device merge re-test (historical E4 evidence accepted as current per Shared Discovery revision match)
- B2/C1/C2 manual walkthrough (same code path as B1, not separately triggered)
