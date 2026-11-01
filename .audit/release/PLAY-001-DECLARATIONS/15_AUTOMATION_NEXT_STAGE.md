# Next Persistent Automation Layer (design only, not implemented this run)

## Recommended pipeline

```
release tag pushed (e.g. v0.1.1) OR manual workflow_dispatch
  → EAS production build (eas build --platform android --profile production --non-interactive)
  → EAS Submit to Internal Testing (eas submit --platform android --profile production --non-interactive)
  → automated verification (Android Publisher API: confirm track=internal, versionCode matches, status=completed)
  → [optional, only if 12_PRODUCTION_REQUIREMENTS.md determines it applies] promote to a Closed Testing track
  → explicit, separate, human-triggered production-promotion step — never automatic
```

## What can be automated now (credentials and tooling already exist)

- Build submission (`eas build`) — already proven working end-to-end.
- Track release creation/verification (`eas submit` + Android Publisher API confirmation) — already proven working end-to-end.
- Tester management (`edits.testers.update`) — mechanically ready once the owner supplies tester emails/groups (`11_INTERNAL_DISTRIBUTION.md`).
- Release notes push (`edits.tracks.update` with `releaseNotes`) — ready once the owner supplies the text (this run will not invent marketing/release-note copy).

## What must remain a deliberate, explicit, separately-authorized step

- Any move to a **production**, **closed**, or **open** testing track.
- Any Data Safety / Content Rating / Target Audience / Account Deletion **submission** to Play (this run prepared draft answers only — submission itself should be a deliberate act, not silently bundled into a build pipeline).
- Store listing content changes.

## Suggested implementation vehicle

A small, tag-triggered GitHub Actions workflow (`.github/workflows/release.yml`), using an `EXPO_TOKEN` (EAS robot/access token) stored as a GitHub Actions secret — never committed, never derived from the Google service-account key. This is a source-config change and, consistent with every prior sprint's own rule, would go through the same protected branch → PR → CI → merge flow, not a direct `main` edit. Not implemented in this run — recorded here as the recommended next step only.

**Status: READY conceptually; not yet implemented (correctly, since it was explicitly out of this run's mandate to build it automatically).**
