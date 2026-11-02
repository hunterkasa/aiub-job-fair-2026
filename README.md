# AIUB Job Fair 2026 — Registration & Job-Matching Platform

> **"Let's Build Your Future Together"**  
> Official platform for American International University-Bangladesh (AIUB) Job Fair 2026. Designed for zero-vendor lock-in, mobile-first student accessibility, and seamless handover to AIUB IT infrastructure.

---

## Architecture Overview

Per architecture update directive (Decision 05), the primary application is built as a **Full-Stack Next.js 16+ (App Router)** application running both the frontend UI and backend Route Handlers (`/api/v1/...`) with **Prisma ORM** connected to PostgreSQL (Neon Serverless or Docker).

* **Frontend:** Next.js App Router (React 19, TypeScript, Tailwind CSS, Lucide Icons, React Hook Form, Zod).
* **Backend:** Next.js Route Handlers (`/api/v1/...`) with JWT authentication (`httpOnly` secure cookies), Bcrypt password hashing, and role-based access control (RBAC).
* **Database & ORM:** Prisma ORM with PostgreSQL.
* **Storage:** Magic-byte validated file storage (PDF &le; 5MB, JPG/PNG/WebP &le; 2MB) with local filesystem or S3-compatible cloud storage adapter.
* **Email:** Nodemailer SMTP with simulation logging fallback.
* **Zero-Cost Prototyping:** Free deployment to Vercel/Netlify with Neon Serverless Postgres, or a single Docker container.

---

## 5-Minute Local Quickstart

### Prerequisites
* [Node.js 22+ LTS](https://nodejs.org/)
* PostgreSQL (Local service, Neon connection string, or Docker)
* Git

### 1. Clone & Set Environment
```bash
git clone <repo-url>
cd "aiub job fair"
cp .env.example .env
```

### 2. Install & Generate Prisma Client
```powershell
cd apps/web
npm install
npx prisma generate
```

### 3. Run Database Migrations & Seed
```powershell
npx prisma db push
npm run seed
```
*(Seeds default administrator `jobfair.admin@aiub.edu`, 11 industry sectors, seminars, event cutoff settings, and the 20-item IPIP Big Five Assessment Set with scoring bands).*

### 4. Start Next.js Development Server
```powershell
npm run dev
```
* Application runs at `http://localhost:3000`
* Liveness Healthcheck: `http://localhost:3000/api/v1/health/live`
* Readiness Healthcheck: `http://localhost:3000/api/v1/health/ready`
* System Info: `http://localhost:3000/api/v1/info`

---

## Running with Docker (Single Command)

```bash
docker compose up --build -d
```
Spins up:
* `aiub_postgres`: PostgreSQL 16 on port `5432` with healthcheck.
* `aiub_web`: Full-stack Next.js standalone container on port `3000` (serving both UI and `/api/v1/...` APIs).

---

## 100% Free Prototyping Deployment (Vercel / Netlify + Neon)

To demonstrate the platform to AIUB authorities without recurring infrastructure cost before final budget approval:
1. **Database:** Create a free database at [Neon.tech](https://neon.tech) and copy the pooled connection string into `DATABASE_URL`.
2. **Frontend & API Hosting:** Connect the repository to **Vercel** or **Netlify** with Root Directory set to `apps/web`.
3. Set the following environment variables:
   * `DATABASE_URL`: Your Neon PostgreSQL connection string.
   * `JWT_SECRET`: 32+ character random string.
   * `NEXTAUTH_URL`: `https://your-app.vercel.app` (or Netlify domain).
4. Deploy! The application will automatically build, deploy all static pages, and serve all API route handlers globally with automatic HTTPS.

---

## Project Structure

```
/apps
  /web                      Full-Stack Next.js 16+ App Router
    /prisma                 Prisma schema (PostgreSQL) and seed script
    /src
      /app                  App Router pages & API route handlers
        /admin              Admin management console (KPIs, employer approvals, exports)
        /api/v1             REST API endpoints (auth, student, jobs, companies, assessments)
        /companies          Directory of approved company stalls & details ([id])
        /employer/dashboard Employer portal (job postings, applicants, CVs, Big Five summary)
        /jobs               Job board & application flow ([id])
        /login              Unified role-based authentication
        /register           Student (@student.aiub.edu) & Employer registration
        /student            Profile builder, IPIP Big Five assessment, application tracker
        /verify-email       Email verification landing page
      /components           Shared UI components (Navbar, Footer, Modals)
      /lib
        /auth               JWT signing & session utilities
        /db                 Prisma singleton client
        /services           Storage, email, and database seed services
        /validations        Zod validation schemas
/deploy                     Caddyfile and docker-compose.prod.yml
/docs                       Architecture, Deployment, Admin guides, Decisions log
```

---

## Key Platform Features

1. **AIUB Student Protection:**
   * Student registration strictly restricted to `@student.aiub.edu` or `@aiub.edu` domains.
   * Student ID format enforced: `XX-XXXXX-X`.
   * Dynamic profile completeness calculator (0–100%) requiring 100% complete profile before applying to jobs.
2. **Employer Verification & IDOR Security:**
   * Employers register with company info and require admin approval before stalls and jobs appear publicly.
   * In-depth IDOR checks: Employers can only view applications and download CVs for candidates who applied to their own job posts.
3. **Big Five Psychometric Assessment:**
   * 20-item IPIP Big Five personality questionnaire.
   * Self-reported developmental snapshot; results grouped into High/Moderate/Low bands.
   * Never used as an automated disqualifier; raw numerical scores are never exposed to students.
4. **Admin Management Console:**
   * Live KPI dashboard (registrations, completion rates, applicants).
   * 1-click employer approval/rejection.
   * Direct CSV export of student registrations and candidate applications.
   * Runtime deadline overrides for student registration, employer cutoff, and CV drops.
