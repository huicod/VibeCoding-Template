# .antigravity/examples/ — 代码模式示例

> AI 看得到示例后，实现质量会大幅提高。把你希望 AI 参考的代码模式放在这里。

## 怎么用

在 prompt 中引用：
```
请参考 @.antigravity/examples/ 中的代码模式实现类似功能。
不要直接复制，理解模式后按当前需求实现。
```

## 应该放什么

| 类型 | 示例 | 说明 |
|------|------|------|
| 项目结构 | `.antigravity/examples/kratos-layout/` | 展示目录组织方式 |
| API 定义 | `.antigravity/examples/todo.proto` | Protobuf API 规范示例 |
| 业务逻辑 | `.antigravity/examples/biz/greeter.go` | 典型的 biz 层写法 |
| 数据访问 | `.antigravity/examples/data/greeter.go` | 典型的 data 层写法 |
| 测试模式 | `.antigravity/examples/biz/greeter_test.go` | table-driven test 示例 |
| 错误处理 | `.antigravity/examples/errors/errors.go` | Kratos 错误码定义方式 |
| Wire DI | `.antigravity/examples/wire/wire.go` | Wire 依赖注入示例 |

## 原则

- **不要复制粘贴**——示例是模式参考，不是复制源
- **保持精简**——每个示例文件 <100 行
- **标注重点**——用 `// PATTERN:` 和 `// CRITICAL:` 注释标注关键模式
