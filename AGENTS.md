# AGENTS.md - AI 协作协议

> **"如果你正在阅读此文档，你就是那个智能体 (The Intelligence)。"**
> 
> 这个文件是你的**锚点 (Anchor)**。它定义了项目的法则、领地的地图，以及记忆协议。
> 当你唤醒（开始新会话）时，**请首先阅读此文件**。

## 🎯 目标项目 (Target Project)

> **控制面板（`.antigravity/`）与业务代码共存于同一工作区。**

```
TARGET_PROJECT: ./
```

> ℹ️ 使用前必须修改为你的实际项目路径。
> 所有 `/forge` `/tdd` `/code-review` `/deploy` 等涉及代码的操作都在此路径下执行。
> 架构文档、任务跟踪、错误日志等保留在本项目中。
> 新 clone 的模板默认**没有**活动架构版本；首次运行 `/genesis` 后才会创建 `.antigravity/genesis/v1/`。

### TARGET_PROJECT 解析协议

所有代码类 workflow 在真正执行前都必须先完成以下步骤：

1. 从本文件读取 `TARGET_PROJECT: ...`
2. 将相对路径解析为**相对于控制面板根目录**的实际路径
3. 校验该目录存在
4. 校验它看起来像代码仓库根目录，至少满足以下任一信号：
   - 存在 `.git/`
   - 存在 `go.mod`、`package.json`、`pyproject.toml`、`Cargo.toml` 等项目文件
   - 存在 `cmd/`、`internal/`、`src/`、`app/`、`services/` 等常见源码目录
5. 在继续前回显解析后的绝对路径
6. 如果路径缺失、无法解析或不像代码仓库根目录，**立即停止**并提示用户修正 `TARGET_PROJECT`

> **职责边界**：
> - 控制面板仓库：`AGENTS.md`、`.antigravity/genesis/`、`.antigravity/artifacts/`、`.antigravity/docs/`
> - 目标代码仓库：代码、测试、构建、调试、部署、git 审查

---

## 🧠 30秒恢复协议 (Quick Recovery)

**当你开始新会话或感到"迷失"时，立即执行**:

1. **读取根目录的 AGENTS.md** → 获取项目地图
2. **查看下方"当前状态"** → 找到最新架构版本
3. **如果显示 `尚未初始化`** → 先运行 `/genesis`
4. **如果已初始化** → 读取 `.antigravity/genesis/v{N}/05_TASKS.md`
5. **检查 `.antigravity/artifacts/error_journal.md`** → 避免重复已知错误
6. **开始工作**

---

## 🗺️ 地图 (领地感知)

| 路径 | 描述 | 访问协议 |
|------|------|----------|
| `./` (TARGET_PROJECT) | **业务代码**。由 TARGET_PROJECT 指向。 | 通过 Task 读/写。 |
| `.antigravity/docs/` | **原始设计文档**。用户的架构设计、需求文档等输入。 | 只读参考。 |
| `.antigravity/genesis/` | **设计演进史**。版本化架构状态 (v1, v2...)；新项目默认为空。 | **只读**(旧版) / **写一次**(新版)。 |
| `.antigravity/genesis/v{N}/` | **当前真理**。最新的架构定义。 | 永远寻找最大的 `v{N}`。 |
| `.antigravity/genesis/v{N}/07_*` | **架构速查**。从 .antigravity/docs/ 原始文档提炼的架构设计速查。 | `/forge` L0 必读。 |
| `.antigravity/genesis/v{N}/08_*` | **代码规范**。技术栈编码约定与规则。 | `/forge` L0 必读。 |
| `.antigravity/artifacts/` | **产出物**。计划、PRP、错误日志、测试日志。 | 自由读写。 |
| `.antigravity/examples/` | **代码模式示例**。AI 参考的模式和最佳实践。 | 只读参考。 |
| `.antigravity/workflows/` | **工作流**。`/genesis`, `/tdd` 等。 | 按需读取对应文件。 |
| `.antigravity/skills/` | **技能库**。原子能力。 | 按需读取对应 skill 文档。 |

---

## 📍 当前状态 (由 Workflow 自动更新)

> **注意**: 此部分由 `/genesis`、`/blueprint` 和 `/forge` 自动维护。

- **最新架构版本**: `尚未初始化`
- **活动任务清单**: `尚未生成（先 /genesis，再 /blueprint）`
- **待办任务数**: -
- **最近一次更新**: `-`

### 🌊 Wave 1 — 待 /genesis 初始化后设置
_尚未开始执行_

---

## 🛠️ 工作流注册表

### 架构设计流程 (ANWS)

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/quickstart` | 新用户入口 / 不知道从哪开始 | 编排其他工作流 |
| `/genesis` | 新项目 / 重大重构 | PRD, Architecture, ADRs |
| `/scout` | 变更前 / 接手项目 | Scout Report |
| `/design-system` | genesis 后 | 04_SYSTEM_DESIGN/*.md |
| `/blueprint` | genesis 后 | 05_TASKS.md + AGENTS.md 初始 Wave |
| `/change` | 微调已有任务 | 更新 TASKS + SYSTEM_DESIGN |
| `/explore` | 调研时 | 探索报告 |
| `/challenge` | 决策前质疑 | 07_CHALLENGE_REPORT.md |
| `/craft` | 创建工作流/技能/提示词 | Workflow / Skill / Prompt 文档 |

### 编码质量流程 (ECC)

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/plan` | 现有项目加功能（轻量规划） | implementation_plan.md |
| `/tdd` | 编码实现 | 测试 + 实现代码 |
| `/code-review [scope]` | 写完一批代码 / Wave 结束 | 审查报告 |
| `/build-fix` | 构建失败 | 修复后的代码 |
| `/forge` | 按任务清单编码（ANWS 方式） | 代码 + 更新 AGENTS.md |

### Context Engineering 流程

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/generate-prp` | 需要详尽的实现蓝图时 | `.antigravity/artifacts/prp_[feature].md` |
| `/execute-prp` | 按 PRP 蓝图实现功能 | 代码 + 验证通过 |

### 运维与调试流程 (Kit)

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/debug` | 遇到 bug / 异常行为 / 性能问题 | 假设驱动调试报告 + 修复 |
| `/deploy` | 部署到测试/生产环境 | 预检 + 构建 + 部署 + 健康检查 |
| `/status` | 查看项目全景状态 | 项目状态卡片 |

### 工作流决策指南

| 场景 | 用哪个 |
|------|--------|
| 从零开始一个全新项目 | `/genesis` |
| 给现有项目加一个新功能 | `/plan` 或 `/generate-prp` |
| 重大重构 | `/genesis`（新建 v{N+1}） |
| 小需求微调 | `/change` |
| 遇到 bug | `/debug` |
| 构建失败 | `/build-fix` |
| 部署上线 | `/deploy` |
| 查看进度 | `/status` |

---

## 📜 宪法 (The Constitution)

### 苏格拉底门控协议 (Socratic Gate)

> 动手之前，先问清楚。

| 请求类型 | 动手前必须做 | 示例 |
|----------|-------------|------|
| 新功能 | 问 3 个战略性问题 | 目标用户？核心场景？成功标准？ |
| Bug 修复 | 确认理解 + 询问影响范围 | 能复现吗？影响哪些功能？ |
| 模糊请求 | 询问目的、用户、范围 | 想解决什么问题？谁会用？边界在哪？ |

### 架构法则 (ANWS)

1. **版本即法律**: 不"修补"架构文档，只"演进"。变更必须创建新版本。
2. **显式上下文**: 决策写入 ADR，不留在"聊天记忆"里。
3. **交叉验证**: 编码前对照 `05_TASKS.md`。我在做计划好的事吗？

### 编码法则 (ECC)

4. **Plan Before Execute**: 复杂功能先规划再编码。
5. **Test-Driven**: 先写测试再实现，80%+ 覆盖率。
6. **Security-First**: 绝不硬编码密钥，验证所有输入。
7. **Small Files**: 函数不超过50行，文件不超过800行，嵌套不超过4层。

### AI 行为法则 (Context Engineering)

8. **不假设缺失的上下文**：不确定时主动提问，不猜测。
9. **不编造不存在的 API**：只使用已验证的库和函数。
10. **参考 .antigravity/examples/**：实现新功能前，先看 `.antigravity/examples/` 中的模式示例。
11. **验证不可跳过**：即使看起来应该能用，也必须跑验证命令。

### Skill 加载法则 (Harness Engineering)

12. **Declare Before Act**: 使用任何 Skill 前，必须在回复中声明：
    `🧠 Loading skill: @{skill-name} — {reason}`
13. **Cross-Reference**: 实现前检查是否有对应的 `.antigravity/examples/` 示例。
14. **Skill Chain**: 复杂任务声明完整的 skill 调用链，例如：
    `🧠 Skill chain: @system-architect → @api-design → @{lang}-patterns → @{lang}-testing`

### 输出节制法则 (Output Discipline)

> **核心原则：假设每次输出的 token 都是十分有限的。**
> **目的：不是把所有事拆成单独对话，而是确保重要环节不因贪多而含糊。**

15. **Token 节约**: 每次回复只输出当前步骤必要的内容，不做多余解释。
    - 不重复用户已知的信息
    - 不输出“预防性”的文档或无关代码
    - 代码注释只写“为什么”，不写“是什么”
16. **重要任务单独执行**: 以下任务必须在**单独一次回答**中完成，确保深度和准确性：
    - 写测试（§3.3 RED）
    - 写实现代码（§3.4 GREEN）
    - 写任务要点 plan / implementation_plan
    - 生成架构文档（/genesis 每个 Step）
    - 系统详设文档（/design-system 的设计产出）
    - 完整 Code Review（Wave 结束后的 `/code-review [scope]`）
    - Debug 根因分析（/debug 的假设验证+修复）
17. **轻量任务可合并**: 以下任务可以在同一次回答中执行：
    - 遵从性检查 + 轻量 Review + Commit（§3.6 + §3.7 + §3.8）
    - 波次规划 + 文档加载（Step 1 + Step 2）
    - 更新 AGENTS.md + 波次回顾（Step 4）
    - Harness Quick Check 结果报告

---

## 🖥️ Coding Style

> **注意**: 此区块由 `/genesis` 根据架构文档中的技术栈维护。
> 空项目无需预设代码规范——首次完成技术选型后再补充即可。

<!-- CODING_STYLE:BEGIN — 由 /genesis 自动维护 -->
（等待 /genesis 根据架构文档填充...）
<!-- CODING_STYLE:END -->

---

## 🔒 Security Checklist (Before Every Commit)

> **自动化验证**: 运行 `/genesis` 后，应根据项目技术栈补充对应的 Security Gate 命令。

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL/NoSQL injection prevention (parameterized queries)
- [ ] Error messages don't leak sensitive data
- [ ] Authentication/authorization verified

---

## 🔧 Harness Engineering — 验证管线

> **核心理念**：验证不靠 AI 自律，靠系统强制。
>
> 具体的验证命令应在 `/genesis` 后按项目技术栈明确记录（例如 Makefile、package scripts、task runner 或等效构建脚本）。

| 层级 | 名称 | 何时跑 | 说明 |
|------|------|--------|------|
| L1 | Quick Check | 每个 `/forge` task 完成后 | 编译 + 静态分析 + 短测试 + 密钥扫描 |
| L2 | Security Gate | 每次 git commit 前 | 硬编码密钥 + 注入检测 + 错误泄露检查 |
| L3 | Full Verification | `/deploy` 前强制 | Lint + Race/并发检测 + Coverage + 依赖审计 |
| L4 | Integration Tests | 完成一个 Wave 后 | 需要外部依赖（DB/Cache/MQ 等） |

> **落地要求**: 运行 `/genesis` 后，应至少补充：
> - 项目采用的验证命令
> - 可选的 CI 配置（如 `.github/workflows/harness.yml`）
> - 可选的参考示例（如 `.antigravity/examples/` 中的代码模式）

<!-- HARNESS_COMMANDS:BEGIN — 由 /genesis 自动维护 -->
（等待 /genesis 根据技术栈生成具体验证命令...）
<!-- HARNESS_COMMANDS:END -->

## 🧬 Error Self-Evolution（错误自进化）

- 遇到 bug 或走错方向时，记录到 `.antigravity/artifacts/error_journal.md`（含根因和防范规则）
- 每次行动前**扫描 `error_journal.md` 的 Prevention Rules 速查表**，不需要读全部历史
- 修复 bug 后，同步更新 Prevention Rules 表和 Error Log

## 📦 Artifacts（产出物管理）

| 类型 | 路径 | 何时创建 |
|------|------|---------|
| 实现计划 | `.antigravity/artifacts/plan_[task].md` | 编码之前 |
| PRP 蓝图 | `.antigravity/artifacts/prp_[feature].md` | /generate-prp 生成 |
| 错误日志 | `.antigravity/artifacts/error_journal.md` | 遇到 bug 或走错方向时 |
| 测试/构建日志 | `.antigravity/artifacts/logs/` | 运行测试或构建后 |

---

## 🔄 Git Workflow

**Commit format:** `<type>: <description>`
Types: feat, fix, refactor, docs, test, chore, perf, ci

### Git 恢复协议

> 每个 task 一个 commit，确保任何时候都能精确回退。

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看某个任务的代码变更 | `git log --oneline --grep="T{X.Y.Z}"` | 通过 Task ID 查找 commit |
| 查看某个 Wave 的所有变更 | `git log --oneline --grep="feat(system-id)"` | 通过系统查找 |
| 回退某个任务的代码 | `git revert <commit-hash>` | 安全回退，不影响其他 |
| 回退到某个 Wave 开始前 | `git log` 找到 Wave 开始的 commit，然后 `git reset --hard <hash>` | ⚗️ 破坏性操作，需确认 |
| 查看某个版本的架构信息 | 直接读 `.antigravity/genesis/v{N}/` 下的文档 | 架构文档永远保留 |
| push 到 GitHub 后回退 | `git revert <commit-hash>` + `git push` | 安全回退 |
| push 后强制回退 | `git reset --hard <hash>` + `git push --force` | ⚗️ 仅限个人分支 |

> **关键设计**：因为每个 task 独立 commit 且 message 包含 Task ID，
> 所以你可以精确定位到任意一个任务的代码变更并回退。

---

## 🌳 项目结构 (Project Tree)

> **注意**: 此部分由 `/genesis` 维护。

```text
(等待 Genesis 初始化结构树...)
```

---

## 🔄 Auto-Updated Context

<!-- AUTO:BEGIN — 由工作流自动维护，请勿手动编辑此区块 -->

### 技术栈决策
- [由 .antigravity/genesis/tech-evaluator 自动填充]

### 系统边界
- [由 .antigravity/genesis/system-architect 自动填充]

### 活跃 ADR
- [由 genesis 自动填充 ADR 摘要]

### 当前任务状态
- [由 blueprint/forge 自动更新]

<!-- AUTO:END -->

---
> **状态自检**: 运行 `/status` 查看项目全景，`/quickstart` 开始全新项目，`/plan` 加功能，`/debug` 排查问题，`/deploy` 部署上线。
