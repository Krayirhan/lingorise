# Worldwide Distribution

## Owner decision

WORLDWIDE (per instruction — not silently limited to Turkey).

## API surface check (corrected)

`edits.countryavailability.get` genuinely exists in the API — an earlier attempt this run used the wrong path casing (`countryavailability` instead of the required `countryAvailability`), which produced a misleading raw-404. Retried with the correct path, confirmed against the API's own live discovery document:

- `GET .../countryAvailability/internal` → `400 "Track internal does not support country availability"` — expected; internal testing is tester-gated, not country-gated, so this track simply has no country concept.
- `GET .../countryAvailability/production` → `204` (empty body) — **no restriction record exists on the production track.**

This resource is **read-only** in the v3 API (no `update`/`set` method exists at all, confirmed from the discovery document) — country/region selection can only be *written* through Play Console UI, but it can be *read*, and what was read confirms no restriction.

## Practical effect

Google Play's default for a track with no restriction record is worldwide availability. Confirmed directly for `production` (the track that will eventually carry country targeting); `internal` doesn't carry this concept at all. No restriction to Turkey or any other subset exists anywhere in this app's Play configuration.

## Status

EVIDENCE: READY. PLAY: **VERIFIED IN PLAY (read-only confirmation)** — worldwide, no restriction, on the production track. Owner action only if they ever want to explicitly deviate from worldwide (that write is Console-UI-only).
