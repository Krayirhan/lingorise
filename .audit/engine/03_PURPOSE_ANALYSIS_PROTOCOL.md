# 03 — Purpose Analysis Protocol

The purpose document defines what "good" means for this specific product.

## Required sections

### Primary purpose
One concise statement answering:
> What user problem does this project exist to solve?

### Primary user promises
List outcomes the product implicitly or explicitly promises.
Examples:
- user input is not lost;
- calculations are correct;
- reminders fire reliably;
- notes are quickly retrievable;
- multiplayer state stays consistent;
- API authorization prevents cross-user access.

### Success conditions
Define observable product-level success conditions.

### Failure consequences
Classify realistic consequences of failure:
- inconvenience;
- data loss;
- privacy leak;
- financial loss;
- account compromise;
- legal/regulatory harm;
- availability impact.

### Non-goals
Explicitly record features/infrastructure that are outside the product's intended scope.
Non-goals protect the project against irrelevant audit penalties.

### Release context
Examples:
- portfolio demo;
- internal prototype;
- public beta;
- consumer app store release;
- paid SaaS production;
- regulated production.

## Purpose conflict rule
If README/marketing/code imply different purposes, document the conflict. Score against the most authoritative current intended product behavior, not dead/legacy documentation.

## Output
Create `02_PROJECT_PURPOSE.md` and update `state/CURRENT_PURPOSE.md` when appropriate.
