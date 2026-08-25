# 01 — Operation Modes

## DISCOVER
Purpose: understand the repository without scoring.

Must:
- inventory project structure and technologies;
- infer product type with evidence;
- identify uncertainties;
- produce/update project understanding only.

Must not:
- issue a quality score;
- create findings solely from generic best practices;
- modify product code.

## BASELINE
Purpose: create the first authoritative contextual audit.

Must:
- redo/validate discovery;
- define purpose and non-goals;
- establish risk profile;
- build applicability map and weighted rubric;
- lock rubric version;
- collect evidence;
- score applicable areas;
- register findings;
- generate prioritized actions;
- issue release verdict separately.

## PLAN
Purpose: convert validated findings into executable actions.

Must:
- preserve finding IDs;
- produce action IDs;
- define acceptance criteria and verification;
- prioritize stabilization before polish where appropriate.

## FIX
Purpose: implement only approved actions.

Input must include `APPROVED_ACTIONS`.
If absent, do not modify source.

Must:
- map each code change to an approved action;
- avoid unrelated cleanup;
- run action-specific verification;
- record changed files and verification evidence;
- never self-certify the whole project after a fix; use REAUDIT.

## REAUDIT
Purpose: measure progress fairly.

Must:
- use locked rubric version unless material change is documented;
- identify code/config changes since prior run;
- re-check impacted areas deeply;
- run mandatory global gates;
- verify claimed closed findings;
- identify new findings/regressions;
- produce delta report.

## CERTIFY
Purpose: decide readiness for the intended release target.

Must:
- validate release-target-specific gates;
- issue `GO`, `CONDITIONAL GO`, or `NO-GO`;
- list exact blockers/conditions;
- not equate score threshold alone with release readiness.
