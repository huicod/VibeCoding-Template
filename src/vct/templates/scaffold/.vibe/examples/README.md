# .vibe/examples

Store reusable code patterns here after project init. Good examples noticeably
improve implementation quality.

The generator ships this folder as a placeholder on purpose, so template-repo
examples do not leak into every generated project.

## How to ask AI to use it

```text
请参考 @.vibe/examples/ 中的代码模式实现类似功能。
不要直接复制，先理解模式，再按当前需求实现。
```

## Good example categories

| Type | Example | Why it helps |
| --- | --- | --- |
| project layout | `.vibe/examples/service-layout/` | shows how the repo is organized |
| API definition | `.vibe/examples/todo.proto` | shows naming and contract style |
| business logic | `.vibe/examples/biz/greeter.go` | shows service-layer conventions |
| data access | `.vibe/examples/data/greeter.go` | shows repository / DAO patterns |
| test pattern | `.vibe/examples/biz/greeter_test.go` | shows table-driven tests |
| error handling | `.vibe/examples/errors/errors.go` | shows error model and translation |
| dependency wiring | `.vibe/examples/wire/wire.go` | shows DI / bootstrap structure |

## Principles

- Treat examples as pattern references, not copy-paste sources.
- Keep each example focused and concise.
- Mark the key idea with `// PATTERN:` and constraints with `// CRITICAL:`.
- Prefer examples that match the real stack, framework, and directory layout of
  the project.
