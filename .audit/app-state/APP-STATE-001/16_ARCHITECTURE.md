# 16 — Architecture &amp; Codebase Hotspots

## Structure
`src/{app,components,content,context,domain,features,i18n,screens,services,state,theme,types,utils}` — clean separation matching CLAUDE.md's stated architecture: `domain/` is pure logic (gamification, learning, practice, review, sync — no RN/UI imports observed), `screens/` compose UI, `features/*` hold component/hook/type bundles per area, `services/` abstract Firebase/storage. 132 TS/TSX files, ~16,730 lines total.

Is the architecture still healthy for LingoRise's size? **Yes** — the domain/screens/features/services boundary is respected in practice (agents found no direct Firebase/Firestore calls from screens/features during this pass), and the codebase is small enough (132 files) that the layering hasn't yet accrued serious cross-module coupling.

## Top hotspot files (largest / most central, not necessarily unhealthy)

| FILE | WHY | RISK | ACTION |
|---|---|---|---|
| `src/state/useUserProgress.ts` (496 lines) | Central hook — auth, sync, quests, reduce-motion, notification toggle all pass through it | Medium coupling; most future features will touch this file | LATER — works, well-commented, candidate for splitting if it keeps growing |
| `src/screens/PracticeHubScreen.tsx` (480 lines) | Screen + level-exhaustion logic + list rendering | Low — recently hardened (CORE-004) | NO |
| `src/features/profile/components/DataManagementCard.tsx` (478 lines) | Export/import/reset UI and logic combined | Low-medium | LATER — could split UI from data ops |
| `src/features/home/components/GardenHeroCard.tsx` (476 lines) | Large single UI component | Low (visual complexity, not logic risk) | NO |
| `src/features/progress/components/WordNotebookModal.tsx` (420 lines) | Large but uses FlatList correctly | Low | NO |

## Dead / legacy code (reference-checked, not assumed)
- `src/screens/GameScreen.tsx` — 1-line re-export of `PracticeScreen`, zero importers anywhere in `src/`. Confirmed dead.
- `isOfflineError` in `src/services/errorReporter.ts` — defined, no call sites found. Likely dead.
- Legacy storage key `@lingorise_user_data_v1` and related migration types are intentionally retained for migration, not dead code.

## Performance
No material issues found: all long lists use `FlatList`; bounded arrays (level enum, session-size options) use plain `.map`; Firestore deletes are properly batched (500/batch via `writeBatch`, not looped single deletes); catalogue loading is timeout-guarded against hangs; retry logic is bounded (max 3 attempts, exponential backoff).
