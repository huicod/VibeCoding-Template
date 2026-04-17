---
description: 快速查看项目当前状态，包括架构版本、任务进度、技术栈、artifacts 摘要和服务健康。
---

## Preflight: TARGET_PROJECT 解析与校验

在统计代码、检查服务前，先执行：

1. 从控制面板根目录 `AGENTS.md` 读取 `TARGET_PROJECT`
2. 将其解析为实际代码仓库根目录
3. 校验目录存在
4. 向用户回显最终解析路径

后续状态展示需要明确区分：
- 控制面板状态：架构版本、Wave、任务清单、artifacts、examples
- 目标代码仓库状态：文件统计、最近改动、服务健康

显示项目的全景状态卡片：

1. **读取 AGENTS.md** 提取：
   - 当前架构版本（`.vibe/genesis/v{N}`）
   - Wave 进度
   - 待办任务数
   - 活动任务清单与最近一次更新

2. **读取控制面板 artifacts / examples**
   - 最近的 `.vibe/artifacts/plan_[task].md`（如存在）
   - 最近的 `.vibe/artifacts/prp_[feature].md`（如存在）
   - `.vibe/artifacts/error_journal.md` 的最近规则 / 最近问题摘要
   - `.vibe/artifacts/logs/` 中最近的构建 / 调试 / 部署日志
   - `.vibe/examples/` 中示例数量与最近更新项（如存在）

3. **扫描 `TARGET_PROJECT`** 统计：
   - 代码仓库中的源码文件数和行数
   - 测试文件数
   - 最近修改的 5 个文件

4. **检查运行状态**（如有服务在跑）：
   - HTTP / gRPC 健康检查
   - 数据库连接状态

5. **输出格式**：

```
═══ 项目状态 ═══

🧭 Control Panel: {控制面板目录名}
📁 Target Project: {目标代码仓库名}
📐 Architecture: .vibe/genesis/v{N}
🌊 Wave: {当前 Wave} — {进度}

🔧 技术栈:
   Language: Go
   Framework: Kratos
   DI: Wire
   DB: MySQL/PostgreSQL

✅ 已完成任务: {N}
⏳ 进行中: {N}
📋 待办: {N}

📄 代码统计:
   源文件: {N} 个
   测试文件: {N} 个
   总行数: ~{N}

📝 最近变更:
   • {file1} ({时间})
   • {file2} ({时间})
   • {file3} ({时间})

═══ 控制面板上下文 ═══

🗂️ Recent Plan: {plan_[task].md or 无}
🧭 Recent PRP: {prp_[feature].md or 无}
🛡️ Prevention Rules: {最近命中的规则摘要}
📚 Examples: {N} 个，可参考模式
📝 Recent Logs:
   • {log1}
   • {log2}

═══ 服务状态 ═══

🌐 HTTP: http://localhost:8000 → {状态}
📡 gRPC: localhost:9000 → {状态}
```
