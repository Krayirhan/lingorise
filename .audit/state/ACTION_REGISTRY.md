# Action Registry

| Action ID | Priority | Status | Finding IDs | Created Run | Verified Run | Goal |
|---|---|---|---|---|---|---|
| ACT-CORE-001 | P1 | VERIFIED | CORE-001 | RUN-001-BASELINE | FIX-2026-08-25-01 | Fix streak reset on backward/non-+1-day clock diff |
| ACT-DATA-001 | P1 | VERIFIED | DATA-001 | RUN-001-BASELINE | RUN-005-REAUDIT | Eliminate cold-start local-storage race; unit test added (testSuite.ts #56); physical two-device signed-in test performed by project owner 2026-08-26 (self-reported) |
| ACT-CORE-002 | P2 | VERIFIED | CORE-002 | RUN-001-BASELINE | FIX-2026-08-25-02 | Test computeXpReward/computeDifficulty |
| ACT-DATA-002 | P2 | VERIFIED | DATA-002 | RUN-001-BASELINE | FIX-2026-08-25-02 | Surface signal on repeated save failure |
| ACT-REL-001 | P2 | VERIFIED | REL-001 | RUN-001-BASELINE | FIX-2026-08-25-02 | Wrap refresh() sync call in try/catch |
| ACT-ARCH-003 | P2 | VERIFIED | ARCH-003 | RUN-001-BASELINE | FIX-2026-08-25-02 | Split AuthScreen/AccountManagementCard |
| ACT-CORE-003 | P3 | VERIFIED | CORE-003 | RUN-001-BASELINE | FIX-2026-08-25-03 | Test archiveDailyQuests/bringForward |
| ACT-ARCH-001 | P3 | VERIFIED | ARCH-001 | RUN-001-BASELINE | FIX-2026-08-25-03 | Delete one dead duplicate file (i18n/formatters.ts) |
| ACT-ACC-001 | P3 | VERIFIED | ACC-001 | RUN-001-BASELINE | RUN-005-REAUDIT | 5/5 DoD closed. Onboarding + LevelPromotionModal + reduceMotion (commit 55130bf); Profile/Progress/Auth TalkBack+uiautomator audit found and fixed 2 more real bugs (AvatarPicker, EditableAccountName — both now i18n-sourced labels) |
| ACT-DEPLOY-001 | P3 | CLOSED | DEPLOY-001 | RUN-001-BASELINE | RUN-003-REAUDIT | Maestro/release-build CI gate live and green end-to-end, re-confirmed on current HEAD: https://github.com/Krayirhan/lingorise/actions/runs/32900631213 |
| ACT-ARCH-002 | P4 | VERIFIED | ARCH-002 | RUN-001-BASELINE | FIX-2026-08-25-06 | Fix two layering-inversion imports |
| ACT-ARCH-004 | P4 | VERIFIED | ARCH-004 | RUN-001-BASELINE | FIX-2026-08-25-06 (scope reduced — see note) | Remove dead getDailyTaskCollection (rule kept, tested & harmless) |
| ACT-SEC-002 | P4 | VERIFIED | SEC-002 | RUN-001-BASELINE | FIX-2026-08-25-06 | Replace real IDs in .env.example |
| ACT-DEP-001 | P4 | VERIFIED | DEP-001 | RUN-001-BASELINE | FIX-2026-08-25-06 | Run npm audit, triage findings (accepted risk) |
| ACT-ACC-002 | P4 | VERIFIED | ACC-002 | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Fix hint button malformed label |
| ACT-ACC-003 | P3 | VERIFIED | ACC-003 | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Add accessible name to audio button |
| ACT-ACC-004 | P3 | VERIFIED | ACC-004 | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Fix mascot bubble mid-word break at max font scale |
| ACT-DEPLOY-002 | P4 | OPEN | DEPLOY-002 | RUN-003-REAUDIT | — | Add branch-protection rule on `main` requiring `verify` check (once PR-based/multi-contributor workflow adopted) |
| ACT-SEC-003 | P4 | OPEN | SEC-003 | RUN-003-REAUDIT | — | Enable GitHub secret scanning + push protection (free, public repo) |
