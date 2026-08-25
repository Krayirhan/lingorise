# 09 — Findings

Run: RUN-001-BASELINE · Revision: `4a80283`

## Summary table

| ID | Severity | Domain | Status | Short issue | User impact |
|---|---|---|---|---|---|
| CORE-001 | P1 | Core correctness | OPEN | Streak resets to 1 on a non-`+1`-day clock diff (incl. backward clock) | Real, unearned loss of the app's core motivational counter |
| DATA-001 | P1 | Data integrity | OPEN | Cold-start race between `AppBootstrap` and `useUserProgress.init()` can clobber merged progress | Silent, intermittent loss of remote-only progress until next sign-in |
| CORE-002 | P2 | Core correctness / Testing | OPEN | `computeXpReward`/`computeDifficulty` untested despite feeding the reward economy and word ordering | Silent mis-pricing/mis-ordering on a future regression |
| DATA-002 | P2 | Data integrity | OPEN | `saveUserData` failure is silently swallowed, no user-facing signal | Believed-saved progress that is not actually persisted |
| REL-001 | P2 | Reliability | OPEN | `refresh()`'s Firestore sync call has no try/catch, unlike every other call site | Uncaught rejection on pull-to-refresh during a network failure |
| ARCH-003 | P2 | Architecture | OPEN | `AuthScreen.tsx` (662 lines) and `AccountManagementCard.tsx` (594 lines) mix multiple responsibilities | Elevated regression risk when touching one auth/account flow |
| CORE-003 | P3 | Core correctness / Testing | OPEN | `archiveDailyQuests` and `bringForward` mutate persisted state with zero test coverage | Silent regression risk in quest reset / manual reschedule |
| ARCH-001 | P3 | Architecture | OPEN | Two fully dead files duplicate live logic (`services/spacedRepetition.ts`, `i18n/formatters.ts`) | None today; future edit-wrong-copy risk |
| ACC-001 | P3 | Accessibility | OPEN | Accessibility DoD checklist (TalkBack/dynamic-type/scanner) is 0/5 confirmed despite broad code investment | Unknown real-world screen-reader/low-vision experience quality |
| DEPLOY-001 | P3 | Deployment | OPEN | Maestro E2E and release-build compile are not gated in CI | A broken runtime flow or native build could merge undetected |
| ARCH-002 | P4 | Architecture | OPEN | Two one-directional layering inversions (domain→services-barrel, state→feature-hook type) | None observed; latent coupling risk only |
| ARCH-004 | P4 | Architecture | OPEN | `getDailyTaskCollection` is dead code; `dailyTasks` Firestore rule guards a collection nothing writes to | None; cleanup-only |
| SEC-002 | P4 | Security | OPEN | `.env.example` contains real production Firebase identifiers instead of placeholders | Negligible — Firebase web keys are not secret-by-design |
| DEP-001 | P4 | Dependency health | OPEN | No `npm audit`/CVE scan has been run against current dependencies | Unknown — evidence gap, not a confirmed vulnerability |

---

## CORE-001

- Title: Daily streak resets to 1 on any non-exact-`+1`-day clock difference, including backward clock movement
- Status: OPEN
- Severity: P1
- Domain: Core product correctness
- Evidence IDs: E-CORE-02
- Confidence: HIGH
- Affected user promise: "The daily streak accurately reflects consecutive days of real engagement" (`02_PROJECT_PURPOSE.md`)
- First seen run: RUN-001-BASELINE
- Last verified run: RUN-001-BASELINE

### Problem
`updateDailyStreak` (`src/domain/gamification/streak.ts:32-48`) computes `diffDays = floor((today - lastActiveDate) / 1 day)` and only special-cases `diffDays === 1`. Every other value — including `0` or negative, which occurs whenever the device's reported "today" date string is earlier than or equal to the stored `lastActiveDate` in a way not already caught by the exact-string-match branch at line 24 — falls through to the final branch, which unconditionally resets `newStreak` to `1` and sets `isNewDay: true`.

### Why it matters
The streak is this product's single most emotionally load-bearing number — the entire gamification loop (`02_PROJECT_PURPOSE.md`) is built around "don't break the streak." A device clock correction (NTP resync fixing a fast clock, a timezone change from travel, a manual clock adjustment) is an ordinary, non-adversarial event that can produce exactly this condition.

### Concrete impact / failure mode
A learner with a genuine 47-day streak whose phone's clock is corrected backward by even a few minutes across a date boundary opens the app and sees their streak silently reset to 1, with no error, warning, or recovery path.

### Affected files/components
`src/domain/gamification/streak.ts:32-48`; consumed by `src/state/useUserProgress.ts` (`init`, `refresh`).

### Root cause
Missing explicit handling for `diffDays <= 0` as a distinct case from `diffDays > 1` (missed days). The two conditions currently share one fallback branch.

### Recommended direction
Add an explicit `diffDays <= 0` branch that preserves `currentStreak` unchanged (`isNewDay: false`) rather than falling through to the reset branch — a backward/same-effective-day clock reading should be a no-op for streak purposes, matching the intent already expressed by the `lastActiveDate === todayFormatted` branch immediately above it.

### Acceptance criteria
A new test in `tests/testSuite.ts` asserts: given `lastActiveDate` one day *ahead* of the computed `today` (simulating a backward clock correction), `updateDailyStreak` returns the streak unchanged, not reset to 1.

### Verification method
`npm test` passes the new assertion; existing streak tests (`diffDays === 1` and `diffDays > 1` cases) remain unchanged and passing.

---

## DATA-001

- Title: Cold-start race between `AppBootstrap`'s auth-merge and `useUserProgress`'s own local init can silently discard merged remote progress
- Status: OPEN
- Severity: P1
- Domain: Data integrity & persistence
- Evidence IDs: E-DATA-02
- Confidence: MEDIUM (reasoned interleaving from source, not reproduced under artificial network delay in this run)
- Affected user promise: "Signing in preserves and merges progress across devices" / "progress is never silently lost"
- First seen run: RUN-001-BASELINE
- Last verified run: RUN-001-BASELINE

### Problem
On app cold start with an already-persisted Firebase session, two independent effects both perform read→mutate→write against the same AsyncStorage key with no shared sequencing: `AppBootstrap.tsx`'s `onAuthStateChanged` handler (fetches remote, merges with local via `mergeAndSyncUserData`, then `saveUserData(mergedData)`) and `useUserProgress`'s own `init()` effect (reads local only, applies streak rollover, then `saveUserData(updated)`). If `init()`'s write completes after the auth handler's merged write, the merge result is overwritten by a plain local-only snapshot.

### Why it matters
This is the exact scenario the merge logic exists to protect against — a user who made progress on Device B, then opens Device A, expects that progress to appear, not to be silently dropped back to Device A's stale state.

### Concrete impact / failure mode
A learner who studied on their tablet, then opens their phone (both signed in to the same account): the phone briefly shows merged progress, then a subsequent state update from `init()`'s own local-only save can revert the in-memory/UI state to the phone's pre-merge snapshot, and that stale snapshot gets persisted as the new local source of truth.

### Affected files/components
`src/app/AppBootstrap.tsx:26-40`, `src/state/useUserProgress.ts:47-81` (`init`).

### Root cause
Two independently-triggered effects both treat themselves as the sole owner of the local↔remote reconciliation step; neither waits for or defers to the other.

### Recommended direction
Have `useUserProgress`'s `init()` effect either (a) skip its own unconditional `saveUserData` when a sign-in-triggered merge is already in flight (a shared ref/flag set by `AppBootstrap` before calling `mergeAndSyncUserData`), or (b) have `AppBootstrap` own the entire cold-start-for-signed-in-user path and have `useUserProgress.init()` only run its local-only logic when no user is signed in at mount time.

### Acceptance criteria
A test or reproducible manual scenario demonstrates that, for a signed-in user, the final persisted local state after cold start always reflects the Firestore-merged data, never a stale local-only overwrite, regardless of which effect's async chain resolves last.

### Verification method
Targeted test in `tests/testSuite.ts` simulating both write orders (if the fix is refactored into a testable pure sequencing function), plus a manual two-device on-device verification pass before this finding is closed.

---

## CORE-002

- Title: Content-baked XP/difficulty values feed the core reward and ordering logic with zero test coverage
- Status: OPEN
- Severity: P2
- Domain: Core product correctness / Testing & verification
- Evidence IDs: E-CORE-03
- Confidence: HIGH
- Affected user promise: "Calculations are correct" (implicit — XP reward accuracy)
- First seen run: RUN-001-BASELINE

### Problem
`computeXpReward`/`computeDifficulty` (`src/content/questions/difficulty.ts`) run at content-module load time to stamp `xp`/`difficulty` onto ~590 static question objects. `tests/testSuite.ts` never imports or exercises these functions directly.

### Why it matters
`applyPracticeAnswer` (well-tested, 26 references) trusts whatever `xpReward` value it is handed — it does not independently validate it. The new difficulty-ordered word selection (`pickNewWords`, already tested — see `18-srs-flow-hardening.md`) also depends on `difficulty` being correct. A regression in either formula would silently mis-price the entire question bank or mis-order every learner's new-word introduction, with no test to catch it.

### Concrete impact / failure mode
A future content-generation change that accidentally alters the difficulty/XP formula ships with 283/283 tests still green, because none of them exercise this specific code path.

### Affected files/components
`src/content/questions/difficulty.ts`; consumed by `src/content/questions/a1.ts`, `a2Generated.ts`, and (for difficulty) `src/state/useAppSession.ts`'s `pickNewWords`.

### Root cause
Test suite growth has followed feature work closely (SRS hardening, mastery, leech) but this earlier Sprint-6 module was never retrofitted with direct tests.

### Recommended direction
Add direct unit tests asserting `computeXpReward`/`computeDifficulty`'s expected output for representative inputs (short/common word vs. long/rare word, each CEFR level), matching this project's established per-function test discipline.

### Acceptance criteria
`tests/testSuite.ts` imports and directly exercises both functions with at least 3-5 representative assertions each.

### Verification method
`npm test` passes with the new assertions included.

---

## DATA-002

- Title: `saveUserData` write failures are silently swallowed with no user-facing signal
- Status: OPEN
- Severity: P2
- Domain: Data integrity & persistence
- Evidence IDs: E-DATA-01
- Confidence: HIGH
- Affected user promise: "A learner's progress is never silently lost"
- First seen run: RUN-001-BASELINE

### Problem
`saveUserData` (`src/services/storage.ts`) wraps its AsyncStorage write in try/catch but only logs a `console.warn` on failure — no retry, no in-app flag, no user-visible indicator that the most recent action didn't actually persist.

### Why it matters
A sustained write failure (e.g., device storage full) would let a user continue playing, believing their progress is being saved, when it silently is not — the worst-case version of the "progress is never lost" promise being broken, precisely because it's invisible.

### Concrete impact / failure mode
Low-storage device fills up mid-session; every subsequent `saveUserData` call fails silently; the user closes the app and reopens it later to find their last several sessions' progress missing, with no prior warning that anything was wrong.

### Affected files/components
`src/services/storage.ts` (`saveUserData`).

### Root cause
No failure-surfacing mechanism exists between the storage layer and the UI layer for this specific failure mode.

### Recommended direction
At minimum, surface a lightweight one-time warning (toast/banner) on repeated consecutive save failures, and/or retry once before giving up. Full solution scope is a product decision, not purely a code fix — flagged here as a finding, not prescribed as a mandatory specific UI.

### Acceptance criteria
A user is informed, in some form, if their progress has failed to save more than once in a row.

### Verification method
Manual test: simulate a storage write failure (mockable in `storage.ts`'s save path) and confirm a user-visible signal fires.

---

## REL-001

- Title: `refresh()`'s Firestore sync call lacks the try/catch pattern used everywhere else in the file
- Status: OPEN
- Severity: P2
- Domain: Reliability & lifecycle management
- Evidence IDs: E-REL-02
- Confidence: MEDIUM
- Affected user promise: "The practice loop never crashes or dead-ends" (extends to pull-to-refresh)
- First seen run: RUN-001-BASELINE

### Problem
In `src/state/useUserProgress.ts`, `refresh()`'s final `await Promise.all([syncUserData(...), syncUserProgress(...)])` has no surrounding try/catch, unlike `updateAndPersist`'s equivalent call (which has `.catch(...)`).

### Why it matters
A network failure during a user-initiated pull-to-refresh could throw uncaught into whatever called `refresh()`, producing an unhandled promise rejection instead of the graceful "sync failed, local data is safe" pattern used everywhere else in the same file.

### Concrete impact / failure mode
User pulls to refresh while offline; instead of a quiet no-op or a small error toast, an unhandled rejection propagates — exact downstream UI behavior depends on the caller, but it's inconsistent with the file's own established defensive pattern.

### Affected files/components
`src/state/useUserProgress.ts:113-138` (`refresh`).

### Root cause
Likely an oversight when `refresh()` was extended for the SRS server-date-anomaly fix (the `fetchUserData` call added alongside it is correctly awaited but the pre-existing sync call below it was never wrapped).

### Recommended direction
Wrap the final `Promise.all` in the same try/catch + `console.warn` pattern already used in `updateAndPersist`.

### Acceptance criteria
`refresh()` never throws to its caller on a Firestore failure; local state is still updated regardless of sync outcome.

### Verification method
Manual test with Firestore calls mocked to reject; confirm `refresh()` resolves rather than rejects.

---

## ARCH-003

- Title: `AuthScreen.tsx` and `AccountManagementCard.tsx` each mix multiple independent responsibilities in one large component
- Status: OPEN
- Severity: P2
- Domain: Architecture & maintainability
- Evidence IDs: E-ARCH-03
- Confidence: HIGH
- Affected user promise: n/a (maintainability, indirect risk to all auth/account promises)
- First seen run: RUN-001-BASELINE

### Problem
`src/screens/AuthScreen.tsx` (662 lines) combines login, registration, password-reset, and guest-mode entry forms — plus ~230 lines of inline styles — in a single component with shared state. `src/features/profile/components/AccountManagementCard.tsx` (594 lines) similarly combines account display, provider linking/unlinking, and destructive account actions.

### Why it matters
A change to one flow (e.g., adding a field to registration) risks unintended interaction with shared component state used by the other flows (login, reset) in the same file, since nothing structurally isolates them.

### Concrete impact / failure mode
A future bug fix to the password-reset flow accidentally breaks a piece of shared local state also used by the login form, because both live in the same component and share the same `useState` calls.

### Affected files/components
`src/screens/AuthScreen.tsx`, `src/features/profile/components/AccountManagementCard.tsx`.

### Root cause
Organic growth — each flow was likely added incrementally to an already-existing screen rather than split out at the point it grew past a single cohesive responsibility.

### Recommended direction
Split each file along its natural seams (e.g., `LoginForm`, `RegisterForm`, `ResetPasswordForm` as separate components composed by `AuthScreen`) — a mechanical, low-risk refactor since the seams are already visually/logically distinct in the current code.

### Acceptance criteria
No behavior change; `AuthScreen.tsx` and `AccountManagementCard.tsx` are each reduced to composition of smaller, single-responsibility components.

### Verification method
`npx tsc --noEmit` clean; manual on-device pass through all four flows (login, register, reset, guest) confirming unchanged behavior.

---

## CORE-003

- Title: `archiveDailyQuests` and `bringForward` mutate persisted user state with zero test coverage
- Status: OPEN
- Severity: P3
- Domain: Core product correctness / Testing
- Evidence IDs: E3_STATIC (grep confirmed zero references in `tests/testSuite.ts`)
- Confidence: MEDIUM
- First seen run: RUN-001-BASELINE

### Problem
`archiveDailyQuests` (`domain/gamification/badges.ts`, daily-quest reset/expiry) and `bringForward` (`domain/review/spacedRepetition.ts`, manual reschedule used by the bookmark feature) have no direct test references.

### Why it matters
Both mutate persisted, user-visible state; a regression in either would be silent.

### Recommended direction
Add direct unit tests for both functions, matching the project's established per-function test discipline used elsewhere in `domain/`.

### Acceptance criteria
Both functions have at least 2-3 direct assertions in `tests/testSuite.ts`.

### Verification method
`npm test` passes with new assertions included.

---

## ARCH-001

- Title: One fully dead file duplicates live business logic (corrected — see note)
- Status: OPEN
- Severity: P3
- Domain: Architecture & maintainability
- Evidence IDs: E-ARCH-02
- Confidence: HIGH
- First seen run: RUN-001-BASELINE
- Last verified run: FIX-2026-08-25-02 (correction)

### Correction (2026-08-25, during FIX-2026-08-25-02)
The original version of this finding also named `src/services/spacedRepetition.ts` as a dead duplicate with "zero importers anywhere in `src/`." That check only searched `src/`, not `tests/`. Direct re-read of the file shows it is actually a one-line re-export shim (`export * from "../domain/review/spacedRepetition";`), and `tests/testSuite.ts` imports SRS functions through it — it is live, intentional, and correctly stays in sync with the domain module by construction (a re-export can't drift). This half of the finding is **invalidated**. Only `src/i18n/formatters.ts` (a real, independent duplicate of `utils/formatters.ts` with zero importers anywhere in the repo, `src/` and `tests/` both checked) remains as the live finding.

### Problem
`src/i18n/formatters.ts` (a duplicate implementation of `utils/formatters.ts`) has zero importers anywhere in the repository.

### Why it matters
No live risk today (nothing executes it), but it is a landmine for a future contributor who edits the wrong copy expecting it to be live, or who copy-pastes from the dead file believing it's canonical.

### Recommended direction
Delete `src/i18n/formatters.ts`. Do **not** delete `src/services/spacedRepetition.ts` — it is a legitimate, live re-export shim.

### Acceptance criteria
File removed; `npx tsc --noEmit` and `npm test` remain clean.

### Verification method
Re-run typecheck/tests after deletion; confirm no importer errors.

---

## ACC-001

- Title: Accessibility verification checklist is 0/5 confirmed despite substantial implementation
- Status: OPEN
- Severity: P3
- Domain: Accessibility
- Evidence IDs: 132 `accessibilityLabel`/`accessibilityRole` occurrences (grep) + `docs/roadmap/09-accessibility.md:54-58` DoD checklist (all unchecked)
- Confidence: MEDIUM
- First seen run: RUN-001-BASELINE

### Problem
The project's own accessibility audit document lists five verification steps (TalkBack on 5 main flows, dynamic font max testing, Accessibility Scanner pass, expanded `reduceMotion` coverage, optional CI check) — none are checked as done, despite 132 accessibility-attribute occurrences already in the codebase.

### Why it matters
Code-level accessibility attributes can still produce a poor real screen-reader experience if reading order, label wording, or focus behavior weren't verified with an actual assistive technology pass — the presence of `accessibilityLabel` props is necessary but not sufficient.

### Recommended direction
Execute the five DoD items already scoped in `09-accessibility.md`; no new planning work is needed, only execution.

### Acceptance criteria
Per `09-accessibility.md`'s own Definition of Done.

### Verification method
Manual TalkBack pass + Accessibility Scanner run, as already specified in that document.

---

## DEPLOY-001

- Title: Maestro E2E and release-build compilation are not gated in CI
- Status: OPEN
- Severity: P3
- Domain: Deployment/release engineering
- Evidence IDs: E-TEST-01
- Confidence: HIGH
- First seen run: RUN-001-BASELINE

### Problem
`.github/workflows/ci.yml` runs typecheck, the domain test suite, and Firestore rules tests — but not `npm run test:e2e:smoke` (Maestro) and not an Android release-build compile step.

### Why it matters
A broken runtime UI flow or a native-build-breaking change (Gradle/manifest misconfiguration) can merge to `main` without CI catching it; both currently rely on manual verification (as performed ad hoc this session and in prior sprints).

### Recommended direction
Add a CI job (can be a separate, slower/optional workflow) that runs the Maestro smoke test against an emulator and/or performs `gradlew assembleRelease` as a build-only gate (no signing/publish required for this check).

### Acceptance criteria
CI fails if the Maestro smoke flow breaks or if the Android project fails to compile.

### Verification method
Intentionally break each (a UI element the smoke test depends on; a Gradle config value) in a throwaway branch and confirm CI catches it.

---

## ARCH-002

- Title: Two one-directional layering inversions between domain/services and state/features
- Status: OPEN
- Severity: P4
- Domain: Architecture & maintainability
- Evidence IDs: sub-agent-reported, not independently re-verified line-by-line this run (disclosed)
- Confidence: MEDIUM
- First seen run: RUN-001-BASELINE

### Problem
`domain/practice/answer.ts` imports from a `services/gamification` barrel instead of the domain module directly; `state/useUserProgress.ts` imports a type from a `features/practice` hook.

### Why it matters
Latent coupling that could complicate future refactors of the services barrel or the feature hook; no live cycle or bug currently results.

### Recommended direction
Redirect both imports to their direct domain-layer source.

### Acceptance criteria / Verification method
`npx tsc --noEmit` clean after the import changes; no behavior change.

---

## ARCH-004

- Title: `getDailyTaskCollection` is dead code; the corresponding Firestore rule guards a collection nothing writes to
- Status: OPEN
- Severity: P4
- Domain: Architecture & maintainability (reclassified from an initial Privacy-domain claim)
- Evidence IDs: E-DATA-04
- Confidence: HIGH
- First seen run: RUN-001-BASELINE

### Problem
`getDailyTaskCollection` (`src/services/firestore.ts:235-236`) has zero callers; daily quests live entirely in local `UserData.dailyQuests`, never in the Firestore `dailyTasks` subcollection the rules file defends.

### Why it matters
Purely a cleanup item — confirms no privacy/data-deletion gap exists (see corrected reasoning in `07_DETAILED_AUDIT.md` → Privacy), but the unused function and rule are dead weight that could mislead a future reader into thinking this sync path is active.

### Recommended direction
Remove `getDailyTaskCollection` and the corresponding `dailyTasks` rule block, or implement real usage if daily-quest cloud sync is actually intended.

### Acceptance criteria / Verification method
`npx tsc --noEmit` clean after removal; `firestore.rules` still passes existing rule tests.

---

## SEC-002

- Title: `.env.example` contains real production Firebase identifiers instead of placeholder values
- Status: OPEN
- Severity: P4
- Domain: Security
- Evidence IDs: E-SEC-02
- Confidence: HIGH
- First seen run: RUN-001-BASELINE

### Problem
The git-tracked `.env.example` template contains what appear to be the actual production Firebase Web client-config values, not placeholders.

### Why it matters
Firebase Web API keys are not secret-by-design (enforced by `firestore.rules`, verified correct in this audit) — real-world risk is negligible. Still, an "example" file conventionally signals "replace these," and using real identifiers blurs that signal for future contributors.

### Recommended direction
Replace the values in `.env.example` with clearly-fake placeholders (e.g., `your-project-id`).

### Acceptance criteria / Verification method
`.env.example` values are visually distinguishable as placeholders; app still runs correctly when a developer copies it to `.env` and fills in real values.

---

## DEP-001

- Title: No dependency vulnerability scan has been run against current dependencies
- Status: OPEN
- Severity: P4
- Domain: Dependency/supply-chain health
- Evidence IDs: none executed this run (evidence gap, not a confirmed finding)
- Confidence: LOW (absence of evidence, not evidence of absence)
- First seen run: RUN-001-BASELINE

### Problem
`npm audit` (or an equivalent CVE scanner) was not executed during this audit pass.

### Why it matters
Dependency versions are current-generation (E-DEPS-01), which is a positive signal, but does not substitute for an actual known-vulnerability check.

### Recommended direction
Run `npm audit` (or add it to CI) and triage any findings by actual exploitability in this app's context (client-only, no server-side execution of these packages).

### Acceptance criteria / Verification method
`npm audit` executed and reviewed; any HIGH/CRITICAL findings triaged with a documented accept/fix decision.
