# App Access

## Evidence

- No forced-login gate found anywhere in `src/app/AppNavigator.tsx` or `src/app/AppBootstrap.tsx` (searched for `requireAuth`/mandatory-login patterns — none found).
- Project's own architecture documentation (`CLAUDE.md`) explicitly states: "AsyncStorage ile local-first/guest deneyimi (hesapsız da tam çalışır)" — fully functional without an account.
- Core learning flow (practice sessions, level exams, XP/streak/badges, home/progress screens) is confirmed throughout every prior sprint's own audit trail to work identically for guest and signed-in users — the only difference is whether progress is cloud-synced.
- No premium/paywalled area exists (no IAP SDK, confirmed in `04_ADS.md`'s sibling dependency check).

## Result

**App Access: READY — no special credentials required.** A Play reviewer can install the app and exercise its full core functionality (practice, exams, progress tracking) immediately without creating an account or receiving test credentials. Signing in (optional) unlocks only cross-device cloud sync, not additional reviewable functionality.

No reviewer test credentials need to be prepared or invented.
