# Internal Tester Group

## Verified via API

`GET edits/{id}/testers/internal` → `200 {}` — genuinely empty. No `googleGroups` or `googleEmailAddresses` configured on the internal track at all.

## "Test" group mentioned in the recovery brief

No Play Console UI-only "tester list" concept is visible to this API call — the `testers` resource only reflects what's actually attached to a track, and nothing is attached. If a tester list named "Test" exists in Play Console (a saved list of emails, not yet linked to a track), the API wouldn't show it until it's attached; this run has no way to enumerate Console-only saved lists.

## What was NOT done

No tester email address or Google Group was invented or written, per explicit instruction ("do not invent tester emails").

## Status

EVIDENCE: READY (current empty state confirmed). PLAY: **OWNER ACTION REQUIRED** — attach the existing "Test" list (or specific tester emails/a Google Group) to the internal track in Play Console; this run cannot discover or create tester identities on its own.
