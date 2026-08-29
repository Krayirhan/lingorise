# MASTER-001 — Global Findings (Deduplicated Authoritative Backlog)

All items status: OPEN. Severity of a merged Global finding reflects the real demonstrated impact of the remediation unit, not the mechanical maximum of its source severities (see per-item "Severity justification").

## Sprint 1 — Integrity & Verification

### GLOBAL-QA-001 — Establish canonical progress-schema ownership and fix merge-completeness
- **Master severity:** P1 — **Justification:** direct, current cause of a proven, reachable production data-loss path (RELEASE-QA-001/DATA-QA-002); matches the P1 bar ("reachable serious progress loss/corruption") independently confirmed twice.
- **Priority:** CRITICAL PATH
- **Fix policy:** MUST FIX BEFORE RELEASE
- **Root cause:** No compiler-enforced single declaration of "user progress" fields; `firestore.ts` maintains three independent hand-written field lists, one of which omits `passedLevelExams` and 7 other fields.
- **Source findings:** DATA-QA-002 (primary), ARCH-QA-001 (supporting), CODE-QA-003 (supporting), MAINT-QA-001 (supporting/consolidated)
- **Affected product/layer:** Data Integrity, Maintainability
- **Evidence basis:** E2 direct source read, independently re-verified across three separate audit passes
- **Actual user impact:** Real, bounded, recoverable loss of `passedLevelExams` and secondary/history fields after a transient sync failure + cold restart
- **Release impact:** Sole root cause of RELEASE-QA-001 (proven release blocker)
- **Required fix:** A single canonical, compiler-enforced typed declaration (or pick/map driven by one field registry) that all three consumers (`syncUserData`, `syncUserProgress`, `mergeAndSyncUserData`) derive from, with each field's merge strategy explicitly and correctly classified (not blanket MAX/UNION/remote-wins/local-wins)
- **Required verification:** Executable merge-matrix tests exercising the real production function (see GLOBAL-QA-002)
- **Dependencies:** None (foundation for GLOBAL-QA-014's Firestore-rules validation and GLOBAL-QA-031's rules test)
- **Recommended sprint:** 1
- **Release blocker:** YES (owns RELEASE-QA-001 closure)

### GLOBAL-QA-002 — Merge test oracle must exercise real production merge logic
- **Master severity:** P1 (Assurance) — **Justification:** the existing oracle is drift-blind and already let a real defect ship; per Section 14, this is required evidence for RELEASE-QA-001 closure, not a cosmetic test-quality nit.
- **Priority:** CRITICAL PATH
- **Fix policy:** MUST FIX BEFORE RELEASE
- **Root cause:** The multi-device merge test hand-reimplements `mergeAndSyncUserData()`'s formula inline instead of calling the real function.
- **Source findings:** VERIFY-QA-001
- **Affected product/layer:** Verification Assurance
- **Evidence basis:** E2, confirmed line-by-line copy of the real function's field list at time of writing, by two independent reviewers
- **Actual user impact:** Indirect — false confidence that let DATA-QA-002 ship undetected
- **Release impact:** Required evidence for RELEASE-QA-001 closure per the Release Blocker Closure Standard (static inspection alone is insufficient)
- **Required fix:** Refactor the test to call the real, exported merge function (extracting it to a shared pure function if it is not already independently callable)
- **Required verification:** The refactored test must fail if the real function's field-merge list regresses
- **Dependencies:** GLOBAL-QA-001 must land first so the oracle exercises the corrected logic, not the old broken one
- **Recommended sprint:** 1
- **Release blocker:** NO (directly, but gates the evidence needed to close RELEASE-QA-001)

### GLOBAL-QA-003 — Distinguish remote-fetch-failure from remote-absent in merge decisions
- **Master severity:** P1 — **Justification:** a real, reachable mechanism by which unknown remote state is treated as empty remote state, authorizing a destructive local-over-remote overwrite; matches P1 per the same standard as DATA-QA-002.
- **Priority:** CRITICAL PATH
- **Fix policy:** MUST FIX BEFORE RELEASE
- **Root cause:** The remote-fetch layer conflates "no document exists" with "the read failed," so both produce the same downstream merge behavior.
- **Source findings:** DATA-QA-001
- **Affected product/layer:** Data Integrity
- **Evidence basis:** E2
- **Actual user impact:** Risk of overwriting valid remote progress with stale/incomplete local state after a transient network/service failure
- **Release impact:** Not currently a proven separate release blocker, but shares the same production-safety bar as RELEASE-QA-001
- **Required fix:** Introduce an explicit failure-state distinction (e.g. `REMOTE_DATA_PRESENT` / `REMOTE_DATA_ABSENT` / `REMOTE_FETCH_FAILED`) and route `REMOTE_FETCH_FAILED` to a safe, non-destructive default (keep local, retry later) rather than treating it as absence
- **Required verification:** Executable tests for remote-absent vs. remote-fetch-failed producing different, correct outcomes
- **Dependencies:** None; shares code surface with GLOBAL-QA-001's merge function
- **Recommended sprint:** 1
- **Release blocker:** NO

### GLOBAL-QA-004 — Surface cloud-sync failures to the user
- **Master severity:** P3 — **Justification:** a user-visibility gap, not a data-safety defect; matches source severity (REL-QA-004, P3) exactly, no inflation from clustering with GLOBAL-QA-003.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** Cloud-sync failures are `.catch(console.warn)`-only with no UI signal.
- **Source findings:** REL-QA-004
- **Affected product/layer:** Reliability
- **Required fix:** Minimal, proportionate user-visible signal (e.g. a non-blocking toast/banner) when a sync attempt fails, without inventing a full offline-queue UI
- **Required verification:** A test/manual check that a simulated sync failure produces a visible signal
- **Dependencies:** Touches the same sync code path as GLOBAL-QA-003 — bundled into Sprint 1 to avoid re-touching it in Sprint 2
- **Recommended sprint:** 1
- **Release blocker:** NO

### GLOBAL-QA-005 — Reconcile "irreversible reset" claim with actual signed-in merge behavior
- **Master severity:** P2 — **Justification:** matches source severity (DATA-QA-003, P2); a broken user-facing promise, not a data-loss defect, so it does not inherit GLOBAL-QA-001's P1.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** The reset feature's implementation/copy asserts a stronger guarantee ("irreversible") than the sync architecture provides for signed-in users, whose next successful cloud merge can silently restore the "deleted" state.
- **Source findings:** DATA-QA-003
- **Affected product/layer:** Data Integrity
- **Required fix:** Pick one coherent contract — either make the reset genuinely account-wide/synchronized, or make it explicitly local-only with matching UX copy — and implement it consistently; do not silently change product meaning to make a test pass
- **Required verification:** A test asserting the chosen contract holds after a subsequent signed-in merge
- **Dependencies:** Same reset-UI surface as GLOBAL-QA-006 — bundled into Sprint 1
- **Recommended sprint:** 1
- **Release blocker:** NO

### GLOBAL-QA-006 — Surface reset-operation failure to the user
- **Master severity:** P3 — **Justification:** matches source severity (REL-QA-003, P3); independent of GLOBAL-QA-005's contract-mismatch issue.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** The reset action's own failure path can be silently swallowed with no user signal, inconsistent with the codebase's own boolean-signal pattern elsewhere.
- **Source findings:** REL-QA-003
- **Affected product/layer:** Reliability
- **Required fix:** Surface a definite success/failure result to the user for this trust-sensitive action
- **Required verification:** A test/manual check that a simulated reset failure surfaces to the user
- **Dependencies:** Same reset-UI surface as GLOBAL-QA-005
- **Recommended sprint:** 1
- **Release blocker:** NO

### GLOBAL-QA-007 — Account deletion lifecycle: ordering, failure signaling, and cleanup completeness
- **Master severity:** P3 — **Justification:** matches both source severities (DATA-QA-004 P3, SEC-QA-003 P3); a genuine merge of identical fact + identical remediation, not severity inflation.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** `deleteAccount()`'s Firestore-then-Auth deletion has no explicit failure-path reasoning between the two irreversible external calls, and `dailyTasks` is never purged.
- **Source findings:** DATA-QA-004, SEC-QA-003 (DUPLICATE ROOT CAUSE — merged)
- **Affected product/layer:** Data Integrity, Security & Privacy
- **Required fix:** Explicit ordering rationale, failure surfacing (a failed Auth deletion must not be reported as complete), inclusion of `dailyTasks` in cleanup scope, and a defined retry/recovery path for a partial failure — without claiming true cross-service atomicity if the client-only architecture cannot provide it
- **Required verification:** Tests for Firestore-delete-succeeds/Auth-delete-fails and the reverse, plus confirmation `dailyTasks` is purged
- **Dependencies:** None
- **Recommended sprint:** 1
- **Release blocker:** NO

### GLOBAL-QA-013 — Replace tautological clock-anomaly test with a real one
- **Master severity:** P3 (Assurance) — **Justification:** matches source severity (VERIFY-QA-002, P3); independent of GLOBAL-QA-002 (different production function, different test).
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** The clock/anomaly-detection test asserts `assert(true, ...)` and never references the real detection function.
- **Source findings:** VERIFY-QA-002
- **Affected product/layer:** Verification Assurance
- **Required fix:** Replace with a test that invokes the real production anomaly-detection function with meaningful input/expected output
- **Required verification:** The new test must fail if anomaly-detection behavior regresses
- **Dependencies:** None; bundled into Sprint 1 for file-locality with GLOBAL-QA-002
- **Recommended sprint:** 1
- **Release blocker:** NO

### GLOBAL-QA-014 — Add server-side validation for owner-writable progress fields
- **Master severity:** P2 — **Justification:** matches source severity (SEC-QA-001, P2); self-only abuse, no cross-user impact, so it does not inherit any P1 from the schema cluster.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** No Firestore rules-level field/type/range validation on owner-writable progress documents.
- **Source findings:** SEC-QA-001
- **Affected product/layer:** Security & Privacy
- **Required fix:** Firestore security-rules validation mirroring the canonical field schema established in GLOBAL-QA-001, so the rules and the client schema cannot drift independently
- **Required verification:** Firestore emulator rules tests for the new validation
- **Dependencies:** Sequenced after GLOBAL-QA-001 (reuses its canonical field list) — bundled into Sprint 1 rather than Sprint 2 to avoid touching the rules file twice
- **Recommended sprint:** 1
- **Release blocker:** NO

### GLOBAL-QA-031 — Add dedicated auth-flow / `dailyTasks` cross-user Firestore-rules test
- **Master severity:** P4 — **Justification:** matches source severity (SEC-QA-005, P4); a verification gap, not a proven defect.
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Root cause:** Missing explicit cross-user denial assertion for `dailyTasks` and no dedicated auth-flow test.
- **Source findings:** SEC-QA-005
- **Affected product/layer:** Verification Assurance
- **Required fix:** Add the missing rules-test assertions
- **Dependencies:** Rides along with GLOBAL-QA-007's and GLOBAL-QA-014's rules-test changes to avoid a second emulator-test pass
- **Recommended sprint:** 1
- **Release blocker:** NO

---

## Sprint 2 — Product Quality & Runtime Polish

### GLOBAL-QA-008 — Distinguish exam-sourced from practice-sourced reward/quest accounting
- **Master severity:** P2 — **Justification:** matches source severity (CORE-QA-001, P2); a real, demonstrated correctness defect, not merely an API-clarity nit.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** `applyPracticeAnswer`'s `_sessionMode` parameter is received but never consulted.
- **Source findings:** CORE-QA-001 (primary), CODE-QA-004 (supporting), MAINT-QA-005 (supporting/consolidated)
- **Required fix:** Branch on session mode so exam answers update mastery/telemetry as today but skip `updateDailyQuests` (or intentionally tag exam-sourced rewards distinctly)
- **Required verification:** A regression test asserting an exam-only session does not silently complete the daily practice quest
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-012 — Localize hardcoded Turkish content, including in-app Privacy Policy
- **Master severity:** P2 — **Justification:** matches source severity (COMPAT-QA-001, P2).
- **Priority:** HIGH — **Justification for exception to P2-default-MEDIUM:** its output (a canonical bilingual privacy-policy text) is a hard dependency for Sprint 3's release-blocker closure (GLOBAL-QA-011); sequencing this ahead avoids writing the policy copy twice.
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** Several components (word-detail modal, avatar picker, data-management/privacy modal and dialogs, word-notebook) hardcode Turkish text bypassing the app's working locale system.
- **Source findings:** COMPAT-QA-001
- **Required fix:** Route the identified components through the existing i18n system; produce the canonical, reviewed bilingual Privacy Policy copy as part of this fix
- **Required verification:** Manual/automated check that switching to English locale renders these components in English
- **Dependencies:** Feeds GLOBAL-QA-011 (Sprint 3)
- **Recommended sprint:** 2
- **Release blocker:** NO (but its output gates a release blocker's closure)

### GLOBAL-QA-015 — Respect system font-scale on core practice/exam text
- **Master severity:** P2 — **Justification:** matches source severity (A11Y-QA-001, P2); the app's single most important interaction text.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** `numberOfLines={1}` + `adjustsFontSizeToFit` shrinks text instead of respecting increased system font-scale.
- **Source findings:** A11Y-QA-001
- **Required fix:** Allow the prompt text to wrap/scroll appropriately at larger font scales instead of shrinking
- **Required verification:** Manual check at 200% system font scale
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-018 — Fix session-restore duplicate-answerable state
- **Master severity:** P3 — **Justification:** matches source severity (CORE-QA-002, P3); narrow, low-frequency edge case.
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Root cause:** Session restoration persists `sessionAnswers`/`currentIndex` but not local per-question UI state (`picked`/`submitted`).
- **Source findings:** CORE-QA-002
- **Required fix:** Persist `picked`/`submitted` as part of `ActiveSessionState`, or advance `currentIndex` at submit time
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-019 — Restrict Android backup scope for AsyncStorage/Auth session data
- **Master severity:** P3 — **Justification:** matches source severity (SEC-QA-002, P3); requires prior account/physical compromise to exploit.
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Root cause:** `allowBackup="true"` with no `dataExtractionRules`/`fullBackupContent`.
- **Source findings:** SEC-QA-002
- **Required fix:** Add scoped backup-exclusion rules for the Auth-session-bearing storage
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-020 — Fix `ErrorBoundary` restart to actually reload/remount
- **Master severity:** P3 — **Justification:** matches source severity (REL-QA-002, P3).
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** The restart action doesn't reload/remount the app as its label implies.
- **Source findings:** REL-QA-002
- **Required fix:** Make the restart action functionally restart the relevant tree
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-021 — Route `updateProfile()` through the `services/auth.ts` boundary
- **Master severity:** P3 — **Justification:** matches source severity (MAINT-QA-002, P3); no demonstrated user-facing symptom.
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Root cause:** `AccountManagementCard.tsx` calls `updateProfile()` directly from the Firebase SDK, bypassing the service layer.
- **Source findings:** MAINT-QA-002 (supporting: ARCH-QA-002)
- **Required fix:** Add the missing exported function to `services/auth.ts` and call it instead
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-022 — Replace `as any` cast on onboarding goal selection with a typed path
- **Master severity:** P3 — **Justification:** matches source severity (MAINT-QA-004, P3).
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Root cause:** `onGoalSelect(mins as any)` defeats `UserData.dailyGoalMinutes`'s literal-union type with no runtime validation.
- **Source findings:** MAINT-QA-004 (supporting: CODE-QA-001)
- **Required fix:** Type `GoalStep`'s `onSelectGoal` prop to the literal union, or validate at the boundary
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-023 — Don't gate the first interactive screen behind a network fetch when a bundled fallback exists
- **Master severity:** P3 — **Justification:** matches source severity (PERF-QA-002, P3).
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Source findings:** PERF-QA-002
- **Required fix:** Render immediately from the bundled fallback while the network fetch resolves in the background
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-024 — Reduce write amplification on every practice/exam answer
- **Master severity:** P3 — **Justification:** matches source severity (PERF-QA-003, P3); strongly-established but unmeasured cost.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** Every answer triggers 3 Firestore writes + 1 full local write.
- **Source findings:** PERF-QA-003
- **Required fix:** Consolidate to the minimum correct write(s) for the specific event; must not increase write volume as a side effect of GLOBAL-QA-001's schema work (explicit non-goal overlap — Sprint 1 must not worsen this)
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-025 — Increase two Practice-screen touch targets to platform guidance
- **Master severity:** P3 — **Justification:** matches source severity (A11Y-QA-002, P3).
- **Priority:** LOW
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Source findings:** A11Y-QA-002
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-026 — Raise muted text contrast to WCAG AA 4.5:1
- **Master severity:** P3 — **Justification:** matches source severity (A11Y-QA-003, P3).
- **Priority:** LOW
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Source findings:** A11Y-QA-003
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-032 — Guard catalogue-loading race on rapid level-switch
- **Master severity:** P4 — **Justification:** matches source severity (REL-QA-001, P4); bounded per-level blast radius.
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Source findings:** REL-QA-001
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-033 — Remove dead barrel files and orphaned exports
- **Master severity:** P4 — **Justification:** matches source severity (MAINT-QA-003, P4).
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Root cause:** 2 dead barrel re-export files + 5 orphaned exported functions.
- **Source findings:** MAINT-QA-003 (supporting: ARCH-QA-003, CODE-QA-002)
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-034 — Eliminate redundant `loadUserData()` calls on cold start
- **Master severity:** P4 — **Justification:** matches source severity (PERF-QA-001, P4).
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Source findings:** PERF-QA-001
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-QA-035 — Compress/resize the oversized mascot raster
- **Master severity:** P4 — **Justification:** matches source severity (PERF-QA-004, P4).
- **Priority:** LOW
- **Fix policy:** ACCEPT / DEFER
- **Source findings:** PERF-QA-004
- **Recommended sprint:** 2 (if done at all before release; safe to defer past release)
- **Release blocker:** NO

### GLOBAL-CD-001 — Restore XP visibility on Practice Hub
- **Master severity:** N/A (Consumer Impact: LOW)
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Source findings:** CD-005
- **Recommended sprint:** 2
- **Release blocker:** NO

### GLOBAL-CD-002 — Soften "Hesap & Bulut Senkronizasyonu" group-label tone
- **Master severity:** N/A (Consumer Impact: LOW)
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Source findings:** CD-006
- **Recommended sprint:** 2
- **Release blocker:** NO

---

## Sprint 3 — Release & Repository Hardening

### GLOBAL-QA-011 — Host a durable, public, anonymously-reachable, app-specific privacy policy
- **Master severity:** P1 — **Justification:** matches source severity (RELEASE-QA-003, P1); a directly tested, proven failure of a mandatory Play requirement.
- **Priority:** CRITICAL PATH
- **Fix policy:** MUST FIX BEFORE RELEASE
- **Root cause:** The configured privacy-policy URL serves generic Claude Artifact shell content; the direct content host returns 404, the API 403.
- **Source findings:** RELEASE-QA-003
- **Required fix:** Publish the canonical bilingual content produced in GLOBAL-QA-012 to a durable, anonymously-reachable, app-specific URL, and update the in-app configured link
- **Required verification:** A fresh anonymous HTTP check confirming app-specific content loads without authentication
- **Dependencies:** GLOBAL-QA-012 (Sprint 2) must supply the reviewed content first
- **Recommended sprint:** 3
- **Release blocker:** YES

### GLOBAL-QA-009 — Establish repo/CI signing hygiene (distinguish QA-artifact signing from release distribution)
- **Master severity:** P3 — **Justification:** matches both source severities (SEC-QA-004 P3, SUPPLY-QA-004 P3); a genuine merge of identical fact.
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Root cause:** `android/app/build.gradle`'s release buildType uses `signingConfigs.debug`.
- **Source findings:** SEC-QA-004, SUPPLY-QA-004 (DUPLICATE ROOT CAUSE — merged)
- **Required fix:** Distinguish the QA/CI verification artifact's signing from the actual distributable artifact's signing; establish auditable signing provenance for anything intended for distribution
- **Recommended sprint:** 3
- **Release blocker:** NO (but directly informs closure evidence for GLOBAL-QA-010)

### GLOBAL-QA-010 — Verify EAS production AAB signing / Play App Signing
- **Master severity:** P3 (Release Condition — NOT a proven defect) — **Justification:** NOT VERIFIED ≠ FAIL; per the Release adjudication's own rule, no evidence proves this is actually broken.
- **Priority:** HIGH (release-gating verification task)
- **Fix policy:** MUST FIX BEFORE RELEASE (verification, not code)
- **Source findings:** RELEASE-QA-002
- **Required fix:** N/A — this is a verification task, not a code fix
- **Verification needed:** Generate and inspect an exact-revision EAS production AAB; confirm persistent production credentials and Play App Signing provenance
- **What constitutes PASS:** Verified production signing distinct from the repo debug key
- **What constitutes FAIL:** Confirmed use of debug/insecure signing for the actual distributable artifact (would newly become a proven P1 blocker if found)
- **Recommended sprint:** 3
- **Release blocker:** NO directly (CONDITIONAL) — see `06_RELEASE_DEPENDENCY_MAP.md`

### GLOBAL-QA-028 — Verify EAS production Firebase environment
- **Master severity:** P3 (Release Condition)
- **Priority:** HIGH
- **Fix policy:** MUST FIX BEFORE RELEASE (verification, not code)
- **Source findings:** RELEASE-QA-004
- **Verification needed:** Confirm all six required `EXPO_PUBLIC_FIREBASE_*` values are present in the EAS production environment and that the AAB initializes Firebase-backed functionality
- **Recommended sprint:** 3
- **Release blocker:** NO directly (CONDITIONAL)

### GLOBAL-QA-029 — Verify Play Console version/listing/Data Safety/account-deletion web declaration
- **Master severity:** P3 (Release Condition)
- **Priority:** HIGH
- **Fix policy:** MUST FIX BEFORE RELEASE (verification, not code)
- **Source findings:** RELEASE-QA-005
- **Verification needed:** Play Console versionCode acceptance, listing completeness, Data Safety submission, functional account-deletion web declaration
- **Recommended sprint:** 3
- **Release blocker:** NO directly (CONDITIONAL)

### GLOBAL-QA-016 — Enable branch protection on `main`
- **Master severity:** P2 — **Justification:** matches source severity (SUPPLY-QA-001, P2).
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Source findings:** SUPPLY-QA-001
- **Recommended sprint:** 3
- **Release blocker:** NO

### GLOBAL-QA-017 — Enable GitHub secret scanning
- **Master severity:** P2 — **Justification:** matches source severity (SUPPLY-QA-002, P2).
- **Priority:** MEDIUM
- **Fix policy:** SHOULD FIX BEFORE RELEASE
- **Source findings:** SUPPLY-QA-002
- **Recommended sprint:** 3
- **Release blocker:** NO

### GLOBAL-QA-027 — Pin the E2E CI Maestro installer
- **Master severity:** P3 — **Justification:** matches source severity (SUPPLY-QA-003, P3).
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Source findings:** SUPPLY-QA-003
- **Recommended sprint:** 3
- **Release blocker:** NO

### GLOBAL-QA-030 — Establish proportionate production observability
- **Master severity:** P3 — **Justification:** matches source severity (RELEASE-QA-006, P3).
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Source findings:** RELEASE-QA-006
- **Recommended sprint:** 3
- **Release blocker:** NO

### GLOBAL-QA-036 — Establish dependency/security maintenance automation
- **Master severity:** P4 — **Justification:** matches source severity (SUPPLY-QA-005, P4).
- **Priority:** LOW
- **Fix policy:** FIX IF CHEAP
- **Source findings:** SUPPLY-QA-005
- **Recommended sprint:** 3
- **Release blocker:** NO

---

## Global finding count summary

| Sprint | Global findings (GLOBAL-QA-*) | Global findings (GLOBAL-CD-*) |
|---|---:|---:|
| Sprint 1 | 10 (001,002,003,004,005,006,007,013,014,031) | 0 |
| Sprint 2 | 16 (008,012,015,018,019,020,021,022,023,024,025,026,032,033,034,035) | 2 (CD-001, CD-002) |
| Sprint 3 | 10 (009,010,011,016,017,027,028,029,030,036) | 0 |
| **Total** | **36** | **2** |
