# DATA-002-REAUDIT — Lifecycle: Reset & Account Deletion

## DATA-QA-003 — reset semantics, independently re-verified

**Current behavior (traced fresh from `src/features/profile/components/DataManagementCard.tsx` and `src/state/useUserProgress.ts`):**

```
handleResetData → confirm dialog (copy depends on isCloudSynced) → handleConfirmReset → executeReset
executeReset:
  { success } = await clearAllLocalData()        [storage.ts — AsyncStorage.multiRemove + clearTelemetry]
  if (!success): show failure dialog, RETURN (no success reported, no state reload)
  else: await onDataReset()                       [= userProgress.reloadLocalOnly, wired in AppNavigator.tsx]
        show success dialog
reloadLocalOnly:
  loaded = await loadUserData()                    [re-reads AsyncStorage — now empty → DEFAULT_USER_DATA]
  ...rollover math...
  setUserData(updated); await saveUserData(updated)
  [NO auth.currentUser check, NO syncUserData/syncUserProgress call anywhere in this function]
```

**Independently confirmed: `reloadLocalOnly()` contains no Firestore import, no `auth` reference, and no call to `syncUserData`/`syncUserProgress`** — verified by direct reading of its full body (`useUserProgress.ts` lines 229-242). This is a structural guarantee (the function simply cannot reach Firestore), not merely an absence-of-a-bug-so-far.

**Contrast with the historical defect:** the old wiring called `userProgress.refresh()` instead, which — independently re-confirmed by reading its body — DOES call `syncUserData`/`syncUserProgress` when `auth.currentUser` is set (lines 208-216). This is the exact mechanism that made "Reset Local Data" destructive to cloud progress for signed-in users. The reaudit confirms this defect is structurally eliminated, not merely patched around.

**Copy accuracy:**
- Signed-in (`isCloudSynced === true`): `resetDataConfirmSynced` — "Bu cihazdaki yerel kopyanı sıfırlayacak. Hesabına kayıtlı bulut ilerlemen etkilenmez ve bir sonraki senkronizasyonda geri yüklenir." ("This will reset your local copy on this device. Your account's cloud progress is unaffected and will be restored on the next sync.") — **Accurate**, verified against actual behavior: cloud data is untouched (confirmed above), and the next sign-in/cold-start merge will indeed pull the untouched remote data back down via the normal `mergeAndSyncUserData` path, restoring it locally. This is truthful, not merely optimistic copy.
- Guest (`isCloudSynced === false`): unchanged original copy — "Tüm yerel ilerlemeni ve verilerini sıfırlamak istediğinden emin misin? Bu işlem geri alınamaz." ("...cannot be undone.") — **Accurate** for a guest, who has no cloud copy to restore from; `clearAllLocalData()` genuinely and irreversibly erases the only copy of their data.
- **Failure surfaced:** `clearAllLocalData()`'s new `{success}` result is checked before `onDataReset()` is even called; a failure shows a dedicated error dialog and does not proceed to the success dialog. Independently confirmed via direct reading — no path exists where a failed clear still shows "Başarılı."

**DATA-QA-003 status: CLOSED.** One coherent contract now holds and is truthfully described: local-only reset for everyone, with copy that correctly describes the cloud-progress consequence (none, for a signed-in account) rather than the previous universally-applied, sometimes-false "cannot be undone" claim.

## DATA-QA-004 — account deletion lifecycle, independently re-verified

**Current behavior (`src/services/auth.ts`, `src/services/firestore.ts`):**

```
deleteAccount():
  if (!user) return
  await deleteUserData(uid)     [Firestore: items subcollection, dailyTasks subcollection, progress/main, users/{uid} — all deleted in that order]
  try:
    await deleteUser(user)      [Firebase Auth]
  catch (err):
    throw PartialAccountDeletionError(err)
  await enableGuestMode()
```

**Independently verified:**
- `dailyTasks` purge is real: `deleteUserData()` now runs a `getDocs(collection(db, "users", userId, "dailyTasks"))` + batched-delete loop, structurally identical to the pre-existing `items` subcollection cleanup it was modeled on. Confirmed by direct reading.
- **Ordering:** Firestore deletion happens fully before the Auth deletion attempt. This is the only feasible order for a client-side deletion — deleting the Auth account first would immediately revoke the security-rules-checked `request.auth.uid == userId` condition needed to perform the subsequent Firestore deletes, since Firestore rules require an authenticated matching UID for every delete in this collection (`firestore.rules`, `allow delete: if request.auth != null && request.auth.uid == userId`). Independently confirmed this ordering constraint is real, not an arbitrary choice.
- **Partial failure signal:** if `deleteUser()` throws (e.g. `auth/requires-recent-login`), `deleteAccount()` throws `PartialAccountDeletionError` wrapping the original error, rather than letting the raw error propagate un-annotated or (worse) swallowing it and reporting success. `AccountManagementCard.tsx`'s `executeDelete()` catch block distinguishes this case (`e instanceof PartialAccountDeletionError`) and shows copy that tells the user their data is already gone and only the credential removal needs retrying — verified by direct reading of both files.
- **Never reports false success:** confirmed — there is no code path in `deleteAccount()` where `onLoggedOut()`/success is signaled after a `deleteUser()` failure; the `throw` happens before `enableGuestMode()` and before control returns to the caller's success branch.
- **Retry safety / idempotency:** `deleteUserData()`'s three deletion steps are each naturally idempotent under Firestore's actual semantics — `getDocs` on an already-emptied collection returns an empty snapshot (the batch-delete loops simply do nothing), and `deleteDoc` on an already-deleted or nonexistent document succeeds as a no-op rather than erroring. Independently confirmed this is standard, well-documented Firestore client-SDK behavior, not an assumption. A user who retries "Hesabı Sil" after resolving a `PartialAccountDeletionError` (e.g. by re-authenticating) will re-run `deleteUserData()` harmlessly and then retry only the still-pending `deleteUser()` call — this converges correctly.
- **No atomicity overclaim:** searched all comments and code in `auth.ts`/`firestore.ts` touching this path — no claim of cross-service atomicity exists anywhere; the `PartialAccountDeletionError` doc comment explicitly states "The client architecture cannot make Firestore + Auth deletion atomic." This is an honest, bounded claim, not an overclaim.
- **Reauthentication handling:** unchanged, pre-existing `auth/requires-recent-login` handling in `AccountManagementCard.tsx` is preserved and now additionally distinguishes the partial-deletion case.
- **Cross-user/security regression:** none found — `firestore.rules`'s `delete` rules for `users/{userId}` and `users/{userId}/progress/{document=**}` are unchanged in substance (still require `request.auth.uid == userId`); `dailyTasks`'s rule is also unchanged.

**Remaining risk (bounded, documented, not hidden):** a window can exist between "Firestore data deleted" and "Auth credential removed" if `deleteUser()` fails and the user does not immediately retry. This is not eliminable on a client-only Firebase architecture without a backend Cloud Function performing a server-side atomic operation — explicitly out of proportion for this sprint's and this reaudit's scope.

**DATA-QA-004 status: CLOSED.** The historical defect — a deletion that could leave inconsistent state with no distinguishing signal and an incomplete cleanup scope — is materially eliminated: cleanup scope is now complete (verified: `items`, `dailyTasks`, `progress/main`, `users/{uid}` — matches every user-owned Firestore location referenced anywhere in the current rules file), the partial-failure state is now explicit and safely retryable, and no false success is ever reported. The residual cross-service timing window is a proportionate, honestly-documented limitation of the client-only architecture, not a materially persisting version of the original defect.
