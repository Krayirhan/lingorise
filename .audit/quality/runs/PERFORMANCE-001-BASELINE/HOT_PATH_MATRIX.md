# PERFORMANCE-001-BASELINE — Practice/Exam Hot Path Trace

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

This section is HIGH PRIORITY per the audit's own scope (Section 9).

## Traced call chain: answer tap → next-question transition

```
PracticeScreen.onCheck
  → session.recordSessionStep(isCorrect, xpReward)      [in-memory only, cheap]
  → userProgress.recordAnswer(question, picked, xpReward, sessionMode, quality)
      → updateAndPersist((prev) => {
          next = applyPracticeAnswer(prev, ...)          [pure, cheap — see CODE-QUALITY-001-BASELINE, no complexity finding]
          track("question_answered", ...)                [local telemetry ring buffer, bounded 200 events]
          ...several more track() calls for mastery/leech/garden-stage/quest events, all bounded...
          if (signed in) syncLearningItemProgress(uid, question, next, isCorrect)   [Firestore write #1 — correctly scoped to the single item]
          return next
        })
        → setUserData(next)                               [React state update — cheap]
        → saveUserData(next)                               [AsyncStorage write — FULL UserData JSON.stringify]
        → if (signed in): Promise.all([
              syncUserData(uid, next),                      [Firestore write #2 — FULL UserData document, re-stamps EVERY learningProgress entry]
              syncUserProgress(uid, next)                   [Firestore write #3 — separate document, curated subset]
            ])
  → session.setSubmitted(true)                            [UI proceeds immediately — none of the above is awaited]
```

## Finding: PERF-QA-003

**For every single signed-in-user answer submission, 4 persistence operations fire: 1 full local write + 3 Firestore writes (one appropriately item-scoped, two redundantly broad).**

- All 4 operations are fire-and-forget (`.then()`/`.catch()`, never awaited by the caller) — confirmed the UI's transition to `submitted: true` and the next question does not wait on any of them. **No responsiveness/jank impact.**
- `saveUserData()` and `syncUserData()` both serialize the **entire** `UserData` object on every call, including the `learningProgress` map — a per-word record that, unlike `practiceHistory` (explicitly capped to the last 30 entries), has no explicit cap of its own. Independent review correctly noted this is bounded in practice by the total content catalogue size (per `firestore.ts`'s own comment, on the order of several hundred questions), not literally unbounded — but it is still meaningfully larger and more expensive to reserialize than the deliberately-capped fields elsewhere in the same object, and grows monotonically as a user engages with more of the catalogue over time.
- `syncUserData()` additionally re-stamps **every** entry in `learningProgress` with a fresh `serverTimestamp()` call on every single invocation (`Object.fromEntries(Object.entries(data.learningProgress || {}).map(...))`), meaning the cost of this one write scales with total lifetime vocabulary engagement, not with the single word just answered.
- `syncUserProgress()`'s separate write to a second document (`users/{uid}/progress/main`) duplicates several of the same fields (`xp`, `level`, `streak`, `lastActiveDate`) already present in `syncUserData()`'s full-object write moments earlier — two Firestore writes carrying overlapping information for the same single event.
- `syncLearningItemProgress()` — the one write that IS correctly scoped to just the answered item — already exists and already runs on this same path, making the other two Firestore writes largely redundant for the specific "one answer was submitted" event they're reacting to.

## Frequency and scaling

This fires on **every single question answered**, in both practice sessions (5-30 questions) and exams (60 questions) — the highest-frequency interaction in the entire application. The cost of the two redundant writes scales with a user's total lifetime `learningProgress` size (unbounded), not with the size of a single answer event, meaning the inefficiency grows the longer someone uses the app.

## What this is NOT

- Not a responsiveness/jank defect — nothing here is awaited before the UI proceeds.
- Not a data-integrity defect — this is a distinct concern from DATA-001-BASELINE's merge-correctness findings; those examined whether these writes' *content* survives merges correctly, not their *frequency/redundancy*.
- Not measured via runtime profiling this pass (no release build available) — this is E2 static-certain evidence (the call chain is deterministic and directly read from source), not E1 inference or E3/E4 measurement.

## Related but out of scope

Independent review noted that `updateAndPersist()`'s `setUserData` call embeds network side-effects (`syncUserData`/`syncUserProgress`) directly inside the state updater function passed to `setUserData`, which is technically impure and inconsistent with React's updater-function contract. This is a code-quality/future-risk observation, not a performance defect (it has no current measured or inferable runtime cost under React Native's current non-concurrent rendering behavior) — noted here for completeness but not scored in this audit.
