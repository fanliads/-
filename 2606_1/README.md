# 需求管理系统

## 项目简介

需求管理系统是一个面向产品团队的需全生命周期管理平台，支持原始需求采集、需求分析拆解、迭代规划与任务跟踪。

## 技术栈

### 前端
- Vue 3 + TypeScript
- Vite 5
- Element Plus
- Pinia (状态管理)
- Vue Router 4
- Axios
- SCSS

### 后端（规划中）
- Java / Spring Boot
- MySQL 8.0
- Redis 7

## 当前可用能力

- 外部提报入口：`/external-submit`
- 原始需求详情抽屉：支持展示提交来源、系统分级、缺失字段和人工覆盖信息
- AI 解释增强：支持 `DeepSeek / HTTP 网关 / auto` 三种 Provider 路由模式
- 企业微信通知：支持通过环境变量开启 webhook 通道

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 启动开发环境基础设施

```bash
export MYSQL_ROOT_PASSWORD=change-me
docker-compose -f docker-compose.dev.yml up -d
```

### 前端启动

```bash
cd frontend
npm install
npm run dev
```

访问 http://localhost:5173

### 构建生产版本

```bash
cd frontend
npm run build
```

## GitHub 部署标准流程

代码管理和部署统一遵循下面的规则：

1. 本地开发或开发 agent 修改代码后，必须先提交并推送到 GitHub。
2. 部署 agent 只允许从 GitHub 拉取代码，不直接使用本地目录，不在服务器手改业务代码。
3. 测试环境可以部署 `main`，生产环境建议只部署 `tag` 或固定 `commit`。
4. 生产环境密钥统一放在服务器 `/opt/req-mgmt/shared/.env.production`，不提交到仓库。

推荐命令：

```bash
# 服务器初始化
bash deploy/init-server.sh

# 首次拉取仓库
bash deploy/deploy.sh bootstrap

# 部署测试环境
bash deploy/deploy.sh deploy branch main

# 部署正式版本
bash deploy/deploy.sh deploy tag v1.0.0

# 回滚
bash deploy/deploy.sh rollback v1.0.0
```

详细规范见 [deploy/DEPLOYMENT_WORKFLOW.md](./deploy/DEPLOYMENT_WORKFLOW.md)。

## 环境变量要求

开发环境至少需要：

```bash
export MYSQL_ROOT_PASSWORD=change-me
export DB_PASS=change-me
export JWT_SECRET=change-me-dev-secret
```

生产环境请在服务器 `/opt/req-mgmt/shared/.env.production` 中配置：

```env
MYSQL_ROOT_PASSWORD=replace-with-strong-password
JWT_SECRET=replace-with-a-long-random-secret
DB_USER=root
DB_PASS=replace-with-db-password
DB_HOST=mysql
REDIS_HOST=redis
AI_PRIORITY_ENABLED=false
AI_PRIORITY_PROVIDER=deepseek
AI_PRIORITY_BASE_URL=https://api.deepseek.com
AI_PRIORITY_API_KEY=
AI_PRIORITY_MODEL=deepseek-v4-flash
AI_PRIORITY_GATEWAY_URL=
AI_PRIORITY_TIMEOUT_MS=5000
AI_PRIORITY_RETRY_MAX=1
AI_PRIORITY_MAX_TOKENS=800
WECOM_NOTIFICATION_ENABLED=false
WECOM_NOTIFICATION_WEBHOOK_URL=
WECOM_NOTIFICATION_TIMEOUT_MS=3000
```

`AI_PRIORITY_PROVIDER` 支持：

- `deepseek`
- `http-gateway`
- `auto`

## 项目结构

```
├── frontend/                 # 前端工程
│   ├── src/
│   │   ├── api/             # API 接口定义
│   │   ├── directives/      # 自定义指令
│   │   ├── layouts/         # 布局组件
│   │   ├── router/          # 路由配置
│   │   ├── store/           # 状态管理
│   │   ├── styles/          # 全局样式
│   │   ├── utils/           # 工具函数
│   │   └── views/           # 页面视图
│   ├── index.html
│   ├── vite.config.ts
│   └── package.json
├── docker-compose.dev.yml    # 开发环境 Docker Compose
├── deploy/                   # GitHub 拉取式部署脚本与规范
├── .gitignore
└── README.md
```
