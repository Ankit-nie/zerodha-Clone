# TradeX DevOps Guide — CI/CD, Docker, GitFlow & GitHub Actions

This document explains the complete DevOps implementation in the **TradeX** repository and provides step-by-step commands for demonstrating each component live.

---

## 1. Containerization (Docker & Docker Compose)

Each service is containerized using production best practices:

- **`Backend/Dockerfile`**
  - Base image: `node:20-alpine`
  - Installs production dependencies only (`npm ci --omit=dev`) with layer caching on `package*.json`
  - Runs as non-root user (`USER node`)
  - Includes Docker `HEALTHCHECK` calling `GET /health`
- **`Frontend/Dockerfile` & `dashboard/Dockerfile`**
  - **Multi-stage builds**: Stage 1 (`node:20-alpine`) compiles the React bundle; Stage 2 (`nginx:1.27-alpine`) serves only static assets (tiny, secure production image)
  - Custom `nginx.conf` with SPA `try_files` fallback, gzip compression, static caching, and `/healthz` health check
- **`docker-compose.yml`**
  - Orchestrates `mongo`, `backend`, `frontend`, and `dashboard` on a dedicated bridge network (`tradex-network`)
  - Persists MongoDB data in named volume `mongo_data`
  - Uses `depends_on` with `condition: service_healthy` so services start in the proper order

### Docker Demo Commands
```bash
# Validate compose configuration
docker compose config

# Build and start all 4 containers
docker compose up --build -d

# Show running services and health status
docker compose ps

# Inspect Backend health endpoint
curl http://localhost:3002/health

# View logs
docker compose logs -f backend

# Tear down containers (keep MongoDB volume)
docker compose down
```

---

## 2. GitFlow Branching Model

TradeX follows the standard **GitFlow** workflow:

```text
main         ──●─────────────────────────●────────── (production + vX.Y.Z tags)
                \                       /
release/v1.0.0   \              ●──────●
                  \            /
develop      ──────●────●─────●───────────────────── (integration / staging)
                         \   /
feature/xyz               ●─●                        (short-lived features)
```

| Branch Pattern | Purpose | Branched From | Merged Into |
| --- | --- | --- | --- |
| `main` | Production-ready code, tagged `v*.*.*` | — | — |
| `develop` | Integration / staging branch | `main` | `main` (via `release/*`) |
| `feature/<name>` | New features & enhancements | `develop` | `develop` (via PR) |
| `bugfix/<name>` | Non-urgent bug fixes | `develop` | `develop` (via PR) |
| `release/v<x.y.z>` | Release preparation & final testing | `develop` | `main` and `develop` |
| `hotfix/<name>` | Urgent production fixes | `main` | `main` and `develop` |

---

## 3. GitHub Actions Workflows (`.github/workflows/`)

| Workflow File | Trigger | What It Does |
| --- | --- | --- |
| **`ci.yml`** | Push to `main`, `develop`, `feature/**`, `bugfix/**`, `release/**`, `hotfix/**` and PRs to `main`/`develop` | Runs Backend lint + unit/API tests, Frontend Jest tests + build, Dashboard Jest tests + build, uploads build artifacts, validates `docker-compose.yml`, builds all 3 Docker images with Buildx cache, and produces a DevSecOps `npm audit` summary |
| **`cd.yml`** | Push to `main`, `develop`, `v*.*.*` tags, or manual trigger | Builds & pushes Docker images (`tradex-backend`, `tradex-frontend`, `tradex-dashboard`) to GitHub Container Registry (`ghcr.io`), tags by branch/SHA/semver, triggers optional Render deploy hooks on production, and outputs a deployment summary |
| **`gitflow-guard.yml`** | Pull Requests targeting `main` or `develop` | Automatically enforces GitFlow rules (blocks invalid merges such as `feature/* -> main`) |
| **`release.yml`** | Push of version tags (`v*.*.*`) | Automatically creates a GitHub Release with generated release notes and GHCR image links |

---

## 4. Step-by-Step Live Demo Script (For Presentation / Viva)

### Step A — Push GitFlow Branches to GitHub
```bash
git push -u origin develop
git push -u origin main
```

### Step B — Demonstrate Feature Branch + PR + CI + GitFlow Guard
```bash
git checkout develop
git checkout -b feature/demo-devops-check
# Make a small edit (e.g., README or comment), then commit & push:
git add .
git commit -m "chore: demonstrate GitFlow feature PR"
git push -u origin feature/demo-devops-check
```
1. Open a Pull Request on GitHub from `feature/demo-devops-check` -> `develop`.
2. Show the **GitFlow Branch Policy Guard** passing and the **CI Pipeline** (Backend, Frontend, Dashboard, Docker Verify, Security Audit) running in parallel and turning green.
3. (Optional) Show what happens if you try to target `main` directly from `feature/*` — **GitFlow Guard** automatically blocks it!
4. Merge the PR into `develop` -> Watch **CD Pipeline** automatically build & push staging Docker images to `ghcr.io`!

### Step C — Demonstrate Release & Production Deployment
```bash
git checkout develop
git pull origin develop
git checkout -b release/v1.0.0
git push -u origin release/v1.0.0
```
1. Open a PR from `release/v1.0.0` -> `main` and merge it.
2. Tag the production release on `main`:
   ```bash
   git checkout main
   git pull origin main
   git tag -a v1.0.0 -m "Release v1.0.0 - TradeX DevOps CI/CD & Docker"
   git push origin v1.0.0
   ```
3. Show:
   - **CD Pipeline** publishing `v1.0.0` and `latest` Docker images to GitHub Container Registry (`Packages` tab).
   - **Automated GitHub Release** creating `TradeX v1.0.0` in the `Releases` tab.

### Optional: Automatic Render Deployment via Secrets
In GitHub Repository **Settings -> Secrets and variables -> Actions**, you may optionally add:
- `RENDER_BACKEND_DEPLOY_HOOK`
- `RENDER_FRONTEND_DEPLOY_HOOK`
- `RENDER_DASHBOARD_DEPLOY_HOOK`

When configured, pushes to `main` automatically redeploy all three Render services after Docker images are built and pushed.
