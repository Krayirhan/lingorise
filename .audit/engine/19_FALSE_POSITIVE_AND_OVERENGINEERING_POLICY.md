# 19 — False Positive and Overengineering Policy

## Purpose
Prevent audits from turning into architecture-fashion checklists.

## Do not create a finding merely because
- a class/file is long;
- a node is central in a graph;
- an interface is missing;
- DI is not used;
- repository/service/use-case layers are absent;
- microservices are absent;
- a popular library/tool is absent;
- code coverage is below an arbitrary universal percentage;
- a design pattern is not used;
- every function is not unit tested;
- logging/metrics are minimal in a low-risk local app.

## Create a finding when evidence connects structure to real cost/risk
Examples:
- a 900-line editor class has multiple independent responsibilities causing regression-prone changes;
- central service bypasses authorization boundaries;
- missing lifecycle persistence causes real user data loss;
- unbounded query causes demonstrated UI stalls;
- duplicate business logic produces inconsistent calculations;
- test gap leaves a high-impact rule unverifiable.

## Overengineering penalty
Unnecessary complexity can lower architecture/maintainability scores when it creates:
- cognitive load;
- fragile wiring;
- excessive change surface;
- duplication;
- hard-to-test indirection;
- unnecessary runtime/network/deployment risk.

## Recommendation threshold
A recommendation should be actionable and materially useful. Low-value theoretical ideas belong in P4 notes or should be omitted.

## Fairness test before deduction
Ask:
1. Is this requirement applicable to the product purpose?
2. Is there evidence of a weakness?
3. Does the weakness matter at this risk/release level?
4. Is the deduction proportionate?

If any answer is no, do not make a material deduction.
