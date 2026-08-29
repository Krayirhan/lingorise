# RELIABILITY-001-BASELINE — DEEP RELIABILITY / RECOVERY AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

## Reliability / Recovery: 88/100

Confidence: HIGH

Status: **STRONG**

Derived independently from current source evidence (AppBootstrap.tsx, AppNavigator.tsx, ErrorBoundary.tsx, storage.ts, catalogueService.ts, errorReporter.ts, useAppSession.ts, useUserProgress.ts, auth.ts, AccountManagementCard.tsx, AuthScreen.tsx, PracticeScreen.tsx). No expected score was used, no historical findings or other domain scores were consulted before this score was drafted.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Startup / state recovery | 15 | 13 | 2 | REL-QA-002 — `ErrorBoundary`'s restart button clears only its own React state, doesn't remount/reload | E2 | HIGH |
| Async & race safety | 20 | 18 | 2 | REL-QA-001 — catalogue-loading effect has no request-ordering guard; independent review confirmed the race is real but its actual blast radius is narrow (per-level content-freshness only, not cross-level content corruption) | E2 | HIGH |
| Network / service failure handling | 15 | 14 | 1 | No explicit user-facing "offline/degraded mode" indicator anywhere (hygiene observation, not a demonstrated dead-end — offline/guest usage otherwise works fully) | E1 | MEDIUM |
| Practice / exam runtime resilience | 20 | 19 | 1 | Token deduction for transparency: the session-restore duplicate-answer window sits in this dimension's territory even though its root cause and score are owned by CORE-001-BASELINE's CORE-QA-002 (not independently re-deducted at full weight here) | E2 | HIGH |
| Persistence failure recovery | 15 | 12 | 3 | REL-QA-003 — `clearAllLocalData()`/`resetUserData()` swallow `AsyncStorage` failures with only `console.warn`, unlike `saveUserData()`'s own boolean-signal pattern | E2 | HIGH |
| User-visible error / escape paths | 15 | 12 | 3 | REL-QA-004 — cloud-sync failures are never surfaced via the app's existing toast/notice system, only `console.warn` | E2 | HIGH |
| **TOTAL** | **100** | **88** | **12** | | | |

## Findings

| ID | Title | Severity | Evidence | Status |
|---|---|---|---|---|
| REL-QA-002 | `ErrorBoundary`'s "Uygulamayı Yeniden Başlat" button only resets its own `hasError` state (no `onRestart` prop is passed by `AppBootstrap.tsx`, and `ErrorBoundary` is used nowhere else) — it does not remount the app root or clear any underlying persistent bad state. If a render-throwing condition is caused by persistent bad state rather than a transient glitch, tapping restart could immediately re-trigger the same error | P3 | E2 (`ErrorBoundary.tsx`, `AppBootstrap.tsx`) | OPEN |
| REL-QA-003 | `clearAllLocalData()`/`resetUserData()` (`storage.ts`) swallow `AsyncStorage` clear/remove failures with only `console.warn`/silent catch, then unconditionally return `DEFAULT_USER_DATA` — a reset action can appear to succeed in the UI while the persisted value was never actually cleared, with no user-visible signal. Independent review raised this from an initial P4 draft to P3: reset is a deliberate, trust-sensitive action, and the inconsistency with `saveUserData()`'s own boolean-return pattern makes the gap more consequential than a pure hygiene issue | P3 | E2 (`storage.ts` L376-391) | OPEN |
| REL-QA-004 | Cloud-sync failures in `useUserProgress.ts`'s `updateAndPersist()` and `refresh()` are caught but only `console.warn`'d — never surfaced through the app's own toast/notice system (which does exist and is used for local-save failures via `saveFailureNotice`/`noteSaveOutcome`). A signed-in user with persistent (non-fatal) sync failures has no in-app way to learn their progress isn't backing up to the cloud | P3 | E2 (`useUserProgress.ts` L132-190) | OPEN |
| REL-QA-004b (folded, related root cause) | Same silence pattern applies to `refresh()`'s cloud sync path, not only `updateAndPersist()` | (part of REL-QA-004) | E2 | OPEN |
| REL-QA-001 | `AppBootstrap.tsx`'s catalogue-loading effect has no request-ordering/cancellation guard (no `AbortController`/generation counter) around `loadCatalogue(level).then(setRuntimeQuestions)`. Reachable via two rapid level switches. Independent review confirmed the race is real but downgraded severity from an initial P3 draft: `setRuntimeQuestions` performs an id-based merge into a single cross-level question pool, not a per-level replacement — a stale, late-resolving response only risks that level's content-freshness (e.g. an enrichment field reverting to bundled/stale) rather than corrupting or showing wrong questions | P4 | E2 (`AppBootstrap.tsx` L66-72, `src/content/questions/index.ts`) | OPEN |

Findings were not padded to fill severity quotas — this is the complete set found with real, reachable evidence at this depth.

## Cross-domain observations (no scoring impact here)

- **CORE-QA-002 (session-restoration duplicate-answer window)** — an interrupted session where the last question was answered but not yet advanced past can, on restore, let the user answer the same question again, appending a duplicate entry to `sessionAnswers`. This does not crash or dead-end the app (the practice screen resumes into a normal, fully interactive state) — it is a scoring/data-correctness artifact whose root cause and score belong to CORE-001-BASELINE. Independent review confirmed no distinct reliability failure results.
- **DATA-QA-002 (incomplete merge field-list)** — `passedLevelExams` and other secondary fields can be silently reverted by a cold-start merge. Local usability and app functionality are fully preserved; this is a data-correctness matter already scored in DATA-001-BASELINE, not a reliability crash/dead-end.
- **DATA-QA-004 / SEC-QA-003 (account-deletion partial-failure orphan)** — verified this pass that the UI-facing reliability angle is actually solid: `AccountManagementCard.tsx` specifically handles `auth/requires-recent-login`, resets `busy` in every path, and surfaces an error message rather than hanging. The residual orphaned-identity/data risk is a data-integrity/privacy concern already scored in DATA-001-BASELINE and SECURITY-001-BASELINE, not a reliability dead-end.

## Strongest controls

- Startup resilience: bounded 8s auth-state timeout falling back to guest mode; catalogue loading has a genuine 3-tier remote→cache→bundled fallback with its own timeout.
- `storage.ts`'s load/migrate/normalize pipeline is fully defensive (try/catch, shape-detecting idempotent migrations, safe defaults for every field) and correctly returns usable defaults on any corruption.
- Duplicate-action guards are real and effective: the practice Check button is conditionally unmounted once `submitted`, and exam-result recording is keyed/idempotent via `examResultRecordedRef`.
- Auth flows (login/register/reset/delete) consistently use try/catch/finally to reset busy state and surface friendly, field-targeted error messages — no stuck-loading states found.

## Weakest controls

- Silent failure paths exist in two places that have an established, already-working pattern elsewhere in the same codebase (`saveFailureNotice` for local saves) that simply wasn't extended to cloud-sync failures (REL-QA-004) or to the reset/clear functions (REL-QA-003).
- The one existing crash-containment mechanism (`ErrorBoundary`) has a recovery action that doesn't fully deliver on its stated promise (REL-QA-002) — though no realistic render-throw call chain was found this pass, so this is fairly characterized as a hardening gap, not a demonstrated catastrophic defect.

## Do Not Change

- The 8s auth-state timeout and catalogue-fetch timeout values — both were deliberately tuned against real observed CI-hang behavior (per in-code comments) and should not be "optimized" without similar real evidence.
- The local-save-always-succeeds-independent-of-cloud-sync design in `updateAndPersist`/`refresh` — this is the correct offline-first architecture for this app's guest-first design intent; the fix for REL-QA-004 is to surface sync failures, not to make local success depend on cloud success.

## Known limitations (test coverage — do not treat as scored defects)

Independent `test-reviewer` review of `tests/testSuite.ts` found HIGH confidence for pure data-normalization/migration logic (extensively tested with direct edge cases), but LOW confidence for several reliability-specific runtime paths that this audit's own findings rely on static/inference-level evidence for:
- `loadUserData()`'s actual `AsyncStorage`-touching code (try/catch, legacy-key migration, `saveUserData`, `resetUserData`, `clearAllLocalData`) is never executed under test — `testSuite.ts` runs under plain `ts-node` with no `AsyncStorage` available, by the test file's own documented design; on-device verification is relied on instead.
- The empty-pool return (`startPractice`/`startExam` → `false`) is verified only via a source-text regex check, not by actually rendering/exercising the hook.
- The interrupted-session-restore path (`activeSession` restoration, index clamping, stale-question-id filtering) is never exercised by any test.
- Auth/Firestore service-layer rejection paths are essentially uncovered in `testSuite.ts` (this is a different concern from `firestoreRules.test.ts`, which tests authorization rules, not service-layer error handling).

These are verification gaps, not proven defects — per this audit's own instruction, they are not double-punished in the score above and are recorded here as confidence context for future reliability work.

## Independent review

**`code-reviewer` (primary reliability reviewer) — ADJUST.** Independently verified all four findings as real and reachable. Adjusted REL-QA-001's severity down (P3→P4): confirmed the race exists but found the actual blast radius narrower than originally framed — `setRuntimeQuestions` performs an id-based merge into a single cross-level pool, not a per-level replacement, so the worst case is a stale content-freshness regression for one level, not incorrect/corrupted question display. Adjusted REL-QA-003's severity up (P4→P3): reset/clear is a deliberate, trust-sensitive user action, and the silent-failure pattern is inconsistent with `saveUserData()`'s own boolean-signal convention already established in the same file. Confirmed no duplicated root-cause deductions, no missed user dead-end, and correctly excluded the session-restore duplicate-answer question from reliability scoring (cross-domain, no crash/dead-end). Both severity adjustments have been applied above.

**`test-reviewer` (runtime/test evidence) — coverage assessment incorporated.** Findings folded into "Known limitations" above; confirmed these are verification gaps, not scored as defects, per the audit's own anti-double-punishment rule.

## Historical reconciliation (performed last, against `.audit/state/FINDING_REGISTRY.md`, read-only)

| Historical ID | Historical status | Reconciliation this pass |
|---|---|---|
| REL-001 (P2, `refresh()` sync call lacks try/catch) | CLOSED | **CLOSED AND STILL VALID** — `useUserProgress.ts`'s current `refresh()` (L184-190) wraps its cloud-sync call in `try/catch`, consistent with the original fix. No regression. |

No other REL-domain historical findings exist in the registry. No historical registry file was modified. The independent score above was fixed before this section was read, per the audit's anti-anchoring rule.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git diff -- firestore.rules`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source, test, or rules changes)
