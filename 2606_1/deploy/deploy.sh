#!/bin/bash
# GitLab-based deployment script
# Usage:
#   bash deploy.sh bootstrap
#   bash deploy.sh deploy branch main
#   bash deploy.sh deploy tag v1.0.0
#   bash deploy.sh deploy commit <sha>
#   bash deploy.sh rollback <ref>
#   bash deploy.sh status
#   bash deploy.sh logs
#   bash deploy.sh backup

set -euo pipefail

PROJECT_DIR="${PROJECT_DIR:-/opt/req-mgmt}"
REPO_URL="${REPO_URL:-http://192.168.10.122/product/requirement_management.git}"
# GitLab Personal Access Token authentication
# Set GITLAB_USER and GITLAB_TOKEN in environment or in .env file
# The clone URL will be constructed as: http://<user>:<token>@192.168.10.122/product/requirement_management.git
GITLAB_USER="${GITLAB_USER:-fanli}"
GITLAB_TOKEN="${GITLAB_TOKEN:-}"
DEFAULT_BRANCH="${DEFAULT_BRANCH:-main}"
DEPLOY_LOG="${DEPLOY_LOG:-/opt/req-mgmt/shared/deploy-history.log}"
ENV_FILE="${ENV_FILE:-/opt/req-mgmt/shared/.env.production}"
COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.yml}"

# Build authenticated repo URL for GitLab
build_repo_url() {
  # Load GITLAB_USER and GITLAB_TOKEN from env file if not already set
  if [ -z "$GITLAB_USER" ] || [ -z "$GITLAB_TOKEN" ]; then
    if [ -f "$ENV_FILE" ]; then
      set -a
      . "$ENV_FILE"
      set +a
    fi
  fi
  if [ -n "$GITLAB_USER" ] && [ -n "$GITLAB_TOKEN" ]; then
    echo "http://${GITLAB_USER}:${GITLAB_TOKEN}@192.168.10.122/product/requirement_management.git"
  else
    echo "$REPO_URL"
  fi
}

mkdir -p "$(dirname "$DEPLOY_LOG")"

require_repo() {
  if [ ! -d "$PROJECT_DIR/.git" ]; then
    echo "Repository not found at $PROJECT_DIR"
    echo "Run: bash deploy.sh bootstrap"
    exit 1
  fi
}

record_deploy() {
  local ref_type="$1"
  local ref_name="$2"
  local commit_id
  commit_id="$(git rev-parse HEAD)"
  printf '%s %s %s %s\n' "$(date '+%F %T')" "$ref_type" "$ref_name" "$commit_id" >> "$DEPLOY_LOG"
}

compose_cmd() {
  if docker compose version >/dev/null 2>&1; then
    docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
  else
    docker-compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"
  fi
}

bootstrap_repo() {
  mkdir -p "$PROJECT_DIR"
  if [ ! -d "$PROJECT_DIR/.git" ]; then
    git clone "$(build_repo_url)" "$PROJECT_DIR"
  fi
  # Configure credential helper to store token for subsequent pulls
  if [ -n "$GITLAB_USER" ] && [ -n "$GITLAB_TOKEN" ]; then
    git -C "$PROJECT_DIR" remote set-url origin "$(build_repo_url)"
  fi
}

checkout_ref() {
  local ref_type="$1"
  local ref_name="$2"

  cd "$PROJECT_DIR"
  git fetch --all --tags --prune

  case "$ref_type" in
    branch)
      git checkout "$ref_name"
      git pull --ff-only origin "$ref_name"
      ;;
    tag)
      git checkout "tags/$ref_name"
      ;;
    commit)
      git checkout "$ref_name"
      ;;
    *)
      echo "Unsupported ref type: $ref_type"
      exit 1
      ;;
  esac
}

build_and_start() {
  cd "$PROJECT_DIR"
  compose_cmd down
  compose_cmd build --pull
  compose_cmd up -d
  compose_cmd ps
}

case "${1:-status}" in
  bootstrap)
    bootstrap_repo
    echo "Repository ready at $PROJECT_DIR"
    ;;
  deploy)
    require_repo
    REF_TYPE="${2:-branch}"
    REF_NAME="${3:-$DEFAULT_BRANCH}"
    checkout_ref "$REF_TYPE" "$REF_NAME"
    build_and_start
    record_deploy "$REF_TYPE" "$REF_NAME"
    echo "Deployed $REF_TYPE $REF_NAME"
    ;;
  rollback)
    require_repo
    REF_NAME="${2:?Usage: bash deploy.sh rollback <tag-or-commit>}"
    if git -C "$PROJECT_DIR" rev-parse "refs/tags/$REF_NAME" >/dev/null 2>&1; then
      checkout_ref tag "$REF_NAME"
      build_and_start
      record_deploy tag "$REF_NAME"
    else
      checkout_ref commit "$REF_NAME"
      build_and_start
      record_deploy commit "$REF_NAME"
    fi
    echo "Rolled back to $REF_NAME"
    ;;
  status)
    require_repo
    cd "$PROJECT_DIR"
    echo "Current branch/ref:"
    git status --short --branch
    echo
    echo "Current commit:"
    git rev-parse HEAD
    echo
    echo "Recent deploy history:"
    tail -n 10 "$DEPLOY_LOG" 2>/dev/null || true
    ;;
  logs)
    require_repo
    cd "$PROJECT_DIR"
    compose_cmd logs -f --tail=100
    ;;
  backup)
    require_repo
    cd "$PROJECT_DIR"
    mkdir -p /opt/req-mgmt/shared/backup
    BACKUP_FILE="/opt/req-mgmt/shared/backup/req_mgmt_$(date +%Y%m%d_%H%M%S).sql"
    set -a
    . "$ENV_FILE"
    set +a
    compose_cmd exec -T mysql mysqldump -uroot -p"${MYSQL_ROOT_PASSWORD}" req_mgmt > "$BACKUP_FILE"
    echo "Backup completed: $BACKUP_FILE"
    ;;
  *)
    echo "Usage:"
    echo "  bash deploy.sh bootstrap"
    echo "  bash deploy.sh deploy [branch <name>|tag <name>|commit <sha>]"
    echo "  bash deploy.sh rollback <tag-or-commit>"
    echo "  bash deploy.sh status"
    echo "  bash deploy.sh logs"
    echo "  bash deploy.sh backup"
    exit 1
    ;;
esac
