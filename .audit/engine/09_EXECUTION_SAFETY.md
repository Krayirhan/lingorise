# 09 — Execution Safety

## Read-only command preference
In non-FIX modes prefer commands that inspect, build, test, lint or scan without changing source.

## Avoid destructive operations
Never perform without explicit user authorization:
- deleting project files;
- resetting git history;
- force checkout/reset;
- database destructive migrations;
- production deploy;
- credential rotation;
- package upgrades;
- automatic mass-formatting;
- dependency rewrites.

## Generated output
Build/test artifacts may be generated when normal tooling requires them, but do not treat generated files as intentional source modifications.

## Network caution
Do not make external calls that could:
- send source code;
- send customer/user data;
- trigger production actions;
- incur cost;
- mutate cloud resources;
without explicit authorization.

## Test safety
Do not run destructive integration tests against production resources. Verify environment targeting first when risk exists.

## Scope control
Exclude typical irrelevant/generated areas unless specifically relevant:
- build outputs;
- node_modules/vendor binaries;
- generated code;
- caches;
- IDE metadata;
- large media/assets not relevant to audit claim.

## Time/coverage integrity
If full execution is not possible, report partial coverage. Never claim full audit execution from a partial scan.
