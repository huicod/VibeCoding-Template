---
name: vibecoding-system
description: Use when you are in a skills-only environment and need to route a VibeCoding request to the right workflow reference.
---

# VibeCoding System Router

You are the routing layer for the VibeCoding workflow set in skills-only targets such as Codex.

## First step

Read `references/quickstart.md` before choosing a route unless the user already names a specific workflow.

## Primary routes

- `references/genesis.md`: new project, architecture reset, or major version change
- `references/blueprint.md`: turn architecture into executable tasks
- `references/forge.md`: implement tasks from the active task list
- `references/change.md`: adjust existing task definitions without opening a new genesis version
- `references/plan.md`: lightweight implementation planning in an existing project
- `references/tdd.md`: test-first implementation
- `references/code-review.md`: review code for bugs, regressions, risks, and missing tests
- `references/debug.md`: investigate broken behavior or hard-to-reproduce issues
- `references/build-fix.md`: fix a broken build or failing CI signal
- `references/deploy.md`: deployment and release flow
- `references/status.md`: inspect current project state
- `references/explore.md`: research or investigate before committing to a design
- `references/scout.md`: inspect an existing codebase before structured work
- `references/challenge.md`: pressure-test architecture or task choices
- `references/design-system.md`: deepen the detailed design after genesis
- `references/generate-prp.md`: generate an implementation blueprint
- `references/execute-prp.md`: execute an existing blueprint
- `references/craft.md`: create new workflows, prompts, or skills

## Rules

1. Start with `references/quickstart.md` when the user is unsure where to begin.
2. Read the target workflow reference before acting as that workflow.
3. If the request spans multiple phases, route to the earliest blocking phase first.
4. Keep project-specific records under `.antigravity/` separate from the canonical workflow and skill bundle.
