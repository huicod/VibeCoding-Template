# .vibe/coord/

本目录是 **多 scope 协同层**（Scope Orchestration），只有在项目拆分成 ≥2 个逻辑独立代码根（多微服务、monorepo 中的多 package、前后端分仓等）时才真正启用。

## 激活状态

- **单 scope 项目（默认）**：`registry.yaml` 的 `topology: single`、`scopes: []`。`AGENTS.md` 的 `TARGET_PROJECT: ./` 正常使用，`/genesis` `/forge` 等 workflow 一切照旧。
- **多 scope 项目**：运行 [.agents/workflows/promote-scope.md](../../.agents/workflows/promote-scope.md) 注册第一个 scope 后，`topology` 自动切为 `multi`，并启用：
  - [.agents/workflows/worker-bootstrap.md](../../.agents/workflows/worker-bootstrap.md) — `/worker <scope>` 入口
  - [.agents/workflows/orchestrate.md](../../.agents/workflows/orchestrate.md) — `/orchestrator` 入口
  - [.agents/workflows/reviewer-session.md](../../.agents/workflows/reviewer-session.md) — `/reviewer` 入口
  - [.agents/workflows/coord-status.md](../../.agents/workflows/coord-status.md) — `/coord-status` 只读聚合

## 文件清单

| 文件 | 谁写 | 谁读 |
|------|------|------|
| `registry.yaml` | Orchestrator（通过 `/promote-scope` / `/demote-scope`） | 所有角色在 bootstrap 时读取，校验 scope 合法性 |
| `dependencies.yaml`（可选） | Orchestrator | Worker / Reviewer / Orchestrator |

## 设计原则

**Git 做分布式协调**：本目录不保存会话级运行时状态（谁在干活、task lease、heartbeat 等）。所有运行时信号都从 Git 读：
- "谁在做这个 task" → 远端 feature 分支存在不存在
- "任务进度" → 各 scope `.vibe/05_TASKS.md` 的 `- [x]` 数量
- "审查通过没" → PR 的 review + merge state

这样任何 Chat 都可以随时中断 / 重启，不需要做死会话回收；全局状态永远一致。

## 相关 skill

详细的角色模型、模板清单、扩展方式见 [.agents/skills/scope-orchestration/SKILL.md](../../.agents/skills/scope-orchestration/SKILL.md)。
