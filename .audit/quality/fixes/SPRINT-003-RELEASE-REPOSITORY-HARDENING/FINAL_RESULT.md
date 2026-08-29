# SPRINT-003 — RELEASE & REPOSITORY HARDENING

## Identity

Master: `.audit/quality/runs/MASTER-001-CONSOLIDATION/`
Current HEAD / origin/main: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa` (unchanged — no commit/push performed)
Working tree: Sprint 1 (22 files) + Sprint 2 (subset of same 22) + Sprint 3 (`.github/workflows/ci.yml`, `firebase.json`, `src/features/profile/components/DataManagementCard.tsx`'s URL constant — the latter file already counted in the 22) remain uncommitted; new untracked: `.github/dependabot.yml`, `public/` (privacy-policy + account-deletion pages), `.firebase/` (local deploy cache, harmless), plus pre-existing untracked audit/asset files from prior sprints.

## Sprint Status

**PASS WITH EXTERNAL CONDITIONS**

## Release Blocker

RELEASE-QA-003: **CLOSED**

## Privacy Policy

URL: `https://lingorise-65cb1.web.app/privacy-policy/`
Anonymous access: fresh `curl` this sprint → HTTP 200, no auth redirect
TR/EN: both present (client-toggle, both fully rendered in raw HTML)
Account deletion support: `https://lingorise-65cb1.web.app/account-deletion/` — hosted, verified HTTP 200, explains the in-app deletion flow and a manual-request fallback; explicitly does not overclaim a working remote deletion form

## EAS Production Configuration

Package `com.lingorise.app`, version `0.1.0`, `production` profile → `app-bundle` (correct artifact type), `autoIncrement: true`. No manual version bump made (not warranted for a first RC). Full detail: `04_EAS_PRODUCTION_CONFIG.md`.

## Firebase Production Environment

6 required `EXPO_PUBLIC_FIREBASE_*` variables identified from source (exhaustive). Presence in EAS's production environment: **NOT VERIFIED** (no EAS session). Full detail: `06_FIREBASE_PRODUCTION_ENV.md`.

## Signing

Verification (CI/local) APK: **CONFIRMED debug-signed**, never distributed, now explicitly documented as such.
Production EAS signing: **NOT VERIFIED** (no EAS session; not extrapolated from the debug-signed CI artifact).
Full detail: `05_SIGNING_AND_ARTIFACT_PROVENANCE.md`.

## Play App Signing

**NOT VERIFIED — EXTERNAL PLAY CONSOLE CONDITION.**

## Play Console Readiness

**NOT VERIFIED** for Console-side items (no account access); account-deletion **web surface** component now ready and verified reachable. Evidence-backed Data Safety answer table prepared. Full detail: `07_PLAY_CONSOLE_READINESS.md`.

## Repository Protection

Branch protection on `main`: **ENABLED** (required checks: `verify`, `android-build`, `e2e-smoke`; force-push and deletion blocked; `enforce_admins:false`, disclosed limitation — owner can still bypass). Secret scanning + push protection: **ENABLED**. Dependabot alerts + automated security fixes: **ENABLED**. CodeQL default setup: **ENABLED** (javascript-typescript). All applied live via authenticated `gh` API and independently re-verified, including by an independent security reviewer. Full detail: `08_REPOSITORY_HARDENING.md`.

## Supply Chain Hardening

Maestro CI installer pinned to `2.9.0` (prepared, uncommitted). CI signing-semantics comment clarified. `npm audit`: 0 critical / 0 high / 17 moderate / 0 low, unchanged from baseline — all in build-tooling code paths (native project generation via `xcode`/`@expo/config-plugins`), not the shipped runtime bundle; no dependency version touched. `.github/dependabot.yml` prepared, uncommitted. Full detail: `09_SUPPLY_CHAIN_EVIDENCE.md`.

## Verification

Typecheck: **PASS** (0 errors), fresh
Primary suite: **PASS — 422/422**, fresh, no regression from this sprint's one application-source edit (the privacy-URL constant)
Firestore Rules E3: **NOT VERIFIED** for the current exact working-tree revision (local JDK 17 vs. required 21+, unchanged gap) — but CI's own `verify` job already provisions JDK 21 for this exact check and has passed 8/8 recent runs at the committed HEAD revision; this will resolve automatically once a commit exists, no further Sprint work needed.
Full detail: `10_TEST_BUILD_EVIDENCE.md`.

## Independent Review

Release reviewer: **AGREE** (16/16 challenge items found no issue; one presentation-only note, addressed in this response's phrasing).
Security/supply-chain reviewer: **ADJUST — both items applied** (branch-protection admin-bypass now disclosed; supply-chain advisory classification corrected from "devDependency-only" to "build-tooling-only within a production dependency"). Full transcript: `11_REVIEW_RESULTS.md`.

## Finding Closure Recommendations

See `12_FINDING_CLOSURE_MATRIX.md`. Summary: 6 CLOSED (GLOBAL-QA-011, 009, 016, 017, 027, 036), 1 PARTIAL (GLOBAL-QA-029), 3 NOT VERIFIED — EXTERNAL (GLOBAL-QA-010, 028, and the Console-declaration component of 029), 1 DEFERRED (GLOBAL-QA-030), 1 unchanged deferred (GLOBAL-QA-012 remainder, not Sprint-3-owned).

## External Release Conditions

See `13_RESIDUAL_EXTERNAL_CONDITIONS.md` for exact, actionable next steps on: (1) EAS production signing verification, (2) EAS production Firebase environment verification, (3) Play Console readiness/declaration, (4) source revision lock for RC generation.

## Source Revision / RC Status

**SOURCE REVISION LOCK REQUIRED.** No commit/push performed (per absolute rule). No EAS production build attempted (no session + no locked revision, independently sufficient blockers). RC generation is the next stage after user-authorized commit, per `MASTER-001-CONSOLIDATION/08_REAUDIT_AND_RELEASE_PATH.md`'s own sequencing.

## Required Reaudits

1. RELEASE-002-REAUDIT (recommended only, not run)
2. SUPPLY-CHAIN-002-REAUDIT (recommended only, not run)
3. Security signing/config targeted recheck — relevant once an EAS session/build exists

## Git State

Application source changes this sprint: 1 file (`DataManagementCard.tsx`'s URL constant) on top of 21 pre-existing Sprint 1/2 modified files (22 total tracked-modified, unchanged count from Sprint 2).
Config/CI changes this sprint: `.github/workflows/ci.yml`, `firebase.json` (both modified); `.github/dependabot.yml` (new, uncommitted).
New content: `public/privacy-policy/index.html`, `public/account-deletion/index.html` (new, uncommitted — though the corresponding *live Firebase Hosting deployment* is real and already public, independent of git commit state).
Historical audits modified: **NONE**
MASTER modified: **NO**
FINDING_REGISTRY modified: **NO**

Commit: **NOT DONE**
Push: **NOT DONE**

Live external actions taken this sprint (irreversible only in the trivial sense that they are real settings changes, all easily reversible): GitHub repository settings (branch protection, secret scanning, push protection, Dependabot, CodeQL) and a Firebase Hosting deployment (privacy-policy + account-deletion pages) — both explicitly within this sprint's own instructed scope ("if GitHub access permits," "prefer existing infrastructure").
