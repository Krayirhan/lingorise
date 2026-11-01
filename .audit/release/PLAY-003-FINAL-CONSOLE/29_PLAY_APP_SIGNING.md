# Play App Signing

## Definitive check this run

Earlier attempts (this session and prior ones) guessed at an `appsigning` GET path and got a raw Google infrastructure 404 — ambiguous, since a same-class path mistake on the *images* endpoint (`24_STORE_API_DEPLOYMENT.md`) turned out to be fixable. So this time the check was made authoritative: fetched the Android Publisher API v3's own live discovery document (`GET https://androidpublisher.googleapis.com/$discovery/rest?version=v3`) and enumerated every method under the `appsigning` resource directly from Google's own machine-readable API definition.

**Result: the `appsigning` resource contains exactly two methods — `enrollApp` and `rotateAppSigningKey` — both POST, both write-only, both scoped to the self-hosted Cloud KMS enrollment path (not standard Play App Signing). There is no `get`/`list` method anywhere in the API for reading signing certificate fingerprints.** This is a genuine, confirmed API limitation, not a path mistake — Google's own documentation for `enrollApp` says so explicitly: "Standard enrollment with Google-generated or Google-managed keys cannot be done via API."

No enrollment or rotation call was made (both are destructive/high-consequence, KMS-specific, and this app already went through standard first-release enrollment during its original `eas submit`, not self-hosted KMS enrollment — calling either would be actively wrong).

## Status

**PLAY APP SIGNING: NOT VERIFIABLE VIA API (confirmed structural limitation, not tooling error).** No private key material was requested, generated, or exposed. Owner action: Play Console → **Setup → App signing** to view enrollment status and the public SHA-1/SHA-256 certificate fingerprints directly.
