# Firebase Production Environment

## Required variable names (source-derived, exhaustive)

Confirmed by direct read of `src/services/firebase.ts` — these are the only 6 environment variables the app's Firebase initialization reads, and no other `EXPO_PUBLIC_*` variable appears anywhere in `src/`:

- `EXPO_PUBLIC_FIREBASE_API_KEY`
- `EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN`
- `EXPO_PUBLIC_FIREBASE_PROJECT_ID`
- `EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET`
- `EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID`
- `EXPO_PUBLIC_FIREBASE_APP_ID`

## Production presence

**NOT VERIFIED.**

No authenticated EAS session exists (`eas whoami` → "Not logged in"), so the EAS production build environment's variable set cannot be inspected from this environment. `eas.json` itself does not declare inline `env` values for the `production` profile (EAS environment variables for this project, if configured, live in the EAS dashboard/EAS Environments feature — external to this repo's committed files).

This repository's local `.env` file was intentionally NOT read or output by this sprint (per this project's own `CLAUDE.md` security rule: never display `.env` contents), and even if it had been, **a local `.env` file's presence proves nothing about the separate, remotely-configured EAS production environment** — Section 12's own instruction explicitly forbids claiming VERIFIED from local `.env` alone. CI's `android-build`/`e2e-smoke` jobs write their own `.env` from GitHub Actions repository *variables* (`vars.EXPO_PUBLIC_FIREBASE_*`, confirmed non-secret by design — these are Firebase Web client identifiers, not credentials, consistent with `.env.example`'s own framing and this project's `CLAUDE.md`) — this confirms those 6 values exist as **GitHub repository variables**, which is a separate configuration surface from EAS's own production environment. Their presence in GitHub Actions does not prove their presence in EAS.

## Project identity consistency

Not verifiable without EAS/production access to compare against `.firebaserc`'s `lingorise-65cb1` project id.

## Runtime/build verification

Not performed — no production build was generated this sprint (see `04_EAS_PRODUCTION_CONFIG.md`, `05_SIGNING_AND_ARTIFACT_PROVENANCE.md`).

## Missing variables

Unknown — cannot be determined without EAS production environment access.

## RELEASE-QA-004 recommendation

**NOT VERIFIED.** Consistent with RELEASE-001-BASELINE's own classification (a conditional, not-yet-provable external requirement) — this sprint neither closes nor newly fails it; no evidence exists either way, and per the project's own severity philosophy (`P1_GATE_ADJUDICATION.md`), UNKNOWN is never silently upgraded to PASS. Recorded as an EXTERNAL / USER-AUTHORIZATION GATE item requiring the project owner's own EAS session to resolve — see `13_RESIDUAL_EXTERNAL_CONDITIONS.md`.
