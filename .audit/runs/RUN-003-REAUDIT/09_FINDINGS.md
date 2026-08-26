# 09 — Findings (REAUDIT)

Full current status lives in `.audit/state/FINDING_REGISTRY.md` (authoritative). This document summarizes the lifecycle verification required by `14_REAUDIT_PROTOCOL.md` §5 and records 2 new observations surfaced by this reaudit's public-repo/CI re-examination.

## Finding lifecycle verification (all findings)

| ID | Severity | Status | Verified how this reaudit |
|---|---|---|---|
| CORE-001, CORE-002, CORE-003 | P1/P2/P3 | CLOSED | Re-ran full 300-assertion suite fresh — all associated tests still present and passing. |
| DATA-001 | P1 | **PARTIAL (unchanged)** | Re-read `useUserProgress.ts` — structural fix still present, untouched by this delta. Real two-device test still not performed. Correctly kept open. |
| DATA-002, REL-001 | P2 | CLOSED | Source re-read, fixes intact, untouched by this delta. |
| ARCH-001, ARCH-002, ARCH-003, ARCH-004 | P2-P4 | CLOSED | Source re-read, no reversion, untouched by this delta. |
| ACC-001 | P3 | **PARTIAL (unchanged)** | Untouched by this delta. Remaining scope (onboarding, promotion modal, Scanner, `reduceMotion`) still untested. |
| ACC-002, ACC-003, ACC-004 | P2-P4 | CLOSED | Untouched by this delta, re-confirmed via prior evidence. |
| SEC-002 | P4 | CLOSED | `.env.example` re-read — placeholders confirmed, untouched. |
| DEP-001 | P4 | ACCEPTED_RISK | Unchanged — no new dependency activity to re-triage. |
| **DEPLOY-001** | P3 | **CLOSED (re-confirmed, stronger evidence)** | Registry already marked `VERIFIED→CLOSED` in `FIX-2026-08-25-09`. This reaudit independently re-confirmed the closure is genuine and current: `gh run list`/`gh run view` on the *current* `HEAD` commit (`29ce04e`, run `32900631213`) shows all 3 jobs green — not merely trusting the FIX log's own claim about an earlier commit. |

**No previously-closed finding was found to have regressed** (see `13_REGRESSION_REPORT.md`).

---

## New findings this reaudit cycle

### DEPLOY-002 — `main` has no branch-protection rule; CI is visible, not enforced
- Severity: **P4** · Domain: Deployment/release engineering · Status: OPEN · Confidence: HIGH
- Evidence: `gh api repos/Krayirhan/lingorise/branches/main/protection` → `404 Branch not protected`.
- Problem: CI runs on every push to `main` and is currently green, but nothing technically prevents a commit with a failing `verify`/`android-build`/`e2e-smoke` check from remaining on `main` — there is no "require status checks to pass before merging" rule.
- Why it matters: for this project's actual workflow (a solo developer pushing directly to `main`, no PRs observed in the commit history), the practical exposure is limited — the developer sees the red run within ~10 minutes either way. It matters more if the project ever gains a second contributor or moves to a PR-based workflow, at which point an unprotected `main` could silently accept a broken merge.
- Recommended direction: enable a branch-protection rule on `main` requiring the `verify` (at minimum) status check to pass before merging, once/if a PR-based workflow is adopted. Not urgent for the current single-developer, direct-push pattern.
- Acceptance criteria: `gh api repos/.../branches/main/protection` returns a rule requiring at least the `verify` job.
- Verification method: re-run the same `gh api` check.
- First seen run: RUN-003-REAUDIT.

### SEC-003 — GitHub secret scanning / push protection disabled on now-public repo
- Severity: **P4** · Domain: Security · Status: OPEN · Confidence: HIGH
- Evidence: `gh api repos/Krayirhan/lingorise` → `security_and_analysis.secret_scanning.status: "disabled"`, `secret_scanning_push_protection.status: "disabled"`.
- Problem: now that the repository is public, GitHub's secret-scanning and push-protection features are available free of charge but are not enabled.
- Why it matters: this is a hardening opportunity, not evidence of an active problem — this reaudit's own repo-wide scan (E3-SEC-02) found no committed secrets, and `.env` is correctly gitignored. Enabling these features would catch a future accidental secret commit before or immediately after it lands, which matters more now that the repo is public than it did when private.
- Recommended direction: enable both features in repo Settings → Code security and analysis (a one-click, no-cost change for a public repo).
- Acceptance criteria: both statuses read `"enabled"`.
- Verification method: re-run the same `gh api` check.
- First seen run: RUN-003-REAUDIT.

Both `DEPLOY-002` and `SEC-003` are genuine, actionable, low-severity observations grounded in direct evidence (per `11_FINDING_PROTOCOL.md`'s quality test) — not generic best-practice checklist items (per `19_FALSE_POSITIVE_AND_OVERENGINEERING_POLICY.md`, both connect directly to this specific project's now-changed public/CI posture, not an abstract "should have branch protection" rule applied universally). Neither is a release blocker at this risk tier.

---

## Correction log

None this reaudit — no prior evidence was found to be inaccurate on re-verification.
