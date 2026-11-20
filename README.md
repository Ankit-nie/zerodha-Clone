# TradeX — Full-Stack Stock Trading Platform (DevOps Ready)

[![CI/CD Pipeline](https://github.com/Ankit-nie/zerodha-Clone/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/Ankit-nie/zerodha-Clone/actions/workflows/ci-cd.yml)
[![GitFlow Guard](https://github.com/Ankit-nie/zerodha-Clone/actions/workflows/gitflow-guard.yml/badge.svg)](https://github.com/Ankit-nie/zerodha-Clone/actions/workflows/gitflow-guard.yml)
[![Release](https://github.com/Ankit-nie/zerodha-Clone/actions/workflows/release.yml/badge.svg)](https://github.com/Ankit-nie/zerodha-Clone/actions/workflows/release.yml)

TradeX is a full-stack trading web application built with **Node.js / Express**, **MongoDB**, and **React** (Landing Frontend + Trading Dashboard), containerized with **Docker & Docker Compose** and automated with **GitHub Actions CI/CD** and **GitFlow**.

---

## Architecture

| Service | Tech Stack | Local / Docker Port | Health Endpoint |
| --- | --- | --- | --- |
| **Frontend** | React + Nginx (multi-stage) | `http://localhost:3000` | `GET /healthz` |
| **Dashboard** | React + Chart.js + MUI + Nginx | `http://localhost:3001` | `GET /healthz` |
| **Backend** | Node.js + Express + Mongoose | `http://localhost:3002` | `GET /health` |
| **MongoDB** | MongoDB 7 (persistent volume) | `localhost:27017` | `mongosh ping` |

---

## Quick Start with Docker Compose

1. Copy the environment template (optional — sensible local defaults are built into `docker-compose.yml`):
   ```bash
   cp .env.example .env
   ```
2. Build and start the entire stack:
   ```bash
   docker compose up --build -d
   ```
3. Verify container health:
   ```bash
   docker compose ps
   curl http://localhost:3002/health
   ```
4. Open the apps:
   - **Landing / Auth:** `http://localhost:3000`
   - **Trading Dashboard:** `http://localhost:3001`
   - **Backend API:** `http://localhost:3002`
5. Stop containers:
   ```bash
   docker compose down
   ```

---

## Running Tests Locally

```bash
# Backend syntax check & unit/HTTP tests
cd Backend && npm run lint && npm test

# Frontend React tests
cd Frontend && CI=true npm test -- --watchAll=false

# Dashboard React tests
cd dashboard && CI=true npm test -- --watchAll=false
```

---

## DevOps: CI/CD, GitFlow & GitHub Actions

See **[DEVOPS.md](./DEVOPS.md)** for the complete guide covering:
- Multi-stage Dockerfiles & Docker Compose networking/healthchecks
- GitFlow branching strategy (`main`, `develop`, `feature/*`, `release/*`, `hotfix/*`)
- All 4 GitHub Actions workflows (`ci.yml`, `cd.yml`, `gitflow-guard.yml`, `release.yml`)
- Step-by-step live demo commands for evaluation

<!-- DevOps Demo -->
