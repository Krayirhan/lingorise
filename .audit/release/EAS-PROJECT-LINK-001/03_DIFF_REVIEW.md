# Diff Review

## Full diff (`git diff` in the clean worktree, before staging)

```diff
diff --git a/app.json b/app.json
index d1f60f1..a3322f0 100644
--- a/app.json
+++ b/app.json
@@ -19,6 +19,12 @@
       "expo-font",
       "expo-sharing",
       "expo-status-bar"
-    ]
+    ],
+    "extra": {
+      "eas": {
+        "projectId": "cb13fe89-238a-4a69-9b8e-a128808fc1c6"
+      }
+    },
+    "owner": "mfurkant"
   }
 }
```

## Files changed

`app.json` only — confirmed via `git status --short` (single `M app.json` line, nothing else).

## Classification

| Change | Classification | Verdict |
|---|---|---|
| `expo.extra.eas.projectId` added | Acceptable — EAS project linkage metadata required to connect LingoRise to the `mfurkant` project | ACCEPTED |
| `expo.owner` added (`"mfurkant"`) | Potentially acceptable — owner metadata directly required for stable EAS project resolution (pins the project to the intended account explicitly, preventing future ambiguity if the authenticated session ever has access to multiple accounts) | ACCEPTED |

## Explicitly confirmed NOT present in the diff

- No product source change (no file under `src/` touched)
- No learning/gamification/mastery logic change
- No Firebase logic change (`src/services/firebase.ts` untouched)
- No Firestore rules change (`firestore.rules` untouched)
- No translation/i18n change
- No test change (`tests/` untouched)
- No dependency change (`package.json`, `package-lock.json` untouched — confirmed via `git diff --stat`, only `app.json` listed)
- No native project regeneration (`android/` untouched)
- No workflow change (`.github/` untouched)
- No asset change (confirmed no asset file appears in `git status --short`, despite `eas init` reading the existing icon path)
- No privacy-policy content change (`public/` untouched)
- No unrelated formatting change (the diff is a pure 6-line addition, no reformatting of surrounding lines beyond the necessary trailing-comma insertion on the `]` that precedes the new keys)

**Diff scope: MINIMAL.** No unrelated files were touched by the official CLI tooling, so no revert of any newly-generated unrelated change was necessary.
