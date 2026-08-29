# MASTER-001 — Raw Finding Inventory

No deduplication performed in this file. Every current canonical finding is listed once. Architecture/Code Quality findings are marked "Already consolidated upstream? YES" because `MAINTAINABILITY-001-CONSOLIDATION` has already absorbed them into `MAINT-QA-*`; they are listed here for completeness/traceability only and are excluded from the raw P-severity totals in `03_ROOT_CAUSE_CLUSTERS.md`/Master `FINAL_RESULT.md` to avoid double-counting.

| Finding ID | Layer | Domain | Severity/Impact | Status | Short description | User impact | Release relevance | Canonical source | Already consolidated upstream? | Related findings (source-stated) |
|---|---|---|---|---|---|---|---|---|---|---|
| CORE-QA-001 | Product Quality | Functional Correctness | P2 | OPEN | Exam answers not distinguished from practice answers in reward/quest accounting | Daily quest can be silently completed by exam activity alone | No | `CORE-001-BASELINE/SUMMARY.md` | No | CODE-QA-004, MAINT-QA-005 |
| CORE-QA-002 | Product Quality | Functional Correctness | P3 | OPEN | Session interrupted between answer-submit and "Devam Et" can restore into duplicate-answerable state | Narrow, low-frequency double-answer bookkeeping gap | No | `CORE-001-BASELINE/SUMMARY.md` | No | — |
| DATA-QA-001 | Product Quality | Data Integrity | P1 | OPEN | Failed remote fetch during merge indistinguishable from "no remote data" | Risk of local-over-remote destructive overwrite | Yes (root cause family shared with release blocker) | `DATA-001-BASELINE/FINAL_RESULT.md` | No | — |
| DATA-QA-002 | Product Quality | Data Integrity | P1 | OPEN | Login/cold-start merge silently discards passed level exam + history fields via incomplete field-merge list | Real, bounded, recoverable progress loss | Yes — direct cause of RELEASE-QA-001 | `DATA-001-BASELINE/FINAL_RESULT.md` | No | ARCH-QA-001, RELEASE-QA-001 |
| DATA-QA-003 | Product Quality | Data Integrity | P2 | OPEN | "Irreversible" local reset silently undone by next merge for signed-in users | Broken user-facing trust contract | No | `DATA-001-BASELINE/FINAL_RESULT.md` | No | — |
| DATA-QA-004 | Product Quality | Data Integrity | P3 | OPEN | Account deletion can orphan a live Auth account with already-deleted Firestore data | Partial-failure ordering gap | No | `DATA-001-BASELINE/FINAL_RESULT.md` | No | SEC-QA-003 |
| SEC-QA-001 | Product Quality | Security & Privacy | P2 | OPEN | No server-side field/type/range validation lets a user fabricate their OWN progress state | Self-only abuse; no cross-user impact | No | `SECURITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| SEC-QA-002 | Product Quality | Security & Privacy | P3 | OPEN | `allowBackup=true`, no backup-scope restriction | Requires prior account/physical compromise to exploit | No | `SECURITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| SEC-QA-003 | Product Quality | Security & Privacy | P3 | OPEN | Non-atomic Firestore-then-Auth delete ordering; `dailyTasks` never purged | Undermines "fully erased" guarantee | No | `SECURITY-001-BASELINE/FINAL_RESULT.md` | No | DATA-QA-004 |
| SEC-QA-004 | Product Quality | Security & Privacy | P3 | OPEN | Release buildType signs with debug keystore, repo/CI scope only | No production-signing provenance for CI artifact | Yes (release-adjacent, not proven for shipped artifact) | `SECURITY-001-BASELINE/FINAL_RESULT.md` | No | SUPPLY-QA-004, RELEASE-QA-002 |
| SEC-QA-005 | Product Quality | Security & Privacy | P4 | OPEN | No dedicated auth-flow test; no explicit `dailyTasks` cross-user denial assertion | Verification gap, not a proven defect | No | `SECURITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| REL-QA-001 | Product Quality | Reliability | P4 | OPEN | Catalogue-loading race on rapid level-switch regresses that level's content freshness | Bounded, per-level content-freshness regression | No | `RELIABILITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| REL-QA-002 | Product Quality | Reliability | P3 | OPEN | `ErrorBoundary` restart action doesn't actually reload/remount | Recovery affordance doesn't work as implied | No | `RELIABILITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| REL-QA-003 | Product Quality | Reliability | P3 | OPEN | Reset/clear-data failures can be silently swallowed without user signal | Trust-sensitive action fails silently | No | `RELIABILITY-001-BASELINE/FINAL_RESULT.md` | No | DATA-QA-003 (related, independent root cause) |
| REL-QA-004 | Product Quality | Reliability | P3 | OPEN | Cloud-sync failures are console-only, not surfaced to user | Silent failure, no user signal | No | `RELIABILITY-001-BASELINE/FINAL_RESULT.md` | No | DATA-QA-001 (related, independent root cause) |
| MAINT-QA-001 | Product Quality | Maintainability | P2 | OPEN | No canonical schema for "user progress" — 3 independently maintained field lists | Root cause of DATA-QA-002 | Yes (architectural cause of release blocker) | `MAINTAINABILITY-001-CONSOLIDATION/FINAL_RESULT.md` | — (this IS the canonical consolidation) | DATA-QA-002, VERIFY-QA-001, RELEASE-QA-001 |
| MAINT-QA-002 | Product Quality | Maintainability | P3 | OPEN | `AccountManagementCard`/`DataManagementCard` bypass `services/auth.ts` for one `updateProfile()` write | Boundary-purity issue, no user-facing symptom found | No | `MAINTAINABILITY-001-CONSOLIDATION/FINAL_RESULT.md` | — | — |
| MAINT-QA-003 | Product Quality | Maintainability | P4 | OPEN | 2 dead barrel files + 5 orphaned exported functions | None (dead code) | No | `MAINTAINABILITY-001-CONSOLIDATION/FINAL_RESULT.md` | — | — |
| MAINT-QA-004 | Product Quality | Maintainability | P3 | OPEN | `onGoalSelect(mins as any)` defeats literal-union type, no runtime validation | Latent risk if `GoalStep` options ever change | No | `MAINTAINABILITY-001-CONSOLIDATION/FINAL_RESULT.md` | — | — |
| MAINT-QA-005 | Product Quality | Maintainability | P4 | OPEN | `_sessionMode` param accepted, never read | Implies behavior that doesn't exist | No | `MAINTAINABILITY-001-CONSOLIDATION/FINAL_RESULT.md` | — | CORE-QA-001 |
| PERF-QA-001 | Product Quality | Performance | P4 | OPEN | `loadUserData()` runs 3x on signed-in cold start | Redundant work, no measured user-perceived lag | No | `PERFORMANCE-001-BASELINE/FINAL_RESULT.md` | No | — |
| PERF-QA-002 | Product Quality | Performance | P3 | OPEN | First interactive screen gated behind catalogue network fetch despite instant bundled fallback | Startup delay on happy path | No | `PERFORMANCE-001-BASELINE/FINAL_RESULT.md` | No | — |
| PERF-QA-003 | Product Quality | Performance | P3 | OPEN | Every practice/exam answer triggers 3 Firestore writes + 1 full local write | Unmeasured resource-efficiency cost, no responsiveness impact | No | `PERFORMANCE-001-BASELINE/FINAL_RESULT.md` | No | — |
| PERF-QA-004 | Product Quality | Performance | P4 | OPEN | ~1.05MB mascot raster used at modest display sizes | Asset-size inefficiency | No | `PERFORMANCE-001-BASELINE/FINAL_RESULT.md` | No | — |
| A11Y-QA-001 | Product Quality | Accessibility | P2 | OPEN | Core practice/exam prompt text shrinks instead of respecting font-scale | Core interaction inaccessible to font-scale users | No | `ACCESSIBILITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| A11Y-QA-002 | Product Quality | Accessibility | P3 | OPEN | Two secondary Practice-screen touch targets below platform guidance | Harder to tap for motor-impaired users | No | `ACCESSIBILITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| A11Y-QA-003 | Product Quality | Accessibility | P3 | OPEN | Muted text 4.10:1 contrast, below WCAG AA 4.5:1 | Reduced legibility for low-vision users | No | `ACCESSIBILITY-001-BASELINE/FINAL_RESULT.md` | No | — |
| COMPAT-QA-001 | Product Quality | Compatibility | P2 | OPEN | Multiple components hardcode Turkish incl. entire in-app Privacy Policy content | English-locale users see wrong-language/broken content | Yes (shares surface with RELEASE-QA-003) | `COMPATIBILITY-001-BASELINE/FINAL_RESULT.md` | No | RELEASE-QA-003 (related, independent root cause) |
| CD-004 | Consumer Design | Consumer | Impact: LOW-MEDIUM | OPEN | Memrise already uses similar garden-growth metaphor | Competitive-differentiation dilution risk | No | `CONSUMER-003-REAUDIT/SUMMARY.md` | No | — |
| CD-005 | Consumer Design | Consumer | Impact: LOW | OPEN | XP no longer visible anywhere on Practice Hub | Minor information loss on one screen | No | `CONSUMER-003-REAUDIT/SUMMARY.md` | No | — |
| CD-006 | Consumer Design | Consumer | Impact: LOW | OPEN | "Hesap & Bulut Senkronizasyonu" label reads more technical/corporate than app tone | Minor tone inconsistency | No | `CONSUMER-003-REAUDIT/SUMMARY.md` | No | — |
| VERIFY-QA-001 | Assurance | Verification | P1 | OPEN | Multi-device merge test never calls the real `mergeAndSyncUserData()`, hand-reimplements formula | False confidence; already let DATA-QA-002 ship undetected | Yes — required evidence for RELEASE-QA-001 closure | `VERIFICATION-ASSURANCE-001-BASELINE/FINAL_RESULT.md` | No | DATA-QA-002, MAINT-QA-001 |
| VERIFY-QA-002 | Assurance | Verification | P3 | OPEN | Clock-manipulation anomaly test is tautological (`assert(true,...)`) | False confidence in anomaly detection | No | `VERIFICATION-ASSURANCE-001-BASELINE/FINAL_RESULT.md` | No | — |
| SUPPLY-QA-001 | Assurance | Supply Chain | P2 | OPEN | `main` has no branch protection or ruleset | Unreviewed changes can reach `main` | Yes | `SUPPLY-CHAIN-001-BASELINE/FINAL_RESULT.md` | No | — |
| SUPPLY-QA-002 | Assurance | Supply Chain | P2 | OPEN | GitHub secret scanning disabled | Weaker future credential-leak detection | Yes | `SUPPLY-CHAIN-001-BASELINE/FINAL_RESULT.md` | No | — |
| SUPPLY-QA-003 | Assurance | Supply Chain | P3 | OPEN | E2E CI pipes Maestro installer URL directly to bash, unpinned | CI execution-trust exposure | No | `SUPPLY-CHAIN-001-BASELINE/FINAL_RESULT.md` | No | — |
| SUPPLY-QA-004 | Assurance | Supply Chain | P3 | OPEN | CI release APK uses committed debug signing key | No production-signing provenance for this CI artifact | Yes | `SUPPLY-CHAIN-001-BASELINE/FINAL_RESULT.md` | No | SEC-QA-004, RELEASE-QA-002 |
| SUPPLY-QA-005 | Assurance | Supply Chain | P4 | OPEN | No Dependabot config; alerts/code-scanning disabled | Manual-only dependency/security discovery | No | `SUPPLY-CHAIN-001-BASELINE/FINAL_RESULT.md` | No | — |
| SUPPLY-QA-006 | Assurance | Supply Chain | P4 | OPEN | 17 moderate build/dev dependency advisories | Tooling-path vulnerability debt, no established runtime path | No | `SUPPLY-CHAIN-001-BASELINE/FINAL_RESULT.md` | No | — |
| RELEASE-QA-001 | Release | Release Readiness | P1 | OPEN — proven blocker | Cold-start merge release-path consequence of DATA-QA-002 | Same production data-loss defect, release-path framing | Yes — proven blocker | `RELEASE-001-BASELINE/FINAL_RESULT.md` | No | DATA-QA-002 |
| RELEASE-QA-002 | Release | Release Readiness | P3 (post-adjudication) | OPEN — conditional | EAS production AAB signing / Play App Signing NOT VERIFIED | External verification, not a proven defect | Yes — release condition | `RELEASE-001-BASELINE/FINAL_RESULT.md` | No | SEC-QA-004, SUPPLY-QA-004 |
| RELEASE-QA-003 | Release | Release Readiness | P1 | OPEN — proven blocker | Privacy-policy URL doesn't anonymously expose app-specific policy | Mandatory Play requirement demonstrably unmet | Yes — proven blocker | `RELEASE-001-BASELINE/FINAL_RESULT.md` | No | COMPAT-QA-001 |
| RELEASE-QA-004 | Release | Release Readiness | P3 (post-adjudication) | OPEN — conditional | EAS production Firebase environment NOT VERIFIED | External verification, not a proven defect | Yes — release condition | `RELEASE-001-BASELINE/FINAL_RESULT.md` | No | — |
| RELEASE-QA-005 | Release | Release Readiness | P3 | OPEN — conditional | Play Console version/listing/Data Safety NOT VERIFIED | External verification, not a proven defect | Yes — release condition | `RELEASE-001-BASELINE/FINAL_RESULT.md` | No | — |
| RELEASE-QA-006 | Release | Release Readiness | P3 | OPEN | Production observability local-only | Non-blocking improvement | No | `RELEASE-001-BASELINE/FINAL_RESULT.md` | No | — |

**Supporting evidence (Architecture/Code Quality — already consolidated into MAINT-QA-* above; listed for traceability only, not counted separately):**

| Finding ID | Absorbed into | Canonical source |
|---|---|---|
| ARCH-QA-001 | MAINT-QA-001 | `ARCHITECTURE-001-BASELINE/SUMMARY.md` |
| ARCH-QA-002 | MAINT-QA-002 | `ARCHITECTURE-001-BASELINE/SUMMARY.md` |
| ARCH-QA-003 | MAINT-QA-003 | `ARCHITECTURE-001-BASELINE/SUMMARY.md` |
| CODE-QA-001 | MAINT-QA-004 | `CODE-QUALITY-001-BASELINE/SUMMARY.md` |
| CODE-QA-002 | MAINT-QA-003 | `CODE-QUALITY-001-BASELINE/SUMMARY.md` |
| CODE-QA-003 | MAINT-QA-001 | `CODE-QUALITY-001-BASELINE/SUMMARY.md` |
| CODE-QA-004 | MAINT-QA-005 | `CODE-QUALITY-001-BASELINE/SUMMARY.md` |

**Raw P-severity totals (Product Quality + Assurance + Release, excluding Consumer Impact findings and excluding Architecture/Code Quality supporting evidence already absorbed into Maintainability):**

P0: 0 | P1: 5 | P2: 8 | P3: 21 | P4: 8 — **Total: 42**

Consumer Impact findings (separate scale, not counted above): 3 (CD-004, CD-005, CD-006)
