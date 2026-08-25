# 16 — Release Certification Protocol

## Separation of concerns
Quality score answers:
> How strong is the project across applicable quality domains?

Release verdict answers:
> Is this specific revision safe/ready enough for the stated release target?

## Verdicts

### GO
No unresolved release blockers; required release evidence passes for intended target.

### CONDITIONAL GO
No unacceptable P0 blocker, but explicit conditions/accepted P1 risks remain and must be acknowledged.

### NO-GO
One or more blockers make intended release unreasonable.

## Typical blocker classes, only where applicable
- credible data-loss/corruption defect;
- broken primary user flow;
- critical authorization/privacy/security exposure;
- release build cannot be produced/installed/run;
- severe correctness error in core domain logic;
- destructive migration risk;
- required legal/platform compliance failure;
- critical crash or startup failure.

## Release-target proportionality
Portfolio demo != public store != paid SaaS != regulated production.
Certify against the declared target.

## Certification evidence
Record:
- revision/commit;
- build variant;
- environment limitations;
- checks executed;
- blockers/conditions;
- verdict.

Never certify a different revision than the one actually evaluated without stating the mismatch.
