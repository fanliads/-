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

## 快速开始

### 环境要求
- Node.js >= 18
- npm >= 9

### 启动开发环境基础设施

```bash
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
├── .gitignore
└── README.md
```
