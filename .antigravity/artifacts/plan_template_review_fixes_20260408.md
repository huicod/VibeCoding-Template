# Plan: Template Review Fixes (2026-04-08)

## Goal
把 `Antigravity-Go-Template-V1` 修回一个真正可分发、可上手、可持续维护的“控制面板模板”。

本计划聚焦 3 件事：
- 修掉会让新用户直接走错流程的结构性问题。
- 修掉会让 workflow 落地失败的路径和范围问题。
- 把文档、命名、承诺统一成一套真实可执行的话术。

## Non-Goals
- 本轮不重写全部 workflow。
- 本轮不实现新的大型功能。
- 本轮不优化文案风格，只修正确性、可执行性和一致性。

## Patch Sets

| ID | 优先级 | 主题 | 预期结果 |
|----|--------|------|----------|
| P0.1 | P0 | 清空模板默认运行态 | 新用户拿到的是“空模板”，不是一个正在进行中的 `anws` 示例项目 |
| P0.2 | P0 | 修正 `/code-review` 审查范围模型 | Wave 结束后的已提交代码也能被正确审查 |
| P0.3 | P0 | 把 `TARGET_PROJECT` 接入主 workflow | 所有代码类动作都明确发生在目标项目，而不是控制面板目录 |
| P1.1 | P1 | 统一文件名与文档路径 | 消除 `ADR001`/`ADR_001`、`02_ARCHITECTURE.md`/`02_ARCHITECTURE_OVERVIEW.md` 这类断链 |
| P1.2 | P1 | 去掉宿主绑定过强的伪工具指令 | workflow 在不同 AGENTS.md 宿主里更可移植 |
| P1.3 | P1 | 对齐文档计数与能力承诺 | 不再出现“19 个技能 / 13 个 skills / 17 条 / 20 条”混用，以及过度承诺自动生成能力 |
| P2.1 | P2 | 增加模板一致性自检 | 后续发版时更容易防止文档再漂移 |

## P0.1 清空模板默认运行态

### Problem
当前仓库根目录自带 `.antigravity/genesis/v1/`、`05_TASKS.md`、`06_CHANGELOG.md` 等已初始化产物，而且内容还是 `anws` Node CLI 项目，不符合“空控制面板模板”的定位。

这会带来两个直接后果：
- `/quickstart` 或人工阅读时，会把仓库误判成一个正在开发中的已有项目。
- `AGENTS.md` 写着“尚未初始化”，但磁盘状态却显示“已经初始化且做过多轮实现”，新用户会不知道该信哪边。

### Recommended Patch
- 从模板默认分发内容中移除根目录 `.antigravity/genesis/v1/` 的示例状态。
- 推荐保留空目录占位，例如：
  - `.antigravity/genesis/.gitkeep`
  - `.antigravity/artifacts/logs/.gitkeep`
- 如果需要保留演示材料，把当前 `anws` 示例迁移到非默认执行路径，例如：
  - `.antigravity/docs/samples/anws-cli/`
  - `.antigravity/artifacts/samples/anws-cli/`
  - 或单独的 `.antigravity/examples/reference-project/`
- 更新 `AGENTS.md`、`README.md`、`.antigravity/docs/GUIDE.md`、`.antigravity/docs/walkthrough.md`，明确“新仓库默认没有活动架构版本”。
- 调整 `/quickstart` 的起点判断，不要仅用“是否存在 `.antigravity/genesis/`”做分支条件。

### Files
- `.antigravity/genesis/v1/*`
- [AGENTS.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/AGENTS.md)
- [README.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/README.md)
- [.antigravity/docs/GUIDE.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/docs/GUIDE.md)
- [.antigravity/docs/walkthrough.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/docs/walkthrough.md)
- [.antigravity/workflows/quickstart.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/quickstart.md)

### Acceptance Criteria
- 新 clone 的模板仓库不会被误判成“已有任务的进行中项目”。
- `AGENTS.md` 的“尚未初始化”和仓库实际状态一致。
- `/quickstart` 的默认建议路径是全新项目初始化，而不是续做 `anws` 示例。

## P0.2 修正 `/code-review` 的审查范围模型

### Problem
当前 `/code-review` 只看 `git diff --name-only HEAD`，本质上只适合“未提交改动”。

但模板主流程要求：
- 每个 task 完成后先提交。
- 完整 code review 放在一个 Wave 或里程碑结束后再做。

这两者组合后，默认 `/code-review` 会漏掉最需要审查的那批“已提交但尚未复审”的代码。

### Recommended Patch
- 为 `/code-review` 明确定义 4 种审查范围：
  - `working-tree`: 未提交改动
  - `staged`: 已暂存改动
  - `commit`: 单个 commit
  - `range`: 一段 commit 范围，例如 `HEAD~3..HEAD`
- 默认行为建议：
  - 若工作区有未提交改动，默认审查 `working-tree`
  - 若工作区干净，默认提示用户提供 `commit` 或 `range`
- 给 Wave 结束场景增加明确用法示例，例如：
  - `/code-review HEAD~3..HEAD`
  - `/code-review <wave-start-sha>..HEAD`
- 报告头部必须注明“本次 review 的范围”。
- README 与 GUIDE 中的 `/code-review` 用法示例同步更新。

### Files
- [.antigravity/workflows/code-review.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/code-review.md)
- [README.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/README.md)
- [.antigravity/docs/GUIDE.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/docs/GUIDE.md)
- [AGENTS.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/AGENTS.md)

### Acceptance Criteria
- 工作区干净时，`/code-review` 不会静默审空结果。
- Wave 结束后，用户可以按 commit range 审查刚提交的一整批代码。
- 审查报告会明确写出 review scope。

## P0.3 把 `TARGET_PROJECT` 接入主 workflow

### Problem
`TARGET_PROJECT` 是模板的核心设计，但目前主要停留在 README 和 AGENTS 说明里。

workflow 里缺少统一的：
- 解析
- 路径解析
- 存在性校验
- 执行目录切换

这会让“代码到底写在哪儿”变成宿主 AI 的隐式猜测。

### Recommended Patch
- 在所有代码相关 workflow 的最前面加入统一的 `TARGET_PROJECT` 解析步骤。
- 建议共用一段标准协议：
  - 从 `AGENTS.md` 读取 `TARGET_PROJECT: ...`
  - 将相对路径解析为相对于控制面板根目录的绝对路径
  - 校验目录存在
  - 校验它看起来像代码仓库根目录
  - 在继续前回显最终解析路径
- 对以下 workflow 优先补齐：
  - `/forge`
  - `/tdd`
  - `/build-fix`
  - `/debug`
  - `/deploy`
  - `/plan`
  - `/code-review`
  - `/status`
- 明确约束：
  - 架构文档、artifacts、错误日志保留在控制面板仓库
  - 代码、测试、构建、审查发生在 `TARGET_PROJECT`
- 缺失路径时必须停止，并给出明确报错，而不是继续猜。

### Files
- [AGENTS.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/AGENTS.md)
- [.antigravity/workflows/forge.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/forge.md)
- [.antigravity/workflows/tdd.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/tdd.md)
- [.antigravity/workflows/build-fix.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/build-fix.md)
- [.antigravity/workflows/debug.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/debug.md)
- [.antigravity/workflows/deploy.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/deploy.md)
- [.antigravity/workflows/plan.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/plan.md)
- [.antigravity/workflows/code-review.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/code-review.md)
- [.antigravity/workflows/status.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/status.md)

### Acceptance Criteria
- 每个代码类 workflow 在真正执行前都会显示解析后的 `TARGET_PROJECT`。
- 不再出现控制面板目录和目标代码目录职责混淆。
- `TARGET_PROJECT` 配错时，workflow 会在早期失败并给出可操作提示。

## P1.1 统一文件名与文档路径

### Problem
仓库里同时存在多套命名：
- `ADR_001_TECH_STACK.md` 和 `ADR001_TECH_STACK.md`
- `02_ARCHITECTURE_OVERVIEW.md` 和 `02_ARCHITECTURE.md`
- `控制面板 + TARGET_PROJECT` 结构和“仓库内 `src/` 写代码”结构

这些不一致会让 workflow 在引用文件时直接断链。

### Recommended Patch
- 选定唯一官方命名：
  - `02_ARCHITECTURE_OVERVIEW.md`
  - `03_ADR/ADR_001_TECH_STACK.md`
  - `04_SYSTEM_DESIGN/{system-id}.md`
- 全仓库替换过时引用。
- 重写 `.antigravity/docs/walkthrough.md` 的目录树，让它与 README 的“控制面板 + TARGET_PROJECT 分离”模型一致。
- 如果保留历史示意，必须明确标注“历史示例”或“非当前推荐结构”。

### Files
- [.antigravity/docs/walkthrough.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/docs/walkthrough.md)
- [.antigravity/workflows/design-system.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/design-system.md)
- [README.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/README.md)
- [.antigravity/docs/GUIDE.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/docs/GUIDE.md)

### Acceptance Criteria
- 搜索过时路径后，只剩历史注释或明确标记的样例，不再出现在主说明和主 workflow 中。
- 用户按任一主文档操作时，不会命中找不到文件的问题。

## P1.2 去掉宿主绑定过强的伪工具指令

### Problem
workflow 里存在 `view_file`、`replace_file_content`、`multi_replace_file_content` 这类宿主相关动作名，但 README 又宣称支持多个 AGENTS.md 宿主。

这会让模板更像“某个特定宿主的私有脚本说明”，而不是可复用模板。

### Recommended Patch
- 把工具名改成宿主无关描述，例如：
  - “读取文件”
  - “更新指定区块”
  - “只修改 `AUTO:BEGIN` 到 `AUTO:END` 之间内容”
- 如果确实想保留宿主特定优化，把它们移到“实现提示”或“兼容性备注”中，而不是放在主流程正文。
- 对 `sequentialthinking` 一类扩展能力，也改成“如可用则使用；不可用则执行等价的结构化思考步骤”。

### Files
- [AGENTS.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/AGENTS.md)
- [.antigravity/workflows/genesis.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/genesis.md)
- [.antigravity/workflows/change.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/change.md)
- [.antigravity/workflows/design-system.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/.antigravity/workflows/design-system.md)

### Acceptance Criteria
- 主流程文本不依赖某一个专有编辑器或私有动作名才能理解。
- 迁移到不同 AGENTS.md 宿主后，workflow 仍然可读、可执行。

## P1.3 对齐文档计数与能力承诺

### Problem
当前文档里存在多类漂移：
- `19 个技能` 与 `13 个 skills` 混用
- `20 条宪法规则` 与 `17 条` 混用
- `genesis` 后会自动生成 `Makefile`、`.github/workflows/harness.yml`、`.antigravity/examples/` 示例等说法，和仓库当前真实能力不一致

这类问题虽然不一定立刻让命令失败，但会持续降低用户对模板的信任度。

### Recommended Patch
- 统一全仓库对 workflow、skills、宪法规则数量的描述。
- 对“自动生成 harness / CI / examples”的描述做二选一：
  - 要么实现对应能力
  - 要么把措辞改成“目标能力 / 后续扩展点 / 由具体项目实现”
- 对 `.antigravity/examples/` 的语义也要统一：
  - 如果是“用户自己放参考代码”，就不要再写成“系统自动生成”
  - 如果想做自动生成，就单独定义生成来源和时机

### Files
- [README.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/README.md)
- [.antigravity/docs/GUIDE.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/docs/GUIDE.md)
- [.antigravity/docs/walkthrough.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/docs/walkthrough.md)
- [AGENTS.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/AGENTS.md)
- [.antigravity/examples/README.md](/mnt/e/newlab/vibe coding/Antigravity-Go-Template-V1/examples/README.md)

### Acceptance Criteria
- 主文档中的数量描述完全一致。
- 不再承诺仓库当前并不存在的自动生成结果。
- `.antigravity/examples/` 的定位只有一种官方解释。

## P2.1 增加模板一致性自检

### Problem
本次发现的大部分问题，本质上都是“仓库内容和文档长期漂移”。

如果不加一个低成本自检，这些问题后面还会回来。

### Recommended Patch
- 新增一个轻量的一致性检查脚本或维护清单。
- 优先检查：
  - 过时文件名是否仍被引用
  - workflow/skills 数量描述是否一致
  - 是否存在示例状态误留在默认模板根目录
  - 是否出现新的宿主专有工具名
- 可选做法：
  - `.antigravity/scripts/check-template-consistency.sh`
  - `make check-template-docs`
  - 或一个手工维护的 release checklist

### Files
- `.antigravity/scripts/check-template-consistency.sh` 或等效入口
- `README.md` 或维护文档中的 release checklist

### Acceptance Criteria
- 发布前可以通过一条命令或一份固定清单检查关键漂移项。
- 类似 `ADR001` / `02_ARCHITECTURE.md` 这类旧名再次出现时，能被尽早发现。

## Recommended Order

1. 先做 `P0.1`，把模板从“带示例状态”恢复成真正的空模板。
2. 再做 `P0.3`，把 `TARGET_PROJECT` 真正接进主 workflow。
3. 接着做 `P0.2`，修复 `/code-review` 的范围模型。
4. 然后做 `P1.1` 和 `P1.3`，清理文件名、目录模型、能力承诺。
5. 最后做 `P1.2` 和 `P2.1`，提升可移植性和防回归能力。

## Suggested PR Split

### PR 1: Reset Template State
- 删除或迁移默认 `.antigravity/genesis/v1/` 示例状态
- 修正 `quickstart` 起点判断
- 同步 `AGENTS.md` 和主入口文档

### PR 2: Explicit Target Project Execution
- 为代码类 workflow 增加 `TARGET_PROJECT` 解析与校验
- 统一控制面板与目标代码仓库的职责边界

### PR 3: Review Scope and Doc Consistency
- 重构 `/code-review` 范围模型
- 修复过时文件名和 stale 文档
- 对齐 skills/rules/能力承诺

### PR 4: Portability and Release Guard
- 去掉主流程中的宿主专有伪工具名
- 增加模板一致性自检

## Done Definition
- 新用户按 README 首次使用时，不会被带入旧示例项目。
- 任何代码类 workflow 都能明确说明自己操作的是哪个 `TARGET_PROJECT`。
- `/code-review` 能覆盖未提交改动和已提交的 Wave 范围。
- 主文档、主 workflow、AGENTS 的文件名和目录模型一致。
- 模板不再承诺当前并不存在的自动生成能力。
