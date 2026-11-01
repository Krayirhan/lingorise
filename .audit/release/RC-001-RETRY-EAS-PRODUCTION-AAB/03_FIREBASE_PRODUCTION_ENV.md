# Firebase Production Environment

## Required variables (re-verified independently from source, this run)

`grep`'d fresh in the new worktree's `src/services/firebase.ts` — identical 6-variable set as every prior run, exhaustive (no other `EXPO_PUBLIC_*` reference anywhere in `src/`):

`EXPO_PUBLIC_FIREBASE_API_KEY`, `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`, `EXPO_PUBLIC_FIREBASE_PROJECT_ID`, `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`, `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`, `EXPO_PUBLIC_FIREBASE_APP_ID`.

Required: **6**

## Before

`eas env:list production` (project `@mfurkant/lingorise`): "No variables found for this environment."

Before: **0 / 6**

## Authoritative value source

Values were obtained from the LingoRise Firebase project's own **Web App** SDK configuration (`firebase apps:list --project lingorise-65cb1` → identified the registered "LingoRise Web Config" web app; `firebase apps:sdkconfig web <appId> --project lingorise-65cb1` → returned the authoritative client config) — this is exactly source #3 of the explicitly authorized list ("official Firebase CLI/config for project lingorise-65cb1"). No value was invented, guessed, or taken from any other project. This is the same Firebase project (`lingorise-65cb1`) already used by the app's committed source, by `.firebaserc`, and by the already-live Privacy Policy hosting.

## Created (names only, per Section 11's explicit "never record actual values" instruction)

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

Created via `eas env:set production --name <NAME> --value <value> --type string --visibility plaintext --scope project --environment production --non-interactive`, scoped to `@mfurkant/lingorise` only, one command per variable, each independently confirmed with a `Created variable <NAME> on project @mfurkant/lingorise.` response.

**Visibility: `plaintext`** — chosen because these are Firebase Web SDK client-config values, inlined into the JS bundle at build time and never treated as server secrets anywhere in this project's established security model (access control is enforced by `firestore.rules`, not by hiding these values — consistent with every prior sprint's own documented threat model). No genuine secret (service-account key, admin credential, private key) was ever created or handled.

## After

`eas env:list production` re-run: all 6 names present.

After: **6 / 6**

## Firebase project identity

`EXPO_PUBLIC_FIREBASE_PROJECT_ID` value corresponds exactly to `lingorise-65cb1` — matches the intended Firebase project. All 6 values originate from the same single Firebase Web App registration (`1:891698533974:web:...`) under project `lingorise-65cb1`, confirmed structurally consistent (shared `projectNumber`/`messagingSenderId` = `891698533974` across the fetched config).

**Firebase project: `lingorise-65cb1`**
**Firebase project identity: VERIFIED**

## Production env → production profile connection

`eas.json`'s `production` build profile does not declare a distinct EAS "environment" name, so it resolves to the default `production` EAS environment — the same environment these 6 variables were just created in. This is the standard, default EAS behavior (a build profile without an explicit `environment` field uses the environment matching its own name when one of the three default environments — `production`, `preview`, `development` — matches the profile name, which it does here). No separate environment-to-profile mapping override exists in `eas.json` to contradict this.

## Status

**Production Firebase environment: VERIFIED**
