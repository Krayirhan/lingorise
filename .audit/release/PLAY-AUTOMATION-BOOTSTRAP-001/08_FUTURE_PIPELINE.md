# Future Pipeline (recommendation, not implemented this run)

Once the Cloud-project and Play-permission blockers are resolved, the recommended pipeline (per Section 28-29) is:

**Trigger:** a manually-created release tag (e.g. `v0.1.0`) or a manually-dispatched GitHub Actions workflow — **never** automatic on every `main` commit.

**Flow:**
```
release tag pushed (or workflow_dispatch)
  → EAS production build (eas build --platform android --profile production --non-interactive)
  → EAS Submit to Internal Testing ONLY (eas submit --platform android --profile production --non-interactive)
  → (manual) review in Internal Testing
  → (separate, explicit, future run) promotion to production — never automatic
```

This can be implemented as a small GitHub Actions workflow (`.github/workflows/release.yml`) gated on a tag pattern, using `EXPO_TOKEN` (an EAS robot/access token, itself a secret to be added as a GitHub Actions secret, never committed) for non-interactive EAS auth in CI. This is a source-config change and, per Section 18's own rule, would need its own branch → PR → CI → merge cycle — not implemented in this run, and correctly not needed since the Cloud/Play prerequisites aren't in place yet.

**Status: READY conceptually, not yet implementable** — blocked on the same Cloud-project/service-account/Play-permission chain as the rest of this run.
