# EAS Submit Credential

## Correction applied (per user instruction)

The originally-attempted approach (`eas.json`'s `submit.production.android.serviceAccountKeyPath` pointing at a local file path) was explicitly abandoned per the user's correction — the officially supported and intended mechanism is to upload the key as an **EAS project-level Service Credential** via `eas credentials`, keeping `eas.json` limited to non-secret submission options (`track`).

The detached worktree/branch created for the abandoned approach (`D:/lingorise-play-submit-config`, branch `release/lingorise-play-submit-config`) was removed — nothing from it was ever committed or pushed.

## eas.json change (correct, minimal, merged)

```json
"submit": {
  "production": {
    "android": {
      "track": "internal"
    }
  }
}
```

No `serviceAccountKeyPath`, no credential path, no secret of any kind. Delivered via the protected branch/PR/CI/merge flow — see `.audit/release/PLAY-AUTOMATION-BOOTSTRAP-002-CORRECTED/FINAL_RESULT.md`'s Git State section for the exact new main SHA.

## Google Service Account upload to EAS credentials

**NOT COMPLETED — requires the user's own interactive terminal.**

`eas credentials --platform android` is a fully interactive, TTY-only command (confirmed: it produces zero output even when redirected to a file and run in the background — this is not a "stuck at a specific prompt" situation with visible text to report, it is a menu-driven UI that requires a real terminal to render at all). This session's Bash tool has no interactive TTY, so this step genuinely cannot be driven or observed from here.

### Exact steps for the user to run themselves (in a real terminal, e.g. via `!` in this session or a separate terminal window)

```
cd D:/LingoRise
npx eas-cli credentials --platform android
```

Then, in the menu:
1. Select build profile: **production**
2. From the Android credentials menu, choose the **Google Service Account** option (listed under the submit/Play Store credentials section, not the build/keystore section).
3. Choose to **set up a new Google Service Account Key for EAS Submit**.
4. When prompted for the key file path, enter exactly:
   ```
   D:/lingorise-secure/google-play-service-account.json
   ```
5. Confirm/save, then exit the menu (usually an "exit" or "back" option, or Ctrl+C once configuration is confirmed saved).

Once this is done, EAS stores the credential itself (encrypted, project-scoped to `@mfurkant/lingorise`) — it does not need to be re-uploaded for future submissions, and this repository never needs to reference the key file's path or contents.

**EAS Google Play service credential: NOT CONFIGURED (pending user action).**
