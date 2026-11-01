# Production Firebase Environment

## Required variables (source-derived, exhaustive — from `src/services/firebase.ts` in the clean exact-SHA worktree)

| Variable | Required | Production presence | Verification method | Notes |
|---|---|---|---|---|
| `EXPO_PUBLIC_FIREBASE_API_KEY` | YES | **NOT VERIFIED** | Would require `eas env:list --environment production` against a linked project | Blocked — no EAS project linked (see `02_EAS_ACCOUNT_PROJECT.md`) |
| `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN` | YES | **NOT VERIFIED** | Same | Same |
| `EXPO_PUBLIC_FIREBASE_PROJECT_ID` | YES | **NOT VERIFIED** | Same | Same |
| `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET` | YES | **NOT VERIFIED** | Same | Same |
| `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID` | YES | **NOT VERIFIED** | Same | Same |
| `EXPO_PUBLIC_FIREBASE_APP_ID` | YES | **NOT VERIFIED** | Same | Same |

No other `EXPO_PUBLIC_*` variable is referenced anywhere in `src/` (confirmed by grep in the clean worktree) — this list is exhaustive.

No value was printed or inspected for any variable, present or not — only presence/absence was to be checked, and even that could not be performed.

## Firebase project consistency

**NOT VERIFIED.** EAS's per-project environment configuration cannot be queried without a linked EAS project (see `02_EAS_ACCOUNT_PROJECT.md`). The intended Firebase project is known from `.firebaserc` (`lingorise-65cb1`) and from the live-hosted Privacy Policy's own deployment target, but this is the app's Firebase project identity, not proof of what an EAS production build's environment variables would resolve to.

## Production Firebase status (Section 13 exit gate)

**NOT VERIFIED** — cannot reach a VERIFIED/PARTIAL/INVALID determination because the prerequisite EAS project linkage does not exist. Per Section 13: "If any required key is missing: STOP before production build." No key's presence could even be checked, which is a stronger blocking condition than a single missing key — this is reported honestly as NOT VERIFIED, not inferred as PASS from the local `.env`/GitHub Actions repository variables (which are separate configuration surfaces, per the same reasoning already documented in Sprint 3's `06_FIREBASE_PRODUCTION_ENV.md`).
