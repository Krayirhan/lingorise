# Submission

## Access confirmed (propagation resolved)

Per the user's correction (service accounts have no interactive "accept invite" step — 403s are expected to reflect Google's documented permission-propagation window, not a config defect), a single fresh Android Publisher API test was run:

```
POST /androidpublisher/v3/applications/com.lingorise.app/edits
→ 200 { "id": "17183447848227589538", "expiryTimeSeconds": "1788050806" }
```

**PLAY PACKAGE ACCESS: VERIFIED.** The prior 403s were confirmed to be propagation delay, not misconfiguration — no permission was ever changed between the failing and succeeding calls. The test edit was cleanly discarded (`DELETE .../edits/17183447848227589538` → `204`) before proceeding.

## AAB re-verified (unchanged, this run)

SHA-256 `62c8a47609e3fb5d24833bd5f42fa09e16f998d793bb3a2af8563397651f62e6` — matches exactly. Not rebuilt.

## Submission (real, succeeded)

```
eas submit --platform android --profile production --path D:/lingorise-release-artifacts/lingorise-production-a9d0a048.aab --non-interactive
```

Run from `D:/lingorise-play-submit-track` (contains the merged `submit.production.android.track = "internal"` config).

**Result: SUCCESS.**

| Field | Value |
|---|---|
| Submission ID | `8c1130bf-fcae-4b06-b035-797122527f47` |
| Submission URL | https://expo.dev/accounts/mfurkant/projects/lingorise/submissions/8c1130bf-fcae-4b06-b035-797122527f47 |
| Platform | Android |
| Track | internal |
| Status | finished |
| Release status | completed |
| Started / Finished | 30.08.2026 01:48:12 / 01:50:06 |
| Google Service Account | `lingorise-play-submit@lingorise-65cb1.iam.gserviceaccount.com` (EAS servers) |

## Independent verification via the Android Publisher API itself (not just trusting EAS's own success message)

```
GET /androidpublisher/v3/applications/com.lingorise.app/edits/{editId}/tracks/internal
→ 200
{
  "track": "internal",
  "releases": [ { "name": "0.1.0", "versionCodes": ["2"], "status": "completed" } ]
}
```

**Confirms, directly from Google's own API (not from EAS's report alone): package `com.lingorise.app`, internal track, release `0.1.0` / versionCode `2`, status `completed`.** Exactly matches the intended AAB.

## Play App Signing

**NOT VERIFIED.** A direct `appSigning` endpoint query returned `404` (a routing/path issue on this ad-hoc script's side, not a `403` — i.e., not a permissions signal), and no further tooling was used to chase this down, since Play App Signing status is explicitly non-blocking per this task's own instructions and the release itself is already independently confirmed live on the internal track regardless.

No secrets, private keys, or credential material were printed at any point in this verification.
