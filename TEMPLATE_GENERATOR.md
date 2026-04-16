# Template Generator

This repository now contains a local generator for projecting the VibeCoding workflow bundle into multiple platform layouts.

This is a repository-level implementation note for the generator itself. It is not projected into generated projects, so it does not occupy `.vibe/docs/`, which remains available for real project architecture documents.

## Boundary

Canonical source files:

- `src/vct/templates/AGENTS.md`
- `src/vct/templates/.agents/workflows/`
- `src/vct/templates/.agents/skills/`
- `src/vct/templates/.agents/scripts/`
- `src/vct/templates/scaffold/.vibe/`

Generated projects now use two shared roots:

That means:

- `.agents/` stores canonical shared workflows, skills, and supporting scripts
- `.vibe/` stores project context, docs, examples, genesis, artifacts, and install metadata
- platform directories such as `.antigravity/`, `.cursor/`, `.claude/`, and `.codex/` only contain compatibility entrypoints

Project scaffolding is generated from dedicated template files under `src/vct/templates/scaffold/` so the repository's own project records do not leak into generated projects.

Examples of repository-specific files that are intentionally not projected into `.vibe/`:

- `.antigravity/docs/GUIDE.md`
- `.antigravity/artifacts/plan_template_review_fixes_20260408.md`
- live contents under `.antigravity/genesis/`

## Ownership model

- `.agents/workflows/`, `.agents/skills/`, `.agents/scripts/`, `AGENTS.md`, and platform compatibility wrappers are generator-managed and may be refreshed by `update`
- `.vibe/docs/`, `.vibe/examples/`, `.vibe/genesis/`, and `.vibe/artifacts/` are bootstrap scaffolding for the real project and are preserved during `update`
- `.vibe/install-lock.json` records the installed targets, managed file ownership, bootstrap files, and latest update summary

## Commands

Generate a multi-platform template into an output directory:

```bash
node ./src/vct/bin/cli.js init ./out/demo
```

Install the local CLI on your own machine without publishing to npm:

```bash
npm link
```

Then from another local workspace:

```bash
vct init .
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

- shared core: workflows -> `.agents/workflows`, skills -> `.agents/skills`, scripts -> `.agents/scripts`, docs/examples/genesis/artifacts/install-lock -> `.vibe/*`
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
- `.vscode/mcp.json` from `src/vct/templates/.vscode/mcp.json`
- `.vibe/install-lock.json` metadata

## Update behavior

- `update` reads `.vibe/install-lock.json` first
- if install-lock is missing or drifts from the on-disk target layout, `update` falls back to directory scanning
- update is target-aware and records partial success instead of dropping the whole install state
- bootstrap project files under `.vibe/docs`, `.vibe/examples`, `.vibe/genesis`, and `.vibe/artifacts` are not overwritten during update
- `update` refuses to operate on a foreign target layout when no managed `.vibe/` root is present

## Safety behavior

- `init` does not overwrite existing files unless `--force` is used
- `init` refuses to adopt a foreign root `AGENTS.md` or `.agents/` directory unless `--force` is used
- if a workspace already has foreign target roots such as `.antigravity/`, `.cursor/`, or `.github/` and there is no managed `.vibe/` root yet, `init` skips those targets instead of adopting them silently
- an existing root `AGENTS.md` is only reused automatically when the workspace already has a managed `.vibe/` root
