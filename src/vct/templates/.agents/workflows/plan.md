---
description: 需求分析和实现规划。先规划再编码，等用户确认后再动手。
---

## Preflight: TARGET_PROJECT 解析与校验

在分析现有代码前，先执行：

1. 从控制面板根目录 `AGENTS.md` 读取 `TARGET_PROJECT`
2. 将其解析为实际代码仓库根目录
3. 校验目录存在
4. 向用户回显最终解析路径
5. 架构文档读取发生在控制面板仓库；代码结构分析发生在 `TARGET_PROJECT`

如果 `TARGET_PROJECT` 未配置好，停止规划并要求先修正配置。

开始规划前，补充读取以下上下文（如存在）：

- `.vibe/genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md`，确认本次需求不违背现有架构
- `.vibe/examples/` 中与本次需求相关的模式示例
- `.vibe/artifacts/error_journal.md` 中与当前模块相关的 Prevention Rules

1. **重述需求**
   - 用自己的话重述用户的需求要点，确保理解一致

2. **架构分析**
   - 分析 `TARGET_PROJECT` 中的现有代码结构（如果存在）
   - 识别受影响的组件和文件
   - 确定技术选型和架构边界

3. **分阶段拆解**
   - 将实现分成多个独立可交付的 Phase
   - 每个 Phase 标注：涉及文件、依赖关系、风险等级（Low / Medium / High）
   - Phase 之间按依赖排序

4. **测试策略**
   - 列出需要的 Unit / Integration / E2E 测试
   - 标注关键测试路径

5. **风险评估**
   - 列出潜在风险和应对方案

6. **输出格式**
   - 将计划保存为 `.vibe/artifacts/plan_[task].md`
   - 文件至少包含：需求重述、影响范围、Phase 拆解、测试策略、风险、待确认问题
   - 文件名使用能表达任务主题的 slug，例如 `plan_comment-module.md`

7. **等待确认**
   - 输出计划后 **必须等用户明确确认** 再开始编码
