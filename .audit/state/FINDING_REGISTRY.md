# Finding Registry

| ID | Severity | Domain | Status | First Seen | Last Verified | Title |
|---|---|---|---|---|---|---|
| CORE-001 | P1 | Core correctness | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-01 | Streak resets on non-+1-day clock diff |
| DATA-001 | P1 | Data integrity | CLOSED | RUN-001-BASELINE | RUN-005-REAUDIT | Cold-start race can clobber merged progress. Fix present since FIX-2026-08-25-01, unit test coverage since testSuite.ts #56. Real two-device signed-in test performed by the project owner on 2026-08-26 (self-reported: two physical/real devices signed into the same account, sync confirmed working) — VERIFIED (user-performed, not independently observed by the audit agent). Original acceptance criterion now met. |
| CORE-002 | P2 | Core correctness / Testing | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | XP/difficulty formulas untested |
| DATA-002 | P2 | Data integrity | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | Silent saveUserData failure |
| REL-001 | P2 | Reliability | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | refresh() sync call lacks try/catch |
| ARCH-003 | P2 | Architecture | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-02 | Oversized multi-responsibility auth/account screens |
| CORE-003 | P3 | Core correctness / Testing | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-03 | archiveDailyQuests/bringForward untested |
| ARCH-001 | P3 | Architecture | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-03 | One dead duplicate file (i18n/formatters.ts, deleted) |
| ACC-001 | P3 | Accessibility | CLOSED | RUN-001-BASELINE | RUN-005-REAUDIT | Real TalkBack + dynamic-type pass done; onboarding, LevelPromotionModal, reduceMotion (incl. SkeletonLoader) scope closed. Final DoD item closed 2026-08-26 via real TalkBack service enabled on a physical emulator + uiautomator accessibility-tree inspection (equivalent rigor to the Android Accessibility Scanner app, which was not separately installed) across Profile/Progress/Auth — 2 more real bugs found and fixed: AvatarPicker's 5 avatar options had no accessibilityLabel/Role/State, and EditableAccountName's edit-name Pressable/save-button/TextInput had no accessible labels. Both fixed with proper i18n-sourced labels (src/i18n/profile.ts: editNameLabel/saveNameLabel/nameFieldLabel), verified against testSuite.ts's hardcoded-label localization scan (Bölüm 44). 5/5 DoD items now closed. |
| DEPLOY-001 | P3 | Deployment | VERIFIED→CLOSED | RUN-001-BASELINE | RUN-003-REAUDIT | All 3 CI jobs (verify, android-build, e2e-smoke) genuinely green, re-confirmed on current HEAD: https://github.com/Krayirhan/lingorise/actions/runs/32900631213 (commit 29ce04e) |
| ARCH-002 | P4 | Architecture | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-06 | Two layering inversions |
| ARCH-004 | P4 | Architecture | CLOSED (scope corrected) | RUN-001-BASELINE | FIX-2026-08-25-06 | Dead getDailyTaskCollection removed; firestore.rules dailyTasks rule kept (tested, harmless, not orphaned) |
| SEC-002 | P4 | Security | CLOSED | RUN-001-BASELINE | FIX-2026-08-25-06 | Real Firebase IDs in .env.example |
| DEP-001 | P4 | Dependency health | ACCEPTED_RISK | RUN-001-BASELINE | FIX-2026-08-25-06 | npm audit: 17 moderate/0 high/0 critical, all build-time-only tooling, no dependency changes made |
| ACC-002 | P4 | Accessibility | CLOSED | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Hint button malformed accessibility label (", İpucu") |
| ACC-003 | P3 | Accessibility | CLOSED | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Audio/pronunciation button had zero accessible name |
| ACC-004 | P3 | Accessibility | CLOSED | FIX-2026-08-25-07 | FIX-2026-08-25-07 | Mascot speech bubble breaks word mid-character at 2.0x font scale |
| DEPLOY-002 | P4 | Deployment | OPEN | RUN-003-REAUDIT | RUN-003-REAUDIT | `main` has no branch-protection rule — CI is visible, not enforced |
| SEC-003 | P4 | Security | OPEN | RUN-003-REAUDIT | RUN-003-REAUDIT | GitHub secret scanning/push protection disabled on now-public repo |
