# design-taste

Vendored, project-scoped copy of [sboghossian/design-skill](https://github.com/sboghossian/design-skill) (MIT) for LingoRise. Installed here as `design-taste` (not `design`) to avoid colliding with Claude Code's built-in `design` skill (Claude Design canvas/Artifact creation).

Upstream frontmatter calls this "Use for any visual design or UI/UX task"; in this project its scope is narrowed (see [Role in this project](#role-in-this-project) below) to a taste/aesthetic reference only — not a general-purpose design-task trigger.

Synthesizes four lineages — *impeccable*, *ui-ux-pro-max*, *taste-skill*, *huashu-design* — and wires them to a browser verification loop. Loads reference files on demand, not all at once.

## Why this exists

Most AI-generated UI fails on a handful of reflex moves: Inter for everything, purple→blue gradients, identical 3-card grids, pure black on saturated color. This skill refuses those by default and forces a defensible direction before any markup is written.

## Role in this project

This copy is installed as a **reference skill only**. It is not the primary consumer-appeal scorer for LingoRise — that's [`consumer-design-audit`](../consumer-design-audit/SKILL.md). This skill is consulted for its expertise on:

- visual taste and aesthetic direction
- brand distinctiveness
- AI/generic-template anti-patterns (`reference/anti-slop.md`)

Some of its own workflow references (Playwright screenshots, web-specific tooling) don't apply to LingoRise's React Native app as-is; `consumer-design-audit` uses Maestro/emulator screenshots and Figma MCP for its own evidence instead, and only pulls the taste/anti-slop judgment from here.

## What's inside

- `SKILL.md` — the entry point. The six-step workflow (ground → direction → category check → build → verify → ship) and request patterns.
- `reference/anti-slop.md` — the full catalog of patterns to refuse.
- `reference/brand-protocol.md` — what to do when there's no brand spec.
- `reference/industry-rules.md` — category-aware defaults (legal ≠ wellness ≠ fintech).
- `reference/color.md` · `typography.md` · `space.md` · `motion.md` · `interaction.md` · `responsive.md` · `copy.md` — load on demand.
- `reference/audit.md` — three-issues-max critique format.
- `reference/checklist.md` — pre-delivery gate.

## Source

Vendored verbatim from `sboghossian/design-skill` (`main` branch) via GitHub API on 2026-08-28. No application code, dependencies, or global config were changed to install this.

## License

MIT (see `LICENSE`), original copyright Stephane Boghossian.
