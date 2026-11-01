See 03_SCREEN_INVENTORY.md "User journeys" section for the full fresh-install / guest / signed-in / returning-user narratives reconstructed directly from `AppBootstrap.tsx`, `AppNavigator.tsx`, `useAppSession.ts`, and `OnboardingScreen.tsx`. Duplicated here only as a pointer to avoid drift between two copies of the same evidence.

Key facts not to lose:
- Navigation is a hand-rolled `ScreenType` state machine, not React Navigation.
- Onboarding's "Ready" step is the fork point for guest vs. account creation.
- A returning user with a persisted `activeSession` resumes directly into an in-progress practice question rather than landing on the dashboard.
- Guests never touch Firestore at all (the merge block is gated `if (user)`).
