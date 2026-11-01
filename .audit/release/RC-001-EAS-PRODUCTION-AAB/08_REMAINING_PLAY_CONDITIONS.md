# Remaining Conditions

RC-001 did not reach the point where genuinely Play-Console-only conditions become the sole remainder. The following items block **before** Play Console even becomes relevant, and must be resolved first, via a new source revision (per Section 2's own required path: new branch → PR → CI → new main SHA → new RC attempt):

1. **Link or create an EAS project for this app** (`eas init --id <existing-project-id> --non-interactive` if a LingoRise project already exists under `mfurkant`, or `eas init --account <name> --non-interactive` to create one) — this is a source-config change (writes `expo.extra.eas.projectId` into `app.json`) and cannot be performed inside this locked, build-only run. **A human decision is needed first: which account should own the LingoRise EAS project?**
2. Once linked, re-verify production Firebase environment variable presence (`eas env:list --environment production` against the now-linked project) — currently NOT VERIFIED, blocked by (1).
3. Once linked, verify EAS production Android signing/credentials (`eas credentials`) — currently NOT VERIFIED, blocked by (1).
4. Generate the actual production AAB (`eas build --platform android --profile production`) — blocked by (1)–(3).

**Only after** the above are resolved do the following genuinely Play-Console-side conditions remain (unchanged from Sprint 3's own findings, not newly discovered here):

5. Play App Signing verification (requires Play Console access).
6. AAB upload to an internal testing track.
7. Data Safety declaration (evidence-backed answer table already prepared in `SPRINT-003-RELEASE-REPOSITORY-HARDENING/07_PLAY_CONSOLE_READINESS.md`).
8. Account-deletion declaration (web surface already hosted and verified reachable — only the Console-side declaration itself remains).
9. Store listing completeness, content rating, target audience/countries, release notes.

Items 5–9 are correctly **not** claimed as closed or carried forward as if resolved — they remain exactly where Sprint 3 left them, pending items 1–4 first.
