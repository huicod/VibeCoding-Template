# AGENTS.md - AI 协作协议

> 如果你正在阅读此文档，你就是当前会话的 AI 协作者。
>
> 这个文件是你的锚点。开始任何工作前，先读它；当上下文丢失时，也先回到这里。

## 🎯 目标项目 (Target Project)

> 控制面板（`AGENTS.md`、`.agents/`、`.vibe/`）与业务代码可以共存于同一工作区，也可以通过 `TARGET_PROJECT` 指向子目录。

```text
TARGET_PROJECT: ./
```

使用规则：

1. 使用前必须把 `TARGET_PROJECT` 改成你的真实代码根目录。
2. `/forge`、`/tdd`、`/code-review`、`/deploy`、`/build-fix`、`/debug` 等涉及代码的操作，都在 `TARGET_PROJECT` 中执行。
3. 架构文档、任务跟踪、PRP、计划、错误日志等控制面板信息保留在当前工作区。
4. 新 clone 的模板默认没有活动架构版本；首次运行 `/genesis` 后才会创建 `.vibe/genesis/v1/`。

### TARGET_PROJECT 解析协议

所有代码类 workflow 在真正执行前都必须先完成以下步骤：

1. 从本文件读取 `TARGET_PROJECT: ...`
2. 将相对路径解析为相对于控制面板根目录的实际路径
3. 校验目录存在
4. 校验它看起来像代码仓库根目录，至少满足以下任一信号：
   - 存在 `.git/`
   - 存在 `go.mod`、`package.json`、`pyproject.toml`、`Cargo.toml` 等项目文件
   - 存在 `cmd/`、`internal/`、`src/`、`app/`、`services/` 等常见源码目录
5. 在继续前回显解析后的绝对路径
6. 如果路径缺失、无法解析或不像代码仓库根目录，立即停止并提示用户修正 `TARGET_PROJECT`

职责边界：

- 控制面板仓库：`AGENTS.md`、`.agents/`、`.vibe/docs/`、`.vibe/genesis/`、`.vibe/artifacts/`、`.vibe/examples/`
- 目标代码仓库：代码、测试、构建、调试、部署、git 审查

---

## 🧠 30 秒恢复协议 (Quick Recovery)

当你开始新会话或感觉迷失时，立即执行：

1. 读取根目录 `AGENTS.md`
2. 查看下方“当前状态”
3. 如果显示 `尚未初始化`，先运行 `/genesis`
4. 如果已初始化，读取 `.vibe/genesis/v{N}/05_TASKS.md`
5. 快速扫描 `.vibe/artifacts/error_journal.md`
6. 如当前任务已有规划或 PRP，再读取对应 `.vibe/artifacts/plan_[task].md` 或 `.vibe/artifacts/prp_[feature].md`

---

## 🗺️ 地图 (领地感知)

| 路径 | 描述 | 访问协议 |
|------|------|----------|
| `./` (TARGET_PROJECT) | 业务代码根目录 | 按任务读写 |
| `.vibe/docs/` | 原始设计输入，如 PRD、架构图、规范说明 | 只读参考 |
| `.vibe/genesis/` | 版本化架构演进历史 | 旧版只读，新版写入 |
| `.vibe/genesis/v{N}/` | 当前架构真理 | 永远使用最大的 `v{N}` |
| `.vibe/genesis/v{N}/07_*` | 架构速查 | `/forge` 必读 |
| `.vibe/genesis/v{N}/08_*` | 代码规范 | `/forge` 必读 |
| `.vibe/artifacts/` | 计划、PRP、错误日志、运行日志 | 按职责读写 |
| `.vibe/examples/` | 代码模式示例 | 读多写少，严格精选 |
| `.agents/workflows/` | 工作流定义 | 按需读取 |
| `.agents/skills/` | 技能库 | 按需读取 |

---

## 📍 当前状态 (由 Workflow 自动更新)

> 此部分由 `/genesis`、`/blueprint`、`/forge` 自动维护。

- **最新架构版本**: `尚未初始化`
- **活动任务清单**: `尚未生成（先 /genesis，再 /blueprint）`
- **待办任务**: `-`
- **最近一次更新**: `-`

### 🌊 Wave 1 - 等待 `/genesis` 初始化后设置
_尚未开始执行_

---

## 🛠️ 工作流注册表

### 架构设计流程 (ANWS)

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/quickstart` | 新用户入门 / 不知道从哪开始 | 后续工作流建议 |
| `/genesis` | 新项目 / 重大重构 | PRD、Architecture、ADRs |
| `/scout` | 接手项目 / 变更前调研 | Scout Report |
| `/design-system` | 已完成 genesis，需要系统详设 | `04_SYSTEM_DESIGN/*.md` |
| `/blueprint` | 已完成 genesis，需要任务拆解 | `05_TASKS.md` + 初始 Wave |
| `/change` | 仅修改已有任务细节 | 更新 Tasks / Design / Changelog |
| `/explore` | 技术探索 | 探索报告 |
| `/challenge` | 决策前质疑与审视 | `07_CHALLENGE_REPORT.md` |
| `/craft` | 创建 workflow / skill / prompt | 文档与模板 |

### 编码质量流程 (ECC)

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/plan` | 现有项目加功能，但还不直接编码 | `.vibe/artifacts/plan_[task].md` |
| `/tdd` | 具体实现时采用测试驱动 | 测试 + 实现代码 |
| `/code-review [scope]` | 评审改动质量 | 结构化审查报告 |
| `/build-fix` | 构建失败 | 修复后的代码 + 构建日志 |
| `/forge` | 按任务清单逐步实现 | 代码 + AGENTS 状态更新 |

### Context Engineering 流程

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/generate-prp` | 需要高细节实现蓝图 | `.vibe/artifacts/prp_[feature].md` |
| `/execute-prp` | 按 PRP 实施功能 | 代码 + 验证通过 |

### 运维与调试流程 (Kit)

| 工作流 | 触发时机 | 产出 |
|--------|---------|------|
| `/debug` | 遇到 bug / 异常行为 / 性能问题 | 调试报告 + 根因记录 |
| `/deploy` | 部署到测试或生产环境 | 部署报告 + 部署日志 |
| `/status` | 查看项目全景 | 状态卡片 + artifacts 摘要 |

### 工作流决策指引

| 场景 | 用哪一个 |
|------|----------|
| 从零开始一个全新项目 | `/genesis` |
| 给现有项目加一个新功能 | `/plan` 或 `/generate-prp` |
| 重大重构 | `/genesis`（创建 `v{N+1}`） |
| 小需求微调 | `/change` |
| 遇到 bug | `/debug` |
| 构建失败 | `/build-fix` |
| 部署上线 | `/deploy` |
| 查看进度 | `/status` |

---

## 📜 宪法 (The Constitution)

### 苏格拉底门控协议 (Socratic Gate)

动手之前，先问清楚：

| 请求类型 | 动手前必须做 | 示例 |
|----------|-------------|------|
| 新功能 | 至少问 3 个战略性问题 | 目标用户？核心场景？成功标准？ |
| Bug 修复 | 确认理解 + 询问影响范围 | 能复现吗？影响哪些功能？ |
| 模糊请求 | 询问目的、用户、边界 | 想解决什么问题？谁会用？边界在哪？ |

### 架构法则 (ANWS)

1. **版本即法律**：不要原地修补架构文档，要通过新版本演进。
2. **显式上下文**：关键决策写入文档或 ADR，不留在聊天记忆里。
3. **交叉验证**：编码前对照 `05_TASKS.md`，确保做的是已计划的事情。

### 编码法则 (ECC)

4. **Plan Before Execute**：复杂功能先规划再编码。
5. **Test-Driven**：优先测试驱动，避免只凭感觉改代码。
6. **Security-First**：绝不硬编码密钥，输入必须校验。
7. **Small Files**：倾向小函数、小文件、浅层嵌套。

### AI 行为法则 (Context Engineering)

8. **不假设缺失上下文**：不确定时主动提问，不猜测。
9. **不编造不存在的 API**：只使用已验证的库、函数和命令。
10. **先看示例，再落代码**：如 `.vibe/examples/` 中有对应模式，先参考再实现。
11. **验证不可跳过**：看起来能用不等于真的能用，必须实际运行验证。

### Skill 加载法则 (Harness Engineering)

12. **Declare Before Act**：使用任何 Skill 前，先说明为什么要加载它。
13. **Cross-Reference**：实现前检查是否存在可复用的示例或已有规划。
14. **Skill Chain**：复杂任务要说明技能链，避免无序切换。

### 输出节制法则 (Output Discipline)

15. **Token 节约**：回复只覆盖当前步骤真正需要的信息，不堆砌背景。
16. **重要任务单独执行**：测试、实现、计划、架构生成、完整 Code Review、根因分析应保持专注。
17. **轻量任务可合并**：如遵从性检查、轻量 review、日志回写、状态更新可放在同一轮完成。

---

## 🖥️ Coding Style

> 此区块由 `/genesis` 根据架构文档中的技术栈维护。空项目无需预设具体规范，首次完成技术选型后再补充即可。

<!-- CODING_STYLE:BEGIN 由 /genesis 自动维护 -->
（等待 /genesis 根据架构文档填充...）
<!-- CODING_STYLE:END -->

---

## 🔒 Security Checklist (Before Every Commit)

- [ ] No hardcoded secrets (API keys, passwords, tokens)
- [ ] All user inputs validated
- [ ] SQL / NoSQL injection prevention in place
- [ ] Error messages do not leak sensitive data
- [ ] Authentication / authorization reviewed where applicable

---

## 🔧 Harness Engineering 验证管线

> 验证不靠“自觉”，靠系统强制。具体命令应由 `/genesis` 根据技术栈补齐。

| 层级 | 名称 | 何时运行 | 说明 |
|------|------|----------|------|
| L1 | Quick Check | 每个 `/forge` task 完成后 | 编译 + 静态检查 + 短测 + 密钥扫描 |
| L2 | Security Gate | 每次提交前 | 安全与泄露检查 |
| L3 | Full Verification | `/deploy` 前 | Lint + Coverage + 并发/依赖审计 |
| L4 | Integration Tests | 完成一个 Wave / Sprint 后 | 需要真实外部依赖的集成验证 |

落地要求：

- 记录项目采用的验证命令
- 如有需要，补充 CI 配置
- 如有成熟模式，沉淀到 `.vibe/examples/`

<!-- HARNESS_COMMANDS:BEGIN 由 /genesis 自动维护 -->
（等待 /genesis 根据技术栈生成具体验证命令...）
<!-- HARNESS_COMMANDS:END -->

---

## 🧬 Error Self-Evolution（错误自进化）

- 遇到 bug、错误方向或重复性陷阱时，记录到 `.vibe/artifacts/error_journal.md`
- 每次行动前快速扫描 `error_journal.md` 中与当前任务相关的 Prevention Rules
- 修复 bug 后，同步补充“根因 / 防范规则 / 触发条件”

---

## 📦 Artifacts（产出物管理）

| 类型 | 路径 | 主写入工作流 | 主读取工作流 | 用途 |
|------|------|--------------|--------------|------|
| 实现计划 | `.vibe/artifacts/plan_[task].md` | `/plan` | `/tdd`、`/forge`、`/code-review`、`/status` | 在编码前对齐实现步骤、风险和测试策略 |
| PRP 蓝图 | `.vibe/artifacts/prp_[feature].md` | `/generate-prp` | `/execute-prp`、`/code-review`、`/status` | 为复杂功能提供高细节执行蓝图 |
| 错误日志 | `.vibe/artifacts/error_journal.md` | `/debug`、`/execute-prp`、`/deploy`、`/build-fix` | 所有执行类工作流 | 记录根因、防范规则和重复性陷阱 |
| 测试 / 构建 / 部署日志 | `.vibe/artifacts/logs/` | `/build-fix`、`/debug`、`/deploy` | `/status`、`/debug`、`/build-fix`、`/deploy` | 留存失败摘要、排查轨迹和运行结果 |

### `.vibe/examples/` 生命周期

| 项目 | 说明 |
|------|------|
| 主写入者 | 人工维护为主；`/forge` 可在功能通过验证后提炼稳定模式写入 |
| 主读取者 | `/generate-prp`、`/execute-prp`、`/tdd`、`/code-review`、`/forge` |
| 写入规则 | 只收录可复用、已验证、已脱敏的模式，不存业务私密信息 |
| 使用规则 | 作为模式参考，不直接复制粘贴 |

---

## 🔄 Git Workflow

**Commit format:** `<type>: <description>`

Types: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `perf`, `ci`

### Git 恢复协议

| 场景 | 命令 | 说明 |
|------|------|------|
| 查看某个任务的改动 | `git log --oneline --grep="T{X.Y.Z}"` | 通过 Task ID 查找 commit |
| 查看某个 Wave 的改动 | `git log --oneline --grep="feat(system-id)"` | 通过系统或 Wave 标签查找 |
| 回退某个任务 | `git revert <commit-hash>` | 安全回退，不影响其他提交 |
| 回退到某个 Wave 开始前 | `git log` 后再 `git reset --hard <hash>` | 破坏性操作，必须确认 |
| 查看某个版本的架构 | 直接读取 `.vibe/genesis/v{N}/` | 架构文档长期保留 |
| push 后回退 | `git revert <commit-hash>` + `git push` | 默认方案 |
| push 后强制回退 | `git reset --hard <hash>` + `git push --force` | 仅限个人分支且需确认 |

> 关键设计：task 级 commit 应尽量带 Task ID，这样才能精确定位和回退。

---

## 🌳 项目结构 (Project Tree)

> 此部分由 `/genesis` 维护。

```text
(等待 Genesis 初始化结构树...)
```

---

## 🔄 Auto-Updated Context

<!-- AUTO:BEGIN 由工作流自动维护，请勿手动编辑此区块 -->

### 技术栈决策
- [由 `.vibe/genesis/tech-evaluator` 自动填充]

### 系统边界
- [由 `.vibe/genesis/system-architect` 自动填充]

### 活跃 ADR
- [由 genesis 自动填充 ADR 摘要]

### 当前任务状态
- [由 blueprint / forge 自动更新]

<!-- AUTO:END -->

---

> 状态自检：运行 `/status` 查看项目全景，`/quickstart` 开始全新项目，`/plan` 加功能，`/debug` 排查问题，`/deploy` 部署上线。
