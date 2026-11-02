# Project Architectural & Operational Decisions (ADR)

---

## Decision 01: Initial Prototype Hosting Strategy (Free Tiers vs Paid VPS)
* **Date:** 2 November 2026
* **Status:** CONFIRMED by project owner
* **Context:** The university club is presenting the working platform to AIUB authorities before receiving approval/budget for a production VPS.
* **Decision:**
  * Use **Vercel / Netlify** for hosting the Next.js frontend during the demonstration phase ($0/month).
  * Use **Render Free Web Service** for running the containerized ASP.NET Core API ($0/month).
  * Use **Neon PostgreSQL Free Tier** for database storage ($0/month).
  * After authorities review and approve, migrate the system to a unified always-on VPS (e.g., Contabo / Hetzner) running `docker-compose.prod.yml` and Caddy.

---

## Decision 02: Dual Database Engine Portability (PostgreSQL & SQL Server)
* **Date:** 2 November 2026
* **Status:** CONFIRMED
* **Context:** AIUB's internal database standard is unconfirmed. The platform must default to PostgreSQL for free development while allowing zero-code switching to Microsoft SQL Server if requested during handover.
* **Decision:**
  * Maintain clean separation of database migrations: `Infrastructure.Migrations.PostgreSql` and `Infrastructure.Migrations.SqlServer`.
  * Use `Database__Provider` configuration switch (`PostgreSql` | `SqlServer`).
  * Enforce cross-engine modeling standards (Guid keys, string-based enums, normalized case columns).
  * Validate both database contexts in CI.

---

## Decision 03: Psychometric Assessment Content Source
* **Date:** 2 November 2026
* **Status:** CONFIRMED
* **Context:** Psychometric questions are in scope, but no commercial/clinical tests may be used.
* **Decision:**
  * The club does not invent questions. Use the International Personality Item Pool (IPIP) Big Five short-form instrument (public domain).
  * Display as a self-reported profile (not a pass/fail test).
  * Results visible to Admin and to Employers whose job posts the student has applied to.
  * Store in database so AIUB can swap the question bank via Admin panel with zero code changes.

---

## Decision 04: Gender & Demographic Field Inclusivity (Q9)
* **Date:** 2 November 2026
* **Status:** CONFIRMED default
* **Decision:** Student registration demographic options will provide: `Male`, `Female`, `Prefer not to say` (optional).


---

## Decision 05: Full-Stack Next.js Unification (Frontend + Backend)
* **Date:** 2 November 2026
* **Status:** CONFIRMED by project owner
* **Context:** The owner requested that both the frontend and backend be built within Next.js.
* **Decision:**
  * Build the platform as a unified full-stack Next.js application (App Router) with route handlers (`src/app/api/...`).
  * Use Prisma ORM for type-safe database queries and migrations against PostgreSQL (default on Neon/Docker) with support for SQL Server.
  * Use custom JWT in `httpOnly` secure cookies with bcrypt password hashing and Zod validation.
  * Single deployment container (`output: "standalone"`), streamlining Vercel/Netlify deployment and Docker production hosting.
