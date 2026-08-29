# Play Console Readiness

No Play Console access, API credential, or service-account tooling is configured in this environment. Every item below is genuinely unverifiable from here — none is inferred, guessed, or defaulted to PASS.

| Item | Status | Note |
|---|---|---|
| App exists in Play Console | NOT VERIFIED | No Console access |
| Package matches (`com.lingorise.app`) | NOT VERIFIED (locally consistent) | Confirmed consistent across `app.json`/`build.gradle`; not cross-checked against an actual Play Console listing |
| Target track readiness | NOT VERIFIED | No Console access |
| versionCode acceptance | NOT VERIFIED | No Console access; local versionCode=1 with EAS `autoIncrement` — see `04_EAS_PRODUCTION_CONFIG.md` |
| Store listing readiness | NOT VERIFIED | No Console access |
| Content rating | NOT VERIFIED | No Console access |
| Data Safety form | NOT VERIFIED | See `18` cross-check below for what the form's answers *should* say given actual app behavior |
| App access declaration | NOT VERIFIED | No Console access |
| Ads declaration | NOT VERIFIED | Source-verified: app contains no ads SDK — the correct declaration is "No ads," but the actual Console submission itself is unverified |
| Account deletion declaration | NOT VERIFIED (component ready) | The required public web surface now exists and is verified reachable (`03_PRIVACY_POLICY_EVIDENCE.md`) — the Console *declaration itself* pointing to it has not been submitted/verified |
| Privacy Policy URL (as configured in Play Console) | NOT VERIFIED | The in-app/actual URL is now correct and live (`https://lingorise-65cb1.web.app/privacy-policy/`); whether this exact URL has been entered into the Play Console listing is unverified |
| Target audience | NOT VERIFIED | No Console access |
| Countries/regions | NOT VERIFIED | No Console access |
| Release notes | NOT VERIFIED | No Console access |
| Play App Signing | NOT VERIFIED | See `05_SIGNING_AND_ARTIFACT_PROVENANCE.md` |

## Data Safety cross-check (source-verified, not marketing-copy-inferred)

Actual data behavior, confirmed by source in this and prior sprints' reaudits:

| Category | Collected? | Evidence |
|---|---|---|
| Account information (email) | YES, if user creates an account | Firebase Authentication (`getAuth`) |
| User IDs | YES | Firebase Auth UID; Firestore documents keyed by UID |
| App activity / learning progress | YES, cloud-synced only for signed-in users | Firestore document per user (`mergeAndSyncUserData`, `PROGRESS_FIELD_STRATEGY`) |
| Diagnostics | NO | No crash-reporting SDK in `package.json` |
| Analytics | NO | No analytics SDK in `package.json` |
| Crash data | NO | No crash-reporting SDK in `package.json` |
| Advertising ID / ads data | NO | No ads SDK in `package.json` |
| Data shared with third parties | NO (beyond the Firebase sub-processor itself) | No third-party SDK found; Firebase is the sole external service |

This table is the evidence-backed basis for what the Play Data Safety form *should* declare — it does not itself constitute a completed or verified Console submission, per Section 18's explicit instruction not to claim COMPLETE without Console access.

## RELEASE-QA-005 recommendation

**NOT VERIFIED**, unchanged from RELEASE-001-BASELINE. The account-deletion *web surface* component of this requirement is now genuinely ready (hosted, live, correctly worded) — a concrete improvement — but the Console *declaration/submission* itself remains an external action requiring Play Console account access not available here. See `13_RESIDUAL_EXTERNAL_CONDITIONS.md`.
