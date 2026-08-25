# Finding Registry

| ID | Severity | Domain | Status | First Seen | Last Verified | Title |
|---|---|---|---|---|---|---|
| CORE-001 | P1 | Core correctness | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-01 | Streak resets on non-+1-day clock diff |
| DATA-001 | P1 | Data integrity | PARTIAL | RUN-001-BASELINE | FIX-2026-08-25-01 | Cold-start race can clobber merged progress |
| CORE-002 | P2 | Core correctness / Testing | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | XP/difficulty formulas untested |
| DATA-002 | P2 | Data integrity | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | Silent saveUserData failure |
| REL-001 | P2 | Reliability | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | refresh() sync call lacks try/catch |
| ARCH-003 | P2 | Architecture | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | Oversized multi-responsibility auth/account screens |
| CORE-003 | P3 | Core correctness / Testing | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-03 | archiveDailyQuests/bringForward untested |
| ARCH-001 | P3 | Architecture | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-03 | One dead duplicate file (i18n/formatters.ts, deleted) |
| ACC-001 | P3 | Accessibility | PARTIAL | RUN-001-BASELINE | FIX-2026-08-25-07 | Real TalkBack + dynamic-type pass done (2/5 DoD items), 3 real bugs found & fixed; onboarding/promotion-modal/Scanner/reduceMotion still untested |
| DEPLOY-001 | P3 | Deployment | VERIFIED→CLOSED | RUN-001-BASELINE | FIX-2026-08-25-09 | All 3 CI jobs (verify, android-build, e2e-smoke) genuinely green: https://github.com/Krayirhan/lingorise/actions/runs/32899393092 (commit 1b616e0) |
| ARCH-002 | P4 | Architecture | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-06 | Two layering inversions |
| ARCH-004 | P4 | Architecture | CLOSED (scope corrected) | RUN-001-BASELINE | FIX-2026-08-25-06 | Dead getDailyTaskCollection removed; firestore.rules dailyTasks rule kept (tested, harmless, not orphaned) |
| SEC-002 | P4 | Security | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-06 | Real Firebase IDs in .env.example |
| DEP-001 | P4 | Dependency health | ACCEPTED_RISK | RUN-001-BASELINE | FIX-2026-08-25-06 | npm audit: 17 moderate/0 high/0 critical, all build-time-only tooling, no dependency changes made |
| ACC-002 | P4 | Accessibility | CLOSED | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Hint button malformed accessibility label (", İpucu") |
| ACC-003 | P3 | Accessibility | CLOSED | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Audio/pronunciation button had zero accessible name |
| ACC-004 | P3 | Accessibility | CLOSED | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Mascot speech bubble breaks word mid-character at 2.0x font scale |
