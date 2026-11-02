# Architecture & Technical Design

---

## 1. System Overview
The AIUB Job Fair 2026 platform is designed as a decoupled, portable monorepo consisting of:
* **Frontend Web Application:** Next.js (App Router, TypeScript, Tailwind CSS).
* **Backend API:** ASP.NET Core Web API (.NET 10 LTS) structured with Clean/Onion Architecture.
* **Database Layer:** Entity Framework Core with runtime switch between PostgreSQL (default) and Microsoft SQL Server.
* **Deployment Topology:** Containerized via Docker (`docker-compose.yml` for local dev; `deploy/docker-compose.prod.yml` with Caddy for VPS production).

---

## 2. Backend Layered Architecture

```
[ HTTP Requests ]
       │
       ▼
┌────────────────────────────────────────────────────────┐
│ apps/api/src/Api                                       │
│  - Controllers & Minimal API endpoints                 │
│  - Global exception handler (RFC 7807 ProblemDetails)  │
│  - Middleware, CORS, Cookie auth, Health endpoints     │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ apps/api/src/Application                               │
│  - Use Cases & Application Services                    │
│  - DTOs and Contracts                                  │
│  - FluentValidation rules                              │
│  - Interfaces: IUnitOfWork, IFileStorage, IEmailSender │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ apps/api/src/Domain                                    │
│  - Core Entities: StudentProfile, JobPost, Company     │
│  - Value Objects & Domain Enums                        │
│  - Pure C# (Zero third-party dependencies)             │
└────────────────────────────────────────────────────────┘
                        ▲
                        │
┌───────────────────────┴────────────────────────────────┐
│ apps/api/src/Infrastructure                            │
│  - AppDbContext (EF Core)                              │
│  - Storage Implementations (LocalDisk, S3/R2)          │
│  - Email Sender (Generic SMTP)                         │
│  - ASP.NET Core Identity store                         │
└────────────────────────────────────────────────────────┘
```

### Why Thin Repository + Unit of Work (Section 6.3)
EF Core's `DbContext` intrinsically implements the Repository and Unit of Work patterns. We define a clean `IUnitOfWork` interface and thin aggregate repositories to avoid leaking `IQueryable` into domain/controllers while avoiding redundant boilerplate of generic repositories. Read-heavy views utilize dedicated projected queries with `.AsNoTracking()`.

---

## 3. Database Engine Portability (Section 5.4)
The backend supports zero-code database switching between PostgreSQL and Microsoft SQL Server via configuration:
* `Database:Provider = "PostgreSql"` (loads `Infrastructure.Migrations.PostgreSql`)
* `Database:Provider = "SqlServer"` (loads `Infrastructure.Migrations.SqlServer`)

Portable modeling constraints enforced:
1. `Guid` primary keys throughout all tables.
2. Enums persisted as strings.
3. All dates stored strictly in UTC.
4. Normalized lower-case columns used for case-insensitive indexing.
5. No database-specific vendor features (no `jsonb`, arrays, or raw SQL queries).

---

## 4. Frontend & Same-Origin Routing (Section 5.8)
Next.js acts as both the SSR/client rendering engine and the reverse proxy rewrite layer for API calls:
* `/api/:path*` rewrites internally to `${API_INTERNAL_URL}/api/:path*`.
* This ensures browser cookies, CORS, and authentication headers work identically across local development, Vercel preview environments, and production VPS setups.
