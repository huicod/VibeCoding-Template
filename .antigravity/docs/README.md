# .antigravity/docs/ — 原始设计文档

> 把你自己的设计文档放在这里，AI 在 `/genesis` 或 `/plan` 时会读取参考。

## 放什么

| 文档类型 | 示例 |
|---------|------|
| 架构设计 | `comment-system.pdf` |
| API 规格 | `api-spec.md` |
| 数据库 ER 图 | `er-diagram.png` |
| 产品需求 | `requirements.md` |
| 参考资料 | `kratos-guide.md` |

## 怎么让 AI 读

在 prompt 中引用：
```
请阅读 .antigravity/docs/ 下的设计文档，基于它运行 /genesis。
```
