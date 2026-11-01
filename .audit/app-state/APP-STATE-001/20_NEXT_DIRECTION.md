# 20 — What Should We Build Next

NEXT MOST VALUABLE DEVELOPMENT TARGET: **B1-C2 content production** (vocabulary + question generation for levels 3-6)

WHY: Every other system the content would flow through — practice engine, exam engine, XP/leveling, promotion/unlock logic, sync — is already built, generic, and heavily tested. The single blocker preventing LingoRise from being a real A1-C2 product instead of an A1-A2 product is content volume. This is the highest-leverage work available: no new architecture, no new mechanics, just filling an existing, well-tested pipeline (the same generation approach already used for A1/A2's procedurally-expanded vocabulary tables could plausibly extend to B1-C2).

NEXT 3 DEVELOPMENT AREAS (priority order):
1. **B1-C2 content production** — bring each level to at least the 100-question readiness bar (and 50+ for exam availability), reusing the existing vocabulary-table-to-question generation pattern from A1/A2.
2. **Reliability/observability hardening** — wire a real crash-reporting service (the extensibility hook already exists in `errorReporter.ts`), and fix the ErrorBoundary i18n bypass so crash-screen copy respects locale.
3. **Auth flow test coverage** — add automated tests (mocked Firebase Auth SDK) for register/login/logout/account-deletion, since these are currently the least-verified user-facing flows despite being fully implemented.
