# GitHub Standard Deployment Workflow

## Goal

Keep GitHub as the only source of truth and make every deployment traceable to a branch, tag, or commit.

## Roles

- Development agent or developer:
  - edits code locally
  - verifies locally
  - commits and pushes to GitHub
- Deployment agent:
  - never edits business code on the server
  - only pulls from GitHub
  - deploys a branch, tag, or commit

## Rules

1. All code changes must be committed to GitHub before deployment.
2. The server must not contain manual code-only hotfixes.
3. Production should deploy `tag` or fixed `commit`, not uncontrolled latest code.
4. Environment secrets must live in `/opt/req-mgmt/shared/.env.production`, not in the repository.
5. Every deployment must be recoverable by re-deploying a previous tag or commit.

Runtime integration flags should also be injected from `/opt/req-mgmt/shared/.env.production`, including:

- `AI_PRIORITY_PROVIDER`
- `AI_PRIORITY_ENABLED`
- `AI_PRIORITY_API_KEY`
- `AI_PRIORITY_GATEWAY_URL`
- `WECOM_NOTIFICATION_ENABLED`
- `WECOM_NOTIFICATION_WEBHOOK_URL`

## Recommended Branching

- `main`: integrated code for daily development and test deployment
- `vX.Y.Z` tags: production release points

## Release Process

1. Developer or development agent finishes code locally.
2. Push changes to GitHub.
3. Verify the target commit on GitHub.
4. For production, create a release tag such as `v1.0.0`.
5. Deployment agent runs deployment against that exact branch, tag, or commit.

## Deployment Commands

Server initialization:

```bash
cd /opt/req-mgmt/app
bash deploy/init-server.sh
```

First-time repository bootstrap:

```bash
cd /opt/req-mgmt/app
bash deploy/deploy.sh bootstrap
```

Deploy development or test environment from `main`:

```bash
cd /opt/req-mgmt/app
bash deploy/deploy.sh deploy branch main
```

Deploy production from a tag:

```bash
cd /opt/req-mgmt/app
bash deploy/deploy.sh deploy tag v1.0.0
```

Deploy a fixed commit:

```bash
cd /opt/req-mgmt/app
bash deploy/deploy.sh deploy commit <commit-sha>
```

Rollback:

```bash
cd /opt/req-mgmt/app
bash deploy/deploy.sh rollback v1.0.0
```

Check current deployment:

```bash
cd /opt/req-mgmt/app
bash deploy/deploy.sh status
```

## Version Consistency Guarantees

This workflow avoids code mismatch because:

- local folders are not deployed directly
- GitHub is the only code source
- deployment always points to an explicit ref
- deployment history is recorded
- rollback uses the same mechanism as release

## Current Project Notes

- Repository URL: `https://github.com/fanliads/-.git`
- Suggested server app path: `/opt/req-mgmt/app`
- Suggested shared config path: `/opt/req-mgmt/shared/.env.production`

## Remaining Risk To Fix

This repository still contains some default passwords in project config files such as `docker-compose.yml` and `application-dev.yml`.
For a public or semi-public repository, replace them with environment variables only.
