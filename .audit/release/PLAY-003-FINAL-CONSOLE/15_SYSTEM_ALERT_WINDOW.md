# SYSTEM_ALERT_WINDOW Removal — Final Gate

## Source fix

Removed from `android/app/src/main/AndroidManifest.xml`. Branch `fix/remove-system-alert-window`, commit `ed2d528`, PR #14, merged (merge commit `49057328a3ba2ddccb815732c501b0063482de96`). Root cause was a direct first-party manifest declaration, not a transitive dependency.

Confirmed still absent on current main (`68904b7e27ba5258521a3f9d14028ae622d9895b`):
```
grep -rn "SYSTEM_ALERT_WINDOW" android/app/src/main/AndroidManifest.xml
→ no match (ABSENT)
```

## Artifact-level verification (source-only is not sufficient — this run's gate)

Source removal alone does not prove the permission is absent from what actually ships — a transitive dependency's manifest could reintroduce it during manifest merging. Verified directly against the real replacement `.aab` (build `a22b0c74-2bd2-4372-a1b9-87fca3ba006f`, versionCode 4) using `bundletool dump manifest --bundle=vc4.aab`:

- Merged manifest package: `com.lingorise.app`
- `versionCode="4"`, `targetSdkVersion="36"`, `minSdkVersion="24"`
- `SYSTEM_ALERT_WINDOW`: **absent** from the fully merged manifest actually inside the shipped bundle

Artifact SHA-256: `4ea7e7788cec9c9cdd5dcd562b598f69a2dc6335f88cb5fe48991f49ed52d0a7`

## Status

**PASS — artifact-verified, not source-only.** Gate satisfied for both PR #14 and the replacement release built from post-PR15 main.
