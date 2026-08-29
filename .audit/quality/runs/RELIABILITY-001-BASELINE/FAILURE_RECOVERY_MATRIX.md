# RELIABILITY-001-BASELINE — User Recovery Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`

| Scenario | Detects failure? | User informed? | Retry/escape? | State safe? | Status |
|---|---|---|---|---|---|
| Offline startup | YES (auth timeout, catalogue fetch timeout) | Implicitly (guest/local mode just works) | YES (full guest functionality) | YES | PASS |
| Network loss during practice | N/A — practice runs entirely on local/bundled content, no network dependency mid-session | N/A | YES (session continues) | YES | PASS |
| Firebase write rejection (cloud sync) | YES (`.catch`) | **NO** — console.warn only | Implicit retry on next mutation, but no user-visible retry action | YES (local data unaffected) | PARTIAL (REL-QA-004) |
| Login failure | YES | YES (`getAuthErrorMessage`, field-level error) | YES (form stays interactive, busy reset) | YES | PASS |
| Password reset failure | YES | YES (same error path as login) | YES | YES | PASS |
| Account deletion partial failure | YES (`auth/requires-recent-login` specifically handled; other errors caught generically) | YES (error message shown, busy reset) | YES (can retry/reauth) | Local YES; cloud-identity state can be left inconsistent (already scored as DATA-QA-004/SEC-QA-003 — cross-domain, not re-scored here since the UI itself does not dead-end) | PASS (reliability angle); cross-domain note on data angle |
| Empty practice pool | YES (`startPractice` returns `false`) | YES (toast) | YES (user stays on current screen, can navigate elsewhere) | YES | PASS |
| Interrupted practice | YES (session restored from `activeSession`) | Implicit (resumes where left off) | YES | YES, with a narrow duplicate-answer edge case (cross-domain, CORE-QA-002) | PARTIAL |
| Interrupted exam | Same mechanism as practice (`sessionMode: "EXAM"` also persisted) | Implicit | YES | Same narrow edge case as above | PARTIAL |
| Corrupt optional local state | YES (`try/catch` in `loadUserData`) | No explicit message, but app loads to usable defaults silently — appropriate for this kind of recovery (no action needed from user) | YES (app is usable) | YES | PASS |
| Local persistence failure (save) | YES (`saveUserData` returns `false`) | YES for the main game-state path (`saveFailureNotice` → toast); **NO** for `clearAllLocalData`/`resetUserData` (REL-QA-003) | Partial | Mostly YES | PARTIAL |
| Rapid repeated submit (practice answer) | YES (state-gated) | N/A (prevented, not an error) | N/A | YES | PASS |
| Logout/login transition | YES | YES | YES | YES (`disableGuestMode`/`enableGuestMode` correctly paired with auth transitions) | PASS |

Legend: PASS = invariant holds. PARTIAL = holds in the common case, a real bounded gap exists. FAIL = a concrete, evidenced defect. NOT VERIFIED = genuinely not established this pass. UNKNOWN ≠ FAIL.
