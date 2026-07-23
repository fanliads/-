# v1.2.0 部署速查

## 制品

- `req-mgmt-backend-v1.2.0.jar`：Spring Boot 可执行 JAR。
- `req-mgmt-frontend-v1.2.0.tar.gz`：已构建的静态站点，解压后将 `dist/` 部署到 Nginx。
- `req-mgmt-source-v1.2.0.tar.gz`：用于 Docker Compose 或复现构建的源码快照。

## 后端直接启动

```bash
export DB_HOST=mysql-host
export DB_USER=req_mgmt
export DB_PASS='replace-me'
export REDIS_HOST=redis-host
export JWT_SECRET='replace-with-a-long-random-secret'
java -jar req-mgmt-backend-v1.2.0.jar --spring.profiles.active=prod
```

首次启动会自动校验并执行 Flyway V19。升级生产数据库前请先备份。

## 前端

构建时可选配置：

```bash
VITE_API_BASE_URL=/api
VITE_EXTERNAL_SUBMIT_URL=https://your-domain.example/external-submit?channel=qrcode
```

未配置 `VITE_EXTERNAL_SUBMIT_URL` 时，二维码自动使用当前浏览器域名。

## 上线冒烟

1. 登录和权限信息可正常加载。
2. 原始需求池、产品需求池和我的工作可打开。
3. 未登录访问 `/external-submit` 不跳转登录。
4. 外部提交返回受理编号，后台出现唯一外部来源记录。
5. 数据库 `flyway_schema_history` 最新版本为 19。
