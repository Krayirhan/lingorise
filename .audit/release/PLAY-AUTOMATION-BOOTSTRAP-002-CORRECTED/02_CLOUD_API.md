# Cloud Project and API

## Authentication (resolved)

`studioskrayirhan@gmail.com` is now authenticated in this machine's `gcloud` (confirmed via `gcloud auth list`, shown as the active account). `taztamam.project@gmail.com` and `fusturan@gmail.com` remain present and untouched.

## Cloud project access

```
gcloud projects describe lingorise-65cb1 --account=studioskrayirhan@gmail.com
→ name: LingoRise, projectId: lingorise-65cb1, lifecycleState: ACTIVE
```

**CLOUD PROJECT ACCESS: VERIFIED.**

## Android Publisher API

```
gcloud services list --enabled --project=lingorise-65cb1 --account=studioskrayirhan@gmail.com --filter="config.name:androidpublisher.googleapis.com"
→ androidpublisher.googleapis.com  Google Play Android Developer API
```

**Android Publisher API: ENABLED.** (Enabled by the account owner as part of the Play Console/Cloud setup completed between runs — independently re-verified here via a read-only `gcloud services list` call, not merely trusted from the user's own report.)

No other API was enabled or inspected. No command targeted any project other than `lingorise-65cb1`, and none targeted `taztamam-500716` at any point.
