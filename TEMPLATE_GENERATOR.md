# Template Generator

This repository now contains a local generator for projecting the VibeCoding workflow bundle into multiple platform layouts.

## Boundary

Canonical source files:

- `AGENTS.md`
- `.antigravity/workflows/`
- `.antigravity/skills/`

Project scaffolding is generated from dedicated template files under `src/vct/templates/scaffold/` so the repository's own project records do not leak into generated projects.

Examples of repository-specific files that are intentionally not projected:

- `.antigravity/docs/GUIDE.md`
- `.antigravity/artifacts/plan_template_review_fixes_20260408.md`
- live contents under `.antigravity/genesis/`

## Commands

Generate a multi-platform template into an output directory:

```bash
node ./src/vct/bin/cli.js init ./out/demo --target antigravity,cursor,claude,codex
```

Run the current test suite:

```bash
node --test --test-isolation=none ./src/vct/test/init.test.js
```

## Current projection rules

- `antigravity`: workflows -> `.antigravity/workflows`, skills -> `.antigravity/skills`
- `cursor`: workflows -> `.cursor/commands`, skills -> `.cursor/skills`
- `claude`: workflows -> `.claude/commands`, skills -> `.claude/skills`
- `codex`: workflows -> `.codex/skills/vibecoding-system/references`, plus router skill at `.codex/skills/vibecoding-system/SKILL.md`

The generator also writes:

- `AGENTS.md`
- `.vscode/mcp.json` when present in the repository
- generic `.antigravity/docs`, `.antigravity/examples`, `.antigravity/genesis`, and `.antigravity/artifacts` scaffolding
- `.vct/install-lock.json` metadata
