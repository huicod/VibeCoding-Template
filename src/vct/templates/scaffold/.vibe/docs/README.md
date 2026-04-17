# .vibe/docs

Place your project's original design inputs here. AI should read this folder before
workflows such as `/genesis`, and also before `/plan` when the plan depends on
project requirements or architecture decisions.

This folder is for project-specific design material, not template-maintainer notes.

## What to put here

| Type | Example |
| --- | --- |
| architecture design | `architecture-overview.pdf` |
| API specification | `api-spec.md` |
| database / ER diagram | `er-diagram.png` |
| product requirements | `requirements.md` |
| reference material | `framework-notes.md` |

## How to ask AI to use it

```text
请先阅读 .vibe/docs/ 下的设计文档，再基于它运行 /genesis。
```

## Guidelines

- Prefer original source documents over second-hand summaries.
- Keep filenames stable so later `/genesis` reruns can compare changes.
- When requirements or architecture change, update this folder before asking AI
  to refresh genesis.
