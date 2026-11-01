# Account Deletion

URL: `https://lingorise-65cb1.web.app/account-deletion/` — fresh check this run: HTTP **200**, HTTPS, no login required to view the instructions themselves (satisfies Play's "accessible without needing to install the app or sign in" requirement for the informational page).

## Implementation verification (source-level, not just page text)

- **Accounts can be created:** YES — `src/services/firebase.ts` (`getAuth`), sign-up flow present.
- **Account deletion exists inside the app:** YES — `AccountManagementCard.tsx` → `deleteAccount()` in `src/services/auth.ts`.
- **Firebase Auth account is deleted:** YES — `deleteAccount()` calls Firebase Auth's own user-deletion API.
- **Associated Firestore data is deleted:** YES — `deleteAccount()` also purges the user's Firestore progress document (including `dailyTasks`, added specifically as a Sprint 1 fix for a previously-incomplete cleanup scope).
- **Retained data:** account deletion is two independent, client-initiated steps (Firestore-delete, then Auth-delete); a failure partway through is explicitly surfaced to the user via `PartialAccountDeletionError` rather than silently reported as complete — this is a *disclosed limitation* (a timing window can exist between the two steps on a partial failure), not undisclosed retained data. No data is retained *by design* after a fully successful deletion.
- **Web deletion resource works without login:** YES for viewing instructions; the page itself honestly discloses it cannot process a remote deletion *request* (no backend form exists) and directs a user without app access to email for manual deletion — this is accurately reflected in the page's own text, not a gap being hidden.

## Google Play account-deletion declaration (prepared from verified facts only)

- Does the app support account deletion: **YES**
- In-app deletion available: **YES**
- Web deletion available: **PARTIAL** — informational page only (explains in-app steps); no remote request form. This is the correct, honest declaration shape for Play's form, not a blocker (Play accepts either a functional web deletion flow or a page directing users to the in-app method when the account can only be deleted while authenticated in-app — confirm exact current Play form wording against this, flagged below).
- Data deleted on account deletion: progress data (XP, streak, level, solved questions, passed exams, favorites, practice/quest history), authentication credentials.
- Data retained: none by design; a documented edge case exists only for a failed partial deletion, which the app surfaces to the user for retry.

## Classification

**Account deletion: PASS** for what is independently verifiable from source and the live pages. One item flagged as **OWNER CONFIRMATION REQUIRED**: the exact current Play Console account-deletion declaration form wording should be checked against this program's specific requirements (some Play form versions require a *separate, standalone* web page that itself can process deletion without opening the app at all — if the current form mandates that specific capability rather than accepting an informational/instructional page, a small scope addition to the hosted page would be needed). This is a form-wording verification only Play Console access can resolve, not a code defect.
