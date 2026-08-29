# ARCHITECTURE-001-BASELINE — Dependency Direction & Change-Scenario Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Dependency direction (E2, grep-verified)

| Direction checked | Finding | Status |
|---|---|---|
| UI (screens) → domain/service | Screens receive data via props from `state/` hooks; zero direct Firebase/AsyncStorage imports in `src/screens/` | PASS |
| domain → UI | Zero React imports found in `src/domain/` | PASS |
| service → screen | No service imports a screen | PASS |
| storage → UI | `storage.ts` has no UI imports | PASS |
| shared utility → feature-specific module | `src/utils/*` are generic (clock, logger); no feature-specific reach-in found | PASS |
| feature A → feature B internals | Zero cross-feature imports found via grep | PASS |
| circular module relationships | None found in the areas checked (domain↔services, storage↔firestore) | PASS |
| domain relies on React/Expo | Zero — confirmed pure | PASS |
| services own business rules that belong in domain | Mostly no — `firestore.ts` correctly delegates merge logic to `domain/learning/mastery.ts`'s `mergeLearningProgress`. Exception: `syncUserData`/`syncUserProgress`/`mergeAndSyncUserData` each independently decide which fields constitute "progress" — a schema-ownership gap more than a business-rule leak (see ARCH-QA-001) | PARTIAL |
| screens bypass established state/domain boundaries | Two exceptions found: `AccountManagementCard.tsx`, `DataManagementCard.tsx` reach directly into `services/firebase.ts`'s raw `auth` instance (and the `firebase/auth` SDK) instead of going through `services/auth.ts` | PARTIAL (ARCH-QA-002) |
| modules reach into each other's implementation details | Not found beyond the above two exceptions | PASS |

## Change-scenario blast-radius walkthrough

| Scenario | Modules that must change | Unrelated screens/services touched? | Domain behavior has a clear home? | Blast radius |
|---|---|---|---|---|
| A. Add a new learning reward | `domain/gamification/badges.ts`, `xp.ts` | No | Yes | LOW |
| B. Change XP formula | `domain/gamification/xp.ts` | No | Yes | LOW |
| C. Add another practice mode | `domain/practice/*`, `useAppSession.ts`, `PracticeScreen.tsx` | Touches 2-3 layers, but each has a clear, expected home | Yes | MODERATE |
| D. Add a new CEFR level mechanic | `content/levels.ts`, `domain/learning/*`, possibly UI | Touches 2-3 layers | Yes | MODERATE |
| E. Change Firestore sync representation | `services/firestore.ts` — but must be changed in **three independent places** (`syncUserData`, `syncUserProgress`, `mergeAndSyncUserData`) with no shared schema to update once | Nominally isolated to one file, but internally fragmented | Partially — the merge/sync *mechanism* has a home, but the *field list* does not | **HIGH** (ARCH-QA-001) |
| F. Change local persistence schema | `storage.ts`'s existing versioned migration pipeline | No | Yes — well-structured, isolated | LOW–MODERATE |
| G. Replace Firebase Auth provider | `auth.ts`, `firebase.ts`, **plus** `AccountManagementCard.tsx` and `DataManagementCard.tsx` (due to their direct Firebase imports) | Yes — two feature components outside the service layer | Mostly — undermined by the two boundary exceptions | **HIGH** (ARCH-QA-002 consequence) |
| H. Add a new profile preference | `types/user.ts`, `storage.ts` defaults, `useUserProgress.ts` setter, `ProfileScreen.tsx`/relevant card | Touches several layers, but each is a small, expected, single-line-per-layer change | Yes | MODERATE (routine, expected pattern for this app) |
| I. Add another gamification mechanic | `domain/gamification/*` | No | Yes | LOW |

## Summary

Dependency direction is clean and correctly layered almost everywhere, with no cycles and no cross-feature coupling. The two HIGH-blast-radius change scenarios (E, G) are both directly explained by this audit's two real findings (ARCH-QA-001, ARCH-QA-002) rather than by the overall architecture style, which is otherwise appropriately simple and well-directed for this project's size.
