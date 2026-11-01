# Android Production Signing

EAS owner: `mfurkant`
Project: `lingorise` (`@mfurkant/lingorise`)

## Direct credential inspection

`eas credentials` is an interactive-menu-only command in the installed CLI (`eas-cli/23.0.0`) — confirmed no `--non-interactive` flag exists (`Nonexistent flag: --non-interactive`), so it cannot be queried in this non-interactive session without risking an unattended interactive prompt. No credential command was force-run against a guess.

## Indirect verification (via the build itself)

The production build (`eas build --platform android --profile production --non-interactive`, build ID `a9d0a048-2c1e-451d-99b3-4656c021fe21`) completed with **status FINISHED** — a non-interactive EAS build cannot succeed to completion without a resolved, valid Android signing credential; if none existed and none could be auto-generated, the build would fail immediately at the credentials-resolution step rather than proceeding through compilation and artifact upload. This is the first-ever build for this brand-new project (linked only in the prior EAS-PROJECT-LINK-001 run), so no credential could have pre-existed from an earlier build.

**Production credentials existed before this run: NO** (inferred from this being the project's first build; no prior build history exists for `@mfurkant/lingorise`).
**New EAS-managed keystore generated: YES** (inferred from the build's successful non-interactive completion — EAS's standard, documented behavior is to auto-generate and store a new EAS-managed Android keystore when a non-interactive build finds none and none is supplied; consistent with Section 19's explicit prior authorization for this exact scenario).
**Credential management: EAS MANAGED** (by construction — no local keystore file was ever provided to this build from the repository or from this session).

## Safe certificate metadata

**NOT VERIFIED** — the interactive-only `eas credentials` command could not be safely queried in this session, and the build's signed log URL (a short-lived, 15-minute GCS signed link) expired before a targeted re-fetch could search it for a printed fingerprint. This is a tooling-access limitation, not evidence of a signing defect — the build's own successful completion remains the operative evidence that a valid credential was used.

## Production signing status

**VERIFIED** (capability-level: a real, EAS-managed, project-scoped Android signing credential was resolved and successfully used to produce this exact artifact) — **NOT VERIFIED** (metadata-level: the specific certificate fingerprint was not retrieved in this session).

No debug-signing assumption was made anywhere in this document — this is entirely independent of the CI verification APK's known debug-keystore signing (`android/app/build.gradle`'s committed `signingConfigs.debug` on the `release` buildType), which plays no role in the actual EAS-managed production credential used here.

## Play App Signing

**NOT VERIFIED** — no Google Play Console evidence is available in this environment (per Section 22, this does not block AAB generation and is expected to remain NOT VERIFIED at this stage).

## Secrets handled

No keystore file, private key, keystore password, key password, or credential JSON was downloaded, printed, or written to any evidence file or chat message by this run.
