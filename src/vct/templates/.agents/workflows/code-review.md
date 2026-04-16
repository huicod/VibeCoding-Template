---
description: 代码安全和质量审查。支持审查 working tree、staged、单个 commit 或 commit range。
---

## Preflight: TARGET_PROJECT 解析与校验

在读取 diff、git 历史和源码之前，先执行：

1. 从控制面板根目录 `AGENTS.md` 读取 `TARGET_PROJECT`
2. 将其解析为实际代码仓库根目录
3. 校验目录存在
4. 向用户回显最终解析路径
5. 后续所有 git diff、git log、文件检查、测试覆盖核对都在 `TARGET_PROJECT` 中进行

如果用户要审查的是控制面板 workflow 或文档变更，则显式说明本次 review 范围切回控制面板仓库。

## Step 0: 选择审查范围 (Review Scope)

在开始之前，先明确本次 review 的 scope。

支持 4 种范围：

1. `working-tree`
   - 审查未提交改动
   - 命令：`git diff --name-only HEAD`
2. `staged`
   - 审查已暂存但未提交的改动
   - 命令：`git diff --cached --name-only`
3. `commit <sha>`
   - 审查单个 commit
   - 命令：`git show --name-only --format=oneline <sha>`
4. `range <base>..<head>`
   - 审查一段 commit 范围
   - 命令：`git diff --name-only <base>..<head>`

默认行为：

- 如果工作区存在未提交改动，默认使用 `working-tree`
- 如果工作区干净，**不要静默审空结果**
- 工作区干净时，要求用户指定 `commit` 或 `range`，或明确建议例如：
  - `/code-review HEAD~3..HEAD`
  - `/code-review <wave-start-sha>..HEAD`

报告开头必须写清：

- 审查仓库：`TARGET_PROJECT` 或控制面板仓库
- 审查范围：`working-tree` / `staged` / `commit` / `range`
- 解析后的 commit 或 range

---

对选定范围内的改动进行全面审查：

1. **获取改动文件**
   - 根据 scope 运行对应的 git 命令
   - 如果结果为空，明确说明“当前 scope 内无可审查改动”

2. **安全检查 (CRITICAL)**
   - 硬编码的凭证、API 密钥、Token
   - SQL/NoSQL 注入（是否使用参数化查询）
   - 缺失的输入验证
   - 不安全的依赖
   - 错误信息是否泄露敏感数据

3. **代码质量 (HIGH)**
   - 函数超过 50 行
   - 文件超过 800 行
   - 嵌套超过 4 层
   - 缺失的 error 处理（静默忽略错误）
   - TODO/FIXME 注释
   - 缺失的公共 API 文档

4. **语言惯用写法 (MEDIUM)**
   - 是否符合项目 `AGENTS.md` Coding Style 中定义的规范
   - 是否遵循 `.antigravity/examples/` 中的模式示例
   - 命名是否一致且有意义
   - 是否利用了语言特性（而非用通用写法硬套）
   - 错误处理是否带有上下文信息

5. **Go 基线规则 (MEDIUM)**
   - 是否符合 effective Go
   - error wrapping with context（`fmt.Errorf("xxx: %w", err)`）
   - 接口定义在使用方（accept interfaces, return structs）
   - context 作为第一个参数
   - 零值是否可用
   - goroutine 是否有 leak 风险（channel 未关闭、缺少 done signal）
   - 并发安全（共享状态是否有 mutex/atomic 保护）

6. **测试覆盖 (MEDIUM)**
   - 新增代码是否有对应测试
   - 测试是否覆盖正常路径 + 边界 + 错误情况
   - 修改的函数是否更新了相关测试

7. **生成报告**：
   - 按严重性排序：CRITICAL → HIGH → MEDIUM → LOW
   - 每个问题标注：文件位置、行号、描述、建议修复
   - 报告头必须包含 review scope

8. **判定结果**：
   - 有 CRITICAL 或 HIGH 问题 → **阻止提交**，必须修复
   - 仅 MEDIUM/LOW → 建议修复，可以提交
