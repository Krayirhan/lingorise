# PERFORMANCE-001-BASELINE — DEEP PERFORMANCE EFFICIENCY AUDIT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (== origin/main at audit time)

## Performance Efficiency: 80/100

Confidence: MEDIUM

Runtime evidence quality: **LIMITED** — the only installed build on the available emulator (`emulator-5554`) is a DEBUGGABLE debug build (confirmed via `adb shell dumpsys package com.lingorise.app`), not release-like. Per this audit's own rule against fabricating benchmarks or presenting debug-build timing as release performance, no absolute timing/FPS/memory numbers are reported anywhere in this run. All findings are static source evidence (E2) — deterministic call chains directly read from source, not inference and not runtime measurement. Confidence is capped at MEDIUM specifically because of this absence of E3/E4 evidence, not because the static evidence itself is weak.

Release-like runtime used: **NO**

Derived independently from direct source inspection. No expected score and no other domain's findings (Architecture, Code Quality, Reliability, etc.) were consulted before this score was drafted.

## Scorecard (score-loss ledger)

| Dimension | Max | Score | Lost | Root cause | Evidence | Confidence |
|---|---|---|---|---|---|---|
| Startup / resume efficiency | 15 | 9 | 6 | PERF-QA-001 (-2) + PERF-QA-002 (-4) | E2 | MEDIUM |
| UI rendering / navigation responsiveness | 20 | 19 | 1 | No demonstrated defect in the screens/hooks inspected; light token for incomplete coverage (not a demonstrated issue) | E1 (unchecked remainder) / E2 (checked areas) | MEDIUM |
| Practice / exam interaction hot path | 20 | 13 | 7 | PERF-QA-003 — "fires on every single interaction" angle | E2 | HIGH (deterministic call-chain evidence) |
| Storage / serialization efficiency | 15 | 11 | 4 | PERF-QA-003 — "whole-object serialization for a tiny update" angle (same root cause as above, deliberately split across exactly these 2 dimensions, not a 3rd) | E2 | HIGH |
| Network / Firebase efficiency | 10 | 10 | 0 | PERF-QA-003's redundant-Firestore-writes angle is not charged a third time here, to avoid over-spreading one root cause across 3 dimensions; no other distinct network finding was found | E2 | MEDIUM |
| Asset / memory efficiency | 10 | 8 | 2 | PERF-QA-004 | E2 | MEDIUM |
| Lifecycle / background efficiency | 10 | 10 | 0 | No defect found; not deeply verified via runtime but UNKNOWN ≠ FAIL | E1/E2 | LOW-MEDIUM |
| **TOTAL** | **100** | **80** | **20** | | | |

## Findings

| ID | Title | Severity | Evidence | Status |
|---|---|---|---|---|
| PERF-QA-001 | `loadUserData()` (an `AsyncStorage.getItem` + `JSON.parse` + full migration pipeline) runs **three times** on a signed-in user's cold start — once in `useUserProgress`'s own mount effect, again inside `AppBootstrap`'s `onAuthStateChanged` handler before merging, and a third time inside `refresh()` (called at the end of that same handler). Independent review confirmed this count (corrected from an initial "twice" observation) | P4 | E2 (`useUserProgress.ts` L68-97, L146-191; `AppBootstrap.tsx` L45-58) | OPEN |
| PERF-QA-002 | The app's first interactive screen is unconditionally gated behind `loadCatalogue()` settling (`catalogueReady` state), even on a fast/successful network path, despite synchronously-available bundled question content (`src/content/questions/*.ts`) that could in principle allow immediate render with a background content upgrade. The known-intentional 8s timeout value itself is not in question — only the "blocks first paint even on the happy path" pattern | P3 | E2 (`AppBootstrap.tsx` catalogue effect + render gate, `catalogueService.ts`'s sequential `getDoc`-then-`getDocs` chain) | OPEN |
| PERF-QA-003 | Every single practice/exam answer submission triggers, for a signed-in user: a full local `AsyncStorage` write of the entire `UserData` object, plus **three** separate Firestore writes (`syncUserData`'s full-object write re-stamping every `learningProgress` entry with a fresh `serverTimestamp()`, `syncUserProgress`'s overlapping-field write to a second document, and `syncLearningItemProgress`'s correctly-scoped single-item write) — the first two are largely redundant with the third for this specific event. All four operations are fire-and-forget; independently confirmed there is **no responsiveness/jank impact** — this is a resource/network/battery/Firestore-quota efficiency concern, not a perceived-lag concern. `learningProgress`'s size is bounded by the total content catalogue (not literally unbounded, per independent review's correction) but is meaningfully larger than the codebase's other explicitly-capped fields (e.g., `practiceHistory`'s 30-entry cap), and the redundant writes' cost scales with it | P2 | E2 (`useUserProgress.ts` `updateAndPersist` L132-144, `recordAnswer` L206-291; `firestore.ts` `syncUserData` L112-140, `syncUserProgress` L142-162, `syncLearningItemProgress` L165-196) | OPEN |
| PERF-QA-004 | `sprig-mascot.png` (~1.05MB) is a large referenced/bundled raster image used across multiple screens (Home, onboarding, practice, auth, profile) for what is typically a modest on-screen mascot display size. Independent review corrected an initial miscount: only this one image is actually referenced — `sprig-mascot-idle.png` (~1.2MB) and `sprig-mascot-idle-polished.png` (~1.6MB) are both confirmed unreferenced (zero runtime/bundle impact, not Performance findings); the app's real bundled "idle" asset is the smaller `sprig-mascot-idle-transparent.png` (~478KB) | P4 | E2 (file size + grep-verified reference check, independently re-verified) | OPEN |

Findings were not padded to fill severity quotas — this is the complete set found with real, distinct, deterministic evidence at this depth.

## Independent review

**`code-reviewer` — ADJUST.** Independently re-traced all four call chains against source. Confirmed PERF-QA-001 is real but found it occurs *three* times, not two (corrected above; severity/score unaffected — reviewer judged the additional occurrence "önemsiz," not warranting a score change). Confirmed PERF-QA-002's characterization as fair. Confirmed PERF-QA-003's full call chain precisely, including the exact `serverTimestamp()` re-stamping mechanism, and confirmed no responsiveness impact — but corrected an overstatement: `learningProgress` is bounded by total catalogue size, not literally "unbounded," which has been corrected in the finding text without changing its severity (the core redundant-writes-on-every-answer defect stands). Found and corrected a genuine file-identification error in PERF-QA-004: an initial grep miscounted `sprig-mascot-idle.png` as referenced due to a filename-substring overlap with the actually-referenced `sprig-mascot-idle-transparent.png` — only one large image (`sprig-mascot.png`) is truly bundled; the deduction was kept at the same weight since the corrected single-image evidence still supports it. Also flagged (out of this audit's scope) that `updateAndPersist`'s network side-effects are embedded inside a `setUserData` updater function, technically violating React's updater-purity contract — noted as a related-but-out-of-scope code-quality observation, not scored here. No score/severity inflation, no premature-optimization bias, no debug-runtime-presented-as-release-performance, and no static-inference-presented-as-measured-jank were found. The numeric ledger (80/100) was confirmed acceptable as-is; only finding text required correction.

## Strongest area

UI rendering/navigation responsiveness and lifecycle/background efficiency (both near-full marks): no demonstrated re-render, expensive-computation, unbounded-accumulation, or polling-loop defect was found anywhere in the journeys and hooks inspected. All persistence/network operations on the practice hot path are correctly fire-and-forget, meaning the app's perceived responsiveness is never blocked by any of the resource-efficiency findings below.

## Weakest area

Practice/exam interaction hot path and storage/serialization efficiency, both driven by PERF-QA-003: the app's single highest-frequency interaction (every answer, in every practice session and exam) performs three separate Firestore writes and one full local write, where one correctly-scoped write would suffice for the specific event, with cost scaling as a user's engagement with the content catalogue grows.

## Known measurement limitations

- No release-like build was available this session — every finding is static (E2), not runtime-measured (E3/E4). Absolute timing, FPS, memory, or startup-millisecond figures were deliberately not fabricated.
- Warm launch/resume and app background→foreground journeys were not deeply traced this pass (marked NOT VERIFIED in `PERFORMANCE_MATRIX.md`) — UNKNOWN, not treated as FAIL.
- Deeper runtime memory-leak measurement was not performed; static lifecycle/cleanup evidence (reused as already-established fact, not score, from RELIABILITY-001-BASELINE's own async-race review) found no obvious leak pattern, but this is not equivalent to a measured guarantee.

## Historical reconciliation (performed last, against `.audit/state/FINDING_REGISTRY.md`, read-only)

No performance-related historical findings exist in the registry — this is the first Performance-domain audit for this project. No historical registry file was modified.

## Final validation

- `git diff -- src`: empty
- `git diff -- tests`: empty
- `git status --short`: only pre-existing untracked/modified audit-artifact and asset files (no application source or test changes). A stray malformed-path artifact accidentally created by a review subagent in the repo root was found and removed as tooling cleanup (not application source/test content).
