# SECURITY-001-BASELINE — Firestore Access Matrix

Revision: `16b9aab1f776503ec52067d4f543af8ab6f2e9aa`
Source: `firestore.rules` (45 lines, E2 static read) + `tests/firestoreRules.test.ts` (38 lines, E3 executable, run against Firestore emulator; CI runs it on JDK21 and passes on this HEAD — local JDK17 failure is an environment gap, not a product defect)

| Path | Anonymous read | Anonymous write | Owner read | Owner write | Other-authenticated-user read | Other-authenticated-user write | Expected | Status |
|---|---|---|---|---|---|---|---|---|
| `/users/{uid}` | DENY | DENY | ALLOW | ALLOW (no field validation) | DENY | DENY | Owner-only, no cross-user | PASS (E2+E3 — bob-read/bob-write-fail asserted) |
| `/users/{uid}/progress/{doc=**}` | DENY (inference) | DENY (inference) | ALLOW | ALLOW | DENY (inference) | DENY (inference) | Owner-only | PASS (E2; owner-write directly tested, cross-user not directly tested for this specific subpath but rule pattern identical to `users/{uid}` parent match) |
| `/users/{uid}/dailyTasks/{doc=**}` | DENY (inference) | DENY (inference) | ALLOW | ALLOW | DENY (inference) | DENY (inference) | Owner-only | PASS (E2; owner-write directly tested, cross-user read/write not directly tested — verification gap, not a defect) |
| `/users/{uid}/items/{itemId}` | DENY | DENY | ALLOW | ALLOW | DENY | DENY | Owner-only | PASS (E2+E3 — bob-read-fail explicitly asserted) |
| `contentMeta/{documentId}` | ALLOW | DENY | ALLOW | DENY | ALLOW | DENY | Public read, no client write (admin-script publish) | PASS (E2+E3 — anonymous-read-succeed, and by rule symmetry write denied for everyone) |
| `contentVersions/{versionId}` | ALLOW | DENY | ALLOW | DENY | ALLOW | DENY | Same as above | PASS (E2) |
| `units/{unitId}` | ALLOW | DENY | ALLOW | DENY | ALLOW | DENY | Same as above | PASS (E2) |
| `items/{itemId}` (top-level, distinct from `users/{uid}/items/{itemId}`) | ALLOW | DENY | ALLOW | DENY | ALLOW | DENY | Public catalogue content | PASS (E2+E3 — anonymous-read-succeed, anonymous-write-fail directly asserted) |

## Notes

- The two `items` collections are distinct paths at different depths (`items/{itemId}` top-level catalogue vs `users/{uid}/items/{itemId}` per-user progress) confirmed both in `firestore.rules` and in actual client code (`src/services/catalogueService.ts` reads `collection(db, "items")`; `src/services/firestore.ts` reads/writes `collection(db, "users", userId, "items")`). No confusion between the two exists in the app.
- No field/type/range validation exists on any owner-writable document. This does not create a cross-user or confidentiality issue (isolation itself is solid) — it creates a self-integrity/abuse-resistance gap, tracked as SEC-QA-001 in SUMMARY.md, not a cross-user authorization defect.
- All paths actually used by the client (per `catalogueService.ts`, `firestore.ts`) are covered by an explicit rule; no path is used by the app that would fall through to Firestore's default-deny with no matching rule.
