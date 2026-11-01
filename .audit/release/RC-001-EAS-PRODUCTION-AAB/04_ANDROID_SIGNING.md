# Production Android Signing

**EAS production credentials: NOT VERIFIED.**

`eas credentials` (and any other EAS credentials-inspection command) requires a linked EAS project to operate against — none exists for this app (see `02_EAS_ACCOUNT_PROJECT.md`). No credentials command was run against a guessed/assumed project, since that risks inspecting or acting on the wrong project's credentials.

| Item | Status |
|---|---|
| EAS production credentials exist? | NOT VERIFIED |
| Credential management method (EAS-managed / local / other) | NOT VERIFIED |
| Production keystore available? | NOT VERIFIED |
| Safe certificate metadata/fingerprint | NOT VERIFIED |
| Production signing status | **NOT VERIFIED** |
| Play App Signing | **NOT VERIFIED** (per Section 16, this is expected to remain NOT VERIFIED absent direct Play Console evidence, and is not itself a blocker for AAB generation — it is listed here only because AAB generation itself is separately blocked) |

## Signing distinction maintained

The CI verification APK's debug signing (`android/app/build.gradle`, `signingConfig signingConfigs.debug` on the `release` buildType) is **not** used as a substitute for, or evidence about, EAS production AAB signing anywhere in this document — consistent with Sprint 3's own established distinction (`SPRINT-003-RELEASE-REPOSITORY-HARDENING/05_SIGNING_AND_ARTIFACT_PROVENANCE.md`). No value is inferred; the correct, honest status is NOT VERIFIED for both EAS production signing and Play App Signing.

No keystore file, private key, keystore password, key password, or credential JSON was accessed, generated, or exposed by this run.
