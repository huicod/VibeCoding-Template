---
description: 部署工作流，含 Harness 验证管线、Shadow Mode 和健康检查的完整流程。
---

## Preflight: TARGET_PROJECT 解析与校验

部署前先执行：

1. 从控制面板根目录 `AGENTS.md` 读取 `TARGET_PROJECT`
2. 将其解析为实际代码仓库根目录
3. 校验目录存在，且看起来像可部署项目根目录
4. 向用户回显最终解析路径和目标环境
5. 后续所有验证、构建、镜像生成、部署命令都在 `TARGET_PROJECT` 中执行

若 `TARGET_PROJECT` 缺失、无效，或当前目录只是控制面板仓库，立即停止部署。

生产环境部署的完整流程（含 Harness Engineering 增强）：

## 子命令

```
/deploy            - 交互式部署向导
/deploy check      - 只运行预检（Harness 验证管线）
/deploy staging    - 部署到测试环境
/deploy production - 部署到生产环境（含 Shadow Mode）
/deploy rollback   - 回滚到上一个版本
```

## Step 1: Harness 自动验证（强制）

> [!IMPORTANT]
> **部署前必须全部通过，不可跳过。**

运行项目的 Harness 验证管线（由 `/genesis` 生成的 Makefile 或等效构建脚本）：

1. **Full Verification** — 编译 + 静态分析 + Lint + Race/并发检测 + Coverage + 依赖审计
2. **Security Gate** — 硬编码密钥检测 + 注入模式扫描 + 错误泄露检查
3. **Integration Tests** — 需要外部依赖（DB/Cache 等），启动真实容器测试

**任一步骤失败 → 停止部署，修复后重新运行。**

> ⚠️ 如果项目尚未运行 `/genesis` 生成验证管线，请手动执行等效的编译、测试、安全检查。

## Step 2: 预部署检查清单

```markdown
## 🚀 Pre-Deploy Checklist

### Harness 自动验证（Step 1 已通过）
- [x] Full Verification → PASSED
- [x] Security Gate → PASSED
- [x] Integration Tests → PASSED

### 需人工确认
- [ ] 环境变量已文档化（.env.example）
- [ ] 数据库迁移脚本已准备
- [ ] API 版本号已更新
- [ ] README / CHANGELOG 已更新

### 准备好部署？(y/n)
```

## Step 3: 构建

```bash
# Docker 构建
# 在 TARGET_PROJECT 根目录执行
docker build -t {service-name}:{version} .

# 或项目标准构建命令
# （由 /genesis 生成的 Makefile 或等效脚本）
```

## Step 4: 部署

根据目标平台执行部署：

| 平台 | 命令 | 适用场景 |
|------|------|---------|
| Docker Compose | `docker compose up -d` | 本地/测试环境 |
| Kubernetes | `kubectl apply -f deploy/` | 生产环境 |
| Fly.io | `fly deploy` | 轻量云部署 |
| 自建服务器 | `scp + systemctl restart` | 传统部署 |

## Step 5: Shadow Mode（生产环境推荐）

> 仅在 `/deploy production` 时执行此步骤。

### Shadow 部署检查点

在正式切流之前，执行 Shadow 验证：

1. **部署 Shadow 实例**: 新版本部署但不接真实流量
2. **镜像请求对比**: 将生产流量镜像到 Shadow 实例，对比响应
3. **指标监控**:
   - Error rate < 0.1%
   - P99 latency < 目标值
   - 无 panic / 内存泄漏 / 连接泄漏
4. **观察期**: 至少运行 30 分钟（复杂系统建议 2 小时）
5. **切流**: 通过验证后，逐步切换流量（10% → 50% → 100%）

> [!TIP]
> 如果不需要 Shadow Mode（测试环境或简单服务），跳过此步骤直接进入 Step 6。

## Step 6: 健康检查

```bash
# HTTP 健康检查
curl -f http://{host}:{port}/healthz || echo "FAILED"

# gRPC 健康检查（如适用）
grpc_health_probe -addr={host}:{grpc_port} || echo "FAILED"

# 日志检查
docker logs {container} --tail 50
```

## Step 7: 部署报告

```markdown
## 🚀 部署完成

### 摘要
- **版本:** v{X.Y.Z}
- **环境:** production / staging
- **耗时:** {N} 秒
- **平台:** Docker / K8s / Fly.io

### Harness 验证
✅ Full Verification → PASSED
✅ Security Gate → PASSED
✅ Integration Tests → PASSED

### 端点
- 🌐 HTTP: http://{host}:{port}
- 📡 gRPC: {host}:{grpc_port}

### 健康检查
✅ HTTP /healthz → 200 OK
✅ gRPC health → SERVING
✅ 数据库连接 → OK

### 回滚方案
如需回滚: `/deploy rollback`
上一版本: v{X.Y.Z-1}
```

> **失败处理**：如果任何步骤失败，停止部署、报告错误、记录到 `.vibe/artifacts/error_journal.md`、提供修复建议。
