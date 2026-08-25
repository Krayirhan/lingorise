# 03 — Audit Scope and Risk

## Risk dimensions

| Dimension | Level | Evidence/rationale |
|---|---|---|
| Data loss | HIGH | Core user promise ("progress is never lost"); real state (streak/mastery/XP) lives in AsyncStorage + optional Firestore mirror. A bug here directly breaks the product's value proposition. |
| Privacy | LOW-MEDIUM | Vocabulary/progress data + email (if signed in) only. No health/financial/government-ID data. Account-deletion completeness still matters for trust/store policy. |
| Authentication | MEDIUM | Firebase email/password + guest mode. Standard SDK usage, no custom crypto. |
| Authorization / tenant isolation | MEDIUM | Firestore rules are the only authorization boundary; a mistake here would let one user read/write another's data. |
| Financial | N/A | No payments, no IAP, no monetization code present in this revision. |
| Regulatory | LOW | Play Store Data Safety disclosure applies (evidence: `17-data-safety-worksheet.md`); no GDPR/health/finance-grade regulation triggered by the data model. |
| Network attack surface | LOW | Client talks only to Firebase (Google-operated, TLS-terminated, rules-enforced). No custom server endpoints to attack. |
| Availability | LOW | No SLA; local practice works fully offline by design; only sync degrades if Firebase is unreachable. |
| Concurrency | MEDIUM | Local-first + async cloud merge introduces real races (see `DATA-001`); single-user concurrency only (no multi-user real-time state). |
| External dependencies | MEDIUM | Firebase SDK, Expo SDK 56 — both actively maintained; no abandoned/unusual dependencies observed in `package.json`. |
| Device/platform lifecycle | MEDIUM | React Native app lifecycle (cold start, backgrounding, auth-state races) is a real correctness surface, evidenced by `DATA-001`. |
| Release/reputation impact | MEDIUM-HIGH | Public app store release; a broken first-run experience or lost streaks would directly harm store ratings/retention for a habit-formation product. |

## Aggregate risk class
**R3 — Connected authenticated product**, leaning toward the low end of R3 (small Firebase-backed consumer app, not a multi-tenant SaaS with complex authorization graphs). Local-first architecture keeps most of R2's simplicity while genuinely adding R3 concerns (auth, sync, per-user Firestore authorization) that must be evaluated with real rigor rather than waved through as N/A.

## Applicable domains
Core product correctness, Data integrity & persistence, Reliability & lifecycle management, Testing & verification, Security (auth + Firestore rules), Privacy, Architecture & maintainability, UX/usability, Accessibility, Deployment/release engineering, Dependency/supply-chain health — all `REQUIRED` or `IMPORTANT` (see `04_CONTEXTUAL_RUBRIC.md` for weights and rationale).

## Explicit N/A domains
- **Authorization/tenant isolation as a standalone domain** — folded into Security rather than scored separately; the only authorization surface is Firestore rules, already covered there. Scoring it twice would double-count one root evidence source (Constitution C1/no-double-counting).
- **Networking/API behavior as a standalone domain** — the app has no custom API; Firestore SDK network behavior is covered under Data integrity/Security. A separate domain would have no independent evidence to score.
- **Observability (APM/tracing/dashboards)** — N/A at this scale; local telemetry ring buffer is a proportionate substitute and is evaluated qualitatively as evidence within Reliability, not scored as its own domain.
- **Game-specific runtime quality (frame time, pooling)** — N/A; this is a turn-based quiz UI, not a real-time rendering game.
- **ML/model quality** — N/A; no ML/model component exists.
- **Sync/concurrency as a fully standalone domain** — folded into Data integrity & persistence to avoid double-counting the same race-condition evidence (`DATA-001`) against two domains.

## Audit depth rationale
Data loss and release/reputation risk are the two dimensions that most directly threaten this product's actual purpose, so Data integrity and Core product correctness receive the highest rubric weights. Security/privacy receive real but proportionate weight (R3-appropriate, not R4/regulated-grade) — the audit verifies Firestore rules and account-deletion completeness concretely rather than assuming either is fine. Domains with no genuine applicable evidence (networking-as-API, observability infra, game-loop performance, ML) are excluded from the scoring denominator rather than penalized, per Constitution C2/C3.
