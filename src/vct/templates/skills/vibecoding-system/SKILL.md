---
name: vibecoding-system
description: Use when you are in a skills-only environment and need to route a VibeCoding request to the right shared workflow under .agents.
---

# VibeCoding System Router

You are the routing layer for the shared VibeCoding workflow set stored under `.agents/` in skills-only targets such as Codex.

## First step

Read `.agents/workflows/quickstart.md` before choosing a route unless the user already names a specific workflow.

## Primary routes

- `.agents/workflows/genesis.md`: new project, architecture reset, or major version change
- `.agents/workflows/blueprint.md`: turn architecture into executable tasks
- `.agents/workflows/forge.md`: implement tasks from the active task list
- `.agents/workflows/change.md`: adjust existing task definitions without opening a new genesis version
- `.agents/workflows/plan.md`: lightweight implementation planning in an existing project
- `.agents/workflows/tdd.md`: test-first implementation
- `.agents/workflows/code-review.md`: review code for bugs, regressions, risks, and missing tests
- `.agents/workflows/debug.md`: investigate broken behavior or hard-to-reproduce issues
- `.agents/workflows/build-fix.md`: fix a broken build or failing CI signal
- `.agents/workflows/deploy.md`: deployment and release flow
- `.agents/workflows/status.md`: inspect current project state
- `.agents/workflows/explore.md`: research or investigate before committing to a design
- `.agents/workflows/scout.md`: inspect an existing codebase before structured work
- `.agents/workflows/challenge.md`: pressure-test architecture or task choices
- `.agents/workflows/design-system.md`: deepen the detailed design after genesis
- `.agents/workflows/generate-prp.md`: generate an implementation blueprint
- `.agents/workflows/execute-prp.md`: execute an existing blueprint
- `.agents/workflows/craft.md`: create new workflows, prompts, or skills

## Rules

1. Start with `.agents/workflows/quickstart.md` when the user is unsure where to begin.
2. Read the target shared workflow file before acting as that workflow.
3. If the request spans multiple phases, route to the earliest blocking phase first.
4. Treat `.agents/` as the canonical workflow and skill source of truth.
5. Treat `.vibe/` as the canonical project context root for docs, examples, genesis, and artifacts.
6. Treat platform directories such as `.codex/` only as compatibility entrypoints, not the canonical source of truth.
