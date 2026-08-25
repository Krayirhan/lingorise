# 07 — Tool Discovery and Graph Analysis

## Principle
Tool availability is evidence capability, not product quality.
A missing optional audit tool must not directly reduce product score.

## Phase A — Detect existing tooling
Inspect repository manifests/configuration and local environment for relevant tools without installing or mutating dependencies by default.

Classify each tool/capability:
- `AVAILABLE_CONFIGURED`
- `AVAILABLE_UNCONFIGURED`
- `PROJECT_CONFIG_PRESENT_TOOL_UNAVAILABLE`
- `UNAVAILABLE`
- `N/A`

## Phase B — Select only useful tools
Examples by concern:

### Build/test
- project-native build system;
- unit/integration/UI test runners.

### Static quality
- platform-native lint;
- language linters/static analyzers already configured.

### Dependency/security
- dependency vulnerability scanners where applicable;
- secret scanners only in redacted/safe mode.

### Architecture graph
Use Graphify or an equivalent AST/dependency/call graph tool if safely available and useful.

Graph analysis can investigate:
- high fan-in/fan-out nodes;
- god-node candidates;
- unexpected cross-module dependencies;
- boundary violations;
- cycles;
- change blast radius;
- dependency communities/clusters;
- critical paths.

## Graph interpretation safety
Graph metrics are signals, not findings by themselves.

Do NOT say:
> High fan-out = bad architecture.

Instead:
> Node X has unusually high fan-out. Source inspection shows it crosses UI/domain/data boundaries and changes frequently; this supports ARCH-004.

A legitimate central composition root/navigation/router may have high connectivity without being a defect.

## Existing graph freshness
If graph artifacts exist, determine whether they match the current revision. Mark stale graph evidence as stale and regenerate only if safe and practical.

## No forced installation
Do not modify project dependencies merely to install an audit tool during read-only modes. If a useful tool is unavailable:
- record the gap;
- use alternative evidence where possible;
- recommend optional tooling only if future value is material.

## Output
Create `05_TOOL_AND_GRAPH_ANALYSIS.md` containing:
- discovered tools;
- executed tools;
- skipped tools + reason;
- graph observations validated against source;
- tool limitations.
