# 05 — Tool and Graph Analysis (REAUDIT)

## Change since baseline

| Tool/capability | RUN-001-BASELINE | RUN-002-REAUDIT |
|---|---|---|
| CI (typecheck/test/rules-test gate) | AVAILABLE_CONFIGURED (assumed working — not actually verified live) | **UNAVAILABLE — deliberately removed.** `gh run list` investigation this session revealed every CI run since at least Sprint 6 had failed identically with "Actions budget is preventing further use" (account billing limit, private repo). Never actually functioned. Removed entirely per account owner's cost-driven decision. |
| Android release build | AVAILABLE_CONFIGURED, EXECUTED (1×) | AVAILABLE_CONFIGURED, EXECUTED (6× across this session's FIX passes — `assembleRelease` succeeded every time, including the final check this reaudit) |
| Custom test suite | 283 assertions | **300 assertions** (+17: 2 for CORE-001's backward-clock case, 9 for CORE-002's XP/difficulty formulas, 6 for CORE-003's archiveDailyQuests/bringForward) |
| npm audit | Not executed at baseline | **Executed this session** — 17 moderate, 0 high, 0 critical; all traced to build-time-only tooling (`firebase-tools`, `expo-sharing`'s config-plugins chain). See `ACT-DEP-001` in the FIX log. |
| TalkBack (real device accessibility service) | Not exercised | **Enabled and used for real** on the Pixel_9_Pro emulator this session; `uiautomator dump` used to inspect the actual accessibility tree (not just screenshots) across the practice loop, Level Switcher modal, and Quest History modal. |
| Dynamic font scale testing | Not exercised | **Exercised at 1.3× and 2.0×** (Android's accessibility maximum) via `adb shell settings put system font_scale`, across home/practice/dialog screens. |
| Graphify | Stale, unused (baseline finding) | Still stale/unused — not regenerated this session (no safe/practical trigger to do so within this audit's scope; manual grep-based analysis continued to substitute). |

## Executed this run
- `git log`/`git diff --stat` (baseline revision → current HEAD) — change-surface mapping.
- `npx tsc --noEmit`, `npm test` — fresh execution, both clean/green.
- `gradlew assembleRelease` + `adb install`/`am start`/`logcat` — fresh release-build + boot verification.
- `gh run list` / `gh run view` — real GitHub Actions run history inspection (this is what surfaced the CI-budget-block finding).
- `adb shell uiautomator dump` (×5 screens/modals) — real accessibility-tree inspection.
- `adb shell settings put system font_scale` (1.3, 2.0) + cropped screenshot comparison (`ffmpeg`) — real dynamic-type regression testing.
- `npm audit --json` + `npm ls <package>` dependency-chain tracing — real vulnerability triage.

## Tool limitations (unchanged from baseline)
No crash-reporting SDK; Firestore rules tests and Maestro E2E still not executed live this run (Maestro's CI job was added then removed along with the rest of `ci.yml` — never actually run in GitHub Actions; the smoke flow itself was not manually re-run this reaudit pass since no code change touched it).
