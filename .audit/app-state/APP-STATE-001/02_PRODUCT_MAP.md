# 02 — Current Product Map

| FEATURE | USER CAN DO WHAT | ENTRY SCREEN | STATUS | DATA SOURCE | PERSISTENCE | AUTH REQUIRED | OFFLINE | TEST COVERAGE | NOTES |
|---|---|---|---|---|---|---|---|---|---|
| Onboarding | 4-step goal/level setup, guest-or-account fork | OnboardingScreen | COMPLETE | Local | AsyncStorage | No | Yes | Moderate | — |
| Meaning-Match practice | Pick correct Turkish meaning for an English word | PracticeScreen | COMPLETE for A1/A2; **WORKING BUT PARTIAL** for B1–C2 (content-starved) | Local content + Firestore override | AsyncStorage + Firestore | No | Yes | Strong | — |
| Pick-the-Word (reverse) | Pick correct English word for a Turkish meaning | PracticeScreen (toggle) | COMPLETE for A1/A2 | Same as above | Same | No | Yes | Strong | Runtime transform of same session |
| Level Exam | 60Q exam, ≥83% to pass, unlocks next level | PracticeHubScreen → PracticeScreen | COMPLETE for A1/A2; **NOT IMPLEMENTED in practice** for B1–C2 (pool &lt;50, can't seat) | Same | AsyncStorage + Firestore | No | Yes | Strong | Uncapped retries |
| XP / Garden progress | Earn XP, watch garden grow (1-5 stage) | HomeScreen | COMPLETE | Domain calc | AsyncStorage + Firestore | No | Yes | Strong | Garden stage decoupled from raw XP by design |
| Daily streak | Maintain a day-over-day streak | HomeScreen | COMPLETE | Domain calc | AsyncStorage + Firestore | No | Yes | Strong | Clock-anomaly resilient |
| Daily quests | Complete practice/review quest for bonus XP | HomeScreen | COMPLETE | Domain calc | AsyncStorage + Firestore | No | Yes | Strong | Day-boundary aware merge |
| Badges/achievements | Unlock badges from XP/streak/exam milestones | ProgressScreen | COMPLETE | Domain calc | AsyncStorage + Firestore | No | Yes | Moderate | One badge repurposed after mechanic retired |
| Favorites/word notebook | Bookmark words, review list | ProgressScreen | WORKING BUT PARTIAL (no dedicated tests/domain module) | Local toggle | AsyncStorage + Firestore | No | Yes | Weak | Logic lives in UI component |
| Guest mode | Full app use with no account | Onboarding fork | COMPLETE | Local | AsyncStorage | No | Yes | Moderate | — |
| Email/password auth | Register/login/logout/reset/verify/delete | AuthScreen, ProfileScreen | IMPLEMENTED BUT UNVERIFIED (no automated SDK-flow tests) | Firebase Auth | Firebase | Yes (for these actions) | No (needs network) | Weak | Only error-mapping is unit tested |
| Multi-device sync | Progress merges correctly across devices on sign-in | Automatic on sign-in/refresh | COMPLETE | Firestore merge | Firestore | Yes | Partial (merges on reconnect only) | Strong | Largest test block in suite |
| Profile/settings | Name, avatar, language, sound, motion, notifications, data export/import/reset | ProfileScreen | COMPLETE | Local + Firestore | AsyncStorage + Firestore | Partial | Yes | Weak (mostly untested) | No dark mode |
| Daily reminder notification | Local push reminder at set hour | ProfileScreen toggle | WORKING BUT PARTIAL (no tap/deep-link handling) | Local (expo-notifications) | AsyncStorage flag | No | Yes | None found | Disabled gracefully in Expo Go |

## Product summary
LingoRise is a local-first React Native/Expo English-vocabulary trainer for Turkish speakers, built around a two-mode practice engine (meaning-match and its reverse), a well-engineered gamification layer (XP/streak/quests/badges) with genuinely conflict-resolving multi-device sync, and full guest/account parity. The core mechanics, sync engine, and reliability plumbing are production-grade and heavily regression-tested (422 passing tests). The single biggest gap between the app's *claimed* scope (A1–C2 CEFR coverage) and its *real* scope is content: only A1 and A2 have enough vocabulary to be usable; B1 through C2 exist as fully wired but nearly empty shells.
