---
description: 往 registry.yaml 幂等注册一个新 scope 并生成其 .vibe/ 骨架。Orchestrator 角色调用。
---

## Preflight

本 workflow 只能由 **Orchestrator** 调用。

> **作用**：把一个现有目录（或新建的空目录）升格为受托管的 scope——写一份服务档案 `AGENTS.service.md`、一份任务清单 `05_TASKS.md`、一条 `.cursor/rules/scope-*.mdc` 物理边界，并在 `.vibe/coord/registry.yaml` 中登记。
>
> **幂等**：对已注册的 scope 再次运行，只会校正 `status`，不会覆盖人工编辑。
>
> **单 scope → 多 scope 的演进点**：项目可以长期在单 scope（`registry.yaml` 为空）模式运行；当第一次需要拆分第二个 scope 时，调用本 workflow 即可激活 Worker/Orchestrator 分工。

命令形态：

```text
/promote-scope <name> [--kind=service|contract|frontend|backend|library|app] [--path=./<dir>]
/demote-scope  <name>                              # 将 scope 标记为 paused 或 archived（不删文件）
```

默认：
- `--kind=service`
- `--path=./<name>`

## Promote 流程（幂等）

### 1. 参数校验

1. 读 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml)
2. 若 `<name>` 已存在于 `scopes:` → 这是 **re-promote**（幂等路径）：
   - 若 status 为 `paused` / `archived` → 改为 `active`
   - 其他字段不动（避免覆盖人工编辑）
   - 跳到 Step 5
3. 若 `<path>` 对应的目录不存在：
   - 提示用户："目录 `<path>` 不存在。我不会替你 `git init` 或 `git submodule add`。请先创建目录或初始化子仓库，然后重新运行。"
   - 停止

### 2. 生成 scope 级 `.vibe/` 骨架（拷模板）

模板位置：[.agents/skills/scope-orchestration/references/](../skills/scope-orchestration/references/)

- `AGENTS.service.template.md` → `<path>/.vibe/AGENTS.service.md`
- `05_TASKS.template.md` → `<path>/.vibe/05_TASKS.md`
- `artifacts-README.template.md` → `<path>/.vibe/artifacts/README.md`

拷贝时替换占位符：
- `{{SCOPE_NAME}}` → `<name>`
- `{{SCOPE_KIND}}` → `<kind>`
- `{{SCOPE_PATH}}` → `<path>`
- `{{DATE}}` → 当前日期 `YYYY-MM-DD`
- `{{TASK_PREFIX}}` → scope 短前缀 + 层级序号约定（建议 `<首字母大写>.<wave>.<序号>`，如 `S.0.1` / `S.1.1.1`）

文件若已存在**不要**覆盖——跳过并在回显中标注。

### 3. 追加 `.gitignore` 规则

在 `<path>/.gitignore` 末尾追加（若尚未存在）：

```gitignore

# VibeCoding per-scope artifacts (transient, not source of truth)
.vibe/artifacts/logs/
.vibe/artifacts/plan_*.md
.vibe/artifacts/prp_*.md
```

若 `<path>/.gitignore` 不存在：新建，仅含上述 4 行（或让用户自己补齐）。

### 4. 生成 `.cursor/rules/scope-<name>.mdc`

根据 `<kind>` 选择模板（在 [.agents/skills/scope-orchestration/references/](../skills/scope-orchestration/references/)）：

- `kind: service` / `frontend` / `backend` / `library` / `app` → `scope-service.mdc.template`
- `kind: contract` → `scope-contract.mdc.template`

拷贝时替换同 Step 2 的占位符。若 Cursor 未启用（`.cursor/` 不存在）→ 跳过这一步并在回显中说明"未检测到 .cursor/，物理边界只靠 workflow 文字约束 + PR Reviewer 审查维护"。

### 5. 注册到 registry.yaml

在 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 的 `scopes:` 列表末尾 append：

```yaml
  - name: <name>
    path: <path>
    kind: <kind>
    status: active
    notes: "由 /promote-scope 于 <YYYY-MM-DD> 注册；Worker 首次进场前请补 SYS-* 映射"
```

**不要**覆盖 topology；若当前 `topology: single`（或缺省）→ 改为 `multi`。

### 6. 更新跨 scope 依赖声明（可选）

若用户告知本 scope 的依赖关系（如依赖某个下游 `kind: service` 或 `kind: contract` 的 scope），追加到 [.vibe/coord/dependencies.yaml](../../.vibe/coord/dependencies.yaml)。

### 7. 回显

向用户输出：
- 新创建的文件列表
- registry.yaml 的 diff
- 下一步建议：`给 Chat A 贴: /worker <name> <first-task-id>`

## Demote 流程

将 registry.yaml 对应条目 `status: active` 改为 `paused` 或 `archived`（由用户选择）；**不删任何文件**，只调状态字段。可与 Promote 对称幂等。

## 写入面约束

Orchestrator 的标准写入面：

- [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml)
- [.vibe/coord/dependencies.yaml](../../.vibe/coord/dependencies.yaml)
- 新增 scope 的 `<path>/.vibe/**`（由本 workflow 创建骨架）
- 新增 scope 的 `<path>/.gitignore`（append）
- [.cursor/rules/scope-<name>.mdc](../../.cursor/rules/)（若 Cursor 启用）

**绝不**：
- 替用户 `git init` / `git submodule add`
- 改动目标目录下任何业务代码
- 碰其他 scope 的 `.vibe/` 或代码

## 常见坑位

- `<name>` 要合法：小写字母 + 数字 + 连字符；避免与已存在的保留字冲突
- `<path>` 在父仓库 `.gitignore` 中时 → 新 scope 的 `.vibe/` 不会被父仓库 git 追踪，这是多 repo 形态的正常状态
- 若用户把 `<path>` 指向了已有代码根（如已存在的框架项目）→ 跳过 Step 2 中已存在的文件，只补缺的
- 若用户要"从现有 umbrella `05_TASKS.md` 中抽出一部分任务迁到新 scope"：本 workflow 只创建骨架任务（Wave 0 进场验收）；具体迁移由 Orchestrator 手工完成，保留 umbrella 原文作只读历史参考，新 scope `05_TASKS.md` 头部写 "Source: umbrella 05_TASKS.md sections ..."
