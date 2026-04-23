# VibeCoding Template

> AI 驱动的软件工程工作区模板与本地生成器。
> 它保留 ANWS / ECC / Context Engineering / Kit / Harness Engineering 的核心工作流闭环，同时把共享真相源沉淀到 `.agents/` 和 `.vibe/`，再投影到 Cursor、Claude Code、Codex、Antigravity 等兼容层。

## 为什么需要这个模板

Vibecoding 的核心问题，不是 AI 写不出代码，而是：

- AI 没有记忆，每次新会话都容易从零开始
- AI 会自由发挥，不给约束就容易偏航
- AI 不主动验证，写完不代表真的正确
- AI 不知道项目全貌，只看到局部文件，不理解架构与上下文

这套模板的目标一直没变：通过“文件系统即外部记忆 + 工作流约束 + 自动验证管线”，让 AI 从“聪明但不稳定的实习生”变成“严谨可靠的工程搭档”。

## 架构来源

| 框架 | 贡献 |
|------|------|
| `ANWS` | 版本化架构、`/genesis` 设计流程、Wave 分批执行 |
| `ECC` | 编码规范、TDD、Code Review、error journal |
| `Context Engineering` | PRP 蓝图生成/执行、代码模式示例、AI 行为法则 |
| `Antigravity Kit` | `/debug`、`/deploy`、`/status`、门控式执行 |
| `Harness Engineering` | 分层验证、Prevention Rules、Skill 加载纪律 |

## 现在的真实架构

这份仓库现在不是单纯“拿来就用”的模板目录，而是一个**模板生成项目**。
真正的 source of truth 在这里：

- `src/vct/templates/AGENTS.md`
- `src/vct/templates/.agents/`
- `src/vct/templates/scaffold/.vibe/`

不要再把生成结果目录里的 `.antigravity/`、`.codex/`、`.cursor/` 或生成后的 `AGENTS.md` 当成模板源代码。
真正需要维护和演进的模板内容，已经迁移到 `src/vct/templates/`。

生成后的项目由三层组成：

1. 共享核心

- `AGENTS.md`
- `.agents/workflows/`（含 5 个多 scope 协同 workflow，默认单 scope 模式下不参与调度）
- `.agents/skills/`（含 `scope-orchestration/` 及其 scope 骨架模板 references）
- `.agents/scripts/`
- `.vibe/docs/`
- `.vibe/genesis/`
- `.vibe/artifacts/`
- `.vibe/examples/`
- `.vibe/coord/`（多 scope 协同层，默认出厂 `topology: single`、空 `scopes:`，仅在 `/promote-scope` 激活后生效）
- `.vibe/install-lock.json`

2. 平台兼容层

- Cursor: `.cursor/commands` + `.cursor/skills`
- Claude Code: `.claude/commands` + `.claude/skills`
- Codex: `.codex/skills`，其中 `vibecoding-system` 是 router skill
- Antigravity: `.antigravity/workflows` + `.antigravity/skills`
- 其他已支持 target：`windsurf`、`copilot`、`trae`、`qoder`、`kilo`、`opencode`

3. 业务代码

- 业务代码仍在你自己的真实项目目录中
- `TARGET_PROJECT` 决定 AI 具体在哪个代码根下执行编码、测试、构建与部署

## 为什么从 `.antigravity` 拆成 `.vibe` 和 `.agents`

旧版模板把几乎所有东西都放在同一个平台根目录里，这样很难真正泛化到多个工具。
现在的拆分是：

- `.vibe/`：项目相关但平台无关的上下文与状态
- `.agents/`：跨平台共享的 workflows、skills、scripts
- `.cursor/`、`.claude/`、`.codex/`、`.antigravity/` 等：只保留兼容层入口

这意味着：

- 真正通用的内容只维护一份
- 兼容层只负责把同一套模板语义投影给不同平台
- 即使生成了 `antigravity` target，`.antigravity/` 也只是兼容层，不再是实际内容的主存储位置

## 控制面板与目标代码的关系

当前模板遵循的模型是：

> 控制面板与业务代码共存于同一工作区。

也就是说，生成后的工作区通常长这样：

```text
my-project/
├── AGENTS.md
├── .agents/
│   ├── workflows/
│   ├── skills/
│   └── scripts/
├── .vibe/
│   ├── docs/
│   ├── genesis/
│   ├── artifacts/
│   ├── examples/
│   └── install-lock.json
├── .cursor/
├── .claude/
├── .codex/
├── src/                     # 业务代码
├── internal/                # 业务代码
└── package.json / go.mod / ...
```

`AGENTS.md` 中会有：

```text
TARGET_PROJECT: ./
```

你也可以把它改成：

- `./`
- `./services/review-service`
- `./apps/web`

这样控制面板根和实际编码根就可以分开，但仍处于同一工作区内。
职责边界也保持清晰：

- 控制面板：`AGENTS.md`、`.agents/`、`.vibe/`
- 目标代码：`TARGET_PROJECT` 指向的代码、测试、构建、调试、部署对象

## 默认 target 与支持矩阵

默认不传 `--target` 时，会生成：

- `cursor`
- `claude`
- `codex`

如果你需要 Antigravity 兼容层，可以显式指定：

```bash
vct init . --target antigravity,cursor,claude,codex
```

当前支持的 target：

- `antigravity`
- `cursor`
- `claude`
- `codex`
- `windsurf`
- `copilot`
- `trae`
- `qoder`
- `kilo`
- `opencode`

## 快速开始
### 前提条件

- Node.js
- Git
- 至少一种支持 `AGENTS.md` / workflow / skill 的 AI 编码工具

### 方式 1：直接运行本地 CLI

在本仓库根目录下：

```bash
node ./src/vct/bin/cli.js init ./out/demo
```

指定 target：

```bash
node ./src/vct/bin/cli.js init ./out/demo --target antigravity,cursor,claude,codex
```

更新已生成项目：

```bash
node ./src/vct/bin/cli.js update ./out/demo
```

### 方式 2：本地 link 后在任意工作区直接使用

在本仓库根目录执行一次：

```bash
npm link
```

之后在任意项目目录里：

```bash
vct init .
vct update .
```

Windows PowerShell 下也可以使用：

```powershell
npm.cmd link
```

## 5 分钟上手

假设你已经把 CLI link 到本机，进入真实项目工作区后：

```bash
# 1. 初始化模板
vct init .

# 2. 如有需要，修改 AGENTS.md 里的 TARGET_PROJECT
#    例如把 ./ 改成 ./services/review-service

# 3. 放入你的真实项目文档
#    把 PRD、架构设计、需求说明等放进 .vibe/docs/

# 4. 在 IDE 中打开工作区，对 AI 说：
#    "请先阅读 AGENTS.md，然后运行 /genesis"
```

如果你还想保留 Antigravity 兼容层：

```bash
vct init . --target antigravity,cursor,claude,codex
```

## 核心工作流
### 全景流程

```text
.vibe/docs/ 放入架构文档
  -> /genesis        PRD + 架构 + ADR               设计阶段
  -> /design-system  单系统详设（可选）
  -> /blueprint      任务清单 + Sprint 规划         规划阶段
  -> /forge          Wave 分批编码                  执行阶段
  -> /deploy         验证 + 构建 + 部署             发布阶段
```

### 图例说明

| 标记 | 含义 |
|------|------|
| `手动` | 需要你输入命令、确认检查点或放入文档 |
| `自动` | AI 会按工作流自动执行 |
| `检查点` | AI 会停下来等待你确认 |

## 场景 1：创建新项目，从架构文档到第一行代码
### Phase 0：准备

| 步骤 | 操作 | 触发 |
|------|------|------|
| 0.1 | 在目标工作区执行 `vct init .` | 手动 |
| 0.2 | 修改 `AGENTS.md` 中的 `TARGET_PROJECT` | 手动 |
| 0.3 | 把架构文档（PDF/MD）放入 `.vibe/docs/` | 手动 |
| 0.4 | 可选：把代码模式示例放入 `.vibe/examples/` | 手动 |
| 0.5 | 在 IDE 中打开工作区 | 手动 |

### Phase 1：创世，`/genesis`

你对 AI 说：

```text
请阅读 .vibe/docs/ 下的设计文档，然后运行 /genesis
```

首次运行时，AI 会先创建 `.vibe/genesis/v1/`；在此之前 `.vibe/genesis/` 为空是正常状态。

| 步骤 | 操作 | 触发 | 产出 |
|------|------|------|------|
| 1.0 | 版本管理，创建 `.vibe/genesis/v1/` | 自动 | `00_MANIFEST.md`、`06_CHANGELOG.md` |
| 1.1 | 需求澄清，提取领域概念 | 自动 | `concept_model.json` |
| 1.1.1 | AI 可能追问领域术语 | 检查点 | - |
| 1.2 | PRD 生成 | 自动 | `01_PRD.md` |
| 1.2.1 | 确认 Goals 和 User Stories | 检查点 | - |
| 1.3 | 技术选型，多维度评估 | 自动 | `03_ADR/ADR_001_TECH_STACK.md` |
| 1.4 | 系统拆解，识别系统边界 | 自动 | `02_ARCHITECTURE_OVERVIEW.md` |
| 1.4.1 | 确认系统拆分是否合理 | 检查点 | - |
| 1.5 | 可选：进一步补充 ADR | 自动 | `03_ADR/ADR_00X_*.md` |
| 1.6 | 可选：复杂度审计 | 自动 | 审计报告 |
| 1.7 | 完成总结并更新 `AGENTS.md` | 自动 | AGENTS 状态更新 |

### Phase 2：系统详设，`/design-system`

你对 AI 说：

```text
/design-system backend-api-system
```

| 步骤 | 操作 | 触发 | 产出 |
|------|------|------|------|
| 2.1 | 加载 PRD、Architecture、ADR | 自动 | - |
| 2.2 | 深入理解系统边界 | 自动 | - |
| 2.3 | 调研最佳实践 | 自动 | `_research/{system}-research.md` |
| 2.4 | 完成详细设计 | 自动 | - |
| 2.5 | 输出文档 | 自动 | `04_SYSTEM_DESIGN/{system}.md` |
| 2.6 | 确认系统设计 | 检查点 | - |

### Phase 3：任务规划，`/blueprint`

你对 AI 说：

```text
/blueprint
```

| 步骤 | 操作 | 触发 | 产出 |
|------|------|------|------|
| 3.1 | 加载架构文档 | 自动 | - |
| 3.2 | 以 WBS 方式拆解任务 | 自动 | 任务列表 |
| 3.3 | 规划 Sprint 和退出标准 | 自动 | Sprint 方案 |
| 3.4 | 做依赖分析 | 自动 | 依赖图 |
| 3.5 | User Story 交叉验证 | 自动 | User Story Overlay |
| 3.6 | 生成 `05_TASKS.md` 并更新 AGENTS | 自动 | `05_TASKS.md` |
| 3.7 | 确认任务清单 | 检查点 | - |

### Phase 4：编码执行，`/forge`

你对 AI 说：

```text
/forge
```

每个 Wave 的执行循环：

| 步骤 | 操作 | 触发 |
|------|------|------|
| 0 | 恢复定位，读取 Wave 块和任务状态 | 自动 |
| 1 | 规划本轮任务并等待确认 | 自动 + 检查点 |
| 2 | 加载 Architecture、System Design、ADR | 自动 |

每个 Task 的执行循环：

| 步骤 | 操作 | 触发 | 说明 |
|------|------|------|------|
| 3.1 | 加载任务级上下文 | 自动 | 读取任务描述与验收标准 |
| 3.2 | Think Before Code | 自动 | 先想清楚再动手 |
| 3.3 | 测试先行（RED） | 自动 | 先写失败测试 |
| 3.4 | 最小实现（GREEN） | 自动 | 只写让测试通过的实现 |
| 3.4.1 | 结构重构（REFACTOR） | 自动 | 改命名、去重复、减嵌套 |
| 3.5 | 验证 | 自动 | 逐条检查验收标准 |
| 3.5.1 | Harness Quick Check | 自动 | 编译、分析、短测试、密钥扫描 |
| 3.6 | 遵从性检查 | 自动 | checklist |
| 3.7 | 轻量 Code Review | 自动 | 安全和质量快速检查 |
| 3.8 | Commit 并回写进度 | 自动 | 更新 AGENTS 和任务状态 |

Wave 结束时：

| 步骤 | 操作 | 触发 |
|------|------|------|
| 4.1-4.3 | 波次结算并更新 AGENTS | 自动 |
| 4.4 | 性能审视 | 自动 |
| 4.5 | 确认波次完成 | 检查点 |

### Phase 5：部署，`/deploy`

你对 AI 说：

```text
/deploy production
```

| 步骤 | 操作 | 触发 |
|------|------|------|
| 1 | Harness 自动验证 | 自动 |
| 2 | 预部署检查清单 | 检查点 |
| 3 | 构建 | 自动 |
| 4 | 部署 | 自动 |
| 5 | Shadow Mode 观察 | 检查点 |
| 6 | 健康检查 | 自动 |
| 7 | 输出部署报告 | 自动 |

## 场景 2：编写阶段，新功能开发

项目已经完成首次 `/genesis` + `/blueprint`，存在活动架构版本与任务清单。

### 路线 A：功能已经在任务清单里

你说：

```text
/forge
```

AI 会通过 `AGENTS.md` 里的 Wave 块和 `05_TASKS.md` 的勾选状态恢复上下文，然后继续执行 TDD 循环。

### 路线 B：新功能，但先轻量规划

你说：

```text
/plan 新增评论功能
```

AI 会：

- 重述需求
- 分析架构影响
- 拆解任务
- 给出测试策略与风险
- 输出 `.vibe/artifacts/plan_[task].md`

确认之后，再进入 `/forge` 的任务循环执行。

### 路线 C：新功能，需要详尽蓝图

你说：

```text
/generate-prp 新增 WebSocket 实时通知
```

AI 会先生成 PRP 蓝图，确认后再通过 `/execute-prp` 逐步实现并验证。

## 场景 3：日常维护

| 你想做什么 | 命令 | AI 会做什么 |
|------------|------|-------------|
| 遇到 Bug | `/debug 描述` | 假设驱动调试、修复、记录 error journal |
| 构建失败 | `/build-fix` | 诊断、修复、验证 |
| 微调任务 | `/change T2.1.3 改为 RBAC` | 更新 Tasks 和 Changelog |
| 查看进度 | `/status` | 输出项目状态卡 |
| 审查代码 | `/code-review [scope]` | 输出结构化审查报告 |
| 重大重构 | `/genesis` | 创建 `v{N+1}` 并演进架构 |

## 工作流速查
### 架构设计

| 命令 | 用途 |
|------|------|
| `/quickstart` | 不知道从哪开始时的入口 |
| `/genesis` | 完整设计流程（PRD + 架构 + ADR） |
| `/scout` | 接手已有项目时的代码侦察 |
| `/design-system` | 为单个系统做详细设计 |
| `/blueprint` | 把架构拆成可执行任务 |
| `/change` | 微调已有任务 |
| `/explore` | 技术调研 |
| `/challenge` | 质疑现有架构决策 |
| `/craft` | 创建新的 workflow / skill / prompt |

### 编码质量

| 命令 | 用途 |
|------|------|
| `/plan` | 轻量功能规划 |
| `/tdd` | 先写测试再实现 |
| `/code-review [scope]` | 完整代码审查 |
| `/build-fix` | 构建失败时修复 |
| `/forge` | 按任务清单分 Wave 编码 |

### Context Engineering

| 命令 | 用途 |
|------|------|
| `/generate-prp` | 生成实现蓝图 |
| `/execute-prp` | 按蓝图实现并验证 |

### 运维与调试

| 命令 | 用途 |
|------|------|
| `/debug` | 系统化调试 |
| `/deploy` | 验证、构建、部署、健康检查 |
| `/status` | 输出项目全景状态 |

## 核心机制
### Harness Engineering：分层验证

验证不靠 AI 自律，靠系统强制。

| 层级 | 名称 | 何时运行 | 说明 |
|------|------|----------|------|
| L1 | Quick Check | 每个 task 后 | 编译、静态分析、短测试、密钥扫描 |
| L2 | Security Gate | 每次 commit 前 | 硬编码密钥、注入、错误泄露检查 |
| L3 | Full Verification | `/deploy` 前 | Lint、Race / 并发检测、Coverage、依赖审计 |
| L4 | Integration Tests | Wave 完成后 | 依赖外部 DB / Cache / MQ 的场景 |

### TDD 驱动

`/forge` 的核心节奏仍然是：

```text
RED -> GREEN -> REFACTOR -> VERIFY
```

纯配置、纯文档、纯 UI 类任务可以豁免 TDD，但不能跳过验证与审查。

### 上下文恢复：文件系统即外部记忆

AI 的“记忆”不依赖聊天窗口，而依赖文件系统：

| 类型 | 位置 | 恢复内容 |
|------|------|----------|
| 根锚点 | `AGENTS.md` | 项目地图、状态、宪法 |
| Wave 状态 | `AGENTS.md` | 当前波次与当前阶段 |
| 任务状态 | `.vibe/genesis/v{N}/05_TASKS.md` | 每个任务的完成状态 |
| Prevention Rules | `.vibe/artifacts/error_journal.md` | 已知错误与避免规则 |
| 计划与蓝图 | `.vibe/artifacts/plan_[task].md`、`.vibe/artifacts/prp_[feature].md` | 当前功能的执行上下文 |

所以即使对话重置，项目上下文也不会丢失。

### Artifacts 与 Examples 约定

| 路径 | 主写入者 | 主读取者 | 用途 |
|------|----------|----------|------|
| `.vibe/artifacts/plan_[task].md` | `/plan` | `/tdd`、`/forge`、`/code-review`、`/status` | 轻量实现计划 |
| `.vibe/artifacts/prp_[feature].md` | `/generate-prp` | `/execute-prp`、`/code-review`、`/status` | 高细节执行蓝图 |
| `.vibe/artifacts/error_journal.md` | `/debug`、`/execute-prp`、`/deploy`、`/build-fix` | 所有执行类 workflow | 错误沉淀与 Prevention Rules |
| `.vibe/artifacts/logs/` | `/build-fix`、`/debug`、`/deploy` | `/status`、排障类 workflow | 测试 / 构建 / 部署日志 |
| `.vibe/examples/` | 以人工维护为主，`/forge` 可在验证通过后提炼稳定模式写入 | `/generate-prp`、`/execute-prp`、`/tdd`、`/code-review`、`/forge` | 复用代码模式，而不是业务私货 |

关于 `.vibe/examples/` 的额外规则：

- 只收录可复用、已验证、已脱敏的模式
- 作为模式参考使用，不直接复制粘贴
- 如果某次实现沉淀了新的稳定范式，允许在验证通过后补充进去

### Git 恢复：代码级回退

因为每个 task 最好独立 commit，且 message 里带 Task ID，所以可以精确回退。

| 场景 | 命令 |
|------|------|
| 查看某个任务的变更 | `git log --oneline --grep="T{X.Y.Z}"` |
| 回退某个任务 | `git revert <commit-hash>` |
| 回退到某个 Wave 开始前 | `git reset --hard <hash>` |
| push 后安全回退 | `git revert <commit-hash>` + `git push` |

### 输出节制：重要任务单独做

为避免关键环节因为一次回复塞太多内容而变浅，以下任务应单独完成：

- 写测试
- 写实现
- 写复盘 plan
- 生成架构文档
- 系统详设
- 完整 Code Review
- Debug 根因分析

### Error Self-Evolution：错误自进化

遇到 bug 或走错方向时：

1. 记录到 `.vibe/artifacts/error_journal.md`
2. 每次行动前扫描相关 Prevention Rules
3. 修复后同步更新错误日志和规则

## 宪法规则（20 条）

| # | 规则 | 来源 |
|---|------|------|
| 1 | 版本即法律：架构文档只演进不修补 | ANWS |
| 2 | 显式上下文：决策写入 ADR | ANWS |
| 3 | 交叉验证：编码前对照任务清单 | ANWS |
| 4 | Plan Before Execute：先规划再编码 | ECC |
| 5 | Test-Driven：先写测试再实现 | ECC |
| 6 | Security-First：绝不硬编码密钥 | ECC |
| 7 | Small Files：限制函数和文件复杂度 | ECC |
| 8 | 不假设缺失的上下文 | CE |
| 9 | 不编造不存在的 API | CE |
| 10 | 参考 `.vibe/examples/` | CE |
| 11 | 验证不可跳过 | CE |
| 12 | 使用 Skill 前先声明 | Harness |
| 13 | 实现前交叉检查 `.vibe/examples/` | Harness |
| 14 | 新功能先问 3 个问题 | Kit |
| 15 | 每次只输出当前步骤必要内容 | Output |
| 16 | 重要任务必须单独执行 | Output |
| 17 | 轻量检查可以合并执行 | Output |
| 18 | Bug 先确认影响范围 | Kit |
| 19 | 模糊请求先问目的 | Kit |
| 20 | 错误沉淀到 journal + Prevention Rules | ECC |

## 你需要做什么 vs AI 做什么

| 你的动作 | 频率 |
|----------|------|
| 初始化模板 | 项目开始时一次 |
| 修改 `TARGET_PROJECT` | 需要时 |
| 放入文档到 `.vibe/docs/` | 架构输入变更时 |
| 确认工作流检查点 | 每个阶段 1-2 次 |
| 做最终人工审查 | Wave 或里程碑结束时 |

其余大部分流程，都应由 AI 按工作流自动推进。

## 开发者说明
### 关键命令

运行测试：

```bash
npm test
```

生成本地 demo：

```bash
node ./src/vct/bin/cli.js init ./out/demo --target antigravity,cursor,claude,codex
```

更新本地 demo：

```bash
node ./src/vct/bin/cli.js update ./out/demo
```

### 当前维护约束

目前我们要求：

- canonical template source 自身必须自洽
- `check-template-consistency.sh` 需要覆盖 `AGENTS.md`、`.agents/workflows/`、`.agents/skills/`、`.agents/scripts/` 与 `scaffold/.vibe/`
- 共享根始终是 `.vibe` 和 `.agents`
- 平台目录只保留兼容层投影，不再充当 source of truth

### 如果你要继续改模板

优先改这些位置：

- `src/vct/templates/AGENTS.md`
- `src/vct/templates/.agents/workflows/`
- `src/vct/templates/.agents/skills/`
- `src/vct/templates/.agents/scripts/`
- `src/vct/templates/scaffold/.vibe/`

不要直接把某个平台兼容层当作真相源去维护。

## 多 scope 协同（单 scope 默认 / opt-in）

模板的**默认形态是单 scope 单 Chat**——单个 `TARGET_PROJECT: ./`、`/genesis` / `/blueprint` / `/forge` 走到底，和以前完全一致。

当项目自然演化到需要多个逻辑独立代码根（多微服务、monorepo 中的多 package、前后端分仓等），可以 **opt-in** 升级到多 scope 协同，额外获得：

- **四角色模型**：Worker（写单个 scope）/ Orchestrator（跨 scope 编排）/ Reviewer（只读审查）/ Advisor（只读全景）
- **五个协同 workflow**：`worker-bootstrap` / `orchestrate` / `reviewer-session` / `coord-status` / `promote-scope`
- **一个 `scope-orchestration` skill**：含 `AGENTS.service` / `05_TASKS` / `artifacts README` / `scope-service.mdc` / `scope-contract.mdc` / `dependencies` / `registry` 七份 scope 骨架模板
- **一份 `.vibe/coord/` 协同层**：`registry.yaml`（默认 `topology: single`、空 `scopes:`）+ `README.md`

激活方式极简：在已生成的项目中调用 `/promote-scope <name>`，workflow 会把 `topology: single` → `topology: multi`，并按 skill references 脚手架新 scope 的 `.vibe/` 与 `.cursor/rules/scope-*.mdc` 物理边界。CLI 自身**不需要任何额外 flag**——`vct init` / `vct update` 永远按同一套共享核心投送文件。

角色自识别协议位于 `AGENTS.md` 顶部的 "🪪 角色自识别协议"：新 Chat 根据首条命令自动判定自己是单 scope、Worker、Orchestrator、Reviewer 还是 Advisor。

## Maintainer Check

合并或发布前，至少执行：

```bash
npm test
```

如果你想额外验证某个生成结果：

```bash
node ./src/vct/bin/cli.js init ./out/demo --target antigravity,cursor,claude,codex
bash ./out/demo/.agents/scripts/check-template-consistency.sh
```

## License

MIT
