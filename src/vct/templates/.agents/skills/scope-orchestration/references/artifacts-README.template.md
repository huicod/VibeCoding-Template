# {{SCOPE_PATH}}/.vibe/artifacts/

Worker 在本 scope 工作期间产生的瞬时与沉淀资产：

| 文件 / 目录 | 是否进 git | 用途 |
|------------|-----------|------|
| `logs/` | 否（gitignore） | 构建、测试、调试日志；随会话重启可丢 |
| `plan_<task>.md` | 否（gitignore） | `/plan` 输出的轻量计划，执行完可弃 |
| `prp_<feature>.md` | 否（gitignore） | `/generate-prp` 输出的执行蓝图，执行完可弃 |
| `error_journal.md` | **是** | 本 scope 的错误沉淀与 Prevention Rules；首次出错时由 Worker 新建；Orchestrator 会在收尾时合并要点到 umbrella `.vibe/artifacts/error_journal.md` |
| `review_<pr-id>.md` | 是 | Reviewer 落盘的详细审查报告（可选产物） |

格式与规则沿用 umbrella `.vibe/artifacts/` 的既有约定。
