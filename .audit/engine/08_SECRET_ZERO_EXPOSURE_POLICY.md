# 08 — Secret Zero Exposure Policy

## Objective
Audit the security of secret handling without unnecessarily revealing secret values to the model, terminal logs, reports or stored audit artifacts.

## Core rule
**Presence, location, naming, scope and handling of secrets may be assessed. Raw secret values must not be intentionally displayed or copied.**

## Forbidden by default
Do not run broad value-dumping commands such as:

```text
cat .env
cat .env.*
printenv
env
set
Get-ChildItem Env:
```

Do not dump credential files, keystores, private keys, service-account JSON, signing material or local secret stores into output.

## Safe inspection patterns
Prefer checks that reveal metadata rather than values:
- file exists / permissions / tracked status;
- key names only;
- configuration references to environment-variable names;
- whether secrets are hard-coded, without reproducing the full value;
- redacted scanner output;
- git tracking/history indicators without printing secret content.

## Reporting format
Allowed:
```text
Potential secret-like hard-coded credential detected in src/.../Config.kt
Type: API key pattern
Value: [REDACTED]
Evidence: SEC-E12
```

Forbidden:
```text
API_KEY=actual-secret-value
```

## Scanner safety
A secret scanner may be used only when output is known/configured to redact values or when output is post-processed before entering reports/model context.

## Tool arguments
Do not pass secret values directly as command-line arguments when avoidable because process lists/history may expose them.

## External/network tools
Never upload repository source, `.env`, credentials or proprietary code to an external analysis service solely for auditing unless the user explicitly authorized that data transfer.
Prefer local/offline analysis.

## If accidental exposure occurs
1. Stop propagating the value.
2. Do not repeat it in the report.
3. Mark it `[REDACTED]`.
4. Create a finding recommending rotation if exposure was meaningful.
5. Explain the exposure path without reproducing the secret.

## Secret score proportionality
Secret-management controls are scored according to actual exposure and risk. An offline app with no backend secret requirements should not be penalized for lacking enterprise secret infrastructure.
