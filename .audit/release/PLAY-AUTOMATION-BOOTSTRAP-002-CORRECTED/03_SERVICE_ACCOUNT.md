# Service Account

## Existence (verified, not assumed)

```
gcloud iam service-accounts describe lingorise-play-submit@lingorise-65cb1.iam.gserviceaccount.com --project=lingorise-65cb1 --account=studioskrayirhan@gmail.com
→ displayName: LingoRise Play Submit
  email: lingorise-play-submit@lingorise-65cb1.iam.gserviceaccount.com
  projectId: lingorise-65cb1
```

**Independently confirmed to exist in `lingorise-65cb1`**, under `studioskrayirhan@gmail.com`. Not created by this run's own command — already present between resume points (created either by the account owner directly or by an earlier part of this session; either way, its identity and project were independently re-verified here, not merely trusted).

## Key

**Created (once), stored securely.**

```
gcloud iam service-accounts keys create D:/lingorise-secure/google-play-service-account.json \
  --iam-account=lingorise-play-submit@lingorise-65cb1.iam.gserviceaccount.com \
  --project=lingorise-65cb1 --account=studioskrayirhan@gmail.com
→ created key [1c2701db77b0cb6d77f6b26ea6f53ee321d43689]
```

Only ONE key was created (key ID `1c2701db77b0cb6d77f6b26ea6f53ee321d43689`) — no duplicate key was generated when this run was resumed; the existing file was detected and reused.

**Path:** `D:/lingorise-secure/google-play-service-account.json` — outside every Git repository and every worktree.

## Secret safety (independently verified)

- `git -C D:/lingorise-secure rev-parse --is-inside-work-tree` → `fatal: not a git repository` — confirmed NOT inside any git repo.
- `git -C D:/LingoRise ls-files | grep -i "service-account"` → no output — confirmed not tracked in the LingoRise repository.
- File contents (`private_key`, `private_key_id`, etc.) were never printed to chat or written into any `.audit` Markdown file — only the service account email, project ID, and key-creation confirmation (not the key ID's cryptographic material) are recorded here.

**CREDENTIAL IN GIT: NO.**
