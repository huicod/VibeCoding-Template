---
description: Worker 角色 bootstrap：绑定单个 scope、加载上下文、声明 git 所有权，然后委托给 /forge。
---

## Preflight: 角色 + Scope 解析与校验

你被声明为 **Worker**。在进入任何代码写入前，必须完成此 preflight。

命令形态：

```text
/worker <scope> [task-id]
```

> **多 scope 模式激活条件**：仅当 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 存在且 `scopes:` 至少注册了一个条目时，Worker 角色与本 workflow 才有意义。
>
> 单 scope 项目（默认）直接使用 [AGENTS.md](../../AGENTS.md) 的 `TARGET_PROJECT: ./` 模型和 `/forge` / `/tdd` / `/code-review` 等常规 workflow，无需 Worker/Orchestrator 分工，也无需读本文件。

### 1. 角色与 scope 合法性

1. 读 umbrella [AGENTS.md](../../AGENTS.md) 的"🪪 角色自识别协议"段，确认自己是 Worker 角色
2. 读 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml)：
   - 校验 `<scope>` 在 `scopes:` 列表中
   - 校验该条目 `kind` 属于 Worker 可绑定范围（通常为 `service` / `frontend` / `backend` / `library` / `app`；`kind: contract` 的 scope 禁止 Worker 直接绑定，契约改动走独立流程）
   - 校验该条目 `status: active`
   - 取 `path` 字段（相对 umbrella 根的目录）
3. 校验 `<scope>/` 目录存在并具备最小工程结构（语言特有的工程骨架，如 Go 项目的 `go.mod` + `cmd/` / `internal/`；前端项目的 `package.json` 等）
4. 向用户回显：已解析的 scope 路径、绑定的 task-id（若提供）

若任一校验失败 → 停止并要求用户修正，不得开工。

### 2. TARGET_PROJECT 的 scope 级覆盖

Worker 角色下，umbrella [AGENTS.md](../../AGENTS.md) 的 `TARGET_PROJECT: ./` 默认值被**覆盖**为 `./<scope>`。所有后续委托执行的 workflow（`/forge`、`/tdd`、`/code-review`、`/debug`、`/build-fix`）都把本 scope 目录当 TARGET_PROJECT。

### 3. 上下文加载（按顺序必读）

**A. Scope 级（可写面）**：

1. `<scope>/.vibe/AGENTS.service.md` — 本服务当前 Wave 状态
2. `<scope>/.vibe/05_TASKS.md` — 本服务任务清单（真相源）
3. `<scope>/.vibe/artifacts/error_journal.md`（若存在）— 本 scope 已沉淀的 Prevention Rules

**B. Umbrella 只读真相源**（强制），其中 `v{N}` 为当前架构版本（见 [AGENTS.md](../../AGENTS.md) 的"🎯 目标项目"段）：

4. [.vibe/genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md](../../.vibe/genesis/) — 定位本 scope 在全局拓扑中的角色与职责
5. [.vibe/genesis/v{N}/07_ARCHITECTURE_CHEATSHEET.md](../../.vibe/genesis/) — 架构速查
6. [.vibe/genesis/v{N}/08_CODING_STANDARDS.md](../../.vibe/genesis/) — 编码规范
7. [.vibe/genesis/v{N}/04_SYSTEM_DESIGN/<scope>.md](../../.vibe/genesis/)（若存在）— 本 scope 的 L0 设计；以及 `<scope>.detail.md` 的 L1 细节（若存在）
8. [.vibe/artifacts/error_journal.md](../../.vibe/artifacts/error_journal.md) — 与本 scope 类型相关的 Prevention Rules

**C. Umbrella 强烈推荐阅读（按需，不强制）**：

9. [.vibe/genesis/v{N}/01_PRD.md](../../.vibe/genesis/) — 产品需求，理解 scope 落地到业务的"为什么"
10. [.vibe/genesis/v{N}/03_ADR/**](../../.vibe/genesis/) — 所有架构决策记录；至少扫一遍标题，改到相关话题时回读
11. [.vibe/genesis/v{N}/06_CHANGELOG.md](../../.vibe/genesis/) — 历史版本沿革
12. [.vibe/genesis/v{N}/00_MANIFEST.md](../../.vibe/genesis/)（若存在）— genesis 文档清单导航
13. [.vibe/genesis/v{N}/04_SYSTEM_DESIGN/_research/](../../.vibe/genesis/)（若存在）— 各 scope 的前期调研/技术笔记
14. umbrella 历史 `05_TASKS*.md` — 若本 scope 的当前 `.vibe/05_TASKS.md` 在头部引用了 umbrella 历史 WBS，那些 umbrella 文件是**只读参考**（不是真相源），用于理解任务的原始 acceptance criteria

**D. 跨 scope 依赖**：

15. [.vibe/coord/dependencies.yaml](../../.vibe/coord/dependencies.yaml)（若存在）— 了解本 scope 依赖谁、被谁依赖
16. 被依赖对象的 `<other-scope>/.vibe/AGENTS.service.md` — 只读，了解其当前状态

**写入**仍严格限定在 Part A（scope 级），Part B/C/D 一律只读。

### 4. Git 所有权声明

```bash
cd <scope>
git fetch origin
```

**分支命名**：`feat/<task-id>-<slug>`
- `<task-id>`：完全沿用 `<scope>/.vibe/05_TASKS.md` 中给出的编号，不要自创新前缀
- `<slug>`：英文小写 + 连字符的任务主题简写

**所有权竞争**：

- **远端已存在同名分支** → 进入 **resume 模式**：`git checkout feat/<task-id>-<slug>`，续写；不要 push 占位 commit
- **远端无此分支** → 新建并推空占位声明所有权：
  ```bash
  git checkout -b feat/<task-id>-<slug>
  git commit --allow-empty -m "chore(<scope>): claim <task-id>"
  git push -u origin feat/<task-id>-<slug>
  ```
  若 push 被拒（他人已抢注） → 放弃本次声明，向用户报告冲突；用户可换 task-id 或让 Orchestrator 决定下一步

### 5. 写入面约束（硬底线）

- **可写**：`<scope>/**`（含 `<scope>/.vibe/`、`<scope>/.vibe/artifacts/`）
- **只读**：umbrella `.vibe/genesis/`、`.vibe/coord/`、`.agents/`、[AGENTS.md](../../AGENTS.md)、所有**其他** scope 的目录、`kind: contract` 的 scope
- **唯一允许向 umbrella 写入的例外**：`.vibe/artifacts/error_journal.md` 的 **append-only** 追加（每条带 `<!-- id: YYYYMMDD-<scope>-<short> -->` 注释）
- **绝不**：在 umbrella 根做 `git add` / `commit` / `push`；submodule 指针 bump 是 Orchestrator 的职责

物理约束由 `.cursor/rules/scope-<scope>.mdc`（或更严的 rule）在 Cursor 工具调用层强制执行。非 Cursor 平台（Claude Code / Antigravity / Codex 等）靠本 workflow 的文字约束 + PR Reviewer 检查双重守护。

### 6. 委托给 /forge

Bootstrap 全部完成、向用户确认类似 "已进入 `<scope>` 的 `feat/<task-id>-<slug>` 分支，准备按 T-RED/T-GREEN 循环推进 `<task-id>`" 的状态后，**委托给现有的 [.agents/workflows/forge.md](./forge.md) workflow**。

Forge 的 TDD 循环、Harness Quick Check、Prevention Rules 扫描等行为不变；仅当前工作目录从 umbrella 变成 `<scope>/`。

## 完工交付

每个 task 完成时：

- 独立 commit（message 含 Task ID）
- push 到 remote
- 若任务阶段性完结，用 `gh pr create` 开 PR 到 `<scope>` 子仓库的 `main`
- 在 `<scope>/.vibe/05_TASKS.md` 勾选对应任务（`- [ ]` → `- [x]`），与 commit 一一对应
- 若产生可沉淀的错误经验，优先写入 `<scope>/.vibe/artifacts/error_journal.md`；确认是跨 scope 普适规则时再 append 到 umbrella 的 error_journal.md

**不要**：
- bump umbrella submodule 指针 → Orchestrator 职责
- 修改 umbrella [AGENTS.md](../../AGENTS.md) 或 `.vibe/genesis/**` → Orchestrator 或 `/genesis` workflow 职责
- 修改其他 scope 的 `.vibe/05_TASKS.md` → 对应 scope 的 Worker 职责

## 恢复（Chat 中断后）

用户在新 Chat 发 `/worker <scope> <task-id>` 即可重启。本 workflow 的 Step 4 会自动检测到远端 feature 分支并进入 resume 模式。你原来勾选到哪、commit 到哪、PR 开没开，全部能从 git / 文件系统读出来。无需任何会话级状态。
