# 05 — Tool and Graph Analysis

## Discovered tooling

| Tool/capability | Status | Notes |
|---|---|---|
| TypeScript compiler (`tsc --noEmit`) | AVAILABLE_CONFIGURED | `tsconfig.json` extends `expo/tsconfig.base`, `strict: true`. Executed this run: **0 errors**. |
| Custom test suite (`tests/testSuite.ts`) | AVAILABLE_CONFIGURED | Executed this run: **283/283 assertions passed, 0 failed**. |
| Firestore rules test (`tests/firestoreRules.test.ts`) | AVAILABLE_CONFIGURED | Not executed this run (requires local Firestore emulator via `firebase emulators:exec`); evaluated via source read instead — both ALLOW and DENY cases present. |
| Maestro E2E (`.maestro/smoke.yaml`) | AVAILABLE_CONFIGURED | Not executed this run (requires a running emulator/device + Maestro CLI session outside this audit's time budget); evaluated via source read — onboarding→practice-entry flow, does not cover the answer→reward loop. |
| ESLint / static linter | UNAVAILABLE | No `.eslintrc*`/`eslint.config.*` found anywhere in the repo; no lint script in `package.json`. Not a deduction by itself (Constitution C2/tool-discovery principle: missing optional tooling ≠ automatic defect) but recorded as a real gap — TypeScript strict mode catches type errors, not style/correctness lint rules (unused vars via `noUnusedLocals`-class checks, React hook dependency correctness, etc.). |
| Dependency vulnerability scanner (`npm audit`) | AVAILABLE_UNCONFIGURED | Not run this session (Execution Safety: avoid unrequested network/package-manager mutation side effects; `npm audit` is read-only but was deprioritized against higher-value evidence given the time budget — recorded as a genuine coverage gap, not silently assumed clean). |
| Graphify (architecture graph) | PROJECT_CONFIG_PRESENT_TOOL_UNAVAILABLE — **stale artifact** | `graphify-out/` exists but only indexes ~35 files (missing nearly all of `src/domain`, `src/state`, `src/features`) with `mtime` timestamps corresponding to an early project snapshot, not the current 123-file `src/` tree. **Not used as evidence** — marked stale per Tool Discovery Protocol §"Existing graph freshness." Manual grep-based import/dependency analysis was used instead (see `07_DETAILED_AUDIT.md` → Architecture). |
| Android release build (`gradlew assembleRelease`) | AVAILABLE_CONFIGURED, EXECUTED | Run this session: `BUILD SUCCESSFUL`. APK installed on a running emulator and launched without crash (see Evidence Index E-DEPLOY-01). |

## Executed tools this run
- `npx tsc --noEmit -p tsconfig.json` — 0 errors.
- `npm test` (`tests/testSuite.ts`) — 283/283 pass.
- `git log`, `git ls-files`, `git status` — repository/tracking-hygiene checks.
- `grep`/`find`-based manual dependency and duplication analysis (Graphify substitute, see above).
- `gradlew assembleRelease` + `adb install` + `adb logcat` — release-build and boot-crash verification (see `RUN` context in this session's history for full command output).

## Skipped tools + reason
- `firebase emulators:exec ... firestoreRules.test.ts` — requires local emulator startup outside this audit pass's scope; rules were instead read directly and cross-checked against the test file's asserted scenarios (E3_STATIC + E2_TEST-by-inspection, not E2_TEST-by-execution — see `06_EVIDENCE_INDEX.md` for the confidence distinction).
- `maestro test .maestro/smoke.yaml` — requires a live device/emulator session dedicated to Maestro; evaluated via source read only.
- `npm audit` — deprioritized this run; recorded as an open coverage gap (see `10_ACTION_PLAN.md`).

## Graph observations validated against source
Graphify's cached graph was stale and unused. Manual verification instead confirmed, via direct grep (not inference):
- Zero live importers of `src/services/spacedRepetition.ts` (dead duplicate of `domain/review/spacedRepetition.ts`).
- Zero live importers of `src/i18n/formatters.ts` (dead duplicate of `src/utils/formatters.ts`); all 4 real call sites (`GlobalTopBar.tsx`, `HomeHeader.tsx`, `ReviewCard.tsx`, `WordPrompt.tsx`) import the `utils/` copy only.
- No import cycles found between `domain/`, `state/`, `content/`.
- Two one-directional layering inversions found (domain reaching into a services barrel; a state hook importing a feature-hook type) — see `ARCH-002` in `09_FINDINGS.md`.

## Tool limitations
- No lint tool means style-level and React-hooks-correctness classes of bugs are not mechanically caught anywhere in this stack; `tsc --strict` catches type errors only.
- No crash-reporting SDK (Sentry/Crashlytics-equivalent) means this audit cannot observe real production failure rates — all reliability findings are source/test-based, not incident-based (disclosed as a limitation in `06_EVIDENCE_INDEX.md` and `01_PROJECT_UNDERSTANDING.md`).
- Firestore rules and Maestro E2E were evaluated by direct reading rather than live execution this run — noted as `E3_STATIC`/`NOT EXECUTED` rather than `E1_RUNTIME`/`E2_TEST`, per Evidence Policy.
