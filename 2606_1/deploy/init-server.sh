#!/bin/bash
# 阿里云 ECS 初始化脚本
# 使用方法: bash init-server.sh

set -e

echo "=== 安装 Docker ==="
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "=== 安装 Docker Compose ==="
curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
chmod +x /usr/local/bin/docker-compose

echo "=== 创建项目目录 ==="
mkdir -p /opt/req-mgmt
mkdir -p /opt/req-mgmt/logs
mkdir -p /opt/req-mgmt/backup

echo "=== 配置防火墙 ==="
# 开放 80 和 443 端口
firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo "=== 初始化完成 ==="
echo "请将项目代码上传到 /opt/req-mgmt 目录"
echo "然后执行: cd /opt/req-mgmt && docker-compose up -d"
