# EAS Account & Project Identity

EAS CLI version (via `npx eas-cli`, not installed/persisted into `package.json`): **`eas-cli/23.0.0`** (win32-x64, node-v24.7.0) — satisfies `eas.json`'s `cli.version: ">= 12.0.0"` requirement.

## Authentication

Before this run: `eas whoami` → "Not logged in" (matching Sprint 3's prior finding — no session existed at that time).

This run: the official interactive EAS login flow was initiated (`eas-cli login`), which opened the standard `expo.dev` OAuth browser authorization URL and completed via the browser session already available in this environment — **no password, token, or credential was requested from or supplied by the user in chat**, consistent with Section 7's explicit prohibition.

**Authenticated: YES.**

Safe account identity (from `eas whoami`):
- User: `mfurkant`
- Email: `fusturan@gmail.com`
- Accounts available: `mfurkant` (Role: Owner), `taztamam` (Role: Owner)

## Project identity

`npx eas-cli project:info` (inside the clean, exact-SHA worktree, dependencies installed via `npm ci`):

```
EAS project not configured. This command cannot configure it in non-interactive mode. Run one of the following, then re-run this command:

To link an existing project:
  eas init --id <project-id> --non-interactive

To create a new project:
  eas init --account <account-name> --non-interactive

Accounts you can create projects in: mfurkant, taztamam
```

**No EAS project has ever been linked to this app.** Confirmed by direct inspection of `app.json` (no `expo.extra.eas.projectId` field present, at the exact locked source revision) — consistent with Sprint 3's own prior finding (`SPRINT-003-RELEASE-REPOSITORY-HARDENING/04_EAS_PRODUCTION_CONFIG.md`: "No `expo.extra.eas.projectId` field present in `app.json`").

**This is the RC-001 blocking condition.** Linking (`eas init --id <existing-project-id>`) or creating (`eas init --account <name>`) a project both work by writing `expo.extra.eas.projectId` into `app.json` — a source-config file this run's Section 2 absolute rule explicitly forbids modifying. There is no EAS mechanism to build a production AAB for an unlinked project without this write. Per Section 2: **"If any source/config change becomes required: STOP. Return: RC-001 BLOCKED — NEW SOURCE REVISION REQUIRED."**

Android package (from source, unaffected by EAS linkage): `com.lingorise.app`
Production build profile (from `eas.json`, unaffected by EAS linkage): `production` → `android.buildType: "app-bundle"` (correct artifact type, confirmed).

## Which account should own the project?

Not determined by this run — that is a product decision for the project owner, not something this run should infer or choose unilaterally (both `mfurkant` and `taztamam` are Owner-role accounts under the same authenticated session; picking the wrong one would misplace the project's build history/credentials).
