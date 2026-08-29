# Finding Closure Matrix

| Source/Global ID | Historical severity | Current defect/condition | Action | Evidence | Reviewer verdict | Status |
|---|---|---|---|---|---|---|
| RELEASE-QA-003 → GLOBAL-QA-011 | P1 (proven blocker) | Configured URL didn't anonymously serve app-specific content | Authored + hosted bilingual policy + account-deletion page on Firebase Hosting; updated in-app URL | Fresh anonymous HTTP 200, app-specific content, `03_PRIVACY_POLICY_EVIDENCE.md` | Release reviewer: AGREE | **CLOSED** |
| RELEASE-QA-002 → GLOBAL-QA-010 | P3 (conditional) | EAS production signing unverified | None locally possible | No EAS session | Release reviewer: AGREE | **NOT VERIFIED — EXTERNAL** |
| RELEASE-QA-004 → GLOBAL-QA-028 | P3 (conditional) | EAS production Firebase env unverified | None locally possible | No EAS session | Release reviewer: AGREE | **NOT VERIFIED — EXTERNAL** |
| RELEASE-QA-005 → GLOBAL-QA-029 | P3 (conditional) | Play Console readiness unverified | Account-deletion web surface component prepared/hosted | No Play Console access | Release reviewer: AGREE | **PARTIAL** (component ready; Console declaration itself NOT VERIFIED — EXTERNAL) |
| RELEASE-QA-006 → GLOBAL-QA-030 | P3, non-blocking | Local-only observability | None (not cheap — requires new native/SDK dependency) | `01_MASTER_SCOPE_MAP.md` | Release reviewer: AGREE | **DEFERRED** |
| SUPPLY-QA-001 → GLOBAL-QA-016 | P2 | No branch protection | Applied live via `gh api` | `08_REPOSITORY_HARDENING.md`, live re-`GET` | Security reviewer: ADJUST (applied — admin-bypass disclosed) | **CLOSED** |
| SUPPLY-QA-002 → GLOBAL-QA-017 | P2 | Secret scanning disabled | Applied live via `gh api` | `08_REPOSITORY_HARDENING.md`, live re-`GET` | Security reviewer: AGREE | **CLOSED** |
| SUPPLY-QA-003 → GLOBAL-QA-027 | P3 | Unpinned Maestro installer | Pinned via `MAESTRO_VERSION=2.9.0` | `ci.yml` diff (uncommitted) | Security reviewer: AGREE (version-drift only, honestly characterized) | **CLOSED (prepared, uncommitted)** |
| SUPPLY-QA-004 / SEC-QA-004 → GLOBAL-QA-009 | P3 | CI release APK uses debug signing, semantics unclear | Explicit clarifying comment; confirmed no distribution of the artifact | `ci.yml` diff, `05_SIGNING_AND_ARTIFACT_PROVENANCE.md` | Security reviewer: AGREE | **CLOSED** |
| SUPPLY-QA-005 → GLOBAL-QA-036 | P4 | No Dependabot/code scanning | Enabled live (alerts, security updates, CodeQL default setup); version-update config prepared | `08_REPOSITORY_HARDENING.md` | Security reviewer: ADJUST (applied — advisory classification corrected) | **CLOSED** |
| GLOBAL-QA-012 remainder (not Sprint-3-owned) | P2 (partial, carried from Sprint 2) | Avatar picker/word-detail/word-notebook still hardcoded | None (deliberately deferred — non-release-blocking) | `02_RELEASE_BLOCKER_PLAN.md` | N/A | **DEFERRED (unchanged)** |

No item above is marked CLOSED without direct evidence in this sprint's own artifacts. No external NOT VERIFIED item is marked CLOSED. Both reviewer ADJUST items (branch-protection admin-bypass disclosure; supply-chain advisory classification correction) have been applied to the underlying evidence files — see `11_REVIEW_RESULTS.md`.
