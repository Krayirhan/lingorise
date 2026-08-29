# Repository Hardening

All items below were applied live against the actual GitHub repository (`Krayirhan/lingorise`, public) via the authenticated `gh` CLI (scopes: `gist`, `read:org`, `repo`, `workflow`), and each is independently re-verified by re-querying the same API after applying the change. None required a commit/push.

## main branch protection

**ENABLED.** Before: `GET /branches/main/protection` → `404 Branch not protected`. Applied via `PUT /branches/main/protection`:
- Required status checks (strict — branch must be up to date): `verify`, `android-build`, `e2e-smoke`
- `allow_force_pushes`: `false`
- `allow_deletions`: `false`
- `enforce_admins`: `false` (proportionate for a solo-maintained repo — the owner can still push directly for legitimate reasons; force-push and branch deletion are still blocked even for the owner)
- No mandatory PR-review requirement was added — proportionate to a solo-maintained project per Section 19's own "do not make development impossible" instruction.

**Disclosed limitation (raised by the independent security reviewer):** because `enforce_admins` is `false`, the repository owner (who holds admin permission) can still bypass the required-status-checks rule and push directly to `main` without waiting for CI — the protection is fully binding on any non-admin contributor, but not self-binding on the owner. This is an accepted, intentional trade-off for a solo-maintained project (the alternative, `enforce_admins:true`, would block the owner's own emergency/hotfix pushes with no one else able to grant an exception) — not an oversight, but it is disclosed here rather than left implicit, so this protection is not mistaken for a hard guarantee against every possible push path.

Re-verified via a fresh `GET`: contexts `["verify","android-build","e2e-smoke"]`, `force_push:false`, `deletions:false` — confirmed live.

## Required checks — reliability check performed before marking required

Before requiring these 3 jobs, their actual recent CI reliability was checked (not assumed): `gh run list --branch main --limit 8` showed **8/8 recent CI workflow runs on `main` succeeded**, and the latest run's per-job breakdown confirmed all three jobs (`verify`, `android-build`, `e2e-smoke`) individually succeeded. This satisfies Section 20's instruction not to mark a historically unreliable/incompatible check as required without verifying it actually works.

## Secret scanning + push protection

**ENABLED.** Before: `security_and_analysis.secret_scanning.status` = `disabled`, `secret_scanning_push_protection.status` = `disabled`. Applied via `PATCH /repos/{owner}/{repo}` with `security_and_analysis[secret_scanning][status]=enabled` and `security_and_analysis[secret_scanning_push_protection][status]=enabled`. Both are free features for a **public** repository (verified `visibility: public` first) — no paid GHAS plan required, so no assumption was made about plan availability. Re-verified via a fresh `GET`: both `status: enabled`.

## Dependabot alerts / security updates

**ENABLED.** Before: `GET /vulnerability-alerts` → `404` (disabled). Applied `PUT /vulnerability-alerts` (→ `204`) and `PUT /automated-security-fixes` (→ `204`). Re-verified: `security_and_analysis.dependabot_security_updates.status` = `enabled`.

## Dependabot version-update config

**PREPARED, uncommitted.** `.github/dependabot.yml` created (npm + github-actions ecosystems, weekly schedule, 5-PR cap) — this is a repo *file*, so unlike the settings above it cannot take effect until committed and pushed. Content is minimal and non-noisy (weekly, not daily; capped PR count) per Section 22's "do not introduce noisy automation" instruction.

## Code scanning (CodeQL)

**ENABLED.** Before: `code-scanning/default-setup` → `state: not-configured`. Applied `PATCH .../code-scanning/default-setup` with `state=configured`, `query_suite=default`, `languages=[javascript-typescript]` — this uses GitHub's managed "default setup," which requires no committed workflow file (unlike a custom CodeQL Action workflow). Response confirmed a scan run was queued (`run_id` returned). Re-verified: `state: configured`, `languages: [javascript, javascript-typescript, typescript]`.

## Workflow permissions

Not modified this sprint — the existing `ci.yml` declares no explicit `permissions:` block, meaning it uses the repository's default token permissions. Inspecting/tightening the repository-wide default Actions token permission (Settings → Actions → Workflow permissions) was considered but not changed: the current CI jobs perform no writes (no `git push`, no release creation, no PR comments) that would benefit from a tighter default, and changing this account-wide setting speculatively without a concrete finding driving it would be exactly the kind of "more GitHub settings for their own sake" Section 54 explicitly says not to optimize for. Left as-is; not a finding, not a regression.

## What changed vs. what could not be changed

**Changed (live, verified):** branch protection, secret scanning, push protection, Dependabot alerts + automated security fixes, CodeQL default setup.
**Prepared but requires a commit to take effect:** `.github/dependabot.yml` (version-update PRs), `.github/workflows/ci.yml`'s Maestro pin + signing-clarity comment.
**Not changed, not attempted:** repository-wide default workflow token permissions (no driving finding); required PR reviews (proportionality decision, documented above).

## Evidence level

**E3 — live API verification.** Every claim above was independently re-queried against the actual GitHub API after the change, not merely asserted from the write call's own response.
