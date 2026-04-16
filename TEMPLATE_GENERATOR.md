# Template Generator

This repository now contains a local generator for projecting the VibeCoding workflow bundle into multiple platform layouts.

This is a repository-level implementation note for the generator itself. It is not projected into generated projects, so it does not occupy `.vibe/docs/`, which remains available for real project architecture documents.

## Boundary

Canonical source files:

- `AGENTS.md`
- `.antigravity/workflows/`
- `.antigravity/skills/`

Generated projects now use a shared core directory named `.vibe/`.

That means:

- `.vibe/` stores the canonical shared workflows, skills, docs, examples, genesis, artifacts, scripts, and install metadata
- platform directories such as `.antigravity/`, `.cursor/`, `.claude/`, and `.codex/` only contain compatibility entrypoints

Project scaffolding is generated from dedicated template files under `src/vct/templates/scaffold/` so the repository's own project records do not leak into generated projects.

Examples of repository-specific files that are intentionally not projected into `.vibe/`:

- `.antigravity/docs/GUIDE.md`
- `.antigravity/artifacts/plan_template_review_fixes_20260408.md`
- live contents under `.antigravity/genesis/`

## Ownership model

- `.vibe/workflows/`, `.vibe/skills/`, `.vibe/scripts/`, `AGENTS.md`, and platform compatibility wrappers are generator-managed and may be refreshed by `update`
- `.vibe/docs/`, `.vibe/examples/`, `.vibe/genesis/`, and `.vibe/artifacts/` are bootstrap scaffolding for the real project and are preserved during `update`
- `.vibe/install-lock.json` records the installed targets, managed file ownership, bootstrap files, and latest update summary

## Commands

Generate a multi-platform template into an output directory:

```bash
node ./src/vct/bin/cli.js init ./out/demo --target antigravity,cursor,claude,codex
```

Refresh an existing generated project in place:

```bash
node ./src/vct/bin/cli.js update ./out/demo
```

Run the current test suite:

```bash
node --test --test-isolation=none ./src/vct/test
```

## Current projection rules

- shared core: workflows -> `.vibe/workflows`, skills -> `.vibe/skills`, docs/examples/genesis/artifacts/scripts/install-lock -> `.vibe/*`
- `antigravity`: wrapper workflows -> `.antigravity/workflows`, wrapper skills -> `.antigravity/skills`
- `windsurf`: wrapper workflows -> `.windsurf/workflows`, wrapper skills -> `.windsurf/skills`
- `cursor`: wrapper workflows -> `.cursor/commands`, wrapper skills -> `.cursor/skills`
- `claude`: wrapper workflows -> `.claude/commands`, wrapper skills -> `.claude/skills`
- `copilot`: wrapper workflows -> `.github/prompts`, wrapper skills -> `.github/skills`
- `codex`: router skill -> `.codex/skills/vibecoding-system/SKILL.md`, wrapper skills -> `.codex/skills/*/SKILL.md`
- `trae`: router skill -> `.trae/skills/vibecoding-system/SKILL.md`, wrapper skills -> `.trae/skills/*/SKILL.md`
- `qoder`: wrapper workflows -> `.qoder/commands`, wrapper skills -> `.qoder/skills`
- `kilo`: wrapper workflows -> `.kilocode/workflows`, wrapper skills -> `.kilocode/skills`
- `opencode`: wrapper workflows -> `.opencode/commands`, wrapper skills -> `.opencode/skills`

The generator also writes:

- `AGENTS.md`
- `.vscode/mcp.json` when present in the repository
- `.vibe/install-lock.json` metadata

## Update behavior

- `update` reads `.vibe/install-lock.json` first
- if install-lock is missing or drifts from the on-disk target layout, `update` falls back to directory scanning
- update is target-aware and records partial success instead of dropping the whole install state
- bootstrap project files under `.vibe/docs`, `.vibe/examples`, `.vibe/genesis`, and `.vibe/artifacts` are not overwritten during update
