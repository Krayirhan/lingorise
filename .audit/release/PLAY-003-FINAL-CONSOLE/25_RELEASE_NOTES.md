# Release Notes

## Basis

Actual git history for the current internal release (versionCode 4, source SHA `68904b7e27ba5258521a3f9d14028ae622d9895b`) since the last shipped versionCode 2: PR #14 (removed an unused Android overlay permission) and PR #15 (fixed the app's version numbering so future updates install correctly). Framed for end users, not developers — no architecture, security-implementation, or credential detail.

## English (master)

> This update improves app compatibility and prepares LingoRise for future updates. No visible changes to your practice experience.

(122 characters — well within Play's typical release-notes limits.)

## Turkish

> Bu güncelleme uygulama uyumluluğunu iyileştirir ve LingoRise'ı gelecekteki güncellemelere hazırlar. Pratik deneyiminde görünür bir değişiklik yok.

## Status

EVIDENCE: READY (English + Turkish, matching the two locales with real in-app support; the other 6 store-only locales can reuse the English note or get their own translation on request). **PLAY: NOT YET SUBMITTED** — release notes attach to a specific release via `edits.tracks.update` at the moment a *new* release is rolled out; the current internal release (versionCode 4) was already submitted via `eas submit` before this note was drafted, and editing release notes on an already-`completed` release isn't a track-update use case Play supports (release notes are for the next release, not a retroactive edit to a finished one). Owner action: none needed now — this note is staged for the next internal/production release rollout.
