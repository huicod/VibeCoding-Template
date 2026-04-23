---
description: Reviewer 角色 workflow：按规范审查一个或多个 PR / scope，只读，不写业务代码。
---

## Preflight: 角色确认与规范基线加载

你被声明为 **Reviewer**。这是只读角色——你可以评论 PR、写审查报告，但**不**直接修改业务代码。

命令形态：

```text
/reviewer              # 列出所有 scope 的待审 PR
/reviewer <scope>      # 聚焦某个 scope 的待审 PR
/reviewer <pr-url>     # 对某个具体 PR 做详细审查
```

> **多 scope 模式激活条件**：仅当 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 已注册 ≥1 个 scope 时本 workflow 才有意义。单 scope 项目直接使用 `/code-review`。

步骤：

1. 读 umbrella [AGENTS.md](../../AGENTS.md) 的"🪪 角色自识别协议"段
2. 读 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 了解 scope 列表
3. **必读规范基线（你的审查尺子）**，其中 `v{N}` 为当前架构版本（见 [AGENTS.md](../../AGENTS.md) 的"🎯 目标项目"段）：
   - `.vibe/genesis/v{N}/08_CODING_STANDARDS.md` — 全局编码规范
   - `.vibe/genesis/v{N}/07_ARCHITECTURE_CHEATSHEET.md` — 架构速查
   - `.vibe/genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md` — 受审 scope 所在的章节
   - `.vibe/genesis/v{N}/03_ADR/**` — 架构决策
   - [.vibe/artifacts/error_journal.md](../../.vibe/artifacts/error_journal.md) 中的 Prevention Rules
   - 受审 scope 的 `<scope>/.vibe/artifacts/error_journal.md`（若存在）
4. 若现有 [.agents/workflows/code-review.md](./code-review.md) 有详细 checklist，一并加载（本 workflow 不重复其内容，只编排场次）

## 审查清单（所有 PR 必过）

对每个 PR 至少检查：

### 范围与权限
- 变更是否**完全落在**该 Worker 声称的 scope 目录下
- 是否越界修改了**其他 scope** 的代码 → 直接 block
- 是否修改了 `kind: contract` 的 scope（从 `registry.yaml` 查询） → 必须走契约变更流程；未走流程则 block
- 是否动了 umbrella `.vibe/genesis/**` 或 `.agents/**` → 直接 block（那是 Orchestrator / `/genesis` 的写入面）

### 规范合规
- 命名、文件组织、函数大小符合 `08_CODING_STANDARDS.md`
- 无硬编码密钥、明文口令、SQL 注入风险、错误信息泄露
- commit message 含 Task ID（格式以 `<scope>/.vibe/05_TASKS.md` 中的编号为准）
- 测试覆盖：每个新函数 / 改动函数都有 RED→GREEN 证据（找到对应的测试文件变更）

### 架构合规
- 是否遵守 `02_ARCHITECTURE_OVERVIEW.md` 的分层与依赖方向
- 是否引入了未经 ADR 讨论的新依赖 / 新技术栈
- 对其他 scope 的依赖是否只通过 `kind: contract` 的 scope（不直接 import 其他 service scope 的 internal 包）

### Prevention Rules
- 扫描 `error_journal.md` 中的所有规则，对照 diff 排查命中
- 标注规则 UUID

## 输出格式（每个 PR 一份）

```markdown
## Review: <scope> PR#<id>

### Verdict: approve | request-changes | block

### Findings
- [severity] <file:line> — <issue>
  - Rule: <08_CODING_STANDARDS §x.y> / <Prevention Rule UUID>
  - Suggestion: ...

### Positive notes
- ...

### Summary
- Lines changed: ...
- Scope boundary check: pass / fail
- Test coverage: adequate / missing for <function>
```

severity 分级：
- `block`：必须修才能合并（安全、越界、架构违规、无测试）
- `major`：强烈建议修（显著可维护性问题）
- `minor`：建议修（代码风格、文档）
- `nit`：可选（个人偏好）

## 落盘

若用户要求持久化审查报告：

- 写到 `<scope>/.vibe/artifacts/review_<pr-id>.md`（由该 scope 的 Worker 下次进场时看到）
- 不写到 umbrella `.vibe/artifacts/`（那是 Orchestrator 聚合后的位置）

## 写入面约束

- **可写**：PR 评论（通过 `gh pr review` / `gh pr comment`）、`<scope>/.vibe/artifacts/review_*.md`
- **只读**：全工作区
- **绝不**：直接修改业务代码、修改 05_TASKS 勾选、修改 AGENTS.md、bump submodule 指针

发现 block 级问题时，**不要**自己动手修——在报告里指出来，让 Worker 下次进场修复。
