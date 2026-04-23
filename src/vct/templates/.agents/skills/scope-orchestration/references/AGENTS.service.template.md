# AGENTS.service.md — {{SCOPE_NAME}} ({{SCOPE_LABEL}})

> 本文件是 `{{SCOPE_NAME}}` scope 的 Worker 锚点。Worker Chat bootstrap 必读本文件；umbrella 根 [AGENTS.md](../../AGENTS.md) 的"当前状态"段**不再**为本 scope 记账，服务级 Wave 状态由本文件维护。

## 服务档案

- **ID**: `{{SCOPE_NAME}}`
- **类型**: `{{SCOPE_KIND}}`
- **职责**: _（首次进驻的 Worker 填写：这个 scope 负责什么业务；应与 umbrella 架构总览对齐）_
- **对外协议**: _（如 HTTP/JSON、gRPC、CLI、静态资源等）_
- **源码根目录**: `{{SCOPE_PATH}}/`
- **依赖**: _（列出运行时依赖：其他 scope、基础设施、第三方服务）_
- **契约依赖**: _（若有 kind: contract 的 scope，列在此处并标明"只读"）_
- **详见**: umbrella [.vibe/genesis/{{ARCH_VERSION}}/02_ARCHITECTURE_OVERVIEW.md](../../.vibe/genesis/{{ARCH_VERSION}}/02_ARCHITECTURE_OVERVIEW.md) {{SCOPE_SECTION}}

## 📍 当前 Wave 状态

- **最近一次更新**: `{{DATE}}`（由 /promote-scope 生成骨架；尚未进入 `/forge`）
- **当前 Wave**: `W0 — 未开工`
- **活跃任务**: 无
- **活跃分支**: 无
- **已完成 Wave 历史**: 无

### Wave 记录约定

每完成一个 Wave，Worker 在此追加一段 `### 🌊 Wave N — <title>` 小节，格式与 umbrella `AGENTS.md` 历史 Wave 记录对齐；不覆盖历史。

## 必读上下文（Worker bootstrap 加载顺序）

### 强制

1. 本文件（当前 Wave 状态）
2. [.vibe/05_TASKS.md](./05_TASKS.md)（本服务任务清单）
3. umbrella [.vibe/genesis/{{ARCH_VERSION}}/02_ARCHITECTURE_OVERVIEW.md](../../.vibe/genesis/{{ARCH_VERSION}}/02_ARCHITECTURE_OVERVIEW.md) {{SCOPE_SECTION}}
4. umbrella [.vibe/genesis/{{ARCH_VERSION}}/07_ARCHITECTURE_CHEATSHEET.md](../../.vibe/genesis/{{ARCH_VERSION}}/07_ARCHITECTURE_CHEATSHEET.md)
5. umbrella [.vibe/genesis/{{ARCH_VERSION}}/08_CODING_STANDARDS.md](../../.vibe/genesis/{{ARCH_VERSION}}/08_CODING_STANDARDS.md)
6. umbrella [.vibe/artifacts/error_journal.md](../../.vibe/artifacts/error_journal.md) 中与本 scope 类型相关的 Prevention Rules

### 强烈推荐（按需阅读；写仍限 Part A）

7. umbrella [.vibe/genesis/{{ARCH_VERSION}}/01_PRD.md](../../.vibe/genesis/{{ARCH_VERSION}}/01_PRD.md)
8. umbrella [.vibe/genesis/{{ARCH_VERSION}}/03_ADR/](../../.vibe/genesis/{{ARCH_VERSION}}/03_ADR/)
9. umbrella [.vibe/genesis/{{ARCH_VERSION}}/06_CHANGELOG.md](../../.vibe/genesis/{{ARCH_VERSION}}/06_CHANGELOG.md)
10. umbrella [.vibe/genesis/{{ARCH_VERSION}}/00_MANIFEST.md](../../.vibe/genesis/{{ARCH_VERSION}}/00_MANIFEST.md)（若存在）
11. umbrella [.vibe/genesis/{{ARCH_VERSION}}/04_SYSTEM_DESIGN/](../../.vibe/genesis/{{ARCH_VERSION}}/04_SYSTEM_DESIGN/) — 尤其本 scope 对应的 L0/L1 设计文档与 `_research/` 调研笔记
12. umbrella 历史 `.vibe/genesis/{{ARCH_VERSION}}/05_TASKS*.md` — 若本文件在 `.vibe/05_TASKS.md` 头部引用了 umbrella 历史 WBS，其仅作只读参考
13. [.vibe/coord/dependencies.yaml](../../.vibe/coord/dependencies.yaml)（若存在）— 跨 scope 依赖关系

## 与其他 scope 的并发

- **典型并发**：_（列出常见同时进场的 scope，写"Worker 通常与 X scope 的 Worker 并发"）_
- **契约同步**：_（若依赖 kind: contract 的 scope，说明版本 pin 方式；若无，留空）_
- **冲突边界**：互不读写对方目录；跨 scope 协作只通过 kind: contract 的 scope 或独立 RPC 调用（运行时）达成

## Git 习惯

- 分支命名：`feat/<task-id>-<slug>`，`<task-id>` 使用本文件下方 `05_TASKS.md` 中的编号（前缀 `{{TASK_PREFIX}}`）
- 每 task 一个 commit，message 含 Task ID
- push 到 `{{SCOPE_NAME}}` 子仓库的 `feat/...` 分支 → 开 PR 到其 `main`
- **绝不** 往父仓库根做 `git add/commit/push`（那是 Orchestrator 的写入面）

## Artifacts 目录

本 scope 的瞬时产物（logs / plan / prp）落在 [.vibe/artifacts/](./artifacts/)，详见该目录下的说明。根据 [.gitignore](../.gitignore) 配置，`artifacts/logs/`、`artifacts/plan_*.md`、`artifacts/prp_*.md` 不进 git；`artifacts/error_journal.md` 若出现则进 git。
