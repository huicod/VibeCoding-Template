---
description: 聚合全部 scope 的 git 分支、PR、任务进度、依赖关系，输出跨 scope 全景看板。Orchestrator 主用，Advisor / Reviewer 也可只读调用。
---

## Preflight

本 workflow 是**只读聚合器**，不修改任何文件。任何角色都可以调用。

> **多 scope 模式激活条件**：仅当 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 已注册 ≥1 个 scope 时输出才有意义；单 scope 项目直接用 `/status` 即可。

1. 读 [.vibe/coord/registry.yaml](../../.vibe/coord/registry.yaml) 拿 scope 列表
2. 读 [.vibe/coord/dependencies.yaml](../../.vibe/coord/dependencies.yaml)（若存在）
3. 读 umbrella [AGENTS.md](../../AGENTS.md) 的"📍 当前状态"段（历史锚点）
4. 对每个 `status: active` 的 scope 执行下文数据收集

## 数据收集（每 scope）

### 1. 分支与 PR 状态

```bash
cd <scope>
git fetch --quiet 2>/dev/null || true
git branch -r --list 'origin/feat/*' 2>/dev/null
gh pr list --state open --json number,title,author,updatedAt 2>/dev/null || echo "(gh not available or remote not configured)"
```

收集：在飞 feature 分支数、开放 PR 数、PR 标题列表、最后一次推送时间。

### 2. 任务进度

对 `<scope>/.vibe/05_TASKS.md`：

```bash
done=$(grep -c '^- \[x\]' <scope>/.vibe/05_TASKS.md)
todo=$(grep -c '^- \[ \]' <scope>/.vibe/05_TASKS.md)
```

若文件不存在 → 标记 "(no 05_TASKS.md)"；不报错。

### 3. 最近活动

```bash
cd <scope>
git log -5 --oneline --all 2>/dev/null
```

取最近 5 条 commit 的摘要。

### 4. Wave 状态

读 `<scope>/.vibe/AGENTS.service.md` 的"📍 当前 Wave 状态"段，提取：当前 Wave 名、最近一次更新、活跃任务。

## 输出格式（示例用占位名，实际替换为 registry.yaml 中的真实 scope）

```markdown
═══ Multi-Scope Status (orchestrator coord-status) ═══

Topology: multi (N active scopes)
Last aggregated: <now>

┌──────────────────┬──────┬──────────────┬────────────┬──────────────────────────┐
│ Scope            │ Kind │ Tasks x/y    │ Branches   │ Last commit              │
├──────────────────┼──────┼──────────────┼────────────┼──────────────────────────┤
│ <scope-core>     │ svc  │ 12/34        │ 0 feat     │ chore: … (YYYY-MM-DD)    │
│ <scope-gw-a>     │ svc  │  0/5         │ 1 feat     │ chore: claim S.x.y       │
│ <scope-gw-b>     │ svc  │  0/5         │ 0 feat     │ (no commits yet)         │
│ <scope-contract> │ ctr  │ —            │ —          │ stable (contract)        │
└──────────────────┴──────┴──────────────┴────────────┴──────────────────────────┘

Open PRs:
  - <scope-gw-a>#<id>   feat(<task-id>): <title>         (updated <rel-time>)

Dependencies (read-only, from dependencies.yaml):
  - <scope-gw-a>   → <scope-core>, <scope-contract>@<pin>
  - <scope-gw-b>   → <scope-core>, <scope-contract>@<pin>

Active Wave per scope (from each scope's AGENTS.service.md):
  - <scope-core>   : W{N} (last: YYYY-MM-DD)
  - <scope-gw-a>   : W{M}
  - <scope-gw-b>   : W{M}

Suggestions (for Orchestrator only):
  - <scope-gw-a> 的 <task-id> 分支已声明但未产出任何改动超过 30 分钟 → 可能该 Worker Chat 已离线
  - <scope-gw-b> 无活跃分支 → 下一步可派 /worker <scope-gw-b> <first-unblocked-task-id>
```

## 变体调用

- `/coord-status` — 完整看板（默认）
- `/coord-status <scope>` — 聚焦某个 scope 的详细视图
- `/coord-status --json` — 机器可读 JSON（方便 Orchestrator 接后续逻辑）

## 不做的事

- 不改任何 `05_TASKS.md` 勾选
- 不 push 任何 branch
- 不 bump submodule
- 不"建议"完的动作是单纯参考，不自动执行
