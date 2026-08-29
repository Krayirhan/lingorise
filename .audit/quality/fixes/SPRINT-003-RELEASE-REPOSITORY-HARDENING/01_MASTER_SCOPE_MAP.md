# Sprint 3 — Master Scope Map

Extracted verbatim from `MASTER-001-CONSOLIDATION/04_GLOBAL_FINDINGS.md`, Sprint 3 section. No Global ID guessed.

| Global ID | Title | Master severity | Priority | Source findings | Root cause | Required remediation | Verification requirement | Release relevance | External dependency | Current status | Implementation surface |
|---|---|---|---|---|---|---|---|---|---|---|---|
| GLOBAL-QA-011 | Host a durable, public, anonymously-reachable, app-specific privacy policy | P1 | CRITICAL PATH | RELEASE-QA-003 | Configured URL served generic Claude Artifact shell / 404 / 403 | Publish canonical bilingual content to a durable, anonymously-reachable, app-specific URL; update in-app link | Fresh anonymous HTTP check confirming app-specific content loads without auth | YES — release blocker | None (hosting account available) | **CLOSED** this sprint | Firebase Hosting + `DataManagementCard.tsx` URL constant |
| GLOBAL-QA-009 | Establish repo/CI signing hygiene (distinguish QA-artifact signing from release distribution) | P3 | MEDIUM | SEC-QA-004, SUPPLY-QA-004 | `android/app/build.gradle` release buildType uses `signingConfigs.debug` | Distinguish QA/CI verification-artifact signing from actual distributable-artifact signing; establish auditable signing provenance for anything intended for distribution | Documentation/comment clarity + confirmed no CI artifact is distributed | Informs GLOBAL-QA-010's verification | None | **CLOSED** (clarifying comment added to `ci.yml`; confirmed neither CI job uploads/distributes the debug-signed APK) | `.github/workflows/ci.yml` |
| GLOBAL-QA-010 | Verify EAS production AAB signing / Play App Signing | P3 (Release Condition) | HIGH | RELEASE-QA-002 | N/A — verification task | Generate/inspect exact-revision EAS production AAB; confirm persistent production credentials and Play App Signing provenance | Verified production signing distinct from repo debug key | CONDITIONAL | EAS account login (not available in this environment) | **NOT VERIFIED — EXTERNAL** | EAS dashboard/CLI (no session) |
| GLOBAL-QA-028 | Verify EAS production Firebase environment | P3 (Release Condition) | HIGH | RELEASE-QA-004 | N/A — verification task | Confirm all 6 `EXPO_PUBLIC_FIREBASE_*` values present in EAS production environment; confirm AAB initializes Firebase-backed functionality | Environment confirmed complete/functional | CONDITIONAL | EAS account login | **NOT VERIFIED — EXTERNAL** | EAS dashboard/CLI (no session) |
| GLOBAL-QA-029 | Verify Play Console version/listing/Data Safety/account-deletion web declaration | P3 (Release Condition) | HIGH | RELEASE-QA-005 | N/A — verification task | Play Console versionCode acceptance, listing completeness, Data Safety submission, functional account-deletion web declaration | All four confirmed complete | CONDITIONAL | Play Console account access | **NOT VERIFIED — EXTERNAL** (account-deletion web surface itself is now prepared/hosted, ready for declaration) | Play Console (no access) |
| GLOBAL-QA-016 | Enable branch protection on `main` | P2 | MEDIUM | SUPPLY-QA-001 | No protection/ruleset on `main` | Minimum: required status checks, block force-push, block deletion | `GET .../branches/main/protection` reflects the rule | Repository control, not a Play gate | None (`gh` authenticated with repo scope) | **CLOSED** this sprint | GitHub branch protection API |
| GLOBAL-QA-017 | Enable GitHub secret scanning | P2 | MEDIUM | SUPPLY-QA-002 | Secret scanning disabled | Enable secret scanning (+ push protection where available) | `security_and_analysis` reflects enabled state | Repository control | None (public repo — feature is free) | **CLOSED** this sprint | GitHub repo settings API |
| GLOBAL-QA-027 | Pin the E2E CI Maestro installer | P3 | LOW | SUPPLY-QA-003 | CI piped unpinned remote installer URL into `bash` | Replace with deterministic/pinned version install | `ci.yml` specifies an exact version | Non-gating | None | **CLOSED (prepared, uncommitted)** | `.github/workflows/ci.yml` |
| GLOBAL-QA-030 | Establish proportionate production observability | P3 | LOW | RELEASE-QA-006 | Local-only/limited observability | FIX IF CHEAP | N/A | Non-blocking | Firebase project (Crashlytics not currently integrated; would require a new native module + EAS config change) | **DEFERRED** — not cheap within this sprint's no-redesign/no-new-native-dependency constraint | Would require `@react-native-firebase/crashlytics` or Sentry integration |
| GLOBAL-QA-036 | Establish dependency/security maintenance automation | P4 | LOW | SUPPLY-QA-005 | No Dependabot config/alerts; code scanning disabled | Add/enable proportionate monitoring if cheap | Dependabot + code scanning active | Non-gating | None | **CLOSED** this sprint (Dependabot alerts + security updates enabled live via API; `dependabot.yml` version-update config prepared, uncommitted; CodeQL default setup enabled live via API) | GitHub repo settings API + `.github/dependabot.yml` |

## Also tracked per Section 46 (source IDs explicitly cross-referenced)

| Source ID | Master mapping | Status this sprint |
|---|---|---|
| RELEASE-QA-002 | → GLOBAL-QA-010 | NOT VERIFIED — EXTERNAL |
| RELEASE-QA-003 | → GLOBAL-QA-011 | **CLOSED** |
| RELEASE-QA-004 | → GLOBAL-QA-028 | NOT VERIFIED — EXTERNAL |
| RELEASE-QA-005 | → GLOBAL-QA-029 | NOT VERIFIED — EXTERNAL (account-deletion web surface component now closed) |
| RELEASE-QA-006 | → GLOBAL-QA-030 | DEFERRED |
| SUPPLY-QA-001 | → GLOBAL-QA-016 | **CLOSED** |
| SUPPLY-QA-002 | → GLOBAL-QA-017 | **CLOSED** |
| SUPPLY-QA-003 | → GLOBAL-QA-027 | **CLOSED (prepared, uncommitted)** |
| SUPPLY-QA-004 | → GLOBAL-QA-009 | **CLOSED** |
| SUPPLY-QA-005 | → GLOBAL-QA-036 | **CLOSED** |
| SUPPLY-QA-006 | Not present as a distinct entry in `04_GLOBAL_FINDINGS.md` — no such ID found in Master; not fabricated here | N/A |
| SEC-QA-004 | → GLOBAL-QA-009 (duplicate root cause, merged in Master) | **CLOSED** |

No Global ID was invented; every row above traces to an exact entry in `04_GLOBAL_FINDINGS.md`.
