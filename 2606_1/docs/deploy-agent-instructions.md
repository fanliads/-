# 部署 Agent 执行指令

## 目标

指导部署 agent 按指定版本发布需求管理系统，并在发布后完成基础验证与必要回滚。

## 当前正式发布版本

```text
v1.0.0
```

## 一、发布前检查

部署前请确认以下条件全部满足：

- 服务器已能访问代码仓库
- 应用目录存在：`/opt/req-mgmt/app`
- 生产配置文件存在：`/opt/req-mgmt/shared/.env.production`
- 生产配置已填写完成
- Docker、MySQL、Redis 运行正常

重点确认的配置项：

- `MYSQL_ROOT_PASSWORD`
- `DB_USER`
- `DB_PASS`
- `DB_HOST`
- `REDIS_HOST`
- `JWT_SECRET`

## 二、正式发布命令

在生产服务器执行：

```bash
cd /opt/req-mgmt/app

git fetch --all --tags
git checkout tags/v1.0.0

bash deploy/deploy.sh deploy tag v1.0.0
```

## 三、发布后检查命令

发布完成后执行：

```bash
cd /opt/req-mgmt/app

bash deploy/deploy.sh status
bash deploy/deploy.sh logs
```

## 四、发布后验收项

请至少确认以下内容：

- 服务已启动
- 日志无明显致命错误
- 登录功能正常
- 核心页面可访问
- 本次改动涉及的关键功能正常

## 五、发布失败时的回滚命令

如果发布后出现严重问题，回滚到上一个稳定版本：

```bash
cd /opt/req-mgmt/app

git fetch --all --tags
git checkout tags/<rollback-version>

bash deploy/deploy.sh rollback <rollback-version>
```

示例：

```bash
bash deploy/deploy.sh rollback v0.9.9
```

## 六、回滚后的检查

回滚后请再次执行：

```bash
cd /opt/req-mgmt/app

bash deploy/deploy.sh status
bash deploy/deploy.sh logs
```

并确认：

- 服务已经恢复
- 核心业务恢复正常
- 日志无持续性严重错误

## 七、执行记录模板

```text
执行环境：
发布版本：
执行时间：
执行人：
发布结果：
是否回滚：
回滚版本：
备注：
```
