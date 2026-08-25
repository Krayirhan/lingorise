# Action Registry

| Action ID | Priority | Status | Finding IDs | Created Run | Verified Run | Goal |
|---|---|---|---|---|---|---|
| ACT-CORE-001 | P1 | VERIFIED | CORE-001 | RUN-001-BASELINE | FIX-2026-08-25-01 | Fix streak reset on backward/non-+1-day clock diff |
| ACT-DATA-001 | P1 | DONE | DATA-001 | RUN-001-BASELINE | FIX-2026-08-25-01 (partial — see note) | Eliminate cold-start local-storage race |
| ACT-CORE-002 | P2 | VERIFIED | CORE-002 | RUN-001-BASELINE | FIX-2026-08-25-02 | Test computeXpReward/computeDifficulty |
| ACT-DATA-002 | P2 | VERIFIED | DATA-002 | RUN-001-BASELINE | FIX-2026-08-25-02 | Surface signal on repeated save failure |
| ACT-REL-001 | P2 | VERIFIED | REL-001 | RUN-001-BASELINE | FIX-2026-08-25-02 | Wrap refresh() sync call in try/catch |
| ACT-ARCH-003 | P2 | VERIFIED | ARCH-003 | RUN-001-BASELINE | FIX-2026-08-25-02 | Split AuthScreen/AccountManagementCard |
| ACT-CORE-003 | P3 | PROPOSED | CORE-003 | RUN-001-BASELINE | — | Test archiveDailyQuests/bringForward |
| ACT-ARCH-001 | P3 | PROPOSED | ARCH-001 | RUN-001-BASELINE | — | Delete two dead duplicate files |
| ACT-ACC-001 | P3 | PROPOSED | ACC-001 | RUN-001-BASELINE | — | Execute accessibility DoD verification |
| ACT-DEPLOY-001 | P3 | PROPOSED | DEPLOY-001 | RUN-001-BASELINE | — | Add Maestro/release-build CI gate |
| ACT-ARCH-002 | P4 | PROPOSED | ARCH-002 | RUN-001-BASELINE | — | Fix two layering-inversion imports |
| ACT-ARCH-004 | P4 | PROPOSED | ARCH-004 | RUN-001-BASELINE | — | Remove dead getDailyTaskCollection + rule |
| ACT-SEC-002 | P4 | PROPOSED | SEC-002 | RUN-001-BASELINE | — | Replace real IDs in .env.example |
| ACT-DEP-001 | P4 | PROPOSED | DEP-001 | RUN-001-BASELINE | — | Run npm audit, triage findings |
