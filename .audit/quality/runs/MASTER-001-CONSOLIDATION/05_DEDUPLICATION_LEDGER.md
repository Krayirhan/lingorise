# MASTER-001 — Deduplication Ledger

Every canonical finding and every supporting-evidence finding maps to exactly one row below. Nothing is silently dropped.

| Source finding | → Global finding | Relationship |
|---|---|---|
| DATA-QA-002 | GLOBAL-QA-001 | PRIMARY |
| ARCH-QA-001 | GLOBAL-QA-001 | SUPPORTING EVIDENCE (already consolidated via MAINT-QA-001) |
| CODE-QA-003 | GLOBAL-QA-001 | SUPPORTING EVIDENCE (already consolidated via MAINT-QA-001) |
| MAINT-QA-001 | GLOBAL-QA-001 | DUPLICATE ROOT CAUSE (canonical consolidation of the two rows above; not separately counted) |
| RELEASE-QA-001 | GLOBAL-QA-001 | RELEASE CONSEQUENCE |
| VERIFY-QA-001 | GLOBAL-QA-002 | PRIMARY (RELATED-INDEPENDENT to GLOBAL-QA-001 — different remediation layer) |
| DATA-QA-001 | GLOBAL-QA-003 | PRIMARY |
| REL-QA-004 | GLOBAL-QA-004 | RELATED-INDEPENDENT (shares failure surface with DATA-QA-001, different remediation) |
| DATA-QA-003 | GLOBAL-QA-005 | PRIMARY |
| REL-QA-003 | GLOBAL-QA-006 | RELATED-INDEPENDENT (shares reset UI surface with DATA-QA-003, different remediation) |
| DATA-QA-004 | GLOBAL-QA-007 | PRIMARY |
| SEC-QA-003 | GLOBAL-QA-007 | DUPLICATE ROOT CAUSE (merged — identical fact and remediation) |
| CORE-QA-001 | GLOBAL-QA-008 | PRIMARY |
| CODE-QA-004 | GLOBAL-QA-008 | SUPPORTING EVIDENCE (already consolidated via MAINT-QA-005) |
| MAINT-QA-005 | GLOBAL-QA-008 | DUPLICATE ROOT CAUSE (canonical consolidation of the row above; not separately counted) |
| SEC-QA-004 | GLOBAL-QA-009 | PRIMARY |
| SUPPLY-QA-004 | GLOBAL-QA-009 | DUPLICATE ROOT CAUSE (merged — identical fact and remediation) |
| RELEASE-QA-002 | GLOBAL-QA-010 | RELATED-INDEPENDENT (NOT merged into GLOBAL-QA-009 — external verification, not a proven code defect) |
| RELEASE-QA-003 | GLOBAL-QA-011 | PRIMARY |
| COMPAT-QA-001 | GLOBAL-QA-012 | RELATED-INDEPENDENT (shares privacy-policy surface with RELEASE-QA-003, different remediation; sequenced to feed it) |
| VERIFY-QA-002 | GLOBAL-QA-013 | PRIMARY (independent of VERIFY-QA-001/GLOBAL-QA-002) |
| SEC-QA-001 | GLOBAL-QA-014 | PRIMARY |
| A11Y-QA-001 | GLOBAL-QA-015 | PRIMARY |
| SUPPLY-QA-001 | GLOBAL-QA-016 | PRIMARY |
| SUPPLY-QA-002 | GLOBAL-QA-017 | PRIMARY |
| CORE-QA-002 | GLOBAL-QA-018 | PRIMARY |
| SEC-QA-002 | GLOBAL-QA-019 | PRIMARY |
| REL-QA-002 | GLOBAL-QA-020 | PRIMARY |
| MAINT-QA-002 | GLOBAL-QA-021 | PRIMARY |
| ARCH-QA-002 | GLOBAL-QA-021 | SUPPORTING EVIDENCE (already consolidated via MAINT-QA-002) |
| MAINT-QA-004 | GLOBAL-QA-022 | PRIMARY |
| CODE-QA-001 | GLOBAL-QA-022 | SUPPORTING EVIDENCE (already consolidated via MAINT-QA-004) |
| PERF-QA-002 | GLOBAL-QA-023 | PRIMARY |
| PERF-QA-003 | GLOBAL-QA-024 | PRIMARY |
| A11Y-QA-002 | GLOBAL-QA-025 | PRIMARY |
| A11Y-QA-003 | GLOBAL-QA-026 | PRIMARY |
| SUPPLY-QA-003 | GLOBAL-QA-027 | PRIMARY |
| RELEASE-QA-004 | GLOBAL-QA-028 | PRIMARY |
| RELEASE-QA-005 | GLOBAL-QA-029 | PRIMARY |
| RELEASE-QA-006 | GLOBAL-QA-030 | PRIMARY |
| SEC-QA-005 | GLOBAL-QA-031 | PRIMARY |
| REL-QA-001 | GLOBAL-QA-032 | PRIMARY |
| MAINT-QA-003 | GLOBAL-QA-033 | PRIMARY |
| ARCH-QA-003 | GLOBAL-QA-033 | SUPPORTING EVIDENCE (already consolidated via MAINT-QA-003) |
| CODE-QA-002 | GLOBAL-QA-033 | SUPPORTING EVIDENCE (already consolidated via MAINT-QA-003) |
| PERF-QA-001 | GLOBAL-QA-034 | PRIMARY |
| PERF-QA-004 | GLOBAL-QA-035 | PRIMARY |
| SUPPLY-QA-005 | GLOBAL-QA-036 | PRIMARY |
| SUPPLY-QA-006 | — | **NOT MASTER BACKLOG** — accepted debt: 17 moderate build/dev-only advisories with no established runtime-reachable path; no standalone remediation unit beyond the dependency-maintenance automation already covered by GLOBAL-QA-036. Owner: periodic dependency review, not an implementation sprint. |
| CD-005 | GLOBAL-CD-001 | PRIMARY (Consumer Impact scale, not merged with P-severity backlog) |
| CD-006 | GLOBAL-CD-002 | PRIMARY (Consumer Impact scale) |
| CD-004 | — | **NOT MASTER BACKLOG** — Consumer positioning debt: a category-level metaphor-overlap risk, explicitly not a single-UI-fix item per the source Consumer audit itself. Owner: future Consumer Design reaudit / product positioning discussion, not an implementation sprint. |

## Historical / already-closed findings (not re-opened, not part of this backlog)

CORE-001, CORE-002, CORE-003, CORE-004, DATA-001, DATA-002 (historical registry IDs, distinct from current `DATA-QA-*`), REL-001, ARCH-001, ARCH-002, ARCH-003, ARCH-004, DEP-001, DEPLOY-001, DEPLOY-002, SEC-003, ACC-002, ACC-003, ACC-004 — all confirmed CLOSED AND STILL VALID by their respective current canonical audits, with no regression found. Not reopened here; `.audit/state/FINDING_REGISTRY.md` was not read or modified by this Master run.

## Reconciliation summary

- **Total raw canonical findings mapped:** 42 P-severity (Product Quality + Assurance + Release) + 3 Consumer Impact = 45
- **Folded via DUPLICATE ROOT CAUSE merge (same fact + same remediation):** MAINT-QA-001→GLOBAL-QA-001 (itself already absorbing ARCH-QA-001/CODE-QA-003), MAINT-QA-005→GLOBAL-QA-008 (absorbing CODE-QA-004), SEC-QA-003→GLOBAL-QA-007, SUPPLY-QA-004→GLOBAL-QA-009 = 4 P-severity reductions
- **Folded via RELEASE CONSEQUENCE (same defect, release-path framing, no independent code-level remediation unit):** RELEASE-QA-001→GLOBAL-QA-001 = 1 further P-severity reduction
- **Marked NOT MASTER BACKLOG (accepted debt / positioning, no remediation unit created):** SUPPLY-QA-006 (P4), CD-004 (Consumer Impact) = 1 P-severity reduction, 1 Consumer reduction
- **Full arithmetic:** 42 raw P-severity findings − 4 (DUPLICATE ROOT CAUSE) − 1 (RELEASE CONSEQUENCE fold) − 1 (NOT MASTER BACKLOG) = **36** unique Global (`GLOBAL-QA-*`) findings
- **Result:** 42 raw P-severity findings → 36 unique Global (`GLOBAL-QA-*`) findings; 3 Consumer Impact findings → 2 unique Global (`GLOBAL-CD-*`) findings + 1 NOT MASTER BACKLOG
