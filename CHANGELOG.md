# Changelog

All notable changes to the AIUB Job Fair 2026 platform are documented in this file.

---

## [Phase 1 through Phase 5: Complete Full-Stack Next.js Implementation] - 2026-11-02

### Added
- **Full-Stack Next.js App Router Architecture:**
  - Implemented both frontend UI and backend Route Handlers inside `apps/web/src/app` using Next.js 16+, TypeScript, and Tailwind CSS.
  - Comprehensive Prisma schema (`apps/web/prisma/schema.prisma`) defining all models: `User`, `StudentProfile`, `Company`, `Industry`, `JobPost`, `Application`, `EducationRecord`, `ExperienceRecord`, `ReferenceRecord`, `Seminar`, `SeminarRegistration`, `FileAsset`, `AssessmentSet`, `AssessmentQuestion`, `AssessmentOption`, `AssessmentBand`, `AssessmentAttempt`, `AssessmentAnswer`, `AssessmentResult`, `EventSetting`, `VerificationToken`.
  - Database seed service (`seedService.ts` and `seed.ts`) initializing Default Admin (`jobfair.admin@aiub.edu`), 11 national industry categories, 2 preparatory seminars, default cutoff settings, and the complete 20-item IPIP Big Five Assessment Set with scoring bands.
- **Authentication & RBAC:**
  - JWT token generation & verification (`jwt.ts`) with `httpOnly` secure cookies and Bearer token fallback.
  - Current user session resolver (`session.ts`) supporting `STUDENT`, `EMPLOYER`, and `ADMIN` roles.
  - Strict student registration endpoint (`/api/v1/auth/register/student`) with AIUB ID validation (`XX-XXXXX-X`) and `@student.aiub.edu` / `@aiub.edu` email restriction.
  - Employer registration endpoint (`/api/v1/auth/register/employer`) creating pending company profiles awaiting admin approval.
  - Unified login endpoint (`/api/v1/auth/login`) with bcrypt password verification.
  - Email verification handler (`/api/v1/auth/verify-email`) and frontend landing page (`/verify-email`).
- **Student Profile & Applications:**
  - Student profile builder (`/student/profile`) with dynamic completeness calculator (0–100%) and required sections breakdown.
  - Education, experience, and reference management modals.
  - Profile completeness endpoint (`/api/v1/student/profile-completeness`).
  - Strict job application endpoint (`/api/v1/jobs/[id]/apply`) enforcing 100% profile completeness and preventing duplicate applications.
  - General CV drop endpoint (`/api/v1/applications/cv-drop`).
  - Student application tracker (`/student/applications`) displaying applied jobs, companies, deadlines, and status badges.
- **IPIP Big Five Psychometric Self-Assessment:**
  - Assessment questionnaire (`/student/assessment`) with 20 Likert items across 5 personality traits (Openness, Conscientiousness, Extraversion, Agreeableness, Emotional Stability).
  - Explicit informed consent gate explaining that results are self-reported and not an automated hiring filter.
  - Submission handler (`/api/v1/assessments/submit`) scoring reversed and direct items and mapping results into Low, Moderate, and High bands.
  - Student privacy safeguard: Raw scores are withheld from students; employers receive developmental bands only for applied candidates.
- **Job Board & Company Directory:**
  - Public job search and filter (`/jobs`) supporting keyword search, 8 divisional locations, and job types.
  - Job details page (`/jobs/[id]`) with application modal and employer screening questions.
  - Company directory (`/companies`) and company detail page (`/companies/[id]`) highlighting stall location, company description, hiring criteria ("Looking For..."), and open positions.
- **Employer Portal:**
  - Employer dashboard (`/employer/dashboard`) with company stall profile editor and "What We Are Looking For" criteria publisher.
  - Job post creator and manager (title, division, vacancies, deadlines, custom screening questions).
  - Applicant review interface with verified CV downloads (`/api/v1/files/[id]`) and Big Five psychometric summary bands.
  - Strict IDOR authorization ensuring employers only access candidates who applied to their own job openings.
- **Admin Management Console:**
  - Central admin panel (`/admin`) with real-time KPI cards (students, completed profiles, employers, job posts, applications).
  - 1-click employer stall approval and rejection actions with reason notifications.
  - Student directory and instant search.
  - 1-click streaming CSV exports for both student registrations (`aiub_students.csv`) and job applications (`aiub_applications.csv`).
  - Runtime deadline management for student registration, employer registration, and CV drops.
- **File Upload Security:**
  - Magic-byte verification for binary file uploads (`storageService.ts`): PDF verified as `%PDF` (&le; 5MB); photos verified as PNG/JPEG/WebP (&le; 2MB).
- **Automated Verification:**
  - Core logic verification test suite (`apps/web/src/tests/verify-core.ts`) verifying magic byte detection, JWT cryptography, Zod schemas, and psychometric band algorithms with 100% pass rate.
  - Production build verification (`next build`) producing 49 static and dynamic routes with zero TypeScript errors.

---

## [Phase 0: Foundation] - 2026-11-02

### Added
- **Monorepo Structure:** Structured workspace into `/apps/api`, `/apps/web`, `/deploy`, and `/docs` following Clean Architecture and 12-factor principles.
- **Backend API (.NET 10 LTS):**
  - Scaffolding of `Domain`, `Application`, `Infrastructure`, `Infrastructure.Migrations.PostgreSql`, `Infrastructure.Migrations.SqlServer`, and `Api`.
  - Serilog structured logging and RFC 7807 `ProblemDetails` exception handling.
  - Health check endpoints: `/health/live` and `/health/ready`.
- **Containerization & Deployment:**
  - Multi-stage Dockerfiles and `docker-compose.yml`.
  - Caddy reverse proxy configuration.
