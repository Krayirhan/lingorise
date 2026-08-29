# SUPPLY-CHAIN-001-BASELINE — FINAL RESULT

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

## Supply Chain / Repository Assurance: 73/100

Confidence: **MEDIUM**

| P0 | P1 | P2 | P3 | P4 |
|---:|---:|---:|---:|---:|
| 0 | 0 | 2 | 2 | 2 |

## Advisory posture

| Critical | High | Moderate | Low |
|---:|---:|---:|---:|
| 0 | 0 | 17 | 0 |

Runtime-relevant advisories: **0 established**.

Build/dev-only advisories: **17 moderate**. `firebase-tools` chains to `@opentelemetry/core` and `re2`; `@expo/ngrok`, Firebase tooling and Expo CLI paths include vulnerable `uuid` versions. Expo CLI is build-chain relevant, but no affected package is established as production-bundle runtime reachable.

Repository protection: **WEAK**. Secret hygiene: **PARTIAL**. CI trust: **PARTIAL**. Build reproducibility: **PARTIAL**. Monitoring / maintenance: **WEAK**.

## Canonical findings

### SUPPLY-QA-001 — `main` has no branch protection or ruleset

Severity: P2. Confidence: High. Evidence: E4.

Affected control: repository merge protection. The live GitHub protection endpoint reports `main` is not protected and the ruleset list is empty. CI exists but is not technically required before merge. Prerequisite: someone with permitted direct-write access or a merge path bypasses informal process. Impact: unreviewed or unverified dependency/workflow/build changes can reach `main`. Existing mitigation: CI is defined and currently green. Minimal remediation direction: configure a branch rule/ruleset requiring appropriate review and the CI checks, with force-push/deletion restrictions. Release relevant: Yes. Status: OPEN.

### SUPPLY-QA-002 — GitHub secret scanning is disabled

Severity: P2. Confidence: High. Evidence: E4.

Affected control: hosted credential detection. The authenticated API explicitly reports secret scanning disabled. Current bounded repository and history scans did not expose a credential, but they do not replace continuous hosted scanning. Impact: weaker detection/prevention of an accidental future credential commit. Existing mitigation: `.env` ignore rules and clean bounded scan. Minimal remediation direction: enable secret scanning; separately verify and enable push protection where available. Release relevant: Yes. Status: OPEN.

### SUPPLY-QA-003 — E2E CI executes an unpinned remote Maestro installer

Severity: P3. Confidence: High. Evidence: E2.

Affected control: CI third-party execution trust. The E2E job pipes the Maestro installer URL directly to `bash`; workflow actions use mutable major tags, including a third-party emulator action. No repository-secret exposure or untrusted-PR privilege escalation was established. Impact: upstream installer/action mutation or compromise can affect CI execution. Existing mitigation: bounded workflow surface and no observed secret use. Minimal remediation direction: pin/version and verify the installer (or use a controlled action/package); consider commit-SHA action pinning proportionally. Release relevant: No. Status: OPEN.

### SUPPLY-QA-004 — CI release APK uses the committed debug signing key

Severity: P3. Confidence: High. Evidence: E2.

Affected control: CI artifact authenticity. The Gradle `release` build type uses `signingConfigs.debug`; CI builds that release APK but does not publish it. The committed key is standard debug material, not a powerful production credential. Impact: this CI artifact does not have production-signing provenance. Existing mitigation: artifact is an internal verification input. Minimal remediation direction: distinguish QA/debug artifact signing from release distribution and establish auditable signing provenance for any distributable artifact. Release relevant: Yes. Status: OPEN.

### SUPPLY-QA-005 — Dependency/security maintenance automation is incomplete

Severity: P4. Confidence: High. Evidence: E2/E4.

Affected control: monitoring. No Dependabot configuration exists, Dependabot alerts are disabled, and live code scanning reports no analysis. Impact: dependency/security changes rely on manual discovery. Minimal remediation direction: establish proportionate automated alert/update and scanning coverage. Release relevant: No. Status: OPEN.

### SUPPLY-QA-006 — Moderate build/dev dependency advisories remain

Severity: P4. Confidence: High. Evidence: E3.

Affected control: dependency vulnerability posture. One `npm audit` recorded 17 moderate advisories in tooling/build paths. No direct runtime exploit path was established; raw advisory count was not treated as a severity multiplier. Impact: tooling environments retain known vulnerability debt. Existing mitigation: lockfile integrity and deterministic CI install. Minimal remediation direction: review compatible upgrades during a dedicated dependency-maintenance change. Release relevant: No. Status: OPEN.

## Release-relevant observations

- CI's release APK is debug-signed (`SUPPLY-QA-004`).
- EAS production config creates an AAB, but EAS production credential/signing provenance is **NOT VERIFIED**. The repository configuration does not prove EAS uses the debug key.
- `main` has no enforced required check/review gate and hosted secret scanning is disabled.

## Not verified

Default `GITHUB_TOKEN` permission baseline, GitHub push protection, organization access policy, and EAS production signing credentials/provenance.

## Independent reviewer verdict

**ADJUST.** Reviewer retained repository protection, secret scanning, remote installer/action trust, debug CI signing, and monitoring concerns; it rejected severity inflation from moderate advisories, public Firebase client configuration, action tag use alone, and unverified EAS assumptions.

## Historical reconciliation

- `DEP-001`: REDISCOVERED — same 17-moderate build/dev posture; no runtime advisory established.
- `DEPLOY-002`: REDISCOVERED — live API confirms no `main` protection.
- `SEC-003`: REDISCOVERED as disabled secret scanning; push protection is NOT REVERIFIED.

Strongest area: lock integrity and deterministic CI dependency installation.

Weakest area: no enforced merge control on `main` combined with incomplete hosted monitoring.

This is an **ASSURANCE** score. It is not an additional Product Quality domain score and does not independently decide release GO/NO-GO.

This file is authoritative for Master Consolidation, fix planning, and future Supply Chain reaudit.
