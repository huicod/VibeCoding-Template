# Antigravity Workflow Template

> **AI 驱动的软件工程工作区模板** — 融合 4 个框架精华，通过 Harness Engineering 实现自动化验证，让 AI 成为你的忠实工程搭档。

## 为什么需要这个模板

Vibecoding（AI 辅助编码）的核心问题不是 AI 写不出代码，而是：

- AI **没有记忆**：每次新会话都从零开始
- AI **会自由发挥**：不给约束就开盲盒
- AI **不主动验证**：写完就完，不管对不对
- AI **不知道项目全貌**：只看到当前文件，不懂架构

本模板通过**文件系统即外部记忆 + 工作流约束 + 自动验证管线**，把 AI 从"聪明但不靠谱的实习生"变成"严谨可靠的工程师"。

## 架构来源

| 框架 | 贡献 |
|------|------|
| **ANWS** (Antigravity Workflow System) | 版本化架构、genesis 设计流程、Wave 分批执行 |
| **ECC** (Everything Claude Code) | 编码规范（动态生成）、TDD/Code Review、error journal |
| **Context Engineering** | PRP 蓝图生成/执行、.antigravity/examples/ 代码示例、AI 行为法则 |
| **Antigravity Kit** | `/debug` 调试、`/deploy` 部署、`/status` 状态、苏格拉底门控 |
| **Harness Engineering** | 分层验证管线、Prevention Rules、Skill 加载法则 |

## 架构：控制面板 + 代码项目分离

本模板是**独立的控制面板**，与实际代码项目分离。两者通过 `TARGET_PROJECT` 配置关联：

```
workspace/                                ← 你的工作区
├── .agent/                               ← GSD 等工作区级工具（不冲突）
├── Antigravity-Go-Template/              ← 控制面板（本项目）
│   ├── AGENTS.md                         ← AI 锚点 + TARGET_PROJECT 配置
│   ├── .antigravity/workflows/                 ← 19 个工作流
│   ├── .antigravity/skills/                    ← 19 个技能
│   ├── .antigravity/docs/                             ← 你的设计文档输入
│   ├── .antigravity/genesis/                          ← 版本化架构文档（初始为空）
│   ├── .antigravity/artifacts/                        ← AI 产出物 + 错误日志
│   └── .antigravity/examples/                         ← 代码模式示例
├── my-microservice/                       ← 实际代码项目（TARGET_PROJECT 指向这里）
│   ├── cmd/
│   ├── internal/
│   ├── go.mod
│   └── ...
└── another-service/                       ← 其他项目
```

> **与 GSD 等其他工具不冲突**：GSD 在工作区级 `.agent/`，我们在项目级 `.agent/`，命令前缀不同。
>
> **默认状态说明**：新 clone 的模板不会自带活动 `.antigravity/genesis/v1/`；首次运行 `/genesis` 时才创建第一版架构文档。
>
> **执行规则说明**：所有代码类 workflow 在真正动手前，都应该先解析 `TARGET_PROJECT`、校验目标目录存在，并向你回显最终操作路径。

---

## 快速开始

### 前提条件

- 支持 AGENTS.md 的 AI 代码编辑器（如 Cursor、Windsurf、Claude Code、Antigravity）
- Git

### 5 分钟上手

```bash
# 1. 复制模板到工作区
cp -r Antigravity-Go-Template-V1 ~/workspace/Antigravity
cd ~/workspace/Antigravity

# 新 clone 的模板默认没有 .antigravity/genesis/v1/，这是正常状态

# 2. 配置目标项目路径（编辑 AGENTS.md）
# 将 TARGET_PROJECT: ./ 改为你的实际项目路径

# 3. 放入你的架构文档
cp ~/my-design.pdf .antigravity/docs/

# 4. 在 IDE 中打开工作区，对 AI 说：
# "请阅读 AGENTS.md，然后运行 /genesis"
```

AI 会自动完成：PRD → 技术选型 → 系统拆解 → 任务规划 → 在 TARGET_PROJECT 中开始编码。

---

## 核心工作流

### 全景流程

```
.antigravity/docs/ 放入架构文档
    ↓
/genesis → PRD + 架构 + ADR          ← 设计阶段
    ↓
/design-system → 系统详设（可选）
    ↓
/blueprint → 任务清单 + Sprint 规划   ← 规划阶段
    ↓
/forge → Wave 分批编码                ← 编码阶段
    ↓
/deploy → 验证 + 构建 + 部署          ← 部署阶段
```

### 图例说明

文档中使用以下标记区分操作触发方式：

| 标记 | 含义 |
|:----:|------|
| 🧑 | **你手动操作/触发** — 需要你输入命令或放文件 |
| 🤖 | **AI 自动执行** — 你说一句话，AI 全自动跑完 |
| ⏸️ | **人类检查点** — AI 停下来等你确认后才继续 |

---

## 场景 1: 创建新项目 — 从架构文档到第一行代码

### Phase 0: 准备

| 步骤 | 操作 | 触发 |
|:----:|------|:----:|
| 0.1 | 复制模板到新工作目录 | 🧑 |
| 0.2 | 把架构文档（PDF/MD）放入 `.antigravity/docs/` | 🧑 |
| 0.3 | （可选）把代码示例放入 `.antigravity/examples/` | 🧑 |
| 0.4 | 在 IDE 中打开工作区 | 🧑 |

### Phase 1: 创世 — `/genesis`

> 🧑 你说：`请阅读 .antigravity/docs/ 下的设计文档，然后运行 /genesis`
>
> 首次运行时，AI 会先创建 `.antigravity/genesis/v1/`；在此之前 `.antigravity/genesis/` 保持空目录是正常的。

| 步骤 | 操作 | 触发 | 产出 |
|:----:|------|:----:|------|
| 1.0 | 版本管理 — 创建 `.antigravity/genesis/v1/` 目录 | 🤖 | `00_MANIFEST.md`, `06_CHANGELOG.md` |
| 1.1 | 需求澄清 — 提取领域概念 | 🤖 | `concept_model.json` |
| 1.1.1 | AI 可能追问领域术语 | ⏸️ | — |
| 1.2 | PRD 生成 — 撰写产品需求 | 🤖 | `01_PRD.md` |
| 1.2.1 | **⏸️ 人类检查点 #1** — 确认 Goals 和 User Stories | ⏸️ | — |
| 1.3 | 技术选型 — 12 维度评估 | 🤖 | `03_ADR/ADR_001_TECH_STACK.md` |
| 1.4 | 系统拆解 — 识别系统边界 | 🤖 | `02_ARCHITECTURE_OVERVIEW.md` |
| 1.4.1 | **⏸️ 人类检查点 #2** — 确认系统拆分合理性 | ⏸️ | — |
| 1.5 | （可选）架构决策 — 记录 ADR | 🤖 | `03_ADR/ADR_00X_*.md` |
| 1.6 | （可选）复杂度审计 | 🤖 | 审计报告 |
| 1.7 | 完成总结 — 更新 AGENTS.md | 🤖 | AGENTS.md 更新 |

### Phase 2: 系统详设 — `/design-system`（按需）

> 🧑 你说：`/design-system backend-api-system`

| 步骤 | 操作 | 触发 | 产出 |
|:----:|------|:----:|------|
| 2.1 | 上下文加载 — 读取 PRD + Architecture + ADR | 🤖 | — |
| 2.2 | 系统理解 — 深度思考系统边界 | 🤖 | — |
| 2.3 | 调研 — 搜索业界最佳实践 | 🤖 | `_research/{system}-research.md` |
| 2.4 | 设计 — 架构、接口、数据模型、Trade-offs | 🤖 | — |
| 2.5 | 文档化 — 产出设计文档 | 🤖 | `04_SYSTEM_DESIGN/{system}.md` |
| 2.6 | **⏸️ 人类检查点** — 确认系统设计 | ⏸️ | — |

> 💡 每个复杂系统建议在独立会话中设计。简单项目可跳过。

### Phase 3: 任务规划 — `/blueprint`

> 🧑 你说：`/blueprint`

| 步骤 | 操作 | 触发 | 产出 |
|:----:|------|:----:|------|
| 3.1 | 加载架构文档 | 🤖 | — |
| 3.2 | 任务拆解 — WBS 方法，每个 task 2-8h | 🤖 | 任务列表 |
| 3.3 | Sprint 路线图 — 退出标准 + 集成验证任务 | 🤖 | Sprint 表 |
| 3.4 | 依赖分析 — Mermaid 图 | 🤖 | 依赖图 |
| 3.5 | User Story 交叉验证 — 覆盖率安全网 | 🤖 | User Story Overlay |
| 3.6 | 生成文档 + 更新 AGENTS.md | 🤖 | `05_TASKS.md` |
| 3.7 | **⏸️ 人类检查点** — 确认任务清单 | ⏸️ | — |

### Phase 4: 编码执行 — `/forge`

> 🧑 你说：`/forge`

**每个 Wave（2-5 个任务）的执行循环：**

| 步骤 | 操作 | 触发 |
|:----:|------|:----:|
| 0 | 恢复定位 — 读 Wave 块 + Tasks 状态 | 🤖 |
| 1 | 波次规划 — 选任务 + ⏸️ 你确认 | 🤖 + ⏸️ |
| 2 | 加载文档（Architecture → System Design → ADR） | 🤖 |

**每个 Task 的执行循环：**

| 步骤 | 操作 | 触发 | 说明 |
|:----:|------|:----:|------|
| **3.1** | 加载任务级上下文 | 🤖 | 读 task 描述、验收标准 |
| **3.2** | Think Before Code | 🤖 | 想清楚再写 |
| **3.3** | 测试先行 (RED) | 🤖 | 写测试 → 确认失败 |
| | ↳ TDD 豁免：纯配置/UI/文档 | 🤖 | 可跳过 3.3 |
| **3.4** | 最小实现 (GREEN) | 🤖 | 只写让测试通过的代码 |
| **3.4.1** | 结构重构 (REFACTOR) | 🤖 | 命名/重复/嵌套/长度，不做性能优化 |
| **3.5** | 验证 | 🤖 | 逐条检查验收标准 |
| **3.5.1** | Harness Quick Check | 🤖 | 编译+分析+测试+密钥扫描 |
| **3.6** | 遵从性检查 | 🤖 | 7 项 checklist |
| **3.7** | 轻量 Code Review | 🤖 | 4 项安全扫描 |
| **3.8** | 提交 | 🤖 | git commit + 回写进度 |

**Wave 结束：**

| 步骤 | 操作 | 触发 |
|:----:|------|:----:|
| 4.1-4.3 | 波次结算 + 更新 AGENTS.md | 🤖 |
| 4.4 | 性能审视（跑 benchmark → 识别瓶颈 → 记录优化任务） | 🤖 |
| 4.5 | **⏸️** 你确认波次完成 | ⏸️ |

**里程碑结算（Sprint 完成时）：**

| 步骤 | 操作 | 触发 |
|:----:|------|:----:|
| 5.1 | Harness Full Verification（L3） | 🤖 |
| 5.2 | Integration Tests（L4） | 🤖 |
| 5.3 | 完整 `/code-review [scope]` | 🧑 |

### Phase 5: 部署 — `/deploy`

> 🧑 你说：`/deploy production`

| 步骤 | 操作 | 触发 |
|:----:|------|:----:|
| 1 | Harness 自动验证（Full + Security + Integration） | 🤖 |
| 2 | 预部署检查清单 | ⏸️ |
| 3 | 构建 | 🤖 |
| 4 | 部署 | 🤖 |
| 5 | Shadow Mode（生产环境推荐，30min 观察） | ⏸️ |
| 6 | 健康检查 | 🤖 |
| 7 | 部署报告 | 🤖 |

---

## 场景 2: 编写阶段 — 新增功能

项目已经完成首次 `/genesis` + `/blueprint`，存在活动架构版本和任务清单，正在开发中。

### 路线 A: 功能在任务清单内

```
🧑 你说：/forge
```

AI 自动从上次断点继续（通过 AGENTS.md Wave 块 + Tasks checkbox 恢复），执行 TDD 循环。

### 路线 B: 新功能（轻量规划）

```
🧑 你说：/plan 新增评论功能
```

| 步骤 | 操作 | 触发 |
|:----:|------|:----:|
| 1 | 重述需求 + 架构分析 + 拆解成独立任务 + 测试策略 + 风险 | 🤖 |
| 2 | 输出 `implementation_plan.md`（含任务列表） | 🤖 |
| 3 | **⏸️** 等你确认 | ⏸️ |

确认后，每个任务按 forge 相同的循环执行：

```
🧑 你说：按计划实现，遵循 /forge 的任务循环
```

| 步骤 | 操作 | 触发 | 说明 |
|:----:|------|:----:|------|
| **3.1** | 加载任务上下文 | 🤖 | 读 plan 中该任务的描述 |
| **3.2** | Think Before Code | 🤖 | 想清楚再写 |
| **3.3** | 测试先行 (RED) | 🤖 | **单独一次回答** |
| **3.4** | 最小实现 (GREEN) | 🤖 | **单独一次回答** |
| **3.4.1** | 结构重构 (REFACTOR) | 🤖 | 命名/重复/嵌套，不做性能优化 |
| **3.5** | 验证 + Harness Quick Check | 🤖 | 逐条验收 + 自动检查 |
| **3.6-3.7** | 遵从性检查 + 轻量 Code Review | 🤖 | 可合并 |
| **3.8** | Git commit（含任务标识） | 🤖 | 可合并 |
| ↻ | 下一个任务 | 🤖 | — |

全部完成后：

```
🧑 你说：/code-review HEAD~3..HEAD
```

AI 对最近一段提交进行 8 项审查（安全 → 质量 → Go 基线 → 测试覆盖 → 报告）。你通过 walkthrough 人工审查。

### 路线 C: 新功能（详尽蓝图）

```
🧑 你说：/generate-prp 新增 WebSocket 实时通知
```

AI 生成带验证门控的 PRP 蓝图 → ⏸️ 你确认 → `/execute-prp` 按蓝图逐步实现。

---

## 场景 3: 日常维护

| 你想做什么 | 命令 | AI 做什么 |
|----------|------|----------|
| 遇到 Bug | `/debug 描述` | 假设驱动调试 → 修复 → 记录 error_journal |
| 构建失败 | `/build-fix` | 诊断 → 修复 → 验证 |
| 微调任务 | `/change T2.1.3 改为 RBAC` | 更新 Tasks + Changelog |
| 查看进度 | `/status` | 输出项目状态卡 |
| 审查代码 | `/code-review [scope]` | 8 项检查 + 报告 |
| 重大重构 | `/genesis` | 创建 v{N+1}，演进架构 |

---

## 工作流速查表

### 架构设计（来自 ANWS）

| 命令 | 一句话 |
|------|--------|
| `/quickstart` | 不知道从哪开始？从这里 |
| `/genesis` | 完整设计流程（PRD → 架构 → ADR） |
| `/scout` | 接手已有项目时的代码探索 |
| `/design-system` | 为某个系统设计详细架构 |
| `/blueprint` | 把架构拆成可执行的任务清单 |
| `/change` | 微调已有任务 |
| `/explore` | 技术调研 |
| `/challenge` | 质疑现有架构决策 |
| `/craft` | 创建新的工作流/技能 |

### 编码质量（来自 ECC）

| 命令 | 一句话 |
|------|--------|
| `/plan` | 轻量级功能规划 |
| `/tdd` | 先写测试再实现 |
| `/code-review [scope]` | 代码审查（8 项检查含 Go 基线） |
| `/build-fix` | 构建失败时修复 |
| `/forge` | 按任务清单分 Wave 编码（主力工作流） |

### Context Engineering

| 命令 | 一句话 |
|------|--------|
| `/generate-prp` | 生成详尽的实现蓝图（含验证门控） |
| `/execute-prp` | 按蓝图逐步实现+验证 |

### 运维与调试（来自 Kit）

| 命令 | 一句话 |
|------|--------|
| `/debug` | 假设驱动的系统化调试 |
| `/deploy` | Harness 验证 → 构建 → 部署 → 健康检查 |
| `/status` | 项目全景状态卡 |

---

## 核心机制

### Harness Engineering — 分层验证

验证不靠 AI 自律，靠系统强制。

| 层级 | 名称 | 何时跑 | 说明 |
|:----:|------|--------|------|
| L1 | Quick Check | 每个 task 后 | 编译 + 静态分析 + 短测试 + 密钥扫描 |
| L2 | Security Gate | 每次 commit 前 | 硬编码密钥 + 注入检测 + 错误泄露检查 |
| L3 | Full Verification | deploy 前 | Lint + Race 检测 + Coverage + 依赖审计 |
| L4 | Integration Tests | Wave 完成后 | 需要外部依赖（DB/Cache/MQ 等） |

### TDD 驱动 — 先写测试再写代码

`/forge` 的任务循环强制 TDD：

```
3.3 写测试 (RED)  →  3.4 写实现 (GREEN)  →  3.5 验证
```

豁免条件：纯配置/纯 UI/文档类任务可跳过 TDD，但 Code Review 仍然强制。

### 上下文恢复 — 文件系统即外部记忆

AI 的"记忆"不存在对话里，而是存在文件系统里：

| 层 | 存在哪 | 恢复什么 |
|---|--------|---------|
| AGENTS.md | 项目根目录 | 项目地图 + 当前状态 + 宪法 |
| Wave 块 | AGENTS.md 内 | 当前正在做的波次 |
| Task checkbox | 05_TASKS.md | 每个任务的完成状态 `[x]`/`[ ]` |
| Prevention Rules | error_journal.md | 已知的坑，避免重复 |

对话可以随时重置，进度不会丢失。

### Git 恢复 — 代码级回退

因为每个 task 独立 commit 且 message 包含 Task ID，你可以精确回退到任意一个任务：

| 场景 | 命令 |
|------|------|
| 查看某个任务的变更 | `git log --oneline --grep="T{X.Y.Z}"` |
| 回退某个任务 | `git revert <commit-hash>` |
| 回退到某个 Wave 前 | `git reset --hard <hash>`（⚗️ 破坏性） |
| push 后安全回退 | `git revert` + `git push` |

### 输出节制 — Token 节约策略

AI 假设每次输出 token 都是有限的。目的不是把所有事拆成单独对话，而是确保重要环节不因贪多而含糊：

| 任务类型 | 策略 | 原因 |
|---------|------|------|
| 写测试（§3.3） | **单独一次回答** | 确保深度和准确性 |
| 写实现（§3.4） | **单独一次回答** | 确保代码质量 |
| 写 plan / 架构文档 | **单独一次回答** | 确保规划完整 |
| 系统详设（/design-system） | **单独一次回答** | 设计需要深度思考 |
| 完整 Code Review | **单独一次回答** | 审查需要全面性 |
| Debug 根因分析 | **单独一次回答** | 假设验证需严谨 |
| 遵从性+Review+Commit | 可合并一次执行 | 轻量检查类 |
| 波次规划+文档加载 | 可合并一次执行 | 准备类 |

### Error Self-Evolution — 错误自进化

遇到 bug 或走错方向时：
1. 记录到 `.antigravity/artifacts/error_journal.md`（含根因和防范规则）
2. 每次行动前扫描 Prevention Rules 速查表
3. 系统自动积累"免疫力"

---

## 宪法规则（20 条）

| # | 规则 | 来源 |
|---|------|------|
| 1 | 版本即法律 — 架构文档只演进不修补 | ANWS |
| 2 | 显式上下文 — 决策写入 ADR | ANWS |
| 3 | 交叉验证 — 编码前对照任务清单 | ANWS |
| 4 | Plan Before Execute — 先规划再编码 | ECC |
| 5 | Test-Driven — 先写测试再实现，80%+ 覆盖率 | ECC |
| 6 | Security-First — 绝不硬编码密钥 | ECC |
| 7 | Small Files — 函数≤50行，文件≤800行 | ECC |
| 8 | 不假设缺失的上下文 | CE |
| 9 | 不编造不存在的 API | CE |
| 10 | 参考 .antigravity/examples/ | CE |
| 11 | 验证不可跳过 | CE |
| 12 | Declare Before Act — 使用 Skill 前先声明 | Harness |
| 13 | Cross-Reference — 实现前检查 .antigravity/examples/ | Harness |
| 14 | Socratic Gate — 新功能先问 3 个问题 | Kit |
| 15 | Token 节约 — 每次只输出当前步骤必要内容，不做多余解释 | Output |
| 16 | 重要任务单独执行 — 写测试/写实现/plan 必须单独一次回答 | Output |
| 17 | 轻量任务可合并 — 检查/review/commit 可同次执行 | Output |
| 18 | Socratic Gate — Bug 先确认影响范围 | Kit |
| 19 | Socratic Gate — 模糊请求先问目的 | Kit |
| 20 | Error Self-Evolution — 错误记录到 journal + Prevention Rules | ECC |

---

## 你需要做的 vs AI 做的

| 你的动作 | 频率 |
|---------|------|
| 放入架构文档 → `.antigravity/docs/` | 项目初始化时一次 |
| 输入命令（`/genesis` 等） | 每个阶段一次 |
| 确认检查点 | 每个阶段 1-2 次 |
| 通过 walkthrough 人工 code review | Wave 结束后 |
| 决定是否重置上下文 | 对话太长/AI 跑偏时 |

**其余全部由 AI 自动执行。**

---

## License

MIT

---

## Maintainer Check

发布或合并模板改动前，建议运行：

```bash
bash .antigravity/scripts/check-template-consistency.sh
```
