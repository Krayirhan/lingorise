# DATA-002-REAUDIT — Scorecard

## Dimension scorecard

| Dimension | Max | DATA-001 baseline | DATA-002 current | Delta | Reason |
|---|---:|---:|---:|---:|---|
| Local persistence & recovery | 15 | 14 | **15** | +1 | The one concrete gap this dimension could plausibly have owned — a trust-sensitive action (reset) silently reporting success on failure — is now closed (`clearAllLocalData()` returns `{success}`, checked before any success signal). No remaining open issue found in local read/write/defaulting paths. |
| Schema migration & normalization | 15 | 14 | **13** | −1 | Unchanged migration pipeline overall, but independent review surfaced a slightly more concrete instance of the pre-existing manual-list gap than initially characterized: `fillDefaults()`'s `dailyQuests`/`learningProgress` fields lack the `Array.isArray`/shape guard every other array field has (`src/services/storage.ts:282,284`) — pre-existing, unchanged by Sprint 1, maintainability-tier, but real enough to keep this dimension from a full recovery. |
| Cloud synchronization | 20 | 12 | **17** | +5 | DATA-QA-001's core defect (failure conflated with absence) is closed with a direct, unambiguous code trace: no destructive write is reachable when the remote state is unknown. Cloud-sync failures are now surfaced to the user instead of console-only. −3 remaining: fire-and-forget nature persists with no retry queue (a proportionate, undisputed design choice, not scored further), the actual network-failure trigger is E2- not E3-verified end-to-end, and this dimension also absorbs a share of DATA-QA-006's streak-resurrection risk (a cross-device sync-consistency defect). |
| Merge/conflict correctness | 25 | 15 | **18** | +3 | DATA-QA-002's core defect (8 silently-omitted fields) is comprehensively fixed, field-by-field independently re-verified, and covered by genuine executable regression tests, including a correctly-targeted day-boundary fix independently re-traced through the full call chain. This would have justified a much larger recovery (a draft pass initially proposed 22/25) — reduced to 18/25 after an independent challenge surfaced two real, if bounded, defects in this exact dimension's own new code: DATA-QA-006 (streak resurrection, P2 — the larger factor) and DATA-QA-005 (level/HIGHER_LEVEL vs. intentional downgrade, P2), plus the identified test-fidelity gap that let the streak issue pass undetected. This is not "the fix failed" — it is "the fix is substantially correct for its primary target (the 8 historically-omitted fields) with two narrower, newly-introduced-by-the-same-mechanism gaps in unrelated fields." |
| Offline & partial-failure safety | 15 | 14 | **14** | 0 | The improvements that would justify raising this dimension (failure surfaced to user, failure-vs-absence distinction) are real, but DATA-QA-006's cross-device consistency risk (a stale device's data resurrecting on reconnect) is itself an offline/reconnect-safety concern, holding this dimension at its baseline value rather than allowing a full recovery. |
| Data lifecycle / deletion / reset | 10 | 5 | **9** | +4 | DATA-QA-003 (reset semantics) and DATA-QA-004 (deletion lifecycle) are both closed with strong, independently-traced evidence: reset is structurally incapable of reaching Firestore, copy is truthful per account type, deletion cleanup scope is complete, partial failure is explicit and safely retryable. −1 remaining: the inherent, honestly-documented, unavoidable non-atomicity of client-side Firestore+Auth deletion. |
| **TOTAL** | **100** | **74** | **86** | **+12** | |

## Severity counts (CURRENT open/partial findings only — closed historical findings not counted)

| Severity | Count | Findings |
|---|---:|---|
| P0 | 0 | — |
| P1 | 0 | — |
| P2 | 2 | DATA-QA-005 (level/HIGHER_LEVEL vs. intentional downgrade), DATA-QA-006 (streak resurrection) |
| P3 | 0 | — |
| P4 | 0 | — |

## Historical finding reconciliation

| Finding | Original severity | Current status | Reason | Evidence |
|---|---|---|---|---|
| DATA-QA-001 | P1 | **CLOSED** | Remote fetch failure now throws `RemoteStateUnknownError`, structurally distinct from absent; no destructive write is reachable on failure | `04_FAILURE_AND_OFFLINE_MATRIX.md` — full call-chain trace + executable `decideMergeAction` tests |
| DATA-QA-002 | P1 | **CLOSED** | All 8 historically-omitted fields now correctly classified and merged, independently field-by-field re-verified, day-boundary-correct | `03_MERGE_AND_FIELD_MATRIX.md`, `04_FAILURE_AND_OFFLINE_MATRIX.md` — named regression test + full trace |
| DATA-QA-003 | P2 | **CLOSED** | Reset (`reloadLocalOnly`) is structurally incapable of reaching Firestore; copy accurately reflects behavior per account type; failure surfaced | `05_LIFECYCLE_RESET_DELETE.md` |
| DATA-QA-004 | P3 | **CLOSED** | Cleanup scope complete (`dailyTasks` added); partial failure explicit and safely retryable; no atomicity overclaim | `05_LIFECYCLE_RESET_DELETE.md` |

## Confidence: HIGH

The core historical defects (DATA-QA-001/002/003/004) are closed with strong, independently-traced E2 code evidence reinforced by genuine E3 executable tests for the pure decision/merge logic specifically responsible for each. The two new findings (DATA-QA-005/006) were themselves discovered through direct, unambiguous code tracing (not speculation), and their mechanisms are simple enough to verify with high confidence via static reading alone, even without live/emulator execution. The only residual uncertainty is the untested Firestore I/O layer itself (network calls, rules enforcement) — explicitly disclosed, not hidden, and not treated as a reason to lower confidence in the (separately, strongly evidenced) decision/merge logic itself.
