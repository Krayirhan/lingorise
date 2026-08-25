# 02 — Project Discovery Protocol

No scoring is permitted until project discovery is sufficiently complete.

## Discover the following

### Product identity
- repository/project name;
- apparent user-facing product;
- product type (mobile app, backend, SaaS, library, game, CLI, desktop, etc.);
- primary user/persona when inferable;
- intended release target.

### Technical topology
- languages;
- frameworks;
- build systems;
- modules/packages;
- local storage;
- remote storage;
- backend/API;
- authentication;
- network use;
- background jobs;
- third-party SDKs;
- analytics/crash reporting;
- testing stack;
- CI/CD if present.

### Runtime/data topology
Identify:
- where data originates;
- where data is persisted;
- synchronization boundaries;
- trust boundaries;
- destructive operations;
- user-critical state;
- external services;
- concurrency points;
- offline behavior.

### Repository health facts
Record, without scoring yet:
- buildable/not verified;
- tests present/absent;
- lint/static tooling present/absent;
- dependency manifests;
- documentation relevant to purpose;
- obvious generated/vendor directories to exclude.

## Discovery confidence
For each major conclusion use:
- `CONFIRMED`
- `STRONGLY_INFERRED`
- `INFERRED`
- `UNKNOWN`

## Output contract
Create `01_PROJECT_UNDERSTANDING.md` containing:
- executive description;
- architecture summary;
- data flow summary;
- project classification;
- known constraints;
- uncertainties/questions that affect audit applicability.

Do not ask the user a question if repository evidence can answer it. If uncertainty remains, choose the least punitive reasonable interpretation and label it.
