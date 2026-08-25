# 14 — Re-Audit Protocol

## Goal
Measure real improvement with the same yardstick.

## Inputs
- latest valid locked rubric;
- prior authoritative run;
- current repository revision;
- finding/action registries;
- repository diff/history when available.

## Step 1 — Validate rubric lock
Use the same rubric version unless there is a documented material scope/risk change.

## Step 2 — Determine change surface
Use version-control diff plus dependency/graph evidence where available to identify:
- changed files/modules;
- affected call/dependency paths;
- potential blast radius;
- changed data schemas/configuration;
- newly introduced dependencies.

## Step 3 — Deep re-check impacted criteria
Re-run relevant evidence for changed areas and linked findings.

## Step 4 — Mandatory global gates
Even if unchanged, re-check where applicable:
- project build/compile;
- primary automated test suite or representative critical tests;
- critical user flows where executable;
- P0 security/data-integrity gates;
- secret exposure scan/check where safe;
- dependency health where dependencies changed;
- release build in release-focused runs.

## Step 5 — Finding lifecycle
For every previously open P0/P1 and every action claimed complete:
- verify acceptance criteria;
- close, keep open, mark partial, or invalidate with evidence.

## Step 6 — Detect regressions
Do not assume a fix improved the project globally.
Search for behavior/quality regressions in affected paths.

## Step 7 — Re-score
Re-score the entire rubric using current evidence, but avoid unnecessary full-repository re-reading if unchanged high-confidence evidence remains valid.

## Output
Create new immutable run plus delta/regression reports.
