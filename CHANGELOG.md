# Changelog

All notable changes to the AIUB Job Fair 2026 platform are documented in this file.

---

## [Phase 0: Foundation] - 2026-11-02

### Added
- **Monorepo Structure:** Structured workspace into `/apps/api`, `/apps/web`, `/deploy`, and `/docs` following Clean Architecture and 12-factor principles.
- **Backend API (.NET 10 LTS):**
  - Scaffolding of `Domain`, `Application`, `Infrastructure`, `Infrastructure.Migrations.PostgreSql`, `Infrastructure.Migrations.SqlServer`, and `Api`.
  - Configured Serilog structured logging to console with request enrichment.
  - Implemented RFC 7807 `ProblemDetails` global exception handling middleware.
  - Added dual-database provider configuration (`Database__Provider`: `PostgreSql` or `SqlServer`) with design-time factory support for both engines.
  - Health check endpoints: `/health/live` (process liveness) and `/health/ready` (database readiness).
  - System info endpoint: `GET /api/v1/info` returning event title, status, and server time.
  - Automated integration tests (`Api.Tests`) verifying health checks and system info.
  - Automated unit tests (`Application.Tests`) verifying PostgreSQL and SQL Server provider registration.
- **Frontend Web (Next.js 16 / App Router):**
  - Scaffolding with TypeScript, Tailwind CSS, TanStack Query, Zod, and Lucide Icons.
  - Mobile-first responsive landing page (360px+) featuring:
    - Official tagline "Let's Build Your Future Together".
    - Dual entry paths ("I'm a Student" / "I'm an Employer").
    - Live countdown to Dhaka student registration deadline (5 Dec 2026).
    - Dynamic API connectivity badge communicating with the backend.
  - Standalone build mode (`output: "standalone"`) and same-origin API rewrite rules (`/api/*`).
- **Containerization & Deployment:**
  - Multi-stage `Dockerfile` for API (.NET 10).
  - Multi-stage `Dockerfile` for Web (Next.js standalone on Alpine).
  - `docker-compose.yml` for local development (API + Web + PostgreSQL 16).
  - `deploy/docker-compose.prod.yml` and `deploy/Caddyfile` for production VPS with automated HTTPS.
  - Database backup and restore shell scripts (`deploy/scripts/backup.sh`, `restore.sh`).
- **Continuous Integration (CI):**
  - GitHub Actions workflow (`.github/workflows/ci.yml`) compiling backend, running xUnit tests, and typechecking Next.js on every commit.
- **Documentation & Guides:**
  - Prerequisite guides 01, 02, 03, 04, 07, 08, 09 in `/docs/guides/`.
  - Architecture specification (`ARCHITECTURE.md`).
  - Deployment manual (`DEPLOYMENT.md`).
  - Dependency verification directory (`DEPENDENCIES.md`).
  - Decision logs (`DECISIONS.md`).
  - Admin operational manual (`ADMIN_GUIDE.md`).
  - Emergency runbook (`RUNBOOK.md`).
  - Master template for environment variables (`.env.example`).
