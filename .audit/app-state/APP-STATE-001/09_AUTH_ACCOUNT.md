# 09 — Authentication &amp; Account

Firebase Auth (email/password) via `firebase/auth`, `initializeAuth` with AsyncStorage-backed persistence on native.

| Capability | Implemented | UI-reachable | Tested | Failure handling | Network |
|---|---|---|---|---|---|
| Guest mode | Yes (AsyncStorage flag) | "Continue as guest" in onboarding | No | N/A | Fully offline |
| Register | Yes | AuthScreen | Only error-message mapping tested, not the SDK flow | Errors mapped to tr/en via 11-code table | Requires network |
| Login | Yes | AuthScreen | Same | Same | Requires network |
| Password reset | Yes | AuthScreen, ProfileScreen | No | Alert with mapped error | Requires network |
| Email verification | Yes | ProfileScreen | No | Alert | Requires network |
| Logout | Yes | ProfileScreen | No | console.warn only, no user-facing toast on failure | Requires network |
| Account deletion | Yes | ProfileScreen (confirm dialog) | No direct unit test, but has dedicated `PartialAccountDeletionError` handling referencing fixed defects (DATA-QA-004/SEC-QA-003) | Deletes Firestore data first, then auth user; on partial failure (e.g. requires-recent-login) surfaces a distinct error so the UI can tell the user their data is gone but the credential remains | Requires network |
| Session restore | Automatic (SDK persistence) | n/a | Not unit-testable directly | 8s timeout fallback to guest/signed-out if listener never fires | Local restore; profile merge needs network |
| Profile creation | Yes (displayName) | AuthScreen/ProfileScreen | No | try/catch, console.warn | Requires network |

No auth flow is exercised by a mocked Firebase Auth SDK — only the pure error-message-mapping function is unit-tested. Firestore rules tests use pre-authenticated contexts and don't exercise the auth flows themselves.

**Assessment:** IMPLEMENTED BUT largely UNVERIFIED by automated tests beyond error-message mapping — the flows exist and are UI-reachable, but regression protection for login/register/logout/delete relies on manual testing, not the automated suite.
