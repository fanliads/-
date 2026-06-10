#!/bin/bash
# 部署/更新脚本
# 使用方法: bash deploy.sh [build|restart|stop|logs|backup]

set -e
PROJECT_DIR="/opt/req-mgmt"
cd "$PROJECT_DIR"

case "${1:-build}" in
  build)
    echo "=== 构建并启动服务 ==="
    docker-compose down
    docker-compose build --no-cache
    docker-compose up -d
    echo "=== 等待服务启动 ==="
    sleep 10
    docker-compose ps
    echo "=== 部署完成 ==="
    ;;
  restart)
    echo "=== 重启服务 ==="
    docker-compose restart
    ;;
  stop)
    echo "=== 停止服务 ==="
    docker-compose down
    ;;
  logs)
    docker-compose logs -f --tail=100
    ;;
  backup)
    echo "=== 备份数据库 ==="
    BACKUP_FILE="backup/req_mgmt_$(date +%Y%m%d_%H%M%S).sql"
    docker-compose exec -T mysql mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD:-ReqMgmt2024!}" req_mgmt > "$BACKUP_FILE"
    echo "备份完成: $BACKUP_FILE"
    ;;
  *)
    echo "用法: deploy.sh [build|restart|stop|logs|backup]"
    ;;
esac
