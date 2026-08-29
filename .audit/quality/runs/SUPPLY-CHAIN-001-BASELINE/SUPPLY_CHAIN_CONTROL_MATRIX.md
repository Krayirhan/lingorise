# Supply-Chain Control Matrix

| Control | Current mechanism | Evidence | Status | Confidence |
|---|---|---|---|---|
| Lockfile | Tracked npm lockfile v3 | `package-lock.json`; root specs match | PASS | High |
| Deterministic npm install | `npm ci` in every CI job | `.github/workflows/ci.yml` | PASS | High |
| Runtime dependency advisory posture | No runtime-relevant advisory established | `npm audit`, dependency paths | PASS | Medium |
| Build-time dependency advisory posture | 17 moderate advisories in build/dev paths | `npm audit`; `npm ls` | PARTIAL | High |
| Npm registry/provenance | npmjs-only resolutions with integrity; no git/path/tarball specs | Lockfile analysis | PASS | High |
| Package lifecycle exposure | No project lifecycle hook; four transitive install scripts | Manifest/lockfile analysis | PARTIAL | Medium |
| GitHub Action trust | Major tags, one third-party action tag; remote Maestro installer | Workflow inspection | PARTIAL | High |
| Workflow permissions | No explicit permissions block; live default unavailable | Workflow + API scope limitation | NOT VERIFIED | Medium |
| Secret exposure in CI | No `secrets.*`; only public `EXPO_PUBLIC_*` variables | Workflow inspection | PASS | High |
| Untrusted PR execution | `pull_request` only; no `pull_request_target`; no unsafe event interpolation | Workflow inspection | PASS | High |
| Current secret hygiene | No credible selected-category match | Bounded tracked scan | PASS | Medium |
| Historical secret hygiene | No selected-category hit in bounded all-ref check | Git history check | PARTIAL | Medium |
| Branch protection | None on `main`, no rulesets | Live GitHub API | FAIL | High |
| Required status checks | Not enforced by branch rule/ruleset | Live GitHub API | FAIL | High |
| Secret scanning | Disabled | Live GitHub API | FAIL | High |
| Push protection | State unavailable | API response | NOT VERIFIED | Medium |
| Dependabot / maintenance automation | No config; alerts disabled | Repo and live API | PARTIAL | High |
| Toolchain version control | CI pins Node/JDK majors; no repo-local Node/npm version file | Workflow/repo config | PARTIAL | High |
| Gradle wrapper | Tracked, HTTPS Gradle 9.3.1 with URL validation | Wrapper properties + tracked files | PASS | High |
| Dependency repositories | Google/Maven Central plus HTTPS JitPack | `android/build.gradle` | PARTIAL | High |
| Build reproducibility | Locked npm; wrapper; CI build; local Java differs for Rules test | CI, wrapper, shared verification | PARTIAL | High |
| Artifact trust | CI APK built from checkout but debug-signed and not attested/published | Workflow + `android/app/build.gradle` | PARTIAL | High |
| EAS credential provenance | Production AAB declared, remote credentials unavailable | `eas.json` | NOT VERIFIED | High |
