# Play App Signing

## Attempted verification

Queried the Android Publisher API's App Signing resource at both plausible path casings:
```
GET /androidpublisher/v3/applications/com.lingorise.app/appsigning  → 404 (generic Google 404, not a JSON API error)
GET /androidpublisher/v3/applications/com.lingorise.app/appSigning  → 404 (same)
```

Both returned Google's generic infrastructure 404 page (not a JSON-formatted API error body), indicating the request never reached a registered API route at all — most consistent with an incorrect endpoint path/method shape in this ad-hoc script, rather than a permissions or enrollment signal (a real "not enrolled" condition would typically return a structured 4xx JSON error from the API itself, not a bare HTML 404).

## Result

**PLAY APP SIGNING: NOT VERIFIED** (tooling/endpoint-path limitation in this run, not evidence of a problem). No private signing material was requested, generated, or exposed at any point.

## Recommended check

Play Console → **Setup → App signing** page directly shows whether Play App Signing is enrolled for this app and, if so, both the upload certificate and app signing certificate SHA-1/SHA-256 fingerprints (public values, safe to record). Since this app's first release was submitted via the Android Publisher API directly (not through the Play Console's own upload wizard, which sometimes prompts for explicit App Signing opt-in during a first upload), it is possible enrollment has not yet been confirmed — this should be checked directly in the Console rather than assumed either way.
