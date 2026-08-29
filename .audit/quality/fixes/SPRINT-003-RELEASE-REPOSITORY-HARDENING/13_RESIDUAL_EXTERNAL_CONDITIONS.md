# Residual External Conditions

## 1. EAS production AAB signing (GLOBAL-QA-010 / RELEASE-QA-002)

- **Condition:** Whether EAS's production Android build uses EAS-managed credentials (or a properly-managed production keystore) distinct from the repo's committed debug keystore.
- **Why unresolved:** No authenticated EAS CLI session exists in this environment (`eas whoami` → "Not logged in"). Logging into someone's EAS/Expo account is a credential action this sprint should not and cannot perform.
- **Local fix complete?** Yes — nothing locally fixable remains; `eas.json`'s `production` profile is correctly configured for `app-bundle` output.
- **External dependency:** The project owner's own EAS/Expo account session.
- **Who/what must perform action:** Project owner runs `eas login` (or CI/CD with an `EXPO_TOKEN`), then `eas credentials` to inspect the Android production keystore, or triggers a production build and inspects the resulting AAB's signing certificate.
- **Exact verification needed:** `eas credentials` (Android → production) shows a keystore fingerprint distinct from the repo's `debug.keystore`; or an actual production AAB's signature is inspected (`apksigner`/`jarsigner` equivalent for AAB, or Play Console's own certificate display after upload).
- **PASS criteria:** Confirmed distinct, EAS/Play-managed production signing identity.
- **FAIL criteria:** Confirmed reuse of the repo debug keystore for the actual distributable AAB — this would become a NEW proven P1 blocker, not merely leave this condition unresolved.
- **Release blocking:** YES (conditional — must resolve to PASS before final GO).

## 2. EAS production Firebase environment (GLOBAL-QA-028 / RELEASE-QA-004)

- **Condition:** Whether the EAS `production` profile has all 6 `EXPO_PUBLIC_FIREBASE_*` values configured and correctly targets project `lingorise-65cb1`.
- **Why unresolved:** Same EAS session gap as above; EAS Environments/secrets are not stored in this repo's committed files.
- **Local fix complete?** Yes — the 6 required variable names are definitively identified (`06_FIREBASE_PRODUCTION_ENV.md`); GitHub Actions' own repository variables already carry these 6 values (used by `ci.yml`), which is independent evidence the values are known and available to the project, but is not itself proof of their presence in EAS specifically.
- **External dependency:** Project owner's EAS account/dashboard access.
- **Who/what must perform action:** Project owner opens the EAS dashboard (or `eas env:list --environment production`) and confirms all 6 variables are set, or triggers a production build and confirms the Firebase-backed catalogue fetch/auth flow works on the resulting build.
- **Exact verification needed:** All 6 named variables present and non-empty in the EAS production environment; a production build's runtime successfully initializes Firebase (e.g., a successful Firestore read on first launch).
- **PASS criteria:** All 6 present, build initializes Firebase successfully.
- **FAIL criteria:** Any missing/incorrect value confirmed — would become a new blocker (a production build that can't reach Firestore/Auth at all).
- **Release blocking:** YES (conditional).

## 3. Play Console readiness (GLOBAL-QA-029 / RELEASE-QA-005)

- **Condition:** App listing, versionCode acceptance, Data Safety form, account-deletion declaration, content rating, target audience, countries, release notes, Play App Signing state.
- **Why unresolved:** No Play Console account/API access configured in this environment.
- **Local fix complete?** Partially — the account-deletion **web surface** (the actual blocking sub-component for apps with account creation) is now hosted and verified reachable (`https://lingorise-65cb1.web.app/account-deletion/`); the evidence-backed Data Safety answer set is prepared (`07_PLAY_CONSOLE_READINESS.md`).
- **External dependency:** Project owner's Play Console account access.
- **Who/what must perform action:** Project owner logs into Play Console, enters the new Privacy Policy URL and account-deletion URL, completes the Data Safety form using the evidence table in `07_PLAY_CONSOLE_READINESS.md`, and confirms listing/rating/audience/countries/release-notes completeness.
- **Exact verification needed:** Play Console shows all listed items as complete/accepted for the intended release track.
- **PASS criteria:** All items complete and accepted.
- **FAIL criteria:** Any confirmed incomplete/rejected item — would require remediation before submission (not a new P0/P1 by itself, consistent with Master's own conditional framing).
- **Release blocking:** YES (conditional).

## 4. Source revision lock / RC generation

- **Condition:** A clean, committed, reviewable source revision that an EAS production build's provenance can map to.
- **Why unresolved:** This sprint's own absolute rule (Section 41) and every prior sprint's own instruction forbid committing/pushing without explicit separate user authorization. Sprint 1 + Sprint 2 + this sprint's changes remain uncommitted.
- **Local fix complete?** Yes — every locally-fixable item across all three sprints is complete and independently re-verified (SPRINT-002-TARGETED-REAUDIT, this sprint's own artifacts).
- **External dependency:** Explicit user authorization to commit (and optionally push).
- **Who/what must perform action:** The user reviews the accumulated Sprint 1+2+3 diff and either authorizes a commit directly, or asks for a summarized commit/PR to review first.
- **Exact verification needed:** A `git commit` (and, if intended for CI/EAS provenance, `git push`) exists; `gh run list` shows a fresh CI run at the new SHA; `eas build` (once EAS session exists) can reference that exact SHA.
- **PASS criteria:** Clean working tree, one exact commit SHA, CI green at that SHA, EAS build provenance references that SHA.
- **FAIL criteria:** N/A — this is a process gate, not a pass/fail defect.
- **Release blocking:** YES — required before RELEASE-002 can be meaningfully run against an exact-revision RC.

## Not release-blocking (informational)

- `.github/dependabot.yml` and the `ci.yml` edits (Maestro pin, signing-clarity comment) are prepared but inert until committed — will take effect automatically on the next push, no further action needed beyond the commit itself.
- 17 moderate npm audit advisories (dev-only, transitive) — accepted debt, re-check at a future natural dependency-update point (Dependabot, now enabled, will proactively surface this going forward).
- GLOBAL-QA-012 remainder (avatar picker/word-detail/word-notebook localization) and GLOBAL-QA-030 (observability) — deferred Product Quality debt, not release-blocking.
