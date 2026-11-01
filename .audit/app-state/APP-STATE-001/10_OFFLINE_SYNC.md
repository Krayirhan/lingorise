# 10 — Local-First / Offline / Multi-Device Sync

## Offline behavior by feature

| Feature | Offline read | Offline write | Sync timing | Failure UX |
|---|---|---|---|---|
| Practice/XP/streak/favorites/quests/exams/profile | Yes | Yes (queued only implicitly — every mutation writes AsyncStorage synchronously and best-effort pushes to Firestore) | Immediate best-effort push per mutation; no real outbox/retry-later queue | ≥2 consecutive cloud-sync failures → toast that local data is safe but cloud upload isn't happening; separate toast for local-save failures |
| Content catalogue | Yes | N/A (read-only) | 3-tier: remote (8s timeout) → AsyncStorage cache → bundled JSON | Silent fallback |
| Auth/guest state | Yes | N/A | N/A | 8s bootstrap timeout |

There is no true offline write queue — a failed push is dropped, not retried until the next mutation or the next sign-in/refresh merge reconciles the full state.

## Data storage map

| Store | Key/Collection | Source of truth | Sync direction | Delete behavior |
|---|---|---|---|---|
| AsyncStorage | `@lingorise_user_data_v2` | Local, primary for guests | Local→Firestore push per mutation; Firestore→local on sign-in/refresh merge | `clearAllLocalData()` |
| AsyncStorage | `@lingorise_user_data_v1` (legacy) | Migrated to v2 then removed | — | Removed after migration |
| AsyncStorage | `@lingorise_guest_mode` | Local only | None | Reset on account deletion |
| AsyncStorage | `@lingorise_catalogue_cache_v2:{level}` | Cache of Firestore content | Remote→local only | Not explicitly cleared |
| Firestore | `users/{uid}` | Canonical signed-in profile+progress | Bidirectional, field-strategy merge | `deleteUserData()` deletes doc + subcollections |
| Firestore | `users/{uid}/progress/main` | XP/level/streak mirror | Local→remote push only | Deleted with account |
| Firestore | `users/{uid}/items/{itemId}` | Per-word SRS state | Local→remote push | Batched delete (500/batch) |
| Firestore | `contentMeta/contentVersions/units/items` (top-level) | Published content catalogue | Remote→local, read-only to clients | Public read, write forbidden except trusted admin script |

## Multi-device sync (concrete)

No realtime listener exists (`onSnapshot`) — sync only happens at sign-in/app-open/explicit refresh, not live between simultaneously-online devices. On reconnect, the canonical `mergeUserData` function resolves per-field:

- XP, streak: monotonic max (streak additionally clock-renormalized before comparison — DATA-QA-006 fix)
- favorites/badges/solved/rewarded/celebratedLevels/passedLevelExams: real set union (true on either device wins)
- content level: most-recently-set (timestamp-keyed, deliberate LWW so downgrades survive — DATA-QA-005 fix)
- daily quests / review-xp ids: same-day per-id merge; different-day, the more current day wins outright
- practice/quest history: append-only richer merges, deduped by identity
- account settings (locale, goal minutes, notifications): remote-authoritative (genuine LWW by design)
- transient session state: device-local, never synced

**Critical safety property:** a failed remote fetch (`status:"failed"`) is never treated the same as an absent remote account (`status:"absent"`) — a `RemoteStateUnknownError` blocks any merge/push in that case, preventing a transient network failure from overwriting real remote data with nothing.

## firestore.rules summary
- Ownership enforced (`request.auth.uid == userId`) on `users/{userId}` and its subcollections; cross-user access denied and tested.
- The parent user doc has server-side shape/range validation (`isValidUserDoc` — non-negative xp/streak, valid level enum, array-type checks).
- Public content collections are world-readable, write-forbidden to clients.
- **Gap:** per-item (`items/{itemId}`) and `dailyTasks` subcollection writes only check ownership, with no shape/range validation like the parent doc has — a buggy or compromised client could write malformed per-word SRS/daily-task data, unlike the main user document.

**Assessment: Local-first is genuinely solid — every core feature works fully offline with real conflict resolution (not naive last-write-wins) for progress data. The main gaps are the lack of a real offline write-retry queue (mitigated by idempotent full-state pushes) and shallow Firestore-rule validation on two subcollections.**
