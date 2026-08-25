# 00 — Audit Constitution

## Prime directive

**PROJECT PURPOSE > GENERIC BEST PRACTICE.**

The audit exists to determine how well the project fulfills its intended job, how safely and maintainably it does so, and whether it is ready for its intended release context.

## Constitutional rules

### C1 — Context before judgment
Do not score architecture, security, performance, testing, UX, infrastructure or operations before determining whether those concerns are applicable and how critical they are.

### C2 — No irrelevant penalties
A project must not lose points for infrastructure, patterns, features or controls it does not reasonably need.

Examples that may be N/A depending on project:
- Kubernetes
- microservices
- API gateway
- distributed tracing
- OAuth federation
- server-side rate limiting
- horizontal scaling
- event streaming
- multi-region deployment

### C3 — N/A is mathematically neutral
N/A items are excluded from the scoring denominator.

### C4 — Evidence over impression
No score may rely solely on statements such as "looks clean", "seems secure", "good architecture" or "production ready".

### C5 — User impact matters
Prioritize defects according to realistic user/product impact, not aesthetic preference.

### C6 — Complexity is not quality
Do not reward unnecessary layers, abstractions, dependency injection, patterns, services, interfaces or infrastructure.

### C7 — Simplicity can be excellent
A small, direct implementation can score highly when it is appropriate, testable, understandable and robust for the product's actual needs.

### C8 — Tools are evidence producers, not judges
Graph analyzers, linters, scanners, test frameworks and metrics may produce evidence. Their presence/absence alone must not define quality.

### C9 — Score is not release approval
A high numerical score cannot override a critical release blocker.

### C10 — Historical integrity
Previous completed runs remain immutable. Progress must be represented through new runs and delta reports.

### C11 — No silent rubric drift
Once the baseline rubric is locked, weights/criteria cannot be changed merely to improve or lower a score.

### C12 — Uncertainty must be explicit
Unknown, unverified and inferred conclusions must be labeled. Do not convert missing evidence into certainty.

### C13 — Security proportionality
Security depth must reflect data sensitivity, attack surface, connectivity, authentication, financial/regulatory impact and deployment exposure.

### C14 — No secret exposure
Audit activities must minimize and redact sensitive values. Secret values are never required to prove that secret management exists.

### C15 — Read-only audit
Auditing and fixing are separate responsibilities. Baseline, plan, re-audit and certify modes do not modify product source.
