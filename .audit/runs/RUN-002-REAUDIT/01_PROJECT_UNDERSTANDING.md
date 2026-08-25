# 01 — Project Understanding (REAUDIT)

No material change to product identity, technical topology, or data flow since `RUN-001-BASELINE/01_PROJECT_UNDERSTANDING.md` — that document remains authoritative for architecture/classification and is not repeated here in full.

## What changed since baseline (revision `4a80283` → `3436a1b`)
- **CI/CD topology changed materially**: `.github/workflows/ci.yml` was added (2 new jobs: `android-build`, `e2e-smoke`) then **entirely removed** in the same session, after discovering every CI run on this repository — dating back to at least Sprint 6, long before this audit — had been silently failing with "Actions budget is preventing further use" (a GitHub account billing/spending-limit block, private repo). The account owner directed removal rather than paying to raise the limit. **Current state: this project has zero CI/CD automation.** All verification (typecheck, tests, release build, on-device smoke) is manual, performed locally before each commit.
- Two client-side accessibility defects were found and fixed via genuine on-device TalkBack + dynamic-type testing (not merely code review) — see `02_PROJECT_PURPOSE.md`/`07_DETAILED_AUDIT.md` for detail.
- Several internal refactors (AuthScreen/AccountManagementCard split, two dependency-layering corrections, one dead file removed) — no behavioral or architectural-boundary changes to the system described in the baseline's module map.

## Known constraints (updated)
- **New constraint**: no automated CI gate exists. Every future change relies on the developer (or this audit's FIX passes) running `tsc`/`npm test`/a local release build/an on-device check manually before committing. This is now a standing, documented characteristic of the project, not an oversight.
- All other constraints from `RUN-001-BASELINE` remain unchanged (no committed `ios/` project, Android-only evaluated release path, no crash-reporting SDK).

## Unknowns / confidence
Unchanged from baseline except: production Play Store publication status remains `UNKNOWN`; the account's GitHub Actions billing status is now `CONFIRMED` (over budget) rather than unexamined.
