# 05 — Contextual Rubric Builder

## Goal
Build the smallest complete rubric that accurately measures whether this project fulfills its purpose at its risk/release level.

## Candidate quality domains
Select only applicable domains:

- Core product correctness
- Data integrity & persistence
- State/lifecycle management
- Architecture & boundaries
- Maintainability
- Testing & verification
- Performance & resource use
- Security
- Privacy
- UX/usability
- Accessibility
- Reliability/resilience
- Networking/API behavior
- Authentication
- Authorization/tenant isolation
- Sync/concurrency/conflict handling
- Observability
- Deployment/release engineering
- Dependency/supply-chain health
- Platform compliance
- Game-specific runtime quality
- ML/model quality & evaluation
- Domain-specific correctness

You may add a domain when the product purpose clearly requires it.

## Weight construction
Weights must total 100 across applicable domains.
Weight must reflect:
1. primary user promise;
2. failure impact;
3. likelihood/exposure;
4. release target;
5. architecture importance.

Do not increase weight merely because an area is trendy or complex.

## Subcriteria
Each domain must contain 3–10 concrete, observable subcriteria where feasible.
Each subcriterion includes:
- applicability;
- expected evidence;
- severity ceiling if violated;
- score anchor notes.

## Rubric lock
After a valid baseline:

```text
RUBRIC_VERSION: 1.0
LOCKED: TRUE
PROJECT_PURPOSE_HASH_OR_REVISION: <when available>
RISK_PROFILE_REVISION: <id/date>
```

### Rubric may change only when materially justified
Examples:
- offline app gains cloud sync/auth;
- prototype becomes public paid SaaS;
- financial transactions are introduced;
- major product purpose changes;
- new regulated data is stored.

When changed:
- create a new rubric version;
- never rewrite old scores;
- state why cross-version score comparison is limited.

## Anti-gaming rule
Do not drop a criterion because the implementation performs poorly. Applicability is based on product needs, not current implementation quality.
