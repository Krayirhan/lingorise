# Release Blocker Plan (written before implementation)

## GLOBAL-QA-011 / RELEASE-QA-003 — Privacy Policy hosting

- **Current state:** In-app modal content is localized (Sprint 2) but the configured public URL (`PRIVACY_POLICY_URL` in `DataManagementCard.tsx`) is a Claude Artifact placeholder that RELEASE-001-BASELINE proved does not anonymously serve app-specific content.
- **Required state:** A durable, public, HTTPS, no-login, app-specific, LingoRise-branded, TR+EN privacy policy at a stable URL, plus a linked account-deletion information page (Play requirement for apps with account creation).
- **Local/repo fix:** Author the full policy content (expanding Sprint 2's approved in-app copy into a standalone page covering Firebase Auth, Firestore sync, local storage, notifications, in-app usage logs, third parties actually used, retention/deletion, rights/contact, account deletion); author the account-deletion page; add a `hosting` block to `firebase.json` pointing at a new `public/` directory.
- **External action:** Deploy to Firebase Hosting via the already-authenticated `firebase-tools` CLI (`studioskrayirhan@gmail.com`, project `lingorise-65cb1`) — this project's own existing backend infrastructure, per the "prefer existing infrastructure" instruction. No new hosting account needed.
- **Verification method:** Fresh anonymous `curl` requests (no cookies/auth) to both pages, checking HTTP status, absence of a login redirect, and presence of app-specific title/content text.
- **Failure condition:** Non-200 status, redirect to an auth wall, or generic/non-LingoRise content.
- **Safe rollback:** Firebase Hosting keeps prior releases; `firebase hosting:rollback` reverts instantly if needed. No irreversible action.
- **Release consequence if unresolved:** RELEASE-QA-003 remains a proven P1 blocker; Release Gate stays NO-GO regardless of every other item in this sprint.

## GLOBAL-QA-016 — Branch protection

- **Current state:** `main` had no protection (`404 Branch not protected`).
- **Required state:** Minimum: required status checks for the 3 currently-reliable CI jobs, force-push blocked, deletion blocked; no PR-review requirement (solo-maintained repo — proportionate, does not block normal development).
- **Local/repo fix:** None (pure GitHub setting).
- **External action:** `PUT /repos/{owner}/{repo}/branches/main/protection` via authenticated `gh` CLI (repo scope present).
- **Verification method:** `GET` the same endpoint back and confirm the fields.
- **Failure condition:** 403/404 (no permission) — would require reporting NOT AVAILABLE, not silently skipping.
- **Safe rollback:** `DELETE` the same endpoint restores the prior (unprotected) state.
- **Release consequence:** Non-gating repository control; does not affect Release Gate.

## GLOBAL-QA-017 / GLOBAL-QA-036 — Secret scanning, push protection, Dependabot, code scanning

- **Current state:** All four disabled/not-configured (`security_and_analysis` all `disabled`; `vulnerability-alerts` 404; `code-scanning/default-setup` `not-configured`).
- **Required state:** Secret scanning + push protection enabled (free for this public repo); Dependabot security updates (vulnerability alerts) enabled; CodeQL default setup configured for JS/TS.
- **Local/repo fix:** Prepare `.github/dependabot.yml` for scheduled version-update PRs (requires a committed file to take effect — cannot be completed without a commit).
- **External action:** `PATCH repos/{owner}/{repo}` for `security_and_analysis`; `PUT .../vulnerability-alerts`; `PUT .../automated-security-fixes`; `PATCH .../code-scanning/default-setup`.
- **Verification method:** Re-`GET` each endpoint/field.
- **Failure condition:** Feature unavailable for this plan/repo type — would be reported as NOT AVAILABLE, not fabricated as enabled.
- **Safe rollback:** Each `PATCH`/`PUT` has a corresponding disable call.
- **Release consequence:** Non-gating.

## GLOBAL-QA-009 / GLOBAL-QA-027 — CI signing hygiene and Maestro pinning

- **Current state:** `android-build`'s comment already avoided overclaiming production signing but could be more explicit; the Maestro installer pipes a floating "latest" URL into `bash`.
- **Required state:** Explicit comment distinguishing the CI verification APK (debug-signed, never distributed) from the actual EAS production AAB; Maestro installed at a pinned, known-working version.
- **Local/repo fix:** Edit `.github/workflows/ci.yml` (comment + `MAESTRO_VERSION` env var pinned to `2.9.0`, the version already validated locally against this project's own smoke test).
- **External action:** None (working-tree edit only; takes effect on next commit+push).
- **Verification method:** Read-diff review; no functional CI change expected (pin matches the currently-resolved floating version's compatible major/minor line for this project's Maestro flow file).
- **Failure condition:** N/A (documentation + version pin, not a logic change).
- **Safe rollback:** Revert the edit.
- **Release consequence:** Non-gating; improves supply-chain trust and artifact-semantics clarity.

## GLOBAL-QA-010, GLOBAL-QA-028, GLOBAL-QA-029 (Conditional external verification)

- **Current state:** NOT VERIFIED (per RELEASE-001-BASELINE, unresolved external unknowns, not proven failures).
- **Required state:** EAS production signing verified distinct from the repo debug key; EAS production Firebase env confirmed complete; Play Console listing/Data Safety/account-deletion declaration confirmed complete.
- **Local/repo fix:** None possible — these are account-gated external systems.
- **External action:** Requires an authenticated EAS CLI session (`eas login`) and Play Console access, neither available in this environment (`eas whoami` → "Not logged in"; no Play Console credential/tool configured).
- **Verification method:** N/A this sprint.
- **Failure condition:** N/A this sprint — remains NOT VERIFIED, not downgraded to FAIL and not upgraded to PASS.
- **Safe rollback:** N/A (no action taken).
- **Release consequence:** These remain the three CONDITIONAL release requirements Master already identified; Sprint 3 cannot close them without account access it does not have. Recorded as EXTERNAL/USER-AUTHORIZATION GATE items in `13_RESIDUAL_EXTERNAL_CONDITIONS.md`.

## GLOBAL-QA-012 remainder (Localization, non-Sprint-3-owned)

- **Current state:** Avatar picker, word-detail modal, word-notebook still hardcoded Turkish (confirmed by SPRINT-002-TARGETED-REAUDIT).
- **Decision:** DEFERRED. Not release-blocking (does not gate Play submission), and Sprint 3's own instructions explicitly forbid product redesign / non-release-required changes. Left as documented Product Quality debt, not fixed opportunistically here, to keep this sprint's diff minimal and release-focused.
