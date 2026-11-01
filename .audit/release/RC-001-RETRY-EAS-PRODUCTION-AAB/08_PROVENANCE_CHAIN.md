# Provenance Chain

```
GitHub main SHA (b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4)     [VERIFIED — origin/main, re-fetched post-build, unchanged]
   ↓
fresh clean RC worktree (D:/lingorise-rc1-build-v2)             [VERIFIED — HEAD matches exactly, clean before/after npm ci]
   ↓
EAS project (@mfurkant/lingorise)                               [VERIFIED — project:info matches app.json linkage exactly]
   ↓
project ID (cb13fe89-238a-4a69-9b8e-a128808fc1c6)                [VERIFIED — matches in app.json, project:info, and the build's own `app.id` field]
   ↓
production environment                                          [VERIFIED — 6/6 required Firebase variables present, created from authoritative lingorise-65cb1 source]
   ↓
Firebase project (lingorise-65cb1)                               [VERIFIED — EXPO_PUBLIC_FIREBASE_PROJECT_ID value confirmed, all 6 vars from one consistent Web App registration]
   ↓
production Android signing                                      [PARTIALLY VERIFIED — capability confirmed by build success; certificate fingerprint NOT VERIFIED, tooling limitation]
   ↓
EAS build ID (a9d0a048-2c1e-451d-99b3-4656c021fe21)               [VERIFIED — build:view confirms, status FINISHED]
   ↓
production .aab                                                  [VERIFIED — downloaded, structurally confirmed as a genuine complete AAB]
   ↓
SHA-256 (62c8a47609e3fb5d24833bd5f42fa09e16f998d793bb3a2af8563397651f62e6)  [VERIFIED — computed directly from the downloaded file]
```

## Independent cross-check (the strongest link in this chain)

EAS's own build record (`build:view`, queried independently of this run's own claims) reports `gitCommitHash: b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4` and the exact merge-commit message — this is EAS's own system-recorded provenance, not something this run asserted or could have fabricated. It matches the intended source SHA exactly.

## Result

**AAB PROVENANCE: PARTIAL**

Every link in the chain is independently VERIFIED except the Android production signing certificate's own fingerprint metadata, which is NOT VERIFIED due to a tooling access limitation (interactive-only `eas credentials` command, expired build-log signed URL) — not due to any evidence of a problem. The build's own successful, non-interactive completion is strong indirect evidence that valid, project-scoped signing occurred; the chain is downgraded from VERIFIED to PARTIAL only because that specific piece of metadata could not be directly retrieved and displayed in this session, per the task's own instruction to mark unattainable items NOT VERIFIED rather than guess.
