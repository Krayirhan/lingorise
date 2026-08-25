# 11 — Release Verdict

## Target
Public consumer app store release (Google Play primary), per `02_PROJECT_PURPOSE.md` → Release context.

## Evaluated revision
`4a80283` (branch `main`, pushed to `origin/main` at audit time).

## Verdict
**CONDITIONAL GO**

No P0 blocker was found — no credible data-corruption, broken primary flow, or critical authorization/security exposure was identified (Firestore rules are correctly scoped; the primary practice loop was verified working end-to-end on a real build this session). However, two P1 findings directly touch the product's core promises and should be resolved or explicitly accepted as a known risk before a public launch, not silently shipped.

## Blocking findings
None at P0.

## Conditions / accepted risks
The following must be either fixed or explicitly accepted (in writing, by the product owner) before this revision is treated as launch-ready:

1. **`CORE-001`** (P1) — daily streak incorrectly resets on a backward/non-`+1`-day device clock reading. Low-frequency trigger, but directly breaks a core, emotionally-charged user promise with no user-facing recovery. Fix is XS-effort (`ACT-CORE-001`) — recommend fixing rather than accepting, given the low cost of the fix relative to the damage a single bad review citing "lost my streak for no reason" could do to a habit-formation app's store rating.
2. **`DATA-001`** (P1) — cold-start race can silently drop merged cross-device progress. MEDIUM confidence (reasoned, not reproduced under load) — recommend either fixing (`ACT-DATA-001`, M-effort) or, if deprioritized, explicitly documenting the accepted risk and its trigger conditions so a future support inquiry ("my progress disappeared") can be diagnosed quickly rather than treated as a mystery.

Neither finding blocks a release outright (both require somewhat specific, non-adversarial trigger conditions and neither causes a crash or corrupts the local authoritative copy), but shipping with either unacknowledged would be inconsistent with this project's own stated purpose and its demonstrated practice (elsewhere in the codebase) of not leaving known gaps undocumented.

## Required release evidence
- ✅ Release build produces a working, installable artifact (`gradlew assembleRelease` → `BUILD SUCCESSFUL`; installed and launched on a real emulator without crash — verified this session, E-DEPLOY-01).
- ✅ Automated verification gate exists and passes (CI: typecheck + domain tests + Firestore rules tests, all green).
- ⚠️ Store data-safety disclosure preparation exists (`docs/roadmap/17-data-safety-worksheet.md`) but was not independently re-verified against the actual current data model in this audit pass — recommend a final read-through before submission, since this audit did surface one privacy-adjacent correction (`ARCH-004`: a Firestore collection the rules defend but nothing writes to) that a data-safety form author should be aware doesn't need disclosure.
- ⚠️ No automated gate exists for the one true end-to-end UI flow (Maestro) or for release-build compilation itself (`DEPLOY-001`) — both currently rely on manual verification, which was performed successfully this session but is not continuously enforced.
- ❌ Not executed this run: dependency vulnerability scan (`npm audit`) — recommend running before final release sign-off, low effort.

## Checks executed
- `npx tsc --noEmit -p tsconfig.json` — 0 errors.
- `npm test` (`tests/testSuite.ts`) — 283/283 assertions pass.
- `gradlew assembleRelease` — BUILD SUCCESSFUL.
- `adb install` + `adb shell am start` + `adb logcat` — app installs, launches, and completes a manual 2-question practice interaction (including one wrong answer) with no app-process crash or exception.
- Direct source read of `firestore.rules` — correct tenant isolation confirmed, no overly permissive rule found.
- Direct source read of account-deletion flow — confirmed complete against all Firestore locations actually written to.

## Limitations
- No live execution of `tests/firestoreRules.test.ts` (requires a local Firestore emulator session) or `.maestro/smoke.yaml` this run — both evaluated by direct source reading instead; see `06_EVIDENCE_INDEX.md`.
- No dependency vulnerability scan executed.
- This verdict evaluates the Android release path only; no `ios/` project exists in this checkout to certify.
- No production crash-reporting data exists to cross-check the reliability findings against real-world incident rates — this verdict relies on source-level and one-session on-device verification, not production telemetry.
- `DATA-001`'s MEDIUM confidence reflects that the race was reasoned from source, not reproduced under an artificial network-delay harness in this pass; a fix should still be verified with a real multi-device test before being marked closed.
