# Architecture & Technical Design

---

## 1. System Overview
The AIUB Job Fair 2026 platform is implemented as a unified **Full-Stack Next.js 16+ (App Router)** platform with **Prisma ORM** and PostgreSQL.

* **Frontend Web Application:** Next.js (App Router, React 19, TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod).
* **Backend API:** Native Next.js Route Handlers (`apps/web/src/app/api/v1/...`) with JWT authentication via `httpOnly` secure cookies and role-based access control.
* **Database Layer:** Prisma ORM connected to PostgreSQL (supporting Neon Serverless Postgres, AWS RDS, or local Docker container).
* **Zero-Cost Prototyping:** Single fullstack repository easily deployable on Vercel or Netlify with Neon database.
* **Production Handover Topology:** Containerized via Docker (`docker-compose.yml` for local dev; `deploy/docker-compose.prod.yml` with Caddy Auto-HTTPS for production VPS or AIUB on-premise servers).

---

## 2. Next.js Full-Stack Architecture

```
[ Client Browsers & Mobile Devices (360px+) ]
                       │
                       ▼
┌────────────────────────────────────────────────────────┐
│ Next.js App Router (apps/web)                          │
│                                                        │
│  UI Pages (React 19, Tailwind, Responsive):            │
│  - / : Landing Page & 5 Dec 2026 Countdown             │
│  - /jobs, /jobs/[id] : Job Board & Application Flow    │
│  - /companies, /companies/[id] : Directory & Stalls    │
│  - /student/profile : Profile Builder & Completeness   │
│  - /student/assessment : Big Five Self-Assessment      │
│  - /student/applications : Tracker                     │
│  - /employer/dashboard : Post Jobs & Inspect CVs       │
│  - /admin : Approvals, KPIs, CSV Exports, Deadlines    │
│                                                        │
│  API Route Handlers (/api/v1/...):                     │
│  - /auth/* (login, register, logout, me, verify-email) │
│  - /student/* (profile, completeness, education)       │
│  - /jobs/* (search, apply, cv-drop)                    │
│  - /companies/* (approved directory, stalls)           │
│  - /employers/* (company profile, jobs, applicants)    │
│  - /assessments/* (Big Five current set & submit)      │
│  - /files/* (magic byte verified upload & download)    │
│  - /admin/* (stats, approvals, CSV streaming exports)  │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Services & Validation Layer (apps/web/src/lib)         │
│  - auth/jwt.ts & auth/session.ts (JWT & Cookies)       │
│  - validations/authSchemas.ts (Zod Schemas)            │
│  - services/storageService.ts (Magic Byte Verification)│
│  - services/emailService.ts (Nodemailer SMTP/Sim)      │
│  - services/seedService.ts (Default Data & Scoring)    │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ Prisma ORM (apps/web/prisma)                           │
│  - PostgreSQL Client                                   │
│  - Connection pooling & schema validation              │
└───────────────────────┬────────────────────────────────┘
                        │
                        ▼
┌────────────────────────────────────────────────────────┐
│ PostgreSQL 16 Database                                 │
│  - Neon Serverless PostgreSQL (Review / Free Tier)     │
│  - Docker / On-Premise AIUB Server (Production)        │
└────────────────────────────────────────────────────────┘
```

---

## 3. Key Architectural Safeguards

### 3.1 Strict AIUB Student Restriction
* Registrations are strictly validated against `@student.aiub.edu` or `@aiub.edu` domains.
* Student IDs must match the institutional format `XX-XXXXX-X` (regex: `/^\d{2}-\d{5}-[1-3]$/`).
* Dynamic profile completeness calculator (0–100%) prevents applying to jobs until all required sections (academic credentials, mobile, resume) are satisfied.

### 3.2 In-Depth IDOR Prevention
* Employers can only view applicant records and download candidate CVs for students who submitted an application to that employer's specific job post.
* Students can only view, edit, or delete their own profile, education records, experiences, references, and applications.
* File download handler `/api/v1/files/[id]` validates the requester's identity before serving any binary asset.

### 3.3 File Upload Security & Magic Byte Inspection
* All uploaded files undergo binary magic byte verification (not relying on file extensions or user-provided MIME types):
  * CV files: Verified as `%PDF` (0x25, 0x50, 0x44, 0x46) and limited to 5 MB.
  * Photos/Logos: Verified as valid JPEG, PNG, or WebP and limited to 2 MB.
* Files are stored on disk with UUID filenames or forwarded to S3-compatible object storage.

### 3.4 Psychometric Assessment Privacy & Scoring
* Standard 20-item IPIP Big Five personality questionnaire.
* Five traits scored: Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability.
* Scores are categorized into **Low**, **Moderate**, and **High** bands.
* Raw numerical scores are never returned to students to avoid test anxiety.
* Employer summaries include a prominent disclaimer: *"Self-reported profile. Not a hiring decision tool."*
