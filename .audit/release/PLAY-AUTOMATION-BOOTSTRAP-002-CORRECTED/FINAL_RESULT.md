# PLAY-AUTOMATION-BOOTSTRAP-002-CORRECTED — FINAL RESULT

## Status

**PASS**

## Account map (confirmed throughout)

Firebase / Google Cloud: `studioskrayirhan@gmail.com` → `lingorise-65cb1`
Google Play: `studioskrayirhan@gmail.com` → LingoRise / `com.lingorise.app`
Expo/EAS: `fusturan@gmail.com` → `mfurkant` / `@mfurkant/lingorise`
Cross-account automation: **VALID**

## Android Publisher API

**ENABLED** on `lingorise-65cb1`.

## Service account

`lingorise-play-submit@lingorise-65cb1.iam.gserviceaccount.com` — dedicated, least-privilege where the Play Console UI's own permission model allowed granularity, no Cloud IAM Owner/Editor role ever granted for this purpose.

## Play package access

**VERIFIED.** The earlier `403 PERMISSION_DENIED` responses (across two separate resume points, ~30+ minutes total) were confirmed to be Google's own documented permission-propagation delay, not a configuration defect — access succeeded on the very next test with zero configuration change in between.

## Service account key

**CREATED SECURELY**, once — `D:/lingorise-secure/google-play-service-account.json`, outside every Git repository, never tracked, never printed, never committed.

## EAS Google Play service credential

**CONFIGURED** — uploaded via the user's own interactive `eas credentials --platform android` session (this sandboxed session cannot drive that TUI at all); independently reconfirmed live during the actual submit run ("Google Service Account Key already set up", correct email, stored on EAS's own servers, never in this repository).

## AAB

SHA-256 `62c8a47609e3fb5d24833bd5f42fa09e16f998d793bb3a2af8563397651f62e6` — verified unchanged at every check this run. **Not rebuilt.**

## Automated submission

**PASS.** `eas submit --platform android --profile production --path D:/lingorise-release-artifacts/lingorise-production-a9d0a048.aab --non-interactive` succeeded. Submission ID `8c1130bf-fcae-4b06-b035-797122527f47`. **No manual AAB upload was ever performed at any point in this program.**

## Google Play result — independently verified via the Android Publisher API directly (not merely trusted from EAS's success message)

Package `com.lingorise.app`, track `internal`, release `0.1.0` / versionCode `2`, status `completed` — confirmed live on Google's own servers.

## Play App Signing

**NOT VERIFIED** (a direct API query hit a routing issue, not a permissions signal; non-blocking, does not affect the release's validity).

## Production rollout

**NO** — internal testing only, as required. No production, closed, or open track was touched.

## Git / Source State

No change this turn. Total across the whole bootstrap program: 2 merged PRs (#12 EAS project linkage, #13 submit-track config), both via protected branch → CI → normal merge, no direct push to `main`, no bypass. Current exact main SHA (unchanged from the prior turn): `578c6a49b4e818e2b91beb780eaa77ba39a6cd48`.

## Manual intervention this run

Cleaned up two ad-hoc Android Publisher API "edit" objects created purely for read-only verification purposes (`edits.insert` → immediately `edits.delete`) — standard, reversible, no persisted state left on Google's side beyond the actual real submission itself.
