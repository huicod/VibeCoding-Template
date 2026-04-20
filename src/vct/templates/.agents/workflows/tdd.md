---
description: 测试驱动开发。RED 阶段写失败测试（/forge 之前），GREEN 阶段跑测试回归（/forge 之后），并承担波次收尾（CHANGELOG / git commit）。
---

## 🎯 TDD 在 Dev Cadence 中的位置

> 对齐 `AGENTS.md` "业务开发命令范式 (Dev Cadence)"：
>
> ```text
> /status → /tdd (RED) → /forge → /tdd (GREEN + 收尾) → /code-review
> ```

| 模式 | 触发时机 | 本次要做的事 |
|------|----------|-------------|
| **RED** | `/forge` 之前 | 定义接口签名 + 写失败单测；不写实现；不 commit |
| **GREEN** | `/forge` 之后 | 跑完整测试回归；根据结果决定是否再进 `/forge`；测试全绿后负责收尾（CHANGELOG / git commit / 更新进度文档） |

**调用者须在对话开头声明本次是 `RED` 还是 `GREEN`**；不声明时默认按下方自动判定：
- `05_TASKS.md` 中对应 task 的 `- [ ]` 仍未勾选 → **RED**
- `05_TASKS.md` 中对应 task 已勾选 `- [x]` → **GREEN**

---

## Preflight: TARGET_PROJECT 解析与校验

在开始 TDD 前，先执行：

1. 读取控制面板根目录 `AGENTS.md` 中的 `TARGET_PROJECT`
2. 将路径解析为实际代码仓库根目录
3. 校验目录存在，且看起来像可执行项目根目录
4. 向用户回显最终解析路径
5. 后续所有接口定义、测试编写、测试运行、实现与重构都在 `TARGET_PROJECT` 中进行

若 `TARGET_PROJECT` 缺失或无效，立即停止并要求先修正配置。

在真正开始 TDD 之前，补充读取：

1. 对应任务的 `.vibe/artifacts/plan_[task].md`（如存在）
2. `.vibe/artifacts/error_journal.md` 中与当前模块相关的 Prevention Rules
3. `.vibe/examples/` 中最接近的测试或实现模式

如果存在 plan artifact，应以其作为本轮 TDD 的范围和验证基线。

---

## Mode A: RED（`/forge` 之前）

> **只写失败测试，不写实现，不 commit。**

1. **定义接口 (SCAFFOLD)**
   - 先定义数据结构和函数签名
   - 实现体留空或抛出"未实现"异常

2. **写失败的测试 (RED)**
   - 在实现之前编写测试用例
   - 覆盖：正常路径、边界情况、错误情况
   - 使用项目技术栈推荐的测试模式（参考 `AGENTS.md` Coding Style、plan artifact 和 `.vibe/examples/`）

3. **运行测试，确认失败**
   - 运行项目的测试命令（由 `/genesis` 确定）
   - 确认测试因"未实现"而失败（不是因为编译错误）

4. **下一步**：输出"下一步建议 → 运行 `/forge` 写实现"后结束本次 TDD。

> ❌ 不允许在 RED 模式中写实现；这是 `/forge` 的工作。

---

## Mode B: GREEN（`/forge` 之后）

> **跑测试回归 + 决定是否迭代 + 波次收尾（仅当用户要求/条件满足时）。**

### B.1 回归验证

1. 运行项目完整测试命令（由 `/genesis` 确定）
2. 运行覆盖率（如任务涉及核心逻辑）——目标 80%+，核心逻辑 100%
3. 运行 lint / 静态分析（对齐 L1 Quick Check）

**结果处理**：

| 结果 | 下一步 |
|------|--------|
| 全绿 | 继续 B.2 |
| 仅有与本次实现无关的失败（flaky / 环境问题） | 记录到简报，继续 B.2 |
| 与本次实现相关的失败 | 🛑 停止；简报失败摘要；**建议下一步 = 回到 `/forge` 做小范围修复** |

### B.2 （可选）波次收尾 — 仅在用户明确要求或"本波次全部 task 完成"时做

> [!IMPORTANT]
> **这一节是 `/forge` 不做的收尾工作**。分三件小事，可合并在本次回答内完成（对齐 AGENTS.md §18 "轻量任务可合并"）。
>
> **展开起点（强约束）**：**先读取** 本波次每个 task 对应的 `.vibe/artifacts/logs/*-forge.md`，**以它为事实边界**补充细节；**不得添加 /forge 未实际完成的条目**。

1. **追加 `06_CHANGELOG.md`**：按当前 genesis 版本规范，追加本次完成 task 的摘要；**以 `-forge.md` 的"本次 /forge 改动"小节为起点**，在事实基础上展开（不写决策过程）
2. **更新 `AGENTS.md` Wave 回顾**：如本波次全部 task 完成，把 `🌊 Wave {N}` 行改为 `✅ 已闭合`，加 1-3 行关键产出
3. **git commit**：每个 task 独立 commit；消息格式 `<type>(<scope>): T{X.Y.Z} — 任务标题`；commit body 可直接引用 `-forge.md` 的要点；commit 后**把最新 commit hash 记录到 AGENTS.md 当前状态或 `.vibe/artifacts/logs/commit-history.md`**

> ⚠️ 若任意一项用户未要求或不适用（例如只完成了 task 的一部分），可跳过，只做 B.1。

### B.3 下一步建议

本次回答末尾必须给出下一步建议：

- 测试全绿且波次未闭合 → **下一条命令 = `/forge`**（下一个 task）或 `/status`（重新评估计划）
- 测试全绿且波次闭合 → **下一条命令 = `/code-review [scope]`** 做完整审查
- 测试有失败 → **下一条命令 = `/forge`**（小范围修复）或 `/debug`（深度排查）

---

## 参考：经典 TDD 完整循环（单函数粒度）

当 `/forge` 内部按 §3.3–3.4.1 执行 RED → GREEN → REFACTOR 时，每轮节奏如下：

1. SCAFFOLD：定义签名
2. RED：写失败测试，运行确认失败
3. GREEN：写最小实现，运行确认通过
4. REFACTOR：改命名、去重复、降嵌套（保持测试绿色）
5. 覆盖率：目标 80%+，核心逻辑 100%

此循环在 `/forge` 内部发生；本文件的 Mode A / Mode B 是**命令级**边界。
