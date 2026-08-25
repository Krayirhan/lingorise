# 03 — Audit Scope and Risk (REAUDIT)

## Risk dimension changes since baseline

| Dimension | RUN-001-BASELINE | RUN-002-REAUDIT | Reason |
|---|---|---|---|
| Release/reputation impact | MEDIUM-HIGH | MEDIUM-HIGH | Unchanged — still the declared public-release target. |
| Availability / release-engineering risk | (folded into Deployment domain) | **Elevated within Deployment domain** | CI fully removed; a broken build or regressed test can now only be caught if the developer remembers to run checks manually before every commit. Real risk increase, deliberately accepted by the account owner for cost reasons — see `09_FINDINGS.md` DEPLOY-001. |
| All other dimensions | — | Unchanged | No new data categories, no new network surface, no new auth mechanism, no financial/regulatory change. |

## Aggregate risk class
Unchanged: **R3 — Connected authenticated product**. The CI removal does not change the product's own risk profile (what data it holds, who can access it, what it promises users) — it changes how reliably that profile's guarantees are *verified* going forward, which is scored within the Deployment/release engineering and Testing & verification domains rather than by reclassifying the whole product's risk tier.

## Applicable domains
Unchanged from `RUN-001-BASELINE/04_CONTEXTUAL_RUBRIC.md` — same 11 domains, same weights (rubric not re-versioned; see below).

## Rubric-version decision
Per `05_CONTEXTUAL_RUBRIC_BUILDER.md`'s change criteria (offline app gains cloud sync/auth; prototype becomes paid SaaS; financial transactions introduced; major purpose change; new regulated data), **none apply here**. Removing CI is a tooling/process regression, not a product/purpose/risk-category change. **Rubric stays locked at v1.0** — the same weights are reused for this reaudit, keeping the score directly comparable to `RUN-001-BASELINE`.
