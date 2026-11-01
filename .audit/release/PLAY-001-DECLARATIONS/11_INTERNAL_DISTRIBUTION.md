# Internal Distribution

## Release verification (Android Publisher API, fresh this run)

```
GET /androidpublisher/v3/applications/com.lingorise.app/edits/{editId}/tracks/internal
→ 200
{
  "track": "internal",
  "releases": [ { "name": "0.1.0", "versionCodes": ["2"], "status": "completed" } ]
}
```

**Package `com.lingorise.app`, track `internal`, versionCode `2`, status `completed` — independently reconfirmed directly from Google's own API**, consistent with `PLAY-AUTOMATION-BOOTSTRAP-002-CORRECTED`'s own submission record.

## Tester list

```
GET /androidpublisher/v3/applications/com.lingorise.app/edits/{editId}/testers/internal
→ 200 {}
```

**Empty response — no tester emails or Google Groups are currently configured for the internal track.** This was independently checked via the API, not assumed.

## Classification

**Internal testers: OWNER ACTION REQUIRED.** No tester email addresses or Google Group were invented or guessed. To make the release actually installable by anyone, the owner must add at least one tester email (or a Google Group) via Play Console → Testing → Internal testing → Testers, or provide the email(s)/group here and this run can add them via the Android Publisher API (`edits.testers.update`) without further owner UI interaction.

## Internal opt-in URL

Not retrievable via the Android Publisher API (Play does not expose the tester opt-in URL through this API — it is only shown in the Play Console UI after a tester list exists). **NOT VERIFIED** — becomes checkable once a tester list exists.
