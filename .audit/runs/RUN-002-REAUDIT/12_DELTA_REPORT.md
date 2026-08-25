# 12 — Delta Report

RUN-001-BASELINE (`4a80283`) → RUN-002-REAUDIT (`3436a1b`) · Rubric v1.0 (unchanged, directly comparable)

## Score delta

| Domain | Previous | Current | Δ | Confidence | Main reason |
|---|---:|---:|---:|---|---|
| Core product correctness | 7.5 | 9.0 | +1.5 | HIGH | CORE-001/002/003 all closed with direct test evidence |
| Data integrity & persistence | 6.8 | 7.8 | +1.0 | MEDIUM-HIGH | DATA-002 closed; DATA-001 structurally fixed, not fully verified |
| Reliability & lifecycle management | 7.0 | 7.8 | +0.8 | MEDIUM-HIGH | REL-001 closed |
| Testing & verification | 7.0 | 6.5 | −0.5 | HIGH | Correction: CI never actually worked, now formally removed — not a code regression |
| Security | 8.3 | 8.6 | +0.3 | HIGH | SEC-002 closed |
| Privacy | 7.5 | 7.5 | 0.0 | MEDIUM | No privacy-domain change this cycle |
| Architecture & maintainability | 6.5 | 8.5 | +2.0 | HIGH | All 4 architecture findings closed, largest single-domain movement |
| UX/usability | 7.5 | 8.0 | +0.5 | HIGH | Broader on-device walkthrough this session, confidence raised, no new defects |
| Accessibility | 6.0 | 7.5 | +1.5 | MEDIUM-HIGH | Real TalkBack/dynamic-type testing done; 3 real bugs found and fixed |
| Deployment/release engineering | 7.0 | 5.5 | −1.5 | HIGH | CI fully removed (deliberate, disclosed, cost-driven) |
| Dependency/supply-chain health | 6.5 | 7.5 | +1.0 | HIGH | npm audit executed and triaged, was previously unexecuted |

**Overall: 71.3 → 78.5 (Δ +7.2)**

## Finding delta

- **Closed** (10): `CORE-001`, `CORE-002`, `DATA-002`, `REL-001`, `ARCH-003`, `CORE-003`, `ARCH-001` (scope-corrected), `ARCH-002`, `ARCH-004` (scope-corrected), `SEC-002`.
- **Newly opened and closed within this cycle** (3): `ACC-002`, `ACC-003`, `ACC-004` — discovered and fixed in the same `FIX-2026-08-25-07` pass; recorded per `11_FINDING_PROTOCOL.md` rather than silently omitted since they never appeared "open" in a public state.
- **Accepted risk** (2): `DEPLOY-001` (new condition — CI removed), `DEP-001` (npm audit findings triaged as non-actionable).
- **Still open / partial** (2): `DATA-001` (structurally improved, full acceptance criteria unmet), `ACC-001` (meaningfully improved, full original scope unmet).
- **Invalidated** (0): none — no finding was found to be entirely wrong on re-verification (only `ARCH-001`'s *scope* was partially corrected, not invalidated outright — the `i18n/formatters.ts` half was confirmed correct).

## Action delta

| Status | Count | IDs |
|---|---:|---|
| VERIFIED | 14 | ACT-CORE-001, ACT-CORE-002, ACT-DATA-002, ACT-REL-001, ACT-ARCH-003, ACT-CORE-003, ACT-ARCH-001, ACT-ARCH-002, ACT-ARCH-004, ACT-SEC-002, ACT-DEP-001, ACT-ACC-002, ACT-ACC-003, ACT-ACC-004 |
| DONE (not fully verified against original acceptance criteria) | 2 | ACT-DATA-001, ACT-ACC-001 |
| REJECTED (reversed by user decision) | 1 | ACT-DEPLOY-001 |

## Regression delta
See `13_REGRESSION_REPORT.md` — **zero regressions detected** among previously-closed findings; one genuine, deliberate capability regression (CI removal) which is disclosed as a condition, not hidden as a silent side effect.

## Improvement attribution
Each domain's score movement above is directly attributed to specific, named finding closures with re-verified evidence (fresh `tsc`/`npm test`/on-device runs performed this reaudit, not assumed from the FIX logs alone) — no score was raised on the strength of a FIX log's own claims without independent re-check.

## Rubric-version note
Not applicable — rubric v1.0 was reused unchanged, so this delta is a direct, valid comparison with no version-mismatch caveat required.
