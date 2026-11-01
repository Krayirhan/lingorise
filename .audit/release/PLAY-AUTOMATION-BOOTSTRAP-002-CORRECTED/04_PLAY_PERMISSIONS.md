# Play Permissions

## Owner-reported grant (from the user, between runs)

Service account `lingorise-play-submit@lingorise-65cb1.iam.gserviceaccount.com` added to Google Play Console for LingoRise / `com.lingorise.app`, with: View app information, Edit/delete draft apps, Release apps to testing tracks, Manage testing tracks and tester lists, Release to production / Play App Signing capability, Manage store presence, Reply to reviews, Manage policy declarations, Manage deep links. Admin/global and financial/order permissions explicitly NOT granted (consistent with the least-privilege principle this task requires, though broader than strictly required for Internal Testing submission alone — noted, not corrected unilaterally, since narrowing an already-granted permission set is the account owner's call, not something to silently "fix").

## Independent API-level verification (this run)

A minimal-privilege test call (`androidpublisher.edits.insert` for `com.lingorise.app`, using a hand-signed JWT exchanged for an access token — no new npm dependency added) was made using the service account's own key, at three points in time:

| Attempt | Elapsed since grant (approx.) | Result |
|---|---|---|
| 1 | ~0 min (immediately after key creation) | `403 PERMISSION_DENIED` |
| 2 | ~1 min | `403 PERMISSION_DENIED` |
| 3 | ~20+ min (after the eas.json PR/CI/merge cycle completed) | `403 PERMISSION_DENIED` |

All three attempts returned the identical generic Google error (`"The caller does not have permission"`), which does not by itself distinguish a genuine misconfiguration from Google's own documented permission-propagation delay (Google's own Play Console help states new user/service-account grants can take time to fully propagate).

**No permission was broadened.** No additional Cloud IAM role, no additional Play Console permission, and no different service account was tried.

**PLAY PACKAGE ACCESS: NOT YET VERIFIED** (pending — most consistent with propagation delay given the grant was very recently completed by the account owner, but not conclusively distinguishable from a configuration issue purely from this generic error message).

## Recommended next check (not performed automatically, to avoid uncontrolled retry loops)

Wait a longer interval (Google's own documentation references windows of a few hours in some cases) and retry the same test, or check the Play Console's own "Users and permissions" page to confirm the service account row shows as fully "Active" (not "Pending") for LingoRise specifically.
