# SUPPLY-CHAIN-001-BASELINE

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Supply Chain / Repository Assurance: 73/100

Confidence: **MEDIUM** — dependency, workflow and live GitHub control evidence is strong; default token permissions, push protection and EAS production credentials were not independently available.

| Rubric dimension | Score | Evidence summary |
|---|---:|---|
| Dependency vulnerability posture | 17/20 | 17 moderate advisories, all build/dev-chain paths; no runtime-relevant advisory established. |
| Dependency reproducibility / lock integrity | 14/15 | Tracked npm lockfile v3, full integrity coverage, npmjs-only resolutions, and CI `npm ci`. |
| CI workflow / third-party action trust | 11/15 | Small CI surface; external actions use mutable major tags and Maestro is installed via `curl | bash`. |
| CI permission / secret handling | 8/10 | No secrets are referenced; public Firebase client variables are scoped to build jobs. Default token permissions are not verified. |
| Repository protection / merge controls | 6/15 | Live API confirms `main` is unprotected and no rulesets exist. |
| Secret scanning / credential hygiene | 7/10 | Current scan is clean and `.env` handling is sound; GitHub secret scanning is disabled. |
| Build / toolchain reproducibility | 7/10 | Wrapper and CI toolchains are controlled; CI's release APK is debug-signed and EAS credential provenance is not verified. |
| Supply-chain monitoring / maintenance | 3/5 | No Dependabot config; Dependabot alerts are disabled and no code-scanning analysis exists. |

## Score-loss ledger

`100 → -27 → 73`

| Root cause | Dimensions affected | Deduction | Evidence level |
|---|---|---:|---|
| No enforced merge gate on `main` | Repository protection | -9 | E4 |
| GitHub secret scanning disabled | Secret hygiene | -3 | E4 |
| Remote CI install and mutable action references | CI workflow trust | -4 | E2 |
| Default GitHub token permission baseline not inspectable | CI permission / secret handling | -2 | E2/E4-limited |
| Build/dev dependency advisory debt | Dependency vulnerability posture | -3 | E3 |
| Local version-control/reproducibility gap | Dependency reproducibility; build toolchain | -3 | E2 |
| Debug signing for the CI release APK | Build toolchain / artifact trust | -2 | E2 |
| Dependency/security monitoring is incomplete | Supply-chain monitoring | -1 | E2/E4 |

No deduction is assigned for the Firebase Web client identifiers: they are public client configuration, not credentials.

## Findings

| ID | Severity | Title | Confidence | Release relevant |
|---|---|---|---|---|
| SUPPLY-QA-001 | P2 | `main` has no branch protection or ruleset | High | Yes |
| SUPPLY-QA-002 | P2 | GitHub secret scanning is disabled | High | Yes |
| SUPPLY-QA-003 | P3 | E2E CI executes an unpinned remote Maestro installer | High | No |
| SUPPLY-QA-004 | P3 | CI release APK uses the committed debug signing key | High | Yes |
| SUPPLY-QA-005 | P4 | Dependency/security maintenance automation is incomplete | High | No |
| SUPPLY-QA-006 | P4 | Known moderate advisories remain in build/dev dependency paths | High | No |

## npm audit summary

| Critical | High | Moderate | Low |
|---:|---:|---:|---:|
| 0 | 0 | 17 | 0 |

`@opentelemetry/core` and `re2` resolve through dev dependency `firebase-tools`. `uuid` resolves through dev dependency `@expo/ngrok`, `firebase-tools`, and Expo build tooling. Expo CLI participates in the Android build, so the appropriate classification is build-chain relevant, not runtime-relevant. No advisory is established as shipped/reachable in the production application bundle.

## Controls and observations

- CI uses `npm ci`, Node 20, JDK 21 for Rules testing, JDK 17 for Android builds, and the tracked Gradle 9.3.1 wrapper.
- The lockfile matches the root manifest, has integrity entries, and resolves only from `registry.npmjs.org`; no git, path, tarball, or custom-registry dependencies were found.
- The only workflow is triggered by `pull_request` and push to `main`; it has no `pull_request_target`, `workflow_run`, direct event-field shell interpolation, or repository-secret reference.
- The build variables used in CI are `EXPO_PUBLIC_*` Firebase client identifiers. They are not treated as secrets.
- A bounded tracked-file scan and bounded all-history category scan found no private-key, service-account, AWS-key, or real token evidence. A binary WebP regex hit was excluded as a false positive.
- `android/app/debug.keystore` is tracked standard debug material; it is not treated as a production credential.

## Repository, CI, monitoring and release posture

Repository protection: **WEAK**. Secret hygiene: **PARTIAL**. CI trust: **PARTIAL**. Build reproducibility: **PARTIAL**. Supply-chain monitoring: **WEAK**.

Release-relevant observations: the CI's internal release APK is debug-signed; EAS production AAB credential/signing provenance is **NOT VERIFIED**. This does not establish that EAS production uses a debug key.

Not verified: default workflow token permissions, GitHub push protection, EAS production signing/credential provenance, and organization-level access policies.

## Independent review and history

Independent reviewer verdict: **ADJUST**. The reviewer retained no-protection, disabled-secret-scanning, remote installer, debug-APK and monitoring concerns; rejected runtime-vulnerability and Firebase-secret overstatement.

Historical reconciliation: `DEP-001` **REDISCOVERED** (same build/dev-only 17-moderate posture); `DEPLOY-002` **REDISCOVERED** (no `main` protection); `SEC-003` **REDISCOVERED** for disabled secret scanning, while push protection remains **NOT REVERIFIED**.

Strongest area: deterministic npm dependency installation and lock integrity.

Weakest area: repository merge enforcement and hosted security monitoring.

## Do Not Change / limitations

This audit changed no application source, tests, workflows, dependency manifests/lockfiles, Android/EAS configuration, `.gitignore`, existing audit baselines, or finding registry. It did not install or remediate dependencies. Live GitHub controls are reported only where the authenticated API supplied evidence.
