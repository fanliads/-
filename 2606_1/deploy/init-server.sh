#!/bin/bash
# Server bootstrap for GitHub-based deployments
# Usage: bash init-server.sh

set -euo pipefail

BASE_DIR="/opt/req-mgmt"
APP_DIR="$BASE_DIR/app"
SHARED_DIR="$BASE_DIR/shared"
ENV_FILE="$SHARED_DIR/.env.production"

echo "=== Install Docker ==="
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker

echo "=== Install Docker Compose plugin if needed ==="
mkdir -p /usr/local/lib/docker/cli-plugins
if ! docker compose version >/dev/null 2>&1; then
  curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-$(uname -m)" \
    -o /usr/local/lib/docker/cli-plugins/docker-compose
  chmod +x /usr/local/lib/docker/cli-plugins/docker-compose
fi

echo "=== Install Git ==="
if command -v yum >/dev/null 2>&1; then
  yum install -y git
elif command -v apt-get >/dev/null 2>&1; then
  apt-get update
  apt-get install -y git
fi

echo "=== Prepare directories ==="
mkdir -p "$APP_DIR" "$SHARED_DIR/backup"

if [ ! -f "$ENV_FILE" ]; then
  cat > "$ENV_FILE" <<'EOF'
MYSQL_ROOT_PASSWORD=change-me
JWT_SECRET=change-me-to-a-long-random-string
EOF
fi

echo "=== Configure firewall ==="
firewall-cmd --permanent --add-port=80/tcp 2>/dev/null || true
firewall-cmd --permanent --add-port=443/tcp 2>/dev/null || true
firewall-cmd --reload 2>/dev/null || true

echo "=== Initialization completed ==="
echo "1. Configure GitHub credentials on the server."
echo "2. Update $ENV_FILE with production secrets."
echo "3. Run: cd $APP_DIR && bash ../app/deploy/deploy.sh bootstrap"
echo "4. Deploy with: bash $APP_DIR/deploy/deploy.sh deploy branch main"
