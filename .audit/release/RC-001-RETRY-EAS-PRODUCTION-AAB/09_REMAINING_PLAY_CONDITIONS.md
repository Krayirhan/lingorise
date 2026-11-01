# Remaining Conditions

All EAS-side conditions from the prior BLOCKED run are now resolved: project linkage, production Firebase environment, and (at capability level) production signing. A real production AAB exists. Only genuinely Play-Console-side work remains, plus one small piece of metadata that would strengthen (not block) the signing evidence:

1. **Play App Signing verification** — requires Play Console access, not available in this environment.
2. **Upload this exact AAB (`lingorise-production-a9d0a048.aab`, SHA-256 `62c8a47609e3fb5d24833bd5f42fa09e16f998d793bb3a2af8563397651f62e6`) to an Internal Testing track.**
3. **Play Console Data Safety declaration** — evidence-backed answer table already prepared in `SPRINT-003-RELEASE-REPOSITORY-HARDENING/07_PLAY_CONSOLE_READINESS.md`.
4. **Play account-deletion declaration** — the public web surface is already hosted and verified reachable (`https://lingorise-65cb1.web.app/account-deletion/`); only the Console-side declaration itself remains.
5. **Store listing completeness** (description, screenshots, feature graphic, etc.).
6. **Content rating / target audience / countries declarations.**
7. **Release notes** for the first production version.

**Optional, non-blocking follow-up:** retrieve the production Android keystore's certificate fingerprint via an interactive `eas credentials` session (or from the Play Console after the first upload, which displays it automatically) — useful for completeness but not required to proceed, since the build's own success already demonstrates the credential works.

Not carried forward as still-open (correctly closed this run): EAS project linkage, EAS production Firebase environment, EAS production build capability.
