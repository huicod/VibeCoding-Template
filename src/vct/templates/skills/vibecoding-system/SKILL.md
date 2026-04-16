---
name: vibecoding-system
description: Use when you are in a skills-only environment and need to route a VibeCoding request to the right shared workflow under .vibe.
---

# VibeCoding System Router

You are the routing layer for the shared VibeCoding workflow set stored under `.vibe/` in skills-only targets such as Codex.

## First step

Read `.vibe/workflows/quickstart.md` before choosing a route unless the user already names a specific workflow.

## Primary routes

- `.vibe/workflows/genesis.md`: new project, architecture reset, or major version change
- `.vibe/workflows/blueprint.md`: turn architecture into executable tasks
- `.vibe/workflows/forge.md`: implement tasks from the active task list
- `.vibe/workflows/change.md`: adjust existing task definitions without opening a new genesis version
- `.vibe/workflows/plan.md`: lightweight implementation planning in an existing project
- `.vibe/workflows/tdd.md`: test-first implementation
- `.vibe/workflows/code-review.md`: review code for bugs, regressions, risks, and missing tests
- `.vibe/workflows/debug.md`: investigate broken behavior or hard-to-reproduce issues
- `.vibe/workflows/build-fix.md`: fix a broken build or failing CI signal
- `.vibe/workflows/deploy.md`: deployment and release flow
- `.vibe/workflows/status.md`: inspect current project state
- `.vibe/workflows/explore.md`: research or investigate before committing to a design
- `.vibe/workflows/scout.md`: inspect an existing codebase before structured work
- `.vibe/workflows/challenge.md`: pressure-test architecture or task choices
- `.vibe/workflows/design-system.md`: deepen the detailed design after genesis
- `.vibe/workflows/generate-prp.md`: generate an implementation blueprint
- `.vibe/workflows/execute-prp.md`: execute an existing blueprint
- `.vibe/workflows/craft.md`: create new workflows, prompts, or skills

## Rules

1. Start with `.vibe/workflows/quickstart.md` when the user is unsure where to begin.
2. Read the target shared workflow file before acting as that workflow.
3. If the request spans multiple phases, route to the earliest blocking phase first.
4. Treat `.vibe/` as the canonical shared workspace.
5. Treat platform directories such as `.codex/` only as compatibility entrypoints, not the canonical source of truth.
