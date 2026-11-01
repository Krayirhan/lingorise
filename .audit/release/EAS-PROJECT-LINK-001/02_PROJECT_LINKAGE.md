# Project Linkage

## Pre-existing project check (Section 7)

`eas init --account mfurkant --non-interactive` was run first (the only correct way to check-then-create scoped to a single account without a separate list command that risks touching other accounts). Output: `- Creating @mfurkant/lingorise` — this phrasing confirms **no pre-existing LingoRise project existed under `mfurkant`**; the CLI created a new one rather than linking an existing one. Per Section 7's fallback: "If no correct LingoRise project exists under mfurkant: create a new one under: mfurkant" — satisfied exactly.

## Result

```
- Creating @mfurkant/lingorise
✔ Created @mfurkant/lingorise: https://expo.dev/accounts/mfurkant/projects/lingorise
√ Project successfully linked (ID: cb13fe89-238a-4a69-9b8e-a128808fc1c6) (modified app.json)
√ Set the project icon from icon in your app config
```

## Independent verification (`eas project:info`, run separately after linkage)

```
fullName  @mfurkant/lingorise
ID        cb13fe89-238a-4a69-9b8e-a128808fc1c6
```

Matches `app.json`'s new `expo.extra.eas.projectId` exactly.

## Identity confirmation

| Field | Value | Confirmed |
|---|---|---|
| EAS owner | `mfurkant` | YES — `expo.owner` field + `project:info`'s `fullName` |
| EAS project | `lingorise` (`@mfurkant/lingorise`) | YES |
| EAS project ID | `cb13fe89-238a-4a69-9b8e-a128808fc1c6` | YES — present in both `app.json` and `project:info` |
| Android package | `com.lingorise.app` | YES — unchanged, confirmed via diff (no change to `expo.android.package`) |
| Production profile | `eas.json`'s `production` → `android.buildType: "app-bundle"` | YES — `eas.json` untouched by this operation (confirmed via `git diff eas.json` → empty) |
| No taztamam resource modified | YES | See `01_ACCOUNT_BOUNDARY.md` |

## Note on the "Set the project icon" line

`eas init` additionally read `app.json`'s existing `icon` field (`./assets/lingorise-app-icon.png`, unchanged from before this run) and uploaded it as the EAS project's dashboard icon (a remote metadata action on the newly-created `mfurkant` project itself, not a local file write). Confirmed via `git status --short` that no asset file was created, modified, or touched locally — only `app.json` shows as changed.
