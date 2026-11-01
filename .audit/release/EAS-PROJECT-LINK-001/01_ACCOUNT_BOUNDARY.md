# Account Boundary

## Decision (final, per user instruction)

LingoRise EAS owner: **mfurkant** — not asked again, not reconsidered.

## Authenticated session

`eas whoami` (in the clean `release/lingorise-rc1-eas-link` worktree, session persisted from the prior RC-001 login): `mfurkant` / `fusturan@gmail.com`. Two accounts visible in the session (`mfurkant`, `taztamam`, both Owner role) — this is simply what the authenticated user's account list contains; it does not imply either account was queried or acted on.

## How the boundary was enforced

The only EAS command that could create/modify a project was invoked as:

```
eas init --account mfurkant --non-interactive
```

The `--account mfurkant` flag scopes the entire operation to the `mfurkant` namespace at the API level — there is no code path in this command that touches, lists, queries, or resolves anything under `taztamam`. No other EAS command was run in this session that takes an account/project argument.

## TAZTAMAM INTERACTION: NONE

No command in this run referenced, queried, listed, inspected, modified, or otherwise touched any `taztamam` resource. This was ensured by construction (every command scoped to `mfurkant` explicitly), not verified after the fact by probing `taztamam` — per the task's own instruction not to perform extra queries merely to prove non-interference.
