# Privacy Policy Evidence

## Final URL

Privacy Policy: `https://lingorise-65cb1.web.app/privacy-policy/`
Account Deletion: `https://lingorise-65cb1.web.app/account-deletion/`
Root (`/`) 302-redirects to `/privacy-policy/` for convenience.

## Anonymous request result (fresh, this sprint)

```
curl -s -o /dev/null -w "STATUS:%{http_code}" https://lingorise-65cb1.web.app/privacy-policy/
→ STATUS:200, no redirect_url (no login redirect)

curl -s -o /dev/null -w "STATUS:%{http_code}" https://lingorise-65cb1.web.app/account-deletion/
→ STATUS:200
```

No cookies, no auth headers, no prior session were used for these requests — a genuinely anonymous check.

## HTTP/status evidence

Both pages: **HTTP 200**, served over HTTPS by Firebase Hosting's CDN (`*.web.app`, Google-managed TLS certificate — no separate certificate provisioning required). No authentication requirement, no redirect to any login surface.

## Content verification

```
curl -s https://lingorise-65cb1.web.app/privacy-policy/ | grep -o "<title>.*</title>"
→ <title>LingoRise — Gizlilik Politikası / Privacy Policy</title>

curl -s https://lingorise-65cb1.web.app/privacy-policy/ | grep -c "Gizlilik Politikası"
→ 2 (title + in-page heading — confirms real rendered content, not a generic shell)

curl -s https://lingorise-65cb1.web.app/account-deletion/ | grep -o "<title>.*</title>"
→ <title>LingoRise — Hesap Silme / Account Deletion</title>
```

Both titles and bodies are app-specific (name the app, are branded, are not a generic template) — directly contrasting with RELEASE-001-BASELINE's finding of a generic Claude Artifact shell.

## TR/EN availability

Single page, both languages present simultaneously in the DOM with a client-side toggle (no JS framework/CDN dependency — plain inline `<script>`), defaulting to Turkish (the app's primary audience) with an English toggle. This avoids a locale-detection dependency and works even with JavaScript disabled (both language blocks are present in the raw HTML; only the *visual* toggle needs JS — content is not hidden from a text-only/accessibility crawler).

## Content ownership

Content is authored by this project (not a third-party generic template) and hosted on the project's own Firebase project (`lingorise-65cb1`), the same backend the app itself uses for Authentication and Firestore — verified via `.firebaserc`.

## Actual service/data mapping (verified against source, not assumed)

- **Firebase Authentication** — confirmed used (`src/services/firebase.ts` imports `getAuth`); described accurately.
- **Firestore sync** — confirmed used (`getFirestore`); described accurately, including that access is controlled by Firestore security rules (verified: `firestore.rules` exists and is the app's actual access-control mechanism).
- **Local storage** — confirmed (`@react-native-async-storage/async-storage` dependency; `src/services/storage.ts`).
- **Notifications** — confirmed local-only, no push token collection, by direct read of `src/services/notificationService.ts` (uses `expo-notifications`' local `scheduleNotificationAsync`, never `getExpoPushTokenAsync` or any server call).
- **Third parties / analytics / ads** — confirmed NONE exist in `package.json` dependencies (no analytics, crash-reporting, or ad SDK present) — the policy's "no analytics, no ads, no crash reporting" claim is verified true, not assumed.
- **Account deletion behavior** — confirmed matches actual code: `deleteAccount()` (Sprint 1, `src/services/auth.ts`) performs Firestore-then-Auth deletion as two separate steps and throws `PartialAccountDeletionError` on partial failure, surfaced distinctly to the user (`AccountManagementCard.tsx`) — the policy's "two separate steps, partial failure is never silently reported as success" claim is verified true, not an assumption.

No data practice was claimed that source/config does not support. No generic/unrelated template content was used.

## Account deletion wording

Both TR and EN sections explain: how to delete via the app (Profile → Account Management → Delete Account), exactly what gets deleted (Firestore progress document + Auth account), the two-step/partial-failure limitation, and a fallback manual-request path (`fusturan@gmail.com`) for a user who has lost app access — satisfying Play's requirement for an external account-deletion information surface without falsely claiming a working remote/server-side deletion request form (none exists; this is honestly disclosed as a limitation, not hidden).

## Last verified timestamp

2026-08-29 (this sprint), immediately after deployment, via the fresh anonymous `curl` checks above.

## Remaining limitations

- The page cannot itself process a deletion request (no backend form) — disclosed explicitly in its own text, not hidden.
- `lingorise-65cb1.web.app` is a Firebase-provided subdomain, not a custom `lingorise.app`-style domain. This is fully durable and stable (tied to the Firebase project, not to any temporary session) and satisfies "durable enough for Play Console use," but a custom domain remains a possible future improvement, not a defect.
- Content is static HTML with an inline toggle script; no CMS/versioning system — future edits require redeploying via `firebase deploy --only hosting` (documented, repeatable, low-friction).

## RELEASE-QA-003 recommendation

**CLOSED.**

Meets every requirement in the original finding and Master's `06_RELEASE_DEPENDENCY_MAP.md` closure standard: public, no login, stable HTTPS URL, app-specific, LingoRise-branded, TR+EN, content accurately matching actual app behavior, durable (Firebase-project-backed, not a temporary artifact link), and independently re-verified via a fresh anonymous HTTP check performed by this sprint (not merely asserted).
