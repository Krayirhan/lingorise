---
name: context7-mcp
description: Use only for version-sensitive library/framework API questions, suspected deprecated APIs, current package setup/configuration, or when the user explicitly asks for current/latest docs. Do not use for local code reasoning, refactoring, symbol search, or architecture analysis.
---

Use Context7 to fetch current documentation instead of relying on training data — but only when one of the triggers below applies.

## When to Use This Skill

Activate this skill only when the user:

- Asks about a version-sensitive library/framework API (behavior that differs across versions)
- Raises a suspected deprecated API ("is this still the right way to do X?")
- Needs current package setup/configuration steps
- Explicitly asks for current/latest documentation

Do NOT activate for normal local code reasoning, refactoring, symbol search, or architecture analysis — those don't need external docs.

## How to Fetch Documentation

### Step 1: Resolve the Library ID

Call `resolve-library-id` with:

- `libraryName`: The library name extracted from the user's question
- `query`: What to look up in the library's documentation (improves relevance ranking)

### Step 2: Select the Best Match

From the resolution results, choose based on:

- Exact or closest name match to what the user asked for
- Higher benchmark scores indicate better documentation quality
- If the user mentioned a version (e.g., "React 19"), prefer version-specific IDs

### Step 3: Fetch the Documentation

Call `query-docs` with:

- `libraryId`: The selected Context7 library ID (e.g., `/vercel/next.js`)
- `query`: What to look up in the library's documentation, scoped to a single concept

If the user's question spans multiple distinct concepts (e.g. routing and auth and caching), make a separate `query-docs` call per concept with the same library ID, unless the question is about how the concepts interact — combined queries dilute ranking and return shallow results for each topic.

### Step 4: Use the Documentation

Incorporate the fetched documentation into your response:

- Answer the user's question using current, accurate information
- Include relevant code examples from the docs
- Cite the library version when relevant

## Guidelines

- **Be specific**: Describe what to look up in the library's documentation, but keep each query to a single concept
- **One topic per query**: Split multi-topic questions into separate `query-docs` calls — resolve the library ID once, then query per concept, unless the question is about how the concepts interact
- **Version awareness**: When users mention versions ("Next.js 15", "React 19"), use version-specific library IDs if available from the resolution step
- **Prefer official sources**: When multiple matches exist, prefer official/primary packages over community forks
