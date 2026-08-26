# 03 — Audit Scope and Risk (REAUDIT)

## Risk dimension changes since RUN-002-REAUDIT

| Dimension | RUN-002-REAUDIT | RUN-003-REAUDIT | Reason |
|---|---|---|---|
| Availability / release-engineering risk | Elevated (CI fully removed) | **Reduced back toward baseline, arguably better than baseline** | CI restored and confirmed genuinely green end-to-end (typecheck, unit tests, Firestore rules tests, release build, on-device Maestro smoke) — a stronger, more thoroughly proven gate than baseline ever verified (baseline assumed CI worked but never confirmed a live green run). |
| Public exposure surface | Private repo | **Public repo** | Repo visibility changed to public. Re-examined for secret exposure this reaudit (see `06_EVIDENCE_INDEX.md` E3-SEC-01/02): no real secrets committed; `.env` correctly gitignored; the 6 Firebase Web client identifiers exposed as GitHub Actions *repository variables* (not secrets) are non-sensitive by design (security is enforced by `firestore.rules`, not by hiding a public Web SDK config) and are visible only to accounts with write access to the repo, not to anonymous public visitors. One new gap found: GitHub secret scanning / push protection is **disabled** on the repo (free for public repos) — a real, actionable, low-severity gap given no secrets currently exist to scan for. |
| Reliability risk | — | **Reduced** | Two previously-unbounded network waits (Firestore catalogue fetch, Firebase Auth state resolution) now have explicit timeouts and fallback behavior — a real product-code improvement, not merely a CI artifact, since a real user on bad mobile data was exposed to the same indefinite-hang class of bug. |
| All other dimensions | — | Unchanged | No new data categories, no new network surface, no new auth mechanism, no financial/regulatory change. |

## Aggregate risk class

Unchanged: **R3 — Connected authenticated product**. None of this cycle's changes alter what data the product holds, who can access it, or what it promises users — they change how reliably those guarantees are verified (CI) and how gracefully the app degrades under bad network (the two timeout fixes), both scored within their respective existing domains.

## Applicable domains

Unchanged from `RUN-001-BASELINE`/`RUN-002-REAUDIT` — same 11 domains, same weights.

## Rubric-version decision

Per `05_CONTEXTUAL_RUBRIC_BUILDER.md`'s change criteria, none apply here: no purpose change, no new regulated data, no financial transactions introduced, no auth-model change. Restoring CI and making the repo public are process/operational changes, not product/purpose/risk-category changes. **Rubric stays locked at v1.0**, reused unchanged, keeping this score directly comparable to `RUN-001-BASELINE` and `RUN-002-REAUDIT`.
