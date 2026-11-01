# Account Map

| Role | Account | Resource |
|---|---|---|
| Firebase / Google Cloud owner | `studioskrayirhan@gmail.com` | `lingorise-65cb1` |
| Google Play Console owner | `studioskrayirhan@gmail.com` | LingoRise / `com.lingorise.app` |
| Expo / EAS account | `fusturan@gmail.com` | `mfurkant` / `@mfurkant/lingorise` (ID `cb13fe89-238a-4a69-9b8e-a128808fc1c6`) |

This cross-account architecture (Google identity separate from Expo/EAS identity) is confirmed intentional per this task's own explicit instruction — no attempt was made to unify, migrate, or transfer any of these identities.

## Absolute forbidden boundary

`taztamam.project@gmail.com` / `taztamam-500716`: confirmed as the machine's currently *active* `gcloud` account (unrelated to this task) — **never used, never targeted, never modified**. See `02_CLOUD_API.md` for how this was avoided.

**taztamam interaction: NONE.**
