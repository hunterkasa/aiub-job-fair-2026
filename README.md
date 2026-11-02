# AIUB Job Fair 2026 — Registration & Job-Matching Platform

> **"Let's Build Your Future Together"**  
> Official platform for American International University-Bangladesh (AIUB) Job Fair 2026. Designed for zero-vendor lock-in, mobile-first student accessibility, and seamless handover to AIUB IT infrastructure.

---

## 5-Minute Local Quickstart

### Prerequisites
* [.NET 10 LTS SDK](https://dotnet.microsoft.com/download)
* [Node.js 22+ LTS](https://nodejs.org/)
* Git

### 1. Clone & Set Environment
```bash
git clone <repo-url>
cd "aiub job fair"
cp .env.example .env
```

### 2. Run the Backend API (.NET 10)
```powershell
cd apps/api/src/Api
dotnet run
```
* API runs at `http://localhost:5000`
* Swagger/OpenAPI: `http://localhost:5000/openapi/v1.json`
* Liveness Healthcheck: `http://localhost:5000/health/live`
* System Info: `http://localhost:5000/api/v1/info`

### 3. Run the Frontend Web (Next.js)
In a second terminal window:
```powershell
cd apps/web
npm install
npm run dev
```
* Web application runs at `http://localhost:3000` (mobile-first responsive view at 360px+).

---

## Running with Docker (Alternative)
```bash
docker compose up -d
```
Spins up PostgreSQL, ASP.NET Core API, and Next.js Web on ports 5432, 5000, and 3000 respectively.

---

## Project Structure
```
/apps
  /web                      Next.js App Router (TypeScript, Tailwind CSS, TanStack Query)
  /api
    /src
      Domain                Core entities, enums, zero external dependencies
      Application           Use cases, FluentValidation, interfaces (IUnitOfWork, IFileStorage, IEmailSender)
      Infrastructure        EF Core DbContext, Identity, storage & email services
      Infrastructure.Migrations.PostgreSql   PostgreSQL EF Core migrations
      Infrastructure.Migrations.SqlServer    SQL Server EF Core migrations
      Api                   Minimal API endpoints, ProblemDetails, Serilog, health checks
    /tests
      Api.Tests             Integration tests (WebApplicationFactory)
      Application.Tests     Business rules & provider switch tests
/deploy
  docker-compose.yml        Local development compose
  docker-compose.prod.yml   Production single-VPS stack with Caddy
  Caddyfile                 Automated HTTPS reverse proxy
  scripts/                  backup.sh and restore.sh
/docs
  ARCHITECTURE.md           Clean architecture & patterns
  DEPLOYMENT.md             Vercel, Render, and VPS deployment procedures
  DEPENDENCIES.md           Verified free tier limits and replacement steps
  DECISIONS.md              Architectural Decision Records (ADRs)
  ADMIN_GUIDE.md            Non-technical guide for administrators
  RUNBOOK.md                Operational emergency procedures & backups
  guides/                   Step-by-step prerequisite tutorials (01 to 09)
```

---

## Automated Tests & Verification
Run the complete backend test suite:
```powershell
dotnet test apps/api/AIUB.JobFair.sln
```

Build the frontend for production:
```powershell
cd apps/web && npm run build
```

---

## Documentation & Guides Index
* [Guide 01: Dev Environment Setup](docs/guides/01-dev-environment.md)
* [Guide 02: GitHub Repo & Automated CI](docs/guides/02-github-repo-and-ci.md)
* [Guide 03: Domain & DNS Configuration](docs/guides/03-domain-and-dns.md)
* [Guide 04: Free PostgreSQL Hosting (Neon)](docs/guides/04-database-hosting.md)
* [Guide 07: Free API Container Deployment (Render)](docs/guides/07-deploy-api.md)
* [Guide 08: Free Web Deployment (Vercel)](docs/guides/08-deploy-web.md)
* [Guide 09: Environment Variables Directory](docs/guides/09-environment-variables.md)
