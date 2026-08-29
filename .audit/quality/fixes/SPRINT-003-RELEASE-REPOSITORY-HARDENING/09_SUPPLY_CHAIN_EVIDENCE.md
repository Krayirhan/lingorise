# Supply Chain Evidence (no rescoring — evidence only, per Section 37)

## npm audit (fresh, this sprint)

```
Critical: 0
High: 0
Moderate: 17
Low: 0
Total: 17
Dependencies: 600 prod, 604 dev, 37 optional (1214 total)
```

Identical counts to the historical `SUPPLY-CHAIN-001-BASELINE` state (0/0/17/0) — **no drift, no new advisory**.

## Classification

All 17 moderate advisories trace to `uuid`/`gaxios`/`xcode` transitive dependencies of `firebase-tools` (a devDependency) and of `@expo/config-plugins` (a transitive dependency of `expo` itself). **Correction applied after independent security review:** `expo` is classified by `package.json` as a **production** dependency, not a devDependency — the earlier draft of this file incorrectly generalized all 17 advisories as "devDependency-only." The accurate characterization is narrower: the specific vulnerable code path (`xcode`, used by `@expo/config-plugins` to manipulate native iOS Xcode project files) is exercised only during **build-time tooling** (`expo prebuild`/native project generation), not inside the JS bundle that actually ships and executes on a user's device at runtime — so the practical runtime-reachability risk remains low, but "devDependency-only" was not the correct basis for that conclusion, and is retracted. `npm audit`'s own `fixAvailable` for these requires a semver-**major** bump of `firebase-tools` (to 13.13.3, actually older than the current `^15.28.1` — i.e., `npm audit fix`'s suggestion here is a downgrade, not a safe forward fix) or of `expo` (to 46.0.21, many majors behind the current `^56.0.20`). Neither is a safe, low-risk, high-leverage change — both would be a significant, disruptive downgrade of core tooling for advisories that don't reach the shipped runtime bundle's actual execution path.

**Decision: no dependency churn performed.** Consistent with Section 25's explicit instruction not to chase zero advisories through broad, disruptive changes, and consistent with `SUPPLY-CHAIN-001-BASELINE`'s own prior classification of these as build/dev-side rather than proven production runtime vulnerabilities. Documented as accepted debt, not silently dropped.

## Direct vs. transitive, runtime vs. dev

| Advisory source | Type | Direct/transitive |
|---|---|---|
| `uuid` (<11.1.1) | dev | transitive (via `@expo/ngrok`, `gaxios`, `firebase-tools`) |
| `gaxios` | dev | transitive (via `firebase-tools`) |
| `xcode` | build-tooling (native project generation) | transitive (via `@expo/config-plugins`, a dependency chain reached through `expo`, which is itself a **production** dependency by `package.json` classification) |

No advisory was found reachable from the app's actual **shipped runtime code path** (the JS bundle executed on-device: `react`, `react-native` core APIs, `firebase` Auth/Firestore calls, `@react-native-async-storage/async-storage`, `react-native-safe-area-context`) — confirmed by `npm audit`'s own `effects`/`nodes` fields, which resolve into `xcode`'s native-project-file-manipulation code, invoked only during `expo prebuild`/native build generation, not at app runtime. This is a narrower and more accurate claim than "devDependency-only" (retracted above) — `expo` itself is a production dependency, but the specific vulnerable sub-path is build-tooling code within it, not runtime code.

## CI installer pinning

Addressed — see `08_REPOSITORY_HARDENING.md` and `02_RELEASE_BLOCKER_PLAN.md`: Maestro installer now pinned to `2.9.0` via `MAESTRO_VERSION` env var in `.github/workflows/ci.yml` (prepared, uncommitted).

## Artifact naming/provenance

Addressed — see `05_SIGNING_AND_ARTIFACT_PROVENANCE.md`: CI's debug-signed verification APK is now explicitly documented as never uploaded/distributed and distinct from the production EAS AAB.

## Dependency monitoring

Addressed — see `08_REPOSITORY_HARDENING.md`: Dependabot alerts + automated security fixes enabled live; `.github/dependabot.yml` version-update config prepared (uncommitted); CodeQL default setup enabled live.

## Repository controls

Addressed — see `08_REPOSITORY_HARDENING.md`: branch protection, secret scanning, push protection.

## Remaining risks (not rescored, recorded for the future SUPPLY-CHAIN-002-REAUDIT)

- 17 moderate dev-side advisories remain, accepted as documented debt.
- `.github/dependabot.yml` and the `ci.yml` Maestro/signing-clarity edits are prepared but inert until committed and pushed — the reaudit should re-verify they actually took effect once a commit exists.
- No repository-wide default Actions token permission review was performed (no driving finding — see `08_REPOSITORY_HARDENING.md`).
