# CI Trust Matrix

| Workflow | Trigger | External actions / refs | Permissions | Secrets / variables | Untrusted-input exposure | Artifact behavior | Status | Confidence |
|---|---|---|---|---|---|---|---|---|
| `CI` / `verify` | `pull_request`, push `main` | `actions/checkout@v4`, `setup-node@v4`, `setup-java@v4` (major tags) | No explicit stanza; default not verified | None | No direct event-field shell interpolation; no `pull_request_target` | No artifact | PARTIAL | High |
| `CI` / `android-build` | same | `checkout@v4`, `setup-node@v4`, `setup-java@v4` | No explicit stanza; default not verified | `vars.EXPO_PUBLIC_*` only; public Firebase client config | Same | Builds `assembleRelease`; no upload/publish | PARTIAL | High |
| `CI` / `e2e-smoke` | same | official actions major tags; `reactivecircus/android-emulator-runner@v2`; `upload-artifact@v4` | No explicit stanza; default not verified | `vars.EXPO_PUBLIC_*` only | Same; third-party action receives build/test context, not repo secrets evidenced here | Debug-only E2E logs/screenshots uploaded for five days; Maestro failure causes final job failure | PARTIAL | High |

## Trust assessment

- All jobs perform deterministic `npm ci`; the current same-HEAD CI run `33193481724` succeeded.
- There is no `pull_request_target`, `workflow_run`, repository secret reference, unsafe PR-title/branch/message interpolation, or observed `continue-on-error` path that masks the Maestro outcome.
- `curl -Ls https://get.maestro.mobile.dev | bash` executes an externally hosted installer without a committed checksum/version pin. This is the principal CI execution-trust finding (`SUPPLY-QA-003`).
- Action major tags are mutable. This is a hardening concern; common official major tags alone are not treated as a high-severity compromise path. The third-party emulator action is also tag-pinned rather than SHA-pinned.
- Actions are enabled and all actions are allowed; repository-level SHA pinning is not required. The live API did not permit verification of default `GITHUB_TOKEN` permissions, so least privilege is not claimed.
