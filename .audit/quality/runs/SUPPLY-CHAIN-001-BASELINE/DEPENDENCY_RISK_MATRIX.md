# Dependency Risk Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Dependency / advisory | Direct / transitive | Runtime / build / dev | Severity | Reachability | Existing mitigation | Fix availability | Assurance impact |
|---|---|---|---|---|---|---|---|
| `@opentelemetry/core` via `firebase-tools → @google-cloud/pubsub` | Transitive of direct dev dependency | Build/dev tooling | Moderate | Not established in app bundle | Locked dependency; CI uses `npm ci` | Force path proposes breaking `firebase-tools` downgrade | P4 posture debt |
| `re2` via `firebase-tools → superstatic` | Transitive of direct dev dependency | Build/dev tooling | Moderate | Not established in app bundle | Locked dependency | Non-force fix reported | P4 posture debt |
| `uuid` via `@expo/ngrok` | Transitive of direct dev dependency | Dev tooling | Moderate | Not established in app bundle | Locked dependency | Force path may alter tooling | P4 posture debt |
| `uuid` via Expo CLI/config-plugin path | Transitive of runtime Expo ecosystem dependency | Build-chain relevant | Moderate | Not established in shipped runtime | CI build is deterministic; no direct runtime use identified | Force path proposes breaking change | P4 posture debt |
| `firebase`, Expo modules, React Native, AsyncStorage | Direct | Runtime/platform | — | Runtime reachable by design | Package lock, npm registry integrity, CI install | N/A | No advisory established by this audit |

## Dependency integrity controls

- `package-lock.json` v3 exists, is tracked, matches all root manifest specs, has no missing package integrity fields, and uses `registry.npmjs.org` exclusively.
- No direct git, HTTP tarball, local-path, private-registry, or branch-based npm dependency was found.
- Project scripts contain no `preinstall`, `postinstall`, or `prepare` hook. Four transitive packages declare install scripts, including normal native dependency `re2`; this was considered build-chain exposure, not evidence of compromise.
- The audit ran `npm audit` once only. It did not run any remediation command.

Conclusion: current advisories justify a limited build/dev dependency deduction, not a runtime-vulnerability finding.
