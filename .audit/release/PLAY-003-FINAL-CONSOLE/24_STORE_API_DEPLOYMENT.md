# Store API Deployment

## Auth mechanism

No new dependency added. Used the existing service account key at `D:/lingorise-secure/google-play-service-account.json` (outside the repo, never read into any tracked file) with a hand-signed RS256 JWT (Node's built-in `crypto`) exchanged for an OAuth token — avoids adding `googleapis`/`google-auth-library` as a project dependency for what is a one-off script, consistent with "don't add unnecessary dependency" policy. Script kept in the session scratchpad, not the repo (it references a secret file path; nothing secret is embedded in the script itself).

## Text listings (8 locales)

`edits.listings.update` (PUT) for `en-US` (unchanged, already live from a prior session — verified, not re-pushed) and `tr-TR`, `de-DE`, `es-ES`, `fr-FR`, `it-IT`, `pt-BR`, `ar` (new this run) → `edits:validate` → `edits:commit`. All 8 returned HTTP 200. Independently re-verified via a fresh `GET edits/{id}/listings` read after commit: all 8 language codes present.

## Images (en-US)

Initial attempt used path `.../listings/{lang}/images/{imageType}` (extra `images` segment) → got a raw Google infrastructure 404 (HTML, not a JSON API error) for every image type **and** for the unrelated `appsigning` endpoint, which in hindsight was the tell that these were routing/path mistakes, not real API/permission limitations.

Corrected against Google's own API reference (`developers.google.com/android-publisher/api-ref/rest/v3/edits.images/list` and `.../upload`, fetched live this run): correct path is `.../listings/{language}/{imageType}` (no `images` segment), and upload uses the `/upload/androidpublisher/v3/...` prefix with a raw binary POST body (`Content-Type: image/png`).

Uploaded via `edits.images.upload`: `icon` (1), `featureGraphic` (1), `phoneScreenshots` (3) — all en-US — then `edits:validate` → `edits:commit`, both HTTP 200. Independently re-verified via `GET edits/{id}/listings/en-US/{imageType}` after commit: 1/1/3 images respectively, matching what was uploaded.

## What was deliberately NOT touched

- The existing en-US **text** listing — already correct, no reason to overwrite (NO CHANGE, not a re-upload).
- `category`/tags — no writable API field exists (`16_CATEGORY_TAGS_CONTACT.md`).
- Countries/regions — see `26_COUNTRIES.md`.
- Internal track testers — no tester identities were invented; nothing written (`27_INTERNAL_TESTERS.md`).
- Production/closed/open tracks — untouched, per explicit instruction.
- Play App Signing certificates — read-only inspection only, genuinely no API surface found (`29_PLAY_APP_SIGNING.md`); no private key material ever requested or exposed.

## Idempotency / diff discipline followed

Every write happened inside its own `edits.insert` → change → `edits:validate` → `edits:commit` cycle; nothing was committed after a failed validate; read-only inspection edits were always cleaned up with `edits:delete` rather than left dangling.

## Status

EVIDENCE: READY. PLAY: **SUBMITTED AND VERIFIED IN PLAY** for text listings (8/8) and en-US images (icon, feature graphic, 3 screenshots).
