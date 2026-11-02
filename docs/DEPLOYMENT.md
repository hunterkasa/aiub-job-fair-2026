# Deployment Topology & Guide

---

## 1. Overview
The platform supports three primary deployment configurations:
1. **Local Development (No Docker or with Docker Compose):** Fast iteration with hot reload.
2. **Review & Authority Prototype (Free Tiers):** Vercel (Web) + Render (API) + Neon (PostgreSQL).
3. **Production VPS / AIUB Server Handover:** Single Ubuntu VPS running `deploy/docker-compose.prod.yml` with Caddy (Auto-HTTPS).

---

## 2. Review Phase: Free Tier Setup
To show the prototype to AIUB authorities before purchasing hosting:
1. **Database:** Create a free project on [Neon.tech](https://neon.tech) and copy the PostgreSQL connection string (`docs/guides/04-database-hosting.md`).
2. **Backend API:** Create a free Web Service on [Render.com](https://render.com) pointing to `apps/api/Dockerfile` (`docs/guides/07-deploy-api.md`). Add the Neon connection string in environment variables.
3. **Frontend Web:** Import the repository into [Vercel.com](https://vercel.com) with root directory set to `apps/web` (`docs/guides/08-deploy-web.md`). Set `API_INTERNAL_URL` to your Render API URL.

---

## 3. Production Phase: Single-VPS Deployment (Contabo / AIUB On-Campus Server)
When AIUB gives the green light to deploy on their server or a VPS:
1. Provision an Ubuntu 24.04/22.04 LTS server.
2. Install Docker & Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com -o get-docker.sh
   sh get-docker.sh
   ```
3. Clone the repo and navigate to `/deploy`:
   ```bash
   cd deploy
   cp ../.env.example .env
   # Edit .env with your production domain, passwords, and SMTP credentials:
   nano .env
   ```
4. Start the stack:
   ```bash
   docker compose -f docker-compose.prod.yml --env-file .env up -d
   ```
5. Caddy automatically provisions and renews SSL certificates from Let's Encrypt for your domain.

---

## 4. Health Endpoints for Monitoring
* `GET /health/live`: Process liveness check (HTTP 200).
* `GET /health/ready`: Database connectivity check (HTTP 200 when ready, HTTP 503 if DB is unreachable).
* Point any uptime monitor (UptimeRobot or Better Stack) to `https://<YOUR-DOMAIN>/health/live`.
