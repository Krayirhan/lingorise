# 17 — Reporting Contract

## Writing style
Reports must be concise enough to act on but detailed enough to reproduce evidence.
Avoid generic praise and filler.

## Mandatory distinction labels
Use explicit labels for:
- `VERIFIED`
- `INFERRED`
- `UNVERIFIED`
- `N/A`
- `NOT EXECUTED`

## Scorecard format
Recommended:

| Domain | Weight | Score /10 | Weighted | Confidence | Main evidence |
|---|---:|---:|---:|---|---|

Include overall `/100` after normalization.

## Findings table
Recommended:

| ID | Severity | Domain | Status | Short issue | User impact |
|---|---|---|---|---|---|

Then detailed findings.

## No misleading precision
A score such as 81.37 is discouraged unless calculations genuinely support that precision. Prefer one decimal where useful.

## Evidence limitation section
Every run must disclose meaningful limitations:
- tests could not execute;
- emulator unavailable;
- production credentials intentionally not accessed;
- external services unavailable;
- graph tool unavailable;
- repository subset only.

## No hidden secret values
All examples/snippets in reports must be redacted where necessary.
