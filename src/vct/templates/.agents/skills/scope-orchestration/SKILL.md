---
name: scope-orchestration
description: 多 scope / 多仓库并行 VibeCoding 的角色模型、协调原则与骨架模板。当用户提到多 agent 并行、微服务/多仓库协同、Orchestrator/Worker/Reviewer 分工，或要新增/拆分 scope 时读本文件。
---

# Scope Orchestration — Multi-Agent / Multi-Scope VibeCoding

> **核心立场**：VibeCoding 的默认形态是**单 scope 单 Chat**。多 scope 是当项目**自然演化**到需要多个逻辑独立代码根（多微服务、monorepo 中的多 package、前后端分离等）时，用**最少的额外概念**把单 scope 模式扩展到 N 个 scope 并发协作，不推翻单 scope 工作流。
>
> **所有控制面产物（workflows / skills / genesis）仍然共享一份。** 多 scope 只是在边界上加了"谁能写哪里"的物理约束 + 一份 registry + 一组角色化的 bootstrap workflow。

## 激活条件

| 场景 | `.vibe/coord/registry.yaml` | 启用文件 |
|------|-----------------------------|---------|
| 单 scope（默认） | 不存在或 `scopes:` 为空 | `TARGET_PROJECT: ./` + `/genesis` `/forge` 等常规 workflow |
| 多 scope | `scopes:` 至少登记 1 个条目 | 额外启用 `/worker` `/orchestrator` `/reviewer` `/coord-status` `/promote-scope` |

从单 scope 跨到多 scope 的唯一动作：运行 `/promote-scope <name>`（见 [.agents/workflows/promote-scope.md](../../workflows/promote-scope.md)）。

## 角色模型（四角色，按写入面正交）

| 角色 | 可写面 | 只读面 | 典型触发 |
|------|--------|--------|---------|
| **Worker** | 单个 scope 目录内一切（含 `<scope>/.vibe/`）+ umbrella `error_journal.md` append | 其他 scope、umbrella `.vibe/genesis/`、`.vibe/coord/`、`.agents/`、`AGENTS.md` | `/worker <scope> [task-id]` |
| **Orchestrator** | `.vibe/coord/**`、umbrella `AGENTS.md` 当前状态段、`06_CHANGELOG.md`、submodule 指针 commit（若启用） | 所有 scope 代码、各 scope `05_TASKS.md` 的勾选 | `/orchestrator` |
| **Reviewer** | PR 评论、可选 `<scope>/.vibe/artifacts/review_*.md` | 全工作区（只读） | `/reviewer [<scope>\|<pr-url>]` |
| **Advisor** | 无（纯读取 + 建议） | 全工作区 | 默认无角色 Chat、`/explore` `/scout` |

每个 Chat 在启动时先读 [AGENTS.md](../../../AGENTS.md) 的"🪪 角色自识别协议"段，按用户首条命令落座。

## 协调原则（核心：让 Git 做分布式协调）

本 skill 刻意**不引入会话级 lease / chat_id / heartbeat / 共享 state 文件**。所有运行时协调信号都从 Git + 文件系统读出：

| 要表达什么 | 载体 | 示例 |
|-----------|------|------|
| 某 Worker 正在做某 task | 远端 feature 分支存在 | `feat/S1.2.3-add-login` on `<scope>` remote |
| 任务完成度 | `<scope>/.vibe/05_TASKS.md` 的 `- [x]` 勾选 | `done=$(grep -c '^- \[x\]' ...)` |
| 审查是否通过 | PR 的 review status + merge state | `gh pr view --json reviews,mergeStateStatus` |
| scope 是否激活 | `registry.yaml` 的 `status: active` | Orchestrator 控制 |
| 跨 scope 依赖 | `dependencies.yaml`（可选） | Reviewer 据此检查 scope 边界越界 |

**好处**：

- 任何 Chat 都可以随时离开 / 中断 / 重启——状态都在 Git 里
- 任何时刻全局状态是**一致的**（Git 单点真相）
- 不需要心跳 / 超时清理 / 死会话回收
- Worker 并发冲突只在同 scope 同 task 才会发生 → push 被拒 → 让第二个 Worker 立刻感知

## 物理边界（Cursor 专属强化）

在 `.cursor/rules/` 下每个 scope 一份 `scope-<name>.mdc`（contract 类用 `contract-<name>.mdc`）。Cursor 会在 Worker 试图跨 scope 写入时直接阻止工具调用。非 Cursor 平台（Claude Code / Antigravity / Codex 等）只有**文字约束 + PR Reviewer 双重审查**；Worker 必须自觉遵守 workflow 中的写入面声明。

## 本 skill 打包的参考资源

`/promote-scope` 依赖以下模板（由 CLI 在 init / update 时自动铺到用户项目的同路径）：

| 模板文件 | 输出到 | 用途 |
|---------|--------|------|
| [references/AGENTS.service.template.md](./references/AGENTS.service.template.md) | `<scope>/.vibe/AGENTS.service.md` | 服务级锚点 |
| [references/05_TASKS.template.md](./references/05_TASKS.template.md) | `<scope>/.vibe/05_TASKS.md` | 服务级任务清单 |
| [references/artifacts-README.template.md](./references/artifacts-README.template.md) | `<scope>/.vibe/artifacts/README.md` | artifacts 目录说明 |
| [references/scope-service.mdc.template](./references/scope-service.mdc.template) | `.cursor/rules/scope-<name>.mdc` | Cursor 物理边界（service/frontend/backend/app/library 通用） |
| [references/scope-contract.mdc.template](./references/scope-contract.mdc.template) | `.cursor/rules/contract-<name>.mdc` | Cursor 契约只读边界 |
| [references/dependencies.template.yaml](./references/dependencies.template.yaml) | `.vibe/coord/dependencies.yaml`（按需） | 跨 scope 依赖声明模板 |
| [references/registry.template.yaml](./references/registry.template.yaml) | `.vibe/coord/registry.yaml`（首次激活） | 多 scope 激活的初始 registry |

模板中的占位符：

| 占位符 | 含义 |
|-------|------|
| `{{SCOPE_NAME}}` | scope 标识（小写 + 连字符） |
| `{{SCOPE_KIND}}` | `service` / `contract` / `frontend` / `backend` / `library` / `app` |
| `{{SCOPE_PATH}}` | 目录路径（相对 umbrella 根） |
| `{{SCOPE_LABEL}}` | 人类可读的中英文名（如 `"Core API Service"`） |
| `{{TASK_PREFIX}}` | 任务 ID 首字母大写前缀（如 `S` / `B` / `T`） |
| `{{DATE}}` | 填充时的 `YYYY-MM-DD` |
| `{{ARCH_VERSION}}` | 当前架构版本号（如 `v1`） |
| `{{SCOPE_SECTION}}` | 架构总览中的锚点章节号（如 `§SYS-03`） |

## 何时**不**要用本 skill

- 项目只有一个代码根，没有真正独立的子仓库/子包：用单 scope 默认流程即可
- 只是想把工作目录切换一下：用 cd 即可，不要为此 promote 一个 scope
- 团队协作里想给不同人分不同任务：用 PR + 评审就够了，不必 promote scope

换言之：scope 是**代码组织层面的强边界**（物理目录 + 独立 git + 独立 go.mod/package.json），不是任务拆分或团队划分的概念。

## 相关 workflows

- [.agents/workflows/worker-bootstrap.md](../../workflows/worker-bootstrap.md)
- [.agents/workflows/orchestrate.md](../../workflows/orchestrate.md)
- [.agents/workflows/reviewer-session.md](../../workflows/reviewer-session.md)
- [.agents/workflows/coord-status.md](../../workflows/coord-status.md)
- [.agents/workflows/promote-scope.md](../../workflows/promote-scope.md)
