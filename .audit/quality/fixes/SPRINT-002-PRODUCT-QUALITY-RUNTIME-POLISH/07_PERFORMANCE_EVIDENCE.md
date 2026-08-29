# SPRINT-002 — Performance Evidence

## No Performance findings (PERF-QA-001/002/003/004) were fixed this sprint

Per `01_MASTER_SCOPE_MAP.md`, all four Performance Global findings (GLOBAL-QA-023 startup catalogue gating, GLOBAL-QA-024 write amplification, GLOBAL-QA-034 redundant `loadUserData()` calls, GLOBAL-QA-035 mascot asset) were deliberately deferred this sprint — not attempted, not claimed fixed, not scored.

**Reasoning:**
1. **GLOBAL-QA-023/024** (startup gating, write amplification) both require careful tracing against the Sprint 1 data-integrity architecture (`mergeAndSyncUserData`, `updateAndPersist`'s fire-and-forget sync) to avoid regressing durability — Master's own instructions explicitly warn against this ("Do NOT compromise correctness or Sprint 1 durability merely to reduce writes... First trace current post-Sprint-1 hot path"). Given the effort actually available this sprint went to the mandatory Phase A carry-over (which itself touched the exact same merge/bootstrap code paths) plus the higher-priority Core/Accessibility/Localization/Reliability items, there was no safe remaining budget to also carefully re-trace and modify the answer-write hot path without risking exactly the kind of regression Master warned against.
2. **GLOBAL-QA-034** (redundant `loadUserData()` calls): Master's own instruction explicitly warns "do not accidentally reintroduce DATA-QA-006" — since this sprint's Phase A fix specifically changed `AppBootstrap`'s `loadUserData()` call sequence, touching the OTHER `loadUserData()` call sites in the same cold-start path this sprint carries meaningfully elevated regression risk for the exact defect just fixed. Deferred for safety, not effort alone.
3. **GLOBAL-QA-035** (mascot asset): Master's own guidance says not to spend Sprint time on this; correctly not attempted.

## Consequence of Phase A fixes: no performance regression introduced

**Before:** `mergeUserData` performed `Math.max(local.streak, remote.streak)` — one comparison.
**After:** `mergeUserData` performs `Math.max(normalizedStreak(local...), normalizedStreak(remote...))` — two additional calls to `updateDailyStreak()`, a pure, allocation-light function (a handful of date-string comparisons and a subtraction). `AppBootstrap` additionally calls `rolloverToToday()` once per sign-in cold start (not per answer, not per render) — this is a rare, already-existing-cost code path (sign-in only happens once per session), not the hot path Master's write-amplification concern (`PERF-QA-003`) is about.

**Measurement:** NOT MEASURED. No runtime benchmark was performed for either the before or after state. Structural argument: both additions are O(1), pure-computation, non-I/O operations added to a once-per-sign-in code path, not the per-answer hot path — the actual number of Firestore/AsyncStorage writes per sign-in or per answer is unchanged by any Sprint 2 fix. No precise timing numbers are claimed.

**User impact:** None expected — no evidence exists, and none was fabricated, of any perceptible latency change.

**Tradeoff:** None identified — this is correctness-required computation (the streak-resurrection fix cannot be achieved without at least this much work), not an optional efficiency/correctness tradeoff.

**Regression tests:** N/A (no performance regression tests were needed since no performance-affecting change beyond the above was made; the added computation's correctness is covered by the Phase A regression tests in `05_TEST_EVIDENCE.md`).
