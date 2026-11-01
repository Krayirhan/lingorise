# Test Evidence

Run fresh, inside the clean `release/lingorise-rc1-eas-link` worktree (`D:/lingorise-eas-link`), after the EAS linkage diff was produced and before staging.

`npm run typecheck`: **PASS** (0 errors)
`npm test`: **PASS — 422 passed, 0 failed**

Identical count to every prior verification in this program (SOURCE-REVISION-LOCK-001, RC-001) — confirms the linkage change (a pure `app.json` metadata addition, never read by any application/test code path) introduced no regression, as expected.

## Config resolution sanity

`npx eas-cli project:info` resolving to `@mfurkant/lingorise` / `cb13fe89-238a-4a69-9b8e-a128808fc1c6` (see `02_PROJECT_LINKAGE.md`) itself demonstrates that Expo config resolution and EAS project linkage both work correctly post-change — this command reads and validates `app.json` end-to-end to produce that output.

Production profile recognition: `eas.json`'s `production` profile is unchanged and was not the subject of this task's verification (that belongs to a fresh RC-001 attempt), but its file content is confirmed byte-identical to before this change (`git diff eas.json` → empty).

## Secret scan

Diff scanned for API-key-shaped strings, PEM headers, `service_account`/`private_key` fields, GitHub/OpenAI/AWS credential prefixes, and inline password literals: **no matches**. The only new string is the EAS project UUID (`cb13fe89-238a-4a69-9b8e-a128808fc1c6`), which is a public project identifier, not a secret (consistent with Section 17's own statement: "The EAS projectId is not a secret").
