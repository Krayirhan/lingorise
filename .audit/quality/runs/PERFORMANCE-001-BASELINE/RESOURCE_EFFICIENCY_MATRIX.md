# PERFORMANCE-001-BASELINE — Resource Efficiency (Storage / Network / Assets / Memory)

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Storage (AsyncStorage)

| Operation | Frequency | Payload scope | Concern |
|---|---|---|---|
| `saveUserData()` | Every `updateAndPersist` call — i.e., every answer, every setting change, every quest/badge update | Full `UserData` object, `JSON.stringify`'d whole | PERF-QA-003 — full-object write for a single-field-scale event, unbounded `learningProgress` growth |
| `loadUserData()` | Once per `useUserProgress` mount; a second, duplicate time inside `AppBootstrap`'s signed-in auth-state handler | Full stored blob + full migration pipeline (`normalizeUserData`) | PERF-QA-001 — duplicated read+migration work on the signed-in cold-start path |
| `clearAllLocalData()`/`resetUserData()` | User-initiated only (reset action) | N/A | Not a frequency concern — already covered by RELIABILITY-001-BASELINE's REL-QA-003 (silent-failure angle, not performance) |

## Network / Firebase

| Operation | Trigger | Frequency | Payload | Concern |
|---|---|---|---|---|
| `syncUserData()` | Every `updateAndPersist` call (signed-in only) | Every answer/setting change | Full `UserData`, every `learningProgress` entry re-stamped | PERF-QA-003 |
| `syncUserProgress()` | Same as above | Same | Curated subset, overlaps `syncUserData()`'s fields | PERF-QA-003 |
| `syncLearningItemProgress()` | Every answer (signed-in only) | Every answer | Single item — correctly scoped | No concern — this is the appropriate pattern the other two writes should have followed |
| `loadCatalogue()` | App bootstrap + level change | Low frequency (not per-navigation, not per-question) | One `contentMeta` doc read + one filtered `items` query per level | No concern — correctly cached (`AsyncStorage` cache layer) and bundled-fallback; not re-fetched on ordinary navigation |
| `fetchUserData()` | `refresh()` only (pull-to-refresh, sign-in) | Low, user-initiated | Single document read | No concern |

No duplicate catalogue re-fetching on ordinary navigation was found. No request-waterfall pattern was found outside the already-documented `loadCatalogue()` sequential meta-then-items chain (which is a single extra round-trip, not a chain of many, and already has cache/bundled fallbacks).

## Assets

| Asset | Size | Referenced? | Concern |
|---|---|---|---|
| `sprig-mascot.png` | ~1.05MB | YES — `GardenHeroCard.tsx`, onboarding steps (`GoalStep`/`WelcomeStep`/`LevelStep`/`ReadyStep`), `PracticeMascot.tsx`, `AuthScreen.tsx`, `PracticeHubScreen.tsx`, `ProfileScreen.tsx` | PERF-QA-004 — a large raster for what is typically a modest on-screen mascot display size |
| `sprig-mascot-idle-transparent.png` | ~478KB | YES — the actual referenced "idle" variant (confirmed by independent review; an initial substring-grep miscounted a same-prefix filename as referenced — corrected here) | Smaller; not separately flagged |
| `sprig-mascot-idle.png` | ~1.2MB | **NO — zero references anywhere in `src/` or `app.json`, confirmed by independent review** (an initial grep pass incorrectly counted this as referenced due to substring overlap with `sprig-mascot-idle-transparent.png`'s filename) | **Not a Performance finding** — unreferenced, not bundled by Metro, zero runtime impact. Repo-hygiene observation only |
| `sprig-mascot-idle-polished.png` | ~1.6MB (largest file in `assets/`) | NO — zero references found anywhere in `src/` or `app.json` | **Not a Performance finding** — same reasoning as above |
| `lingorise-app-icon.png` | ~1.2MB | YES — `Brand.tsx`, `app.json` | App icon source; not a runtime-decode concern in the same way as an in-screen mascot (icon generation happens at build time, not app runtime) |

**Correction note:** the initial draft of this matrix incorrectly listed two large referenced mascot images (`sprig-mascot.png` and `sprig-mascot-idle.png`). Independent review confirmed only **one** large image (`sprig-mascot.png`, ~1.05MB) is actually referenced and bundled; the app's real "idle" on-screen asset is the smaller `sprig-mascot-idle-transparent.png` (~478KB). There are now two confirmed-unreferenced large mascot files in the repo (`sprig-mascot-idle.png`, `sprig-mascot-idle-polished.png`) — both are repo-bloat observations with zero runtime cost, not Performance findings.

## Memory / resource lifecycle

Listener/subscription cleanup was already verified (as facts, not scores, reused from RELIABILITY-001-BASELINE's own async-race review) to be correctly paired in every case checked: `onAuthStateChanged` unsubscribe, deep-link listener `.remove()`, auth-timeout `clearTimeout` — all returned as effect cleanup functions. No unbounded in-memory accumulation pattern was found (telemetry ring buffer is explicitly capped at 200 events; `practiceHistory` is capped at 30 entries). No credible memory-leak finding resulted from this pass's scope. Deeper runtime memory measurement was not performed (no release build available) — marked NOT VERIFIED rather than assumed clean beyond what static evidence supports.

## Background work

Notification scheduling (`scheduleDailyReminder`/`cancelDailyReminder`) fires once per relevant state change, not on a repeating poll. No `setInterval`-based polling loop was found anywhere in the areas inspected. Telemetry writes are already covered under Storage above.
