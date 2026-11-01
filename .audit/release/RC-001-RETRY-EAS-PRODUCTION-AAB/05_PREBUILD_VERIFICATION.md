# Prebuild Verification

## Production profile (from source, re-read fresh this run)

`eas.json`:
```json
"production": { "autoIncrement": true, "android": { "buildType": "app-bundle" } }
```

| Field | Value |
|---|---|
| Profile | `production` |
| Distribution | `store` (confirmed by the build's own `distribution: "STORE"` field) |
| Environment | default `production` (no explicit `environment` override) |
| Artifact type | `app-bundle` → **.aab** — confirmed |
| autoIncrement | `true` — confirmed to have taken effect (versionCode 1 → 2, see below) |
| Channel | not configured (no `expo-updates`-based channel in use; not applicable to this project) |
| Credentials source | EAS-managed (no local credentials configured) |

## Prebuild gate checklist

| Condition | Status |
|---|---|
| Exact source SHA | **PASS** (`b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4`, confirmed via `git rev-parse HEAD` in the clean worktree) |
| EAS project | **VERIFIED** (`@mfurkant/lingorise`, ID `cb13fe89-238a-4a69-9b8e-a128808fc1c6`) |
| Owner | **mfurkant** |
| Android package | **com.lingorise.app** |
| Production profile | **READY / AAB** |
| Firebase production env | **VERIFIED** (6/6, see `03_FIREBASE_PRODUCTION_ENV.md`) |
| Firebase project | **lingorise-65cb1** |
| Android signing | Deferred to build-time resolution (interactive-only inspection unavailable pre-build) — build itself is the verification mechanism, per `04_ANDROID_PRODUCTION_SIGNING.md` |
| Typecheck | **PASS** (0 errors) |
| Tests | **PASS** (422/422) |
| Source modifications | **NONE** (`git status --short` clean, both before `npm ci` and before the build trigger) |

All conditions satisfied before triggering the build.

## Post-build local file diff (informational — not committed, not a source mutation of the release revision)

After the build, `git status --short` in the worktree showed:
```
 M android/app/build.gradle
 M app.json
```
Both changes are the `production.autoIncrement: true` setting's own documented side effect, resolving `versionCode: 1 → 2` and writing it back locally. Neither file was staged, committed, or pushed. `origin/main` independently re-fetched and confirmed unchanged at `b8d0687d7217f46ce28bf269b6fc6a2eb9815ae4`. See `01_SOURCE_IDENTITY.md` for full detail.
