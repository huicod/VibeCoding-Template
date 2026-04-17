---
description: 从需求描述生成完整的 PRP（Product Requirements Prompt）实现蓝图，确保一次性正确实现。
---

## Preflight: TARGET_PROJECT 解析与校验

在研究现有代码库前，先执行：

1. 从控制面板根目录 `AGENTS.md` 读取 `TARGET_PROJECT`
2. 将其解析为实际代码仓库根目录
3. 校验目录存在
4. 向用户回显最终解析路径
5. 架构文档与 PRP 输出保留在控制面板仓库；代码模式研究发生在 `TARGET_PROJECT`

根据用户提供的需求描述，生成一份详尽的 PRP 蓝图：

1. **读取需求**
   - 读取用户指定的需求文件（如 `.vibe/docs/requirements/feature.md`）
   - 理解要构建什么、为什么构建

2. **研究代码库**
   - 在 `TARGET_PROJECT` 中搜索类似的功能/模式
   - 参考 `.vibe/examples/` 目录中的代码模式
   - 识别当前代码的命名惯例和架构模式
   - 检查 `.vibe/genesis/v{N}/02_ARCHITECTURE_OVERVIEW.md` 确保符合架构

3. **查阅文档**（如有 Context7 MCP 则主动使用）
   - 查找相关第三方库的最新文档
   - 收集使用示例和已知陷阱
   - 记录关键 API 的正确用法

4. **结构化思考**
   - 使用 3-5 步结构化思考进行深度推理（如宿主支持，可使用顺序思考工具）
   - 考虑边界情况、失败模式、安全风险

5. **生成 PRP 蓝图**，保存为 `.vibe/artifacts/prp_[feature].md`，包含：
   - **Goal**: 要构建什么
   - **Why**: 业务价值
   - **Success Criteria**: 可验证的成功条件（checklist）
   - **Context & References**: 文档 URL、代码引用、已知陷阱
   - **Implementation Blueprint**: 按任务分解的实现步骤 + 伪代码
   - **Validation Gates**: 可执行的验证命令
     ```bash
     go build ./...
     go test -race ./...
     go vet ./...
     ```
   - **Anti-Patterns**: 不应该做的事

6. **质量评分**
   - 给 PRP 打 1-10 分（一次性实现成功的信心）
   - 低于 7 分需补充更多上下文

7. **等待用户确认**后再执行
