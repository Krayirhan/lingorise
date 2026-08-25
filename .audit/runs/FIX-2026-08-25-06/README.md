# FIX-2026-08-25-06

MODE: FIX
APPROVED_ACTIONS: ACT-ARCH-002, ACT-ARCH-004, ACT-SEC-002, ACT-DEP-001
Source run: RUN-001-BASELINE

## ACT-ARCH-002 — Fix two layering-inversion imports

Status: **VERIFIED**

### Change
- `src/domain/practice/answer.ts` — now imports `evaluateBadges`/`updateDailyQuests` from `../gamification/badges` (the actual domain module) instead of the `../../services/gamification` barrel re-export.
- `AnswerQualityMeta` moved from `src/features/practice/hooks/usePracticeSession.ts` (a feature-level hook) to `src/domain/review/qualitySignal.ts` (the domain module this shape actually belongs to, alongside `inferQuality`/`InferredQuality`). `usePracticeSession.ts` now imports and re-exports it (so `PracticeScreen.tsx`'s existing import path is unaffected); `src/state/useUserProgress.ts` now imports it directly from the domain module instead of reaching down into `features/`.

### Verification
- `npx tsc --noEmit` — 0 errors.
- `npm test` — 300/300 pass.
- Release build — BUILD SUCCESSFUL.
- On-device: installed, launched, started a practice session, answered a question (the exact `recordAnswer` → `applyPracticeAnswer` and quality-meta code paths this change touches) — no crash, feedback rendered correctly, logcat clean.

## ACT-ARCH-004 — Remove dead getDailyTaskCollection (scope reduced from original finding)

Status: **VERIFIED (partial scope — see note)**

### Change
Removed `getDailyTaskCollection` from `src/services/firestore.ts` — confirmed zero callers anywhere in `src/` both before and after removal.

### Scope correction
The original finding also suggested removing the corresponding `dailyTasks` rule block in `firestore.rules`. On inspection, `tests/firestoreRules.test.ts:19` actively asserts that a signed-in user CAN write to `users/{uid}/dailyTasks/{doc}` — the rule is not orphaned, it is a deliberately-scoped, currently-tested, forward-looking rule (harmless to keep: correctly restricted to `request.auth.uid == userId`, costs nothing to leave in place, and already has test coverage for if/when the feature is implemented). Removing it would mean also deleting real test coverage for a correctly-written rule, which is out of proportion to a "dead code cleanup" action. **Decision: keep `firestore.rules` and `firestoreRules.test.ts` unchanged; only the genuinely-dead TypeScript helper was removed.**

### Verification
- `npx tsc --noEmit` — 0 errors (no import broke from the removal).
- `npm test` — 300/300 pass (unaffected — the removed function was never used by any test).

## ACT-SEC-002 — Replace real Firebase identifiers in .env.example

Status: **VERIFIED**

### Change
`.env.example` — all six values replaced with clearly-fake placeholders (`your-project-id`, `your-firebase-api-key`, etc.), matching the convention an "example" file is expected to follow.

### Verification
Visual inspection — no real-looking identifiers remain. This file only affects local developer setup (copied to `.env` and filled with real values); no runtime code path depends on its exact contents, so no build/test verification is applicable beyond confirming the app still reads `.env` correctly (unchanged — `.env` itself was never touched).

## ACT-DEP-001 — Run npm audit, triage findings

Status: **VERIFIED (accepted risk, no dependency changes)**

### What was found
`npm audit` — **17 moderate, 0 high, 0 critical** vulnerabilities (600 prod + 604 dev + 37 optional = 1214 total dependencies scanned).

Traced every affected package's dependency chain (`npm ls <package>`):
- `re2`, `@opentelemetry/core` → both exclusively under `firebase-tools` (devDependency; Firebase CLI/emulator tooling, never bundled into the shipped app).
- `uuid` → three separate chains, all build/CLI-time only: `@expo/ngrok` (dev tunnel tool), `expo-sharing → @expo/config-plugins → xcode` (native-project-generation tooling that runs during `expo prebuild`/native builds on the developer's machine, not inside the Metro-bundled JS that ships to users), and `firebase-tools`'s own dependency tree.

### Triage decision
**Accepted risk — no dependency changes made.** All 17 findings are moderate-severity (mostly DoS/memory-disclosure in native regex tooling), zero are high/critical, and every single one traces to build-time or CLI-time tooling that never executes on an end user's device. `npm audit fix --force` would have downgraded `firebase-tools` to a breaking older major version for zero corresponding reduction in real shipped-app risk — an unjustified, disproportionate change per Execution Safety's "avoid automatic dependency rewrites" guidance. This satisfies the finding's own acceptance criteria ("any HIGH/CRITICAL findings triaged with a documented accept/fix decision") — there were none to triage as fixes; the full moderate-only list is triaged here as accepted.

## Scope discipline
No files beyond those named above were touched. `firestore.rules` and `tests/firestoreRules.test.ts` were deliberately left unchanged (see ACT-ARCH-004 note) rather than making an unjustified deduction to force the original finding's exact suggested scope.

## Files changed
- `src/domain/practice/answer.ts`
- `src/domain/review/qualitySignal.ts`
- `src/features/practice/hooks/usePracticeSession.ts`
- `src/state/useUserProgress.ts`
- `src/services/firestore.ts`
- `.env.example`
