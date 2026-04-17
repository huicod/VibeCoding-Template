---
description: 构建错误逐个修复。检测构建系统，解析错误，一个一个安全修复。
---

## Preflight: TARGET_PROJECT 解析与校验

在运行任何构建命令前，先执行：

1. 从控制面板根目录 `AGENTS.md` 读取 `TARGET_PROJECT`
2. 将其解析为实际代码仓库根目录
3. 校验目录存在
4. 在用户可见输出中回显最终解析路径
5. 后续所有构建系统检测、构建命令、日志分析都在 `TARGET_PROJECT` 中执行

若目标目录不存在，或不像可构建的项目根目录，立即停止并要求修正 `TARGET_PROJECT`。

开始修复前，先快速扫描 `.vibe/artifacts/error_journal.md`，查找是否已有相同构建错误或相关 Prevention Rules。

逐步修复构建和类型错误：

1. **检测构建系统并运行构建**
   - 在 `TARGET_PROJECT` 根目录检测并执行
   - `go.mod` → `go build ./...`
   - `Makefile` → `make build`
   - 如有 protobuf → 先 `make proto`

2. **解析和分组错误**
   - 按文件路径分组
   - 按依赖顺序排序（先修 import / 类型错误，再修逻辑错误）
   - 统计总错误数

3. **逐个修复（Fix Loop）**
   对每个错误：
   - 读取错误上下文（错误行 ± 10 行）
   - 诊断根因（缺失 import？类型不匹配？语法错误？）
   - 做最小改动修复
   - 重新构建验证

4. **安全护栏**
   遇到以下情况 **停下来问用户**：
   - 修复引入了更多错误
   - 同一个错误尝试 3 次仍无法修复
   - 需要架构层面的改动
   - 缺少依赖（需要 `go get`）

5. **输出摘要**
   - 已修复的错误（文件路径）
   - 剩余未修复的错误
   - 新引入的错误（应为零）
   - 将本次构建诊断与结果保存到 `.vibe/artifacts/logs/build_fix_[timestamp].md`
   - 如确认根因或沉淀出新规则，更新 `.vibe/artifacts/error_journal.md`

每次只修一个错误，安全优先。
