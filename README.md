# Taskroom · 开发练习室

用于验证 Facility → DeepSeek → GitHub PR → CI 的公开练兵项目。不是生产应用。

## 本地运行

要求 Node.js >=22.12、pnpm 11.20.0。无需模型密钥或数据库。

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

打开 http://127.0.0.1:5173。API 为 http://127.0.0.1:4312。任务保存在服务内存，刷新页面保留，重启服务清空。

## 验证

```powershell
pnpm setup
pnpm verify
```

- `pnpm lint`：Biome 检查。
- `pnpm typecheck`：前后端类型检查。
- `pnpm test`：单元和 API 集成测试，不访问外部网络。
- `pnpm test:e2e`：构建后启动独立服务，执行 Chromium 用户流程，失败时保留 trace。
- `pnpm build` / `pnpm start`：构建并从 http://127.0.0.1:4312 提供页面和 API。
- Linux 全新环境运行 `pnpm exec playwright install --with-deps chromium`；依赖下载需要网络，测试执行本身不需要。

## API

`GET /api/tasks` 列表；`POST /api/tasks` 接收 `{ "title": "任务" }`；
`PATCH /api/tasks/:id` 接收 `{ "completed": true }`；`DELETE /api/tasks/:id` 删除。
标题去除两端空白，必须为 1–120 个字符。`GET /healthz` 返回健康状态。

本服务不带认证，仅用于回环地址上的虚构测试数据，不要直接暴露到公网。

## Facility 接入

连接此仓库，使用平台执行通道，不执行 `facility init` 安装重复代理工作流。
安装命令：`pnpm install --frozen-lockfile`。
环境准备：`pnpm setup`。
检查命令：`pnpm lint`、`pnpm typecheck`、`pnpm test`、`pnpm test:e2e`。
平台 sandbox 需有 Chromium 的 Linux 系统依赖；GitHub CI 已独立安装。

模型凭据仅配置在本地 Facility，不进入本仓库、页面或 Actions secrets。
使用未定价模型时，Facility 中费用为零不代表 DeepSeek 不收费。
首轮仅手工启动；不启用无人值守调度、自动合并或生产部署。

## 第一条练习 Issue

标题：`feat: 增加任务标题关键词搜索`

验收条件：在任务列表上方增加搜索框；大小写不敏感的标题子串匹配；与状态筛选同时生效；
空关键词恢复当前状态列表；无结果显示明确空状态；补充单元和浏览器回归测试；`pnpm verify` 全绿。
基线故意不实现搜索，先由 Facility 提出方案，经人批准后再修改。

## GitHub 设置

CI 不需要任何密钥。初次全绿后保护 `main`：要求 PR、1 位人工批准、`verify` 检查通过、分支保持最新；
禁止强推/删除，不给 Facility App 绕过权限。PR 最终由人合并。
