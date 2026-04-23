# 05_TASKS.md — {{SCOPE_NAME}} 任务清单

> 本文件是 `{{SCOPE_NAME}}` scope 的**任务真相源**。Worker 在此勾选进度；Orchestrator 只读，统计 `- [x]` / `- [ ]` 数量得到进度。
>
> **与 umbrella 的关系**：umbrella [.vibe/genesis/{{ARCH_VERSION}}/05_TASKS.md](../../.vibe/genesis/{{ARCH_VERSION}}/05_TASKS.md)（及其历史变体）若存在且记录了本 scope 的早期规划，保留不动作为**只读参考**；本文件才是本 scope 的真相源。
>
> 任务规划参考：umbrella [.vibe/genesis/{{ARCH_VERSION}}/02_ARCHITECTURE_OVERVIEW.md](../../.vibe/genesis/{{ARCH_VERSION}}/02_ARCHITECTURE_OVERVIEW.md) {{SCOPE_SECTION}}。

## Wave 0 — 进场与骨架验收

首次 Worker 进入本 scope 时，先完成以下 bootstrap 验收，再进入业务任务。初次 `/forge` 时由 Worker 填充具体子任务：

- [ ] {{TASK_PREFIX}}0.1 骨架 sanity check：构建 / lint / 单元测试基线全绿（命令以 scope 具体技术栈为准）
- [ ] {{TASK_PREFIX}}0.2 基础设施确认：启动入口、配置文件、生成脚本就位
- [ ] {{TASK_PREFIX}}0.3 依赖注入 / 模块引导骨架占位（若适用）
- [ ] {{TASK_PREFIX}}0.4 与依赖方（其他 scope / contract scope）的集成链路打通（import / client stub / API consumer 等）
- [ ] {{TASK_PREFIX}}0.5 `/forge` 首次进场，Worker 根据 `02_ARCHITECTURE_OVERVIEW.md` {{SCOPE_SECTION}} 把后续 Wave 的任务补充到本文件下方

## Wave 1 — （待 Worker 在 {{TASK_PREFIX}}0.5 中规划）

_占位：首次 `/forge` 规划结束后在此追加具体子任务。_

---

## 任务编号约定

- 前缀 `{{TASK_PREFIX}}` 表示 {{SCOPE_NAME}} scope（避免与 umbrella 或其他 scope 的任务编号冲突）
- 格式 `{{TASK_PREFIX}}<Wave>.<序号>`，例如 `{{TASK_PREFIX}}1.2.3`
- 分支命名：`feat/{{TASK_PREFIX}}<wave>.<n>-<slug>`

## 勾选与 commit 对齐

每次 `- [ ]` → `- [x]` 的状态切换必须伴随一个独立 commit，message 格式：

```
feat({{SCOPE_NAME}}): <task title>

Task: {{TASK_PREFIX}}<wave>.<n>
```

便于后续 `git log --grep='{{TASK_PREFIX}}1.2.3'` 精确回溯。

## 完工退出标准

每个 Wave 的关门任务建议用 `INT-W<N>` 编号（Integration / Milestone task），验收标准必须是**可演示 / 可观测**的跨组件行为，而不是"所有子任务勾掉"。参考 `.agents/skills/task-planner/SKILL.md` 的"Sprint 退出标准与集成验证任务"段。
