# PERFORMANCE-001-BASELINE — Performance Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

Runtime environment note: the only installed build on the available emulator (`emulator-5554`) is a **DEBUGGABLE debug build** (confirmed via `adb shell dumpsys package com.lingorise.app`), not release-like. Per this audit's own instruction not to fabricate benchmarks or present debug-build timing as release performance, no absolute timing/FPS/memory numbers are reported anywhere in this run — all findings below are static source evidence (E2) or bounded inference (E1).

| Scenario | Runtime evidence | Static evidence | Observed/risked bottleneck | Status | Confidence |
|---|---|---|---|---|---|
| Cold application launch | NOT VERIFIED (no release build) | `AppBootstrap.tsx`: bounded 8s auth timeout, `loadUserData()` called twice for signed-in users (PERF-QA-001), first-paint gated on `loadCatalogue()` settling despite an instantly-available bundled fallback (PERF-QA-002) | Two concrete, bounded static findings | PARTIAL | MEDIUM |
| Warm launch / resume | NOT VERIFIED | Not deeply traced this pass (no dedicated AppState foreground/background reload logic found to inspect further within this pass's time budget) | None found | NOT VERIFIED | LOW |
| Home screen initial render | NOT VERIFIED | `useHomeViewModel.ts` operates on bounded arrays (solved/rewarded question IDs, small daily-quest list); no expensive per-render computation found | None found | PASS | MEDIUM |
| Practice start | NOT VERIFIED | `buildDailySession`/`buildLevelExam` operate over a single level's question pool (bounded, not the full multi-level catalogue); `randomizeDistractors` runs once per session build, not per render | None found | PASS | MEDIUM |
| Answer → next-question transition | NOT VERIFIED | All persistence (`saveUserData`, `syncUserData`, `syncUserProgress`, `syncLearningItemProgress`) is fire-and-forget — UI transition to the next question is not awaited on any of it | No responsiveness/jank impact found; see PERF-QA-003 for the *resource-efficiency* (not responsiveness) concern on this exact path | PASS (responsiveness) / PARTIAL (resource efficiency) | MEDIUM-HIGH (E2 for the call chain itself) |
| Practice session completion | NOT VERIFIED | `nextQuestion()`'s completion branch performs a bounded array filter (`sessionAnswers.filter`) over the session's own question count (typically 5-30) | None found | PASS | MEDIUM |
| Exam flow | NOT VERIFIED | Shares the same session mechanism as practice (60-question exam); same fire-and-forget persistence pattern, same PERF-QA-003 relevance | Same as practice | PARTIAL | MEDIUM |
| Profile navigation | NOT VERIFIED | `ProfileScreen.tsx` composes a fixed, small set of cards; no list/collection rendering found here | None found | PASS | MEDIUM |
| Background / resume | NOT VERIFIED | Not deeply traced this pass | Unknown — UNKNOWN ≠ FAIL | NOT VERIFIED | LOW |
| Offline / local-only operation | NOT VERIFIED (no release build) | Already established (Reliability/Data audits, reused as fact not score): local-first design works fully offline; no network dependency on the practice hot path itself | None found | PASS | MEDIUM-HIGH |

## Summary

No responsiveness-blocking (jank/lag) defect was found anywhere in the journeys traced — every expensive-looking operation identified (persistence, sync) is fire-and-forget and does not delay the next user-visible transition. The two real, concrete findings are resource/efficiency in nature: unnecessary duplicated/blocking work on the startup path (PERF-QA-001, PERF-QA-002), and unnecessary redundant network/storage writes on the single highest-frequency interaction in the app (PERF-QA-003). No release-like runtime measurement was available this pass, so confidence throughout is capped at MEDIUM even where static evidence is strong (E2).
