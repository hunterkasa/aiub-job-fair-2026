# Deployment Topology & Guide

---

## 1. Overview
The platform supports three streamlined deployment configurations:
1. **Local Development:** Fast iteration with Next.js Turbopack and Prisma ORM (`apps/web`).
2. **Review & Authority Prototype (100% Free Tiers):** Vercel or Netlify (Full-Stack Next.js Web + Route Handlers) + Neon (Serverless PostgreSQL).
3. **Production VPS / AIUB Server Handover:** Single Ubuntu VPS or AIUB server running `deploy/docker-compose.prod.yml` with Caddy (Auto-HTTPS).

---

## 2. Review Phase: 100% Free Tier Setup (Vercel / Netlify + Neon)
To demonstrate the working platform to AIUB authorities before acquiring an institutional budget:

1. **Database (Neon Serverless PostgreSQL):**
   * Create a free project on [Neon.tech](https://neon.tech).
   * Copy the connection string (format: `postgresql://username:password@ep-xyz.us-east-2.aws.neon.tech/aiub_jobfair?sslmode=require`).
2. **Push Schema & Seed:**
   * Locally, run:
     ```bash
     cd apps/web
     export DATABASE_URL="<your-neon-connection-string>"
     npx prisma db push
     npm run seed
     ```
3. **Full-Stack Hosting (Vercel or Netlify):**
   * Connect your GitHub repo to **Vercel** or **Netlify**.
   * Set **Root Directory** to `apps/web`.
   * Set Environment Variables:
     * `DATABASE_URL`: Your Neon connection string
     * `JWT_SECRET`: Random 32+ character string
     * `NEXTAUTH_URL`: `https://your-project.vercel.app`
   * Trigger deploy. Both frontend pages and all backend `/api/v1/...` route handlers will be deployed and active under a single HTTPS domain.

---

## 3. Production Phase: Single-VPS Deployment (Contabo / AIUB On-Campus Server)
When AIUB gives the green light to deploy on their server or a dedicated VPS:
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
   docker compose -f docker-compose.prod.yml --env-file .env up -d --build
   ```
5. Caddy automatically provisions and renews SSL certificates from Let's Encrypt for your domain.

---

## 4. Health Endpoints for Monitoring
* `GET /api/v1/health/live`: Process liveness check (HTTP 200).
* `GET /api/v1/health/ready`: Database connectivity check (HTTP 200 when ready, HTTP 503 if DB is unreachable).
* `GET /api/v1/info`: System info and server timestamp.
* Point any uptime monitor (UptimeRobot, Better Stack, or AIUB NOC) to `https://<YOUR-DOMAIN>/api/v1/health/live`.
