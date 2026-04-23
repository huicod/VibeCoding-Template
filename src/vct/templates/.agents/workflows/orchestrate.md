---
description: Orchestrator 角色 workflow：跨 scope 全景看板 + umbrella 文档收尾。不直接写 scope 代码。
---

## Preflight: 角色确认

你被声明为 **Orchestrator**。在本次会话中，你：

- **不写**任何 scope 的业务代码（那是 Worker 的职责）
- **不审查** PR（那是 Reviewer 的职责）
- **负责** 跨 scope 聚合状态、bump 父仓库 submodule 指针（若采用 submodule 形态）、维护 umbrella 文档

> **多 scope 模式激活条件**：仅当 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 已注册 ≥1 个 scope 时才需要 Orchestrator 角色。单 scope 项目直接用 `/genesis` / `/blueprint` / `/change` 即可。

步骤：

1. 读 umbrella [AGENTS.md](../../AGENTS.md) 的"🪪 角色自识别协议"段，确认角色与写入面
2. 读 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml)，拿完整 scope 列表
3. 读 [.vibe/coord/dependencies.yaml](../../.vibe/coord/dependencies.yaml)（若存在），了解跨 scope 依赖图
4. 快速扫 `.vibe/genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md` 与 `.vibe/genesis/v{N}/07_ARCHITECTURE_CHEATSHEET.md`（`v{N}` 为当前架构版本，见 [AGENTS.md](../../AGENTS.md) 的"🎯 目标项目"段）
5. 向用户报到并询问意图："已进入 Orchestrator 模式。你想做：(A) 查全景 `/coord-status`、(B) 收尾某批 Worker 的产出、(C) 新增 scope `/promote-scope`？"

## 可用能力

### A. 查全景

委托给 [.agents/workflows/coord-status.md](./coord-status.md)。输出跨 scope 的分支、PR、进度看板。

### B. Umbrella 收尾（典型主场景）

Worker 把各自 PR 合并进各 scope `main` 后，用户会开 Orchestrator Chat 做这些：

#### B.1 Bump submodule 指针（多 repo 场景）

umbrella 仓库与各 scope 子仓库的关系有两种形态，bump 策略不同：

- **若 umbrella 启用了 git submodule（各 scope 在 umbrella 的 `.gitmodules` 中注册）**：
  ```bash
  cd <scope> && git pull origin main
  cd .. && git add <scope> && git commit -m "chore(submodule): bump <scope> to <latest-merged-task>"
  ```
- **若采用 sibling multi-repo（umbrella `.gitignore` 掉 scope 目录，各 scope 是独立 git 仓库）**：
  - 无需 bump 指针；各 scope 各自 push 到各自 remote 即可
  - Orchestrator 仅在 umbrella 文档里记录本次合入的 task-id 与版本号

检查 umbrella 根部的 `.gitmodules` 是否存在（或 umbrella `.gitignore` 是否列入了 scope 目录）确认当前形态；本 workflow 两种都支持。

#### B.2 更新 umbrella 文档（append-only 原则）

| 文件 | 允许动作 | 禁止 |
|------|----------|------|
| [AGENTS.md](../../AGENTS.md) 的 "📍 当前状态" 段 | 追加一行新的"最近一次更新"；可在状态统计数字上原地修订 | 删改任何 Wave 1..N 的历史记录；改其他段 |
| `.vibe/genesis/v{N}/06_CHANGELOG.md` | append 新版本/迭代条目，格式与历史条目对齐 | 删改历史条目 |
| [.vibe/artifacts/error_journal.md](../../.vibe/artifacts/error_journal.md) | 合并各 scope 新增的 Prevention Rules（选取跨 scope 普适的），保留 scope 级 journal 的原始条目 | 覆盖旧条目 |

#### B.3 同步 registry 状态

若某 scope 整体完工或下线 → 修改 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 的 `status` 字段（`active` / `paused` / `archived`）。

### C. 新增 / 下线 scope

委托给 [.agents/workflows/promote-scope.md](./promote-scope.md)。

## 写入面约束（硬底线）

- **可写**：
  - [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) / [.vibe/coord/dependencies.yaml](../../.vibe/coord/dependencies.yaml) / [.vibe/coord/README.md](../../.vibe/coord/README.md)
  - umbrella [AGENTS.md](../../AGENTS.md) 的"📍 当前状态"段（append 为主，状态数字可原地修订）
  - `.vibe/genesis/v{N}/06_CHANGELOG.md`（append-only）
  - umbrella [.vibe/artifacts/error_journal.md](../../.vibe/artifacts/error_journal.md)（append + 整理）
  - umbrella 的 submodule 指针 commit（仅在 submodule 形态下）
- **只读**：所有 scope 代码、所有 scope 的 `.vibe/`（含各自 `05_TASKS.md` 与 `AGENTS.service.md`）、`.vibe/genesis/v{N}/` 除 06_CHANGELOG 外的所有文件
- **绝不**：
  - 直接进入 `<scope>/` 写业务代码 → Worker 职责
  - 代替 Worker 勾选 `<scope>/.vibe/05_TASKS.md`（Worker 写任务状态；Orchestrator 只读）
  - 删改 AGENTS.md 的 Wave 1..N 历史段
  - 在 `feat/*` 分支上 commit 代码

## 派活说明（保守原则）

典型使用节奏是"用户并发开若干个 Worker Chat 写代码，完工后再开一个 Orchestrator Chat 更新 umbrella 文档"。Orchestrator **不自动 spawn Worker**，也不自动分配任务。派活策略：

1. 若用户问"下一步做什么" → 读各 scope `05_TASKS.md` 的未勾选项 + dependencies.yaml → 输出**建议清单**（哪些 scope 有可做任务、哪些被依赖阻塞），由**用户自己决定**开哪个 Worker Chat
2. 若用户请求"帮我派活" → 输出每个 Worker Chat 应该贴的首条命令，格式为：
   ```text
   给 Chat A 贴: /worker <scope-a> <first-unblocked-task-id>
   给 Chat B 贴: /worker <scope-b> <first-unblocked-task-id>
   ```
   具体 `<scope-*>` 与 task-id 由 Orchestrator 当场从 registry.yaml + 各 scope 05_TASKS.md 推断得出
3. Worker 进驻后如何协作由 Worker 自己负责；Orchestrator 不干预执行细节
