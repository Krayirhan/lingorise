# 03 — Screen Inventory &amp; Navigation

Navigation is **hand-rolled**, not React Navigation: `src/state/useAppSession.ts` owns a `ScreenType` string (`"onboarding"|"home"|"practiceHome"|"practice"|"progress"|"profile"`) and `src/app/AppNavigator.tsx` if/else-branches on it. `AuthScreen` is a separate overlay swap controlled by `AppBootstrap.tsx`'s `showAuth` boolean, outside the `ScreenType` enum.

| SCREEN | ROUTE | PURPOSE | ENTRY POINT | WORKING? | LOADING/EMPTY/ERROR | AUTH DEPENDENCY | NOTES |
|---|---|---|---|---|---|---|---|
| Bootstrap loading gate | pre-screen | Splash while auth/catalogue resolve | App root | Yes | ActivityIndicator, two distinct messages | n/a | 8s auth timeout → guest fallback |
| AuthScreen | `showAuth` overlay | Login/register/reset | Profile/Onboarding "add account" | Yes | error/errorField state; no submit spinner found | Optional, has guest bypass | Not part of ScreenType enum |
| OnboardingScreen | `screen==="onboarding"` | 4-step first-run (welcome→goal→level→ready) | Default when `!onboardingCompleted` | Yes | No loading/error (local step state) | No | Android back handled |
| HomeScreen | `screen==="home"` (default) | Garden dashboard, daily quest, recommended word | Post-onboarding default, bottom tab | Yes | No explicit loading/empty guards (sync local vm) | No | Modals: WordDetailModal, QuestHistoryModal |
| PracticeHubScreen | `screen==="practiceHome"` | Configure/start session or exam | Bottom tab "practice" | Yes | CTA hidden/disabled when level fully learned (CORE-004 fix) | No | 480 lines |
| PracticeScreen | `screen==="practice"` | Answer one question, session progress | From Home/PracticeHub/word-tap | Yes | audioError state; exit-confirm dialog | No | Badge-unlock overlay renders here |
| ProgressScreen | `screen==="progress"` | XP/streak/mastery, topic breakdown, notebook, badges | Bottom tab "progress" | Yes | Empty-safe defaults (`[]`) for lists | No | Android back handled |
| ProfileScreen | `screen==="profile"` | Account, preferences, data reset, dev tools | Bottom tab "profile" | Yes | No loading/error state | Partial (guest-usable) | Dev-only card renders nothing in release |
| **GameScreen** | none | dead 1-line re-export of PracticeScreen | none | **Not reachable** | n/a | n/a | Zero importers anywhere in `src/` — orphan file |

**Total screens in `src/screens/`: 8. Reachable: 7. Orphan: 1 (GameScreen.tsx).**
No `features/*/screens` folders exist — features only hold components/hooks/types.

## User journeys (from code, not docs)

**Fresh install:** `App.tsx` → `AppBootstrap` (auth listener + 8s timeout fallback to guest, catalogue load) → hydrated → `AppNavigator` → `useAppSession` picks `"onboarding"` (since `!onboardingCompleted`) → 4 steps (Welcome→Goal→Level→Ready) → Ready step forks guest vs. create-account → `completeOnboarding()` + `goToHome()` → HomeScreen.

**Guest journey:** `authUser` stays `null` permanently; `AppBootstrap`'s Firestore-merge block only runs `if (user)`, so guests never touch Firestore. All screens work off local AsyncStorage via `useUserProgress`. Profile always offers an "add account" upsell.

**Signed-in journey:** Ready-step "create account" or Profile's "add account" → `AuthScreen` overlay → on success, `onAuthStateChanged` fires → `AppBootstrap` rolls local data to today, merges via `mergeAndSyncUserData`, saves, calls `refresh()`. Merge failures are caught and surfaced as a toast, not swallowed.

**Returning user:** `onAuthStateChanged` resolves (user or null); `onboardingCompleted` already true so onboarding is skipped. If `userData.activeSession` was persisted, the app resumes directly into `"practice"` at the saved question index instead of showing the dashboard.
