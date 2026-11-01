# EAS Project Identity

## Absolute project boundary

Every EAS command in this run targeted `@mfurkant/lingorise` (project ID `cb13fe89-238a-4a69-9b8e-a128808fc1c6`) exclusively, either implicitly (commands run inside the project's own linked worktree, which resolves the project from the committed `app.json`) or explicitly (`env:set`/`env:list` operating on the project scope resolved from that same linkage).

## Authentication

`eas whoami` (session persisted from prior runs, re-verified fresh in the new worktree): `mfurkant` / `fusturan@gmail.com`. No token, password, or cookie was printed or handled in chat.

## Linkage verification (from the new exact SHA)

`eas project:info` (run inside `D:/lingorise-rc1-build-v2`, exact SHA `b8d0687...`):

```
fullName  @mfurkant/lingorise
ID        cb13fe89-238a-4a69-9b8e-a128808fc1c6
```

| Field | Expected | Actual | Match |
|---|---|---|---|
| EAS owner | `mfurkant` | `mfurkant` | YES |
| EAS project | `lingorise` | `lingorise` | YES |
| EAS project ID | `cb13fe89-238a-4a69-9b8e-a128808fc1c6` | `cb13fe89-238a-4a69-9b8e-a128808fc1c6` | YES |
| Android package | `com.lingorise.app` | `com.lingorise.app` (from `app.json`, confirmed unchanged from the linkage commit) | YES |

No mismatch found. No relinking was necessary or performed.
