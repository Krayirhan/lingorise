# Account Boundary

## Decision (final, per user instruction)

LingoRise EAS owner: **mfurkant** — not asked again, not reconsidered.

## Authenticated session

`eas whoami` (in the clean `release/lingorise-rc1-eas-link` worktree, session persisted from the prior RC-001 login): `mfurkant` / `fusturan@gmail.com`.

## How the boundary was enforced

The only EAS command that could create/modify a project was invoked as:

```
eas init --account mfurkant --non-interactive
```

The `--account mfurkant` flag scopes the entire operation to the `mfurkant` namespace at the API level — there is no code path in this command that touches, lists, queries, or resolves anything under another account. No other EAS command was run in this session that takes an account/project argument.

