# Data Safety (re-audit for the Families lens)

## General Data Safety

**READY** — unchanged from `PLAY-001-DECLARATIONS/01_DATA_SAFETY.md`'s full matrix, independently re-confirmed this run (no source change to any data-collection path occurred between that audit and this one, aside from the unrelated `SYSTEM_ALERT_WINDOW` manifest removal).

## Owner's intended profile information — verified against CURRENT reality

| Field | Owner's intended profile info | Currently collected? | Evidence |
|---|---|---|---|
| Email | Listed as intended | **YES, currently collected** (signed-in only) | `src/services/firebase.ts` (`getAuth`) |
| Name | Listed as intended | **NO, not currently collected** — no name field in `UserData`, no name-entry UI found in onboarding or account screens | `src/types/user.ts`, `src/features/onboarding/` |
| Username | Listed as intended | **NO, not currently collected** — `displayName` exists in `PROGRESS_FIELD_STRATEGY` but is not populated from any user-facing input UI found in source (searched account/profile screens) | Same |
| Optional profile picture | Listed as intended | **NO** — `avatarId` exists but selects from a small fixed set of illustrated icons (`AvatarPicker.tsx`'s hardcoded options, e.g. "sprout"/"flower"/"tree"), not an uploaded photo | `src/features/profile/components/AvatarPicker.tsx` |

**UNKNOWN was not silently turned into NO here** — each "NO" above is a direct result of searching for the specific corresponding UI/data-field and finding none, not an assumption from absence of mention.

## Child/Unknown-Age Data Safety

**FINDINGS** — see `07_FAMILIES_READINESS.md` for the full reasoning. The data collected (email only, no name/username/photo currently) is minimal by design, which reduces but does not eliminate the compliance gap: email is still "personal information" under COPPA, and the account-creation flow has no age-awareness at all.

## Status

**GENERAL DATA SAFETY: READY.**
**CHILD/UNKNOWN-AGE DATA SAFETY: FINDINGS** (tracks `07_FAMILIES_READINESS.md`'s own classification, not a separate new problem).
