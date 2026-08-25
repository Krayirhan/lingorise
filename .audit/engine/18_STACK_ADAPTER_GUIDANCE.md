# 18 — Stack Adapter Guidance

This is guidance, not a mandatory checklist. Select only concerns relevant to discovered architecture.

## Android / Kotlin / Compose
Possible concerns:
- core flow correctness;
- lifecycle/process death/state restoration;
- Room/data migration/integrity;
- coroutine/Flow cancellation and ownership;
- Compose state/recomposition correctness;
- navigation/back stack;
- permissions/exported components/intents;
- local data/backup/log exposure;
- accessibility/content descriptions/touch targets;
- build variants/signing only when release relevant;
- Android Lint / configured detekt/ktlint;
- unit/UI/instrumentation tests proportional to risk.

Do not require backend security for a backend-less offline app.

## Spring Boot / Backend
Possible concerns:
- domain correctness;
- API contracts;
- authn/authz;
- input validation;
- transaction boundaries;
- database migrations;
- concurrency/idempotency;
- error handling;
- secrets/config;
- observability where production warrants it;
- integration tests;
- dependency vulnerabilities.

## React / Next.js / Web
Possible concerns:
- rendering/data-fetch correctness;
- auth/session boundaries;
- server/client secret separation;
- XSS/CSRF/CORS applicability;
- accessibility;
- performance/core user paths;
- API/backend interaction;
- build/type/lint/test evidence.

## React Native / Expo
Combine mobile lifecycle/offline concerns with JS/TS build/type/runtime concerns. Inspect permission and secure storage needs proportionally.

## Unity / Game
Possible concerns:
- game loop/state machine correctness;
- save integrity;
- scene transitions;
- input handling;
- pooling/allocation/frame-time hotspots;
- mobile memory/battery where relevant;
- progression/economy correctness;
- crash resilience;
- build target stability;
- automated tests where practical.

Do not penalize game projects for lacking CRUD/SaaS architecture.

## ML / AI system
Possible concerns:
- task definition;
- dataset/evaluation validity;
- leakage;
- reproducibility;
- model/runtime integration;
- failure handling;
- prompt/model versioning where applicable;
- latency/cost;
- safety/privacy proportional to domain.

## Library / SDK
Possible concerns:
- API ergonomics/stability;
- compatibility;
- tests;
- versioning;
- documentation;
- dependency footprint;
- failure semantics.
