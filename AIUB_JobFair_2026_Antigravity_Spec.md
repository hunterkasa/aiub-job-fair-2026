# AIUB Job Fair 2026 — Registration & Job-Matching Platform
## Master Spec for Antigravity (read this ENTIRE file before doing anything)

---

## 0. How you (the AI agent) must work

You are the lead engineer AND mentor for this project. The owner is a university student (club member), not an experienced DevOps engineer. Explain things plainly.

1. **Read the whole file first.** Then reply with (a) a summary of your understanding in 15 lines or fewer and (b) any questions from Section 3 that are still unanswered. Do not write code before this.
2. **Work phase by phase (Section 13).** At the end of each phase: build, run tests, summarize what changed, update `CHANGELOG.md`, then STOP and wait for the owner's confirmation.
3. **Ask before** spending money, entering payment cards, creating cloud accounts, deleting anything, or adding a paid/commercial dependency.
4. **Never hardcode secrets.** Only commit `.env.example`. Real secrets go into the hosting provider's secret/env UI.
5. **Verify live, do not rely on memory.** Free-tier limits, pricing and library licenses change often. Before recommending any hosting service or NuGet/npm package, check its current official page and write the date you checked in the guide.
6. **Teach the prerequisites.** Whenever a step needs an external service (hosting, database, storage, email, domain, CI), create a step-by-step guide in `/docs/guides/` using the template in Section 12.3, and walk the owner through it before you depend on it.
7. **Portability rules (Section 5) are hard constraints.** If a convenient shortcut breaks one, do not take it; explain the trade-off and ask.
8. **Prefer boring, free, well-documented tools.** Simple beats clever. The deadline is tight (Section 13).
9. **Quality bar:** typed code, input validation on both sides, automated tests for business rules, no dead code, meaningful commit messages.
10. The UI language is English. Make every page mobile-first: most students will register from phones, probably by scanning a QR code on a printed poster.

---

## 1. Project context

- **What:** Official website for **AIUB Job Fair 2026**. Students and employers register, employers post jobs or desired-candidate criteria, students apply or drop CVs.
- **Who built the brief:** an AIUB club. The finished code will be **handed over to AIUB**, who will run it long-term.
- **Entry points:** the website URL and a **QR code** (printed on posters). Because the QR code is printed, **the public URL must never change** (see 5.9).
- **Deadlines (from the poster sheet):** Student registration: **5 Dec 2026**. Employer registration: **12 Dec 2026**. (Dhaka time, end of day. Make these admin-configurable, not hardcoded.)
- **Tagline on poster:** "Let's Build Your Future Together".
- **Handover goal:** AIUB can move the whole system from a free host to any VPS or cloud (Contabo, AWS, Azure, their own server) with a documented procedure and no code changes except configuration.

---

## 2. Requirements (transcribed from the three sheets)

### 2.1 Poster sheet — "Job Fair 2026 → Registration" splits into two paths

**A. As Student — registration fields**
| Field | Notes |
|---|---|
| Name | |
| AIUB Student ID | unique |
| Mobile, Email | |
| Job Type | Full-time / Internship |
| Study Level | Ongoing / Graduated |
| Preferred Company / Industry Type | (hand-edited on the sheet, content scribbled out; treat as multi-select from industry list) |
| Which seminar participation? | Yes / No |

Then: **"Want to apply for Job?" → Next Page** (hand-written)
- **Yes** → Search company you're looking for → Select job & drop CV → **Joining Date** (hand-written addition)
- **No** → Just drop your CV

**B. As Employer — registration fields**
| Field | Notes |
|---|---|
| Company Name | |
| Website link | |
| Company / Industry Type | |
| Logo | image upload |
| Email | hand-written: **HR Name, Email, Mobile** |
| Short Intro | |

"Reg completed → Next Page":
- **Psychometric Questions for Students** (a hand mark under it was ambiguous; the owner confirmed it is **IN SCOPE**, see Q2. The sheet places it on the employer column's "Next Page" but the title says "for Students": implement it as a student-facing assessment taken after profile completion.)
- **Any ongoing hiring?**
  - **Yes** → Create Job Post
  - **No** → Upload your desired candidates' criteria

### 2.2 Sheet 2 — "Employer Interface"
- **Employer registration:** Email Id, Password.
- **Company profile:** Company Name, Company Website Address, Company Profile Picture, HR Name, HR Mobile Number, Industry Type, About this Company.
- **Job Post button** (hand-bracketed as **"Desired candidates criteria"**):
  | Field | Value / options |
  |---|---|
  | Position Name | text |
  | Job Location (dropdown) | Divisions + "Anywhere in Bangladesh" (sheet says "7 divisions"; Bangladesh has **8** — use all 8, see 2.5) |
  | Workplace | Work at Office / Remote / Online |
  | Requirements | Education; Additional Requirements |
  | Responsibilities | text |
  | Skills & Expertise | tags / text |
  | Employment Status | Full time / Part time / Contractual |
  | Salary | Negotiable, or any amount the employer enters |
  | Compensation & Benefits | "As per company policy" default |
  | Question 1, Question 2 | optional screening questions "asked by employer if they need it for recruitment" |
  | Job Deadline | date (example: 04 December) |

### 2.3 Sheet 2 — "Student Interface"
- Click the **Job Apply** button → student name and all profile details are attached **automatically**.
- Employer Question Answer(s).
- ~~Salary Expectation~~ — **crossed out by hand → REMOVE**.
- **Joining Date:** Immediately / Within 1 Week / Within 15 Days / Within 1 Month.
- **Submit button.**
- Hand-written: **"Add CV upload button."**

### 2.4 Sheet 3 — "Student Apply For the Job" (profile / CV builder)
(The sheet's first block is labelled "Employer Registration" — this is a typo, it is **Student Registration/Login**: Email Id, Password.)
- **Profile Creation:** Profile Picture, Student Name, AIUB ID, Email Id, Mobile Number, Address, Gender (Male/Female — see Q9 about adding "Other/Prefer not to say").
- **Educational Qualification:** SSC, HSC, BSc, MSc 1, MSc 2, Professional Degree. Each: Institution name, CGPA, Subject, Passing Year (Professional Degree: free text).
- **Experience 1 (repeatable → Experience 2, 3…):** Company Name, Industry Type, Job Type (Internship/Fulltime/Parttime/Contractual), Designation, Start Date, End Date / Continuous, Responsibilities.
- **Extracurricular Activities** (free text).
- **Social Media:** LinkedIn, GitHub.
- **References (repeatable):** Name, Designation, Organization, Email, Mobile, Relation (Relative / Family Friend / Academic / Professional).

### 2.5 Inconsistencies found in the sheets (handle as stated)
1. "Employer Registration" label on the student sheet → treat as Student account.
2. "7 Division name" → Bangladesh has 8 divisions (Barishal, Chattogram, Dhaka, Khulna, Mymensingh, Rajshahi, Rangpur, Sylhet). Use all 8 + "Anywhere in Bangladesh".
3. Employer Employment Status has no "Internship" but students choose Internship → **add Internship** to job posts.
4. Student college fields say "College Name" for BSc/MSc → use "Institution Name" for every level.
5. Workplace says "Remote/Online" (near-duplicate) → keep exactly as sheet: Office / Remote / Online; ask owner if "Hybrid" should be added.
6. The sheet's "Question 1/2" implies employer-optional questions; students must answer only if the employer defined them.

---

## 3. Assumptions & open questions

Status: the owner answered on 2 Nov 2026. Rows marked **CONFIRMED** are decided; rows marked **OPEN** must be asked of the owner before the related feature is built. For OPEN rows, proceed with the stated default if unanswered and record it in `/docs/DECISIONS.md`.

| # | Question | Default if unanswered |
|---|---|---|
| Q1 | **CONFIRMED (no info yet):** AIUB's internal DB is unknown. This is a demo for now. | Build on PostgreSQL; keep SQL Server switch ready and tested in CI (5.4). Do not assume MSSQL. |
| Q2 | **CONFIRMED IN SCOPE:** Psychometric questions for students. **CONFIRMED visibility:** results are seen by **admin and employers** (not shown to the student). **CONTENT OWNER (decided):** the final question set must be approved by AIUB's career/counselling office or a qualified faculty member (psychology / HR / organizational behavior). The club builds the system, not the content. Until AIUB assigns someone, use the **fallback instrument in Section 7A**. | Build an `Assessments` module: admin-managed question bank (multiple choice, Likert 1–5 scale, with category tags), students take it once after completing their profile. Admin sees all results. **Employers see a student's result only for students who applied to that employer's job posts** (never the full student database), shown as category summaries inside the applicant view. Students get a "submitted, thank you" screen without scores. Seed the fallback instrument from Section 7A. Do NOT invent your own questions, clinical-sounding scoring or labels; show simple category summaries only. Add a plain-language notice at the start of the assessment that employers who receive the student's application can see the result (consent). |
| Q3 | **CONFIRMED:** student sign-up requires an AIUB student email, and alumni use the same domain. | Enforce `STUDENT_EMAIL_DOMAINS=student.aiub.edu` (env var, so it is changeable) plus email verification (link/OTP). Validate AIUB ID format softly (e.g. `NN-NNNNN-N`; confirm). Employers use any business email. |
| Q4 | **CONFIRMED:** admin approves the **employer account once**; job posts then publish immediately. | Keep `RequireJobPostApproval` setting, default **false**, so AIUB can turn on per-post approval later. Admin can unpublish any post. Admin panel also: view/search/export students and applications, seminars CRUD, extend deadlines, announcements. |
| Q5 | **CONFIRMED:** admin creates seminars and makes them available. | Admin-managed seminar list; student sees "Which seminar participation? Yes/No" and, if Yes, picks one or more seminars. |
| Q6 | **CONFIRMED:** employers who are "not hiring" still appear, so it is visible they participated. | Approved companies **always** appear in the public company list/"Participating companies" page (logo, intro, industry, website), whether hiring or not. "Not hiring" employers upload desired-candidate criteria (`PostType = CandidateCriteria`), shown on their company page as "Looking for…" with **no Apply button**. |
| Q7 | **CONFIRMED:** both are required: the student must complete the full profile AND upload a CV before applying. | Define "profile complete" precisely and show a progress bar (see 9). Apply button is disabled with a clear checklist of what is missing until the profile is complete and a CV is uploaded. The profile is attached automatically to every application. "Just drop CV" (general CV bank) follows the same requirement. |
| Q8 | **CONFIRMED:** admin approval required before an employer is public. | Yes (see Q4 for job-post approval option). |
| Q9 | Gender options: keep Male/Female only? | Male / Female / Prefer not to say (field optional). |
| Q10 | Expected scale? | Plan for ~10,000 students and ~300 employers, with spikes near deadlines. |
| Q11 | Data-protection expectations from AIUB (where data may be hosted, retention period, consent wording)? | Consent checkbox at registration; documented retention + deletion procedure; flag to AIUB that free hosts store data outside Bangladesh. |
| Q12 | Date the registration must open to the public? | Target **16 Nov 2026** (gives ~3 weeks before the student deadline). |
| Q13 | Does AIUB want a custom domain/subdomain (e.g. `jobfair.aiub.edu`)? | Ask now; otherwise buy/register a cheap domain owned by the club and transfer later (5.9). |

---

## 4. Tech stack (decided)

| Layer | Choice | Why |
|---|---|---|
| Backend | **ASP.NET Core Web API**, latest **LTS** .NET (verify current LTS, expected .NET 10) | Senior's choice; strong fit for a university .NET ecosystem; free & open source SDK (MIT). |
| Frontend | **Next.js** (App Router) + **TypeScript** + Tailwind CSS + shadcn/ui + React Hook Form + Zod + TanStack Query | Fast to build good mobile UI. Build with `output: "standalone"` for Docker. |
| Database | **PostgreSQL** (default). **SQL Server supported via config switch** | Free everywhere; AIUB may prefer MSSQL, so both must work (5.4). |
| ORM | **EF Core** (Npgsql provider + SqlServer provider) | |
| Pattern | **Thin Repository + Unit of Work** (6.3) | Senior's requirement. |
| Realtime | **SignalR** (optional, Phase 3) | Employer notifications of new applications, admin live counters. Must degrade gracefully (polling) if WebSockets are unavailable. |
| Auth | **ASP.NET Core Identity**; short-lived JWT in **httpOnly cookie** + refresh token; roles `Student`, `Employer`, `Admin` | No third-party auth vendor lock-in. |
| API contract | OpenAPI (built-in `Microsoft.AspNetCore.OpenApi` or Swashbuckle) → generated TypeScript client | Keeps frontend/backend in sync. |
| Validation | **FluentValidation** (Apache-2.0) on backend, Zod on frontend | |
| Logging | **Serilog** → console (12-factor) | |
| Tests | xUnit + Testcontainers (Postgres & SQL Server in CI) + Playwright (few smoke e2e) | |
| Containers | **Docker** + docker-compose | The portability backbone. |
| CI/CD | **GitHub Actions** → build/test → push images to GHCR | Free. |
| Reverse proxy (VPS) | **Caddy** (automatic HTTPS) | Simple for AIUB IT. |

**Licensing caution (verify at the time):** do NOT use libraries that moved to commercial/paid licenses, e.g. **MediatR, AutoMapper, FluentAssertions 8+**. Use plain services, manual mapping or **Mapperly** (source generator), and xUnit's native asserts or Shouldly. Check the license of every new package before adding it.

**Not needed:** "Buy a Claude subscription" — nothing in this project requires a paid AI subscription. **Compiler/SDK:** the .NET SDK and Node.js are free; install the LTS versions, nothing to buy.

---

## 5. Portability rules (HARD constraints)

The code must run unchanged on a free host, Contabo, AWS, Azure or an on-prem server.

1. **Everything is a container.** `Dockerfile` for API, `Dockerfile` for web, `docker-compose.yml` for local dev, `docker-compose.prod.yml` for a single-VPS deployment (api + web + postgres + caddy).
2. **12-factor config:** all settings come from environment variables (`.env.example` documents each). No provider-specific config in code.
3. **No vendor SDK in domain/application code.** Cloud-specific things sit behind interfaces:
   - `IFileStorage` → implementations: `LocalDiskStorage` (VPS volume) and `S3CompatibleStorage` (Cloudflare R2, Supabase Storage, AWS S3, MinIO, Backblaze B2). Free hosts have **ephemeral disks** — never store uploads on the app server's disk in free hosting.
   - `IEmailSender` → implementation over generic **SMTP** (works with Brevo, Resend SMTP, AWS SES, Mailgun, Postfix). No vendor-only API.
   - `IClock` (UTC), `ICurrentUser`.
4. **Database portability** (see 5.4).
5. **Stateless API.** No in-memory sessions or local files. If SignalR is scaled to more than one instance later, a Redis backplane is needed — document it, don't build it now.
6. **Health endpoints** `/health/live` and `/health/ready` for any orchestrator.
7. **Time:** store UTC, display `Asia/Dhaka` in the UI.
8. **Same-origin API access:** Next.js rewrites `/api/*` to the backend, so cookies/CORS work identically everywhere.
9. **Stable public URL:** the QR code is printed. Use a **domain name from day one** and point it to whatever host currently runs the site (DNS record). Moving hosts then only means changing DNS. Never print a QR code that points to a `*.vercel.app`/`*.onrender.com` address.
10. **Document every external dependency** in `docs/DEPENDENCIES.md` with: purpose, free-tier limits (and date verified), and the replacement procedure.

### 5.4 Database provider switch
- Config: `Database__Provider = PostgreSql | SqlServer`, `ConnectionStrings__Default`.
- Two migration projects: `Infrastructure.Migrations.PostgreSql` and `Infrastructure.Migrations.SqlServer`. CI generates/validates both and runs the integration tests against **both** engines.
- Portable modelling rules: `Guid` keys (use `Guid.CreateVersion7()` if available); enums stored as **strings**; `DateTime` in UTC; no `jsonb`, arrays, `citext`, `ILike`, or raw provider SQL in application code. For case-insensitive search store a normalized (lower-case) column and index it.
- Provide `docs/guides/switch-to-sqlserver.md` and `docs/guides/migrate-data-between-engines.md`.

---

## 6. Architecture

### 6.1 Repo layout (monorepo)
```
/apps
  /web                      Next.js app
  /api
    /src
      Domain                entities, enums, domain rules (no dependencies)
      Application           use-cases/services, DTOs, validators, interfaces (IRepository, IFileStorage, IEmailSender…)
      Infrastructure        EF Core DbContext, repositories, storage, email, identity
      Infrastructure.Migrations.PostgreSql
      Infrastructure.Migrations.SqlServer
      Api                   controllers/minimal endpoints, SignalR hubs, middleware, Program.cs
    /tests
/deploy
  docker-compose.yml
  docker-compose.prod.yml
  Caddyfile
  scripts (backup.sh, restore.sh)
/docs
  guides/                   prerequisite tutorials (Section 12)
  ARCHITECTURE.md  DEPLOYMENT.md  DEPENDENCIES.md  DECISIONS.md  ADMIN_GUIDE.md  RUNBOOK.md
.github/workflows
.env.example
README.md  CHANGELOG.md
```

### 6.2 Backend rules
- Clean/layered architecture, dependencies point inward. No MediatR; plain application services (`StudentService`, `JobService`, …).
- Return RFC 7807 `ProblemDetails` for errors; global exception middleware.
- Pagination on every list endpoint; never return unbounded lists.
- Authorization via policies; resource checks (an employer can only touch their own jobs/applicants).
- Background work (sending emails) via a `Channel<T>`-based hosted service with retry — no paid job library.

### 6.3 Repository pattern (keep it thin)
- `IUnitOfWork` + **per-aggregate repositories** (`IStudentRepository`, `IJobPostRepository`, `IApplicationRepository`, …).
- Do **not** expose `IQueryable` from repositories; do **not** build a giant generic repository.
- Read-heavy screens (job search, admin lists) use dedicated query methods that project straight to DTOs with `AsNoTracking`.
- Document in `ARCHITECTURE.md` why (EF Core's `DbContext` already acts as UoW) and keep the pattern consistent.

### 6.4 Auth details
- Register → email verification (link or 6-digit OTP, expires) → login.
- Password reset by email. Lockout after repeated failures. Rate limit auth endpoints (built-in ASP.NET rate limiter).
- Cookies: `HttpOnly; Secure; SameSite=Lax`. CSRF protection for state-changing requests.
- First admin created by a **seed command with env-provided credentials**; no default password in code.

### 6.5 SignalR (Phase 3, optional)
- Hub `/hubs/notifications`: employer gets "new application" event; admin dashboard counters; student gets "application received".
- Auth via the same cookie. Fallback: UI polls every 30–60 s if the connection fails. Not required for core flows.

---

## 7. Data model (logical)

All tables: `Id (Guid)`, `CreatedAtUtc`, `UpdatedAtUtc`.

- **AppUser** (Identity): Email, PasswordHash, Role, EmailConfirmed, IsActive.
- **StudentProfile**: UserId, FullName, **AiubId (unique)**, Mobile, Gender?, Address?, ProfilePhotoFileId?, PreferredJobType (FullTime|Internship), StudyLevel (Ongoing|Graduated), LinkedInUrl?, GitHubUrl?, ExtracurricularText?, DefaultCvFileId?, AttendsSeminar (bool), ConsentAcceptedAtUtc.
- **StudentPreferredIndustry**: StudentId, IndustryId (many-to-many).
- **EducationRecord**: StudentId, Level (SSC|HSC|BSc|MSc1|MSc2|Professional), InstitutionName, Cgpa?, Subject?, PassingYear?, Notes?.
- **ExperienceRecord**: StudentId, CompanyName, IndustryId?, JobType (Internship|FullTime|PartTime|Contractual), Designation, StartDate, EndDate?, IsContinuous, Responsibilities.
- **ReferenceRecord**: StudentId, Name, Designation, Organization, Email, Mobile, Relation (Relative|FamilyFriend|Academic|Professional).
- **Industry** (lookup, admin-editable; seed a sensible list).
- **Company**: OwnerUserId, Name, WebsiteUrl, IndustryId, LogoFileId?, ShortIntro, About, HrName, HrEmail, HrMobile, ApprovalStatus (Pending|Approved|Rejected), RejectionReason?, RegistrationCompleted.
- **JobPost**: CompanyId, **PostType (Opening | CandidateCriteria)**, PositionName, Location (Division enum | AnywhereInBangladesh), Workplace (Office|Remote|Online), EducationRequirement, AdditionalRequirements, Responsibilities, SkillsAndExpertise, EmploymentStatus (FullTime|PartTime|Contractual|Internship), SalaryMode (Negotiable|Amount|Range), SalaryMin?, SalaryMax?, CompensationBenefits, Question1?, Question2?, DeadlineUtc? (required for Opening), Status (Draft|Published|Closed).
- **Application**: StudentId, JobPostId? (**null = general "just drop my CV"**), CvFileId, JoiningOption (Immediately|Within1Week|Within15Days|Within1Month), Answer1?, Answer2?, Status (Submitted|Viewed|Shortlisted|Rejected — optional), SubmittedAtUtc. **Unique (StudentId, JobPostId)** to block duplicates.
- **Seminar**: Title, Description, StartsAtUtc, Venue, Capacity?. **SeminarRegistration**: SeminarId, StudentId.
- **FileAsset**: StorageKey (random), OriginalName, ContentType, SizeBytes, Kind (Cv|Photo|Logo), OwnerUserId.
- **EventSetting** (key/value): `StudentRegistrationDeadlineUtc`, `EmployerRegistrationDeadlineUtc`, `RegistrationOpen`, announcement banner.
- **AuditLog**: Actor, Action, Entity, Timestamp (no sensitive payloads).
- **AssessmentSet** (Name, Version, SourceNote, IsActive), **AssessmentQuestion** (SetId, Text, Category, Type: MultipleChoice|Likert, IsReverseKeyed, IsActive, SortOrder), **AssessmentOption** (QuestionId, Text, Value), **AssessmentBand** (SetId, Category, MinScore, MaxScore, Label), **AssessmentAttempt** (StudentId, SetId, StartedAtUtc, CompletedAtUtc?, ConsentAtUtc), **AssessmentAnswer** (AttemptId, QuestionId, OptionId/Value), **AssessmentResult** (AttemptId, Category, Score, Band). One attempt per student unless admin resets. See Section 7A.
- **Student profile completeness** is computed server-side: required (CONFIRMED by owner) = personal info (profile photo, name, AIUB ID, email, mobile, address), education records (SSC, HSC and the current/last degree), consent accepted, assessment submitted, and a CV file uploaded. **Optional:** experience, references, extracurricular activities, LinkedIn, GitHub, MSc 2, professional degree.
- Add `EventSetting.RequireJobPostApproval` (bool, default false) and `JobPost.ApprovalStatus` used only when it is on.

Indexes: AiubId, Email, JobPost(Status, DeadlineUtc, CompanyId), Application(JobPostId), Company(Name normalized).

### 7A. Psychometric assessment: content rules and fallback instrument

**Principle:** nobody on the project invents questions. Use an established, openly licensed instrument, and let AIUB replace it through the admin panel.

1. **Fallback instrument (use until AIUB approves its own):** a short **Big Five self-assessment using IPIP items** (International Personality Item Pool; public domain). Pick a published short form of about 20–30 items covering the five domains (Extraversion, Agreeableness, Conscientiousness, Emotional Stability, Openness), 5-point Likert scale.
   - **Verify before use:** fetch the official IPIP site (ipip.ori.org) and confirm the licence/terms and the exact item wording and scoring keys (including reverse-keyed items). Record the source URL, the date checked and the item IDs in `docs/ASSESSMENT_SOURCES.md`. Do not rely on memory for item text or scoring keys.
   - Optional alternative if AIUB prefers career interests: the O*NET Interest Profiler (US Department of Labor), again only after verifying current terms.
   - Do NOT use copyrighted commercial tests (MBTI, Hogan, DISC, etc.).
2. **Framing (must appear in the UI and in the employer view):**
   - Title it **"Self-assessment"**, not "test"; there is no pass/fail.
   - Employers see only simple category summaries (e.g. five domain bands: Low / Medium / High, computed from the verified scoring keys) with the note: *"Self-reported profile. Not a hiring decision tool."*
   - No diagnostic, clinical or ranking language. Never sort or filter applicants by assessment result in the employer UI.
3. **Consent:** before starting, show a plain-language notice: purpose, that employers who receive the student's application can see the summary, retention period. Store the consent timestamp.
4. **Length and UX:** 20–30 items, about 5–10 minutes, one page per few questions, progress bar, resumable, mobile-friendly. Must not feel like a barrier to registering.
5. **Admin replaceability:** the question bank, scale options, category mapping, reverse-key flags and scoring bands live in the database and are editable by admin (versioned: an attempt always references the question-set version used). Swapping to AIUB-approved content must need **no code change**. Provide CSV import for questions.
6. **Ownership:** document in `ADMIN_GUIDE.md` that AIUB's career/counselling office (or a qualified faculty member) should review and approve the final question set, and that the club-provided fallback is a stand-in.

---

## 8. API surface (prefix `/api/v1`)

**Auth:** `POST /auth/register/student`, `/auth/register/employer`, `/auth/verify-email`, `/auth/login`, `/auth/logout`, `/auth/refresh`, `/auth/forgot-password`, `/auth/reset-password`, `GET /auth/me`
**Lookups:** `GET /lookups/industries | divisions | seminars | event-settings`
**Student:** `GET/PUT /students/me`; `PUT /students/me/preferences`; CRUD `/students/me/education`, `/experience`, `/references`; `POST /students/me/cv`, `/students/me/photo`; `GET /students/me/applications`; `POST /seminars/{id}/register`
**Company/Employer:** `GET /companies?q=&industryId=&page=` (search); `GET /companies/{id}`; `GET/PUT /employers/me/company`; `POST /employers/me/company/logo`
**Jobs:** `GET /jobs?q=&companyId=&location=&employmentStatus=&page=`; `GET /jobs/{id}`; `POST/PUT/DELETE /employers/me/jobs`; `POST /employers/me/candidate-criteria`; `GET /employers/me/jobs/{id}/applications`; `PATCH /employers/me/applications/{id}/status`; `GET /files/{id}` (authorized download or short-lived signed URL)
**Applications:** `POST /jobs/{id}/applications` (rejected with a clear list of missing items unless profile is complete and a CV exists; profile auto-attached; answers to Q1/Q2; joining option); `POST /applications/cv-drop` (same completeness rule); `GET /students/me/profile-completeness`
**Assessments:** `GET /assessments/current`, `POST /assessments/attempts`, `PUT /assessments/attempts/{id}/answers`, `POST /assessments/attempts/{id}/submit` (students get no score back); admin: CRUD questions, `GET /admin/assessments/results` (+ CSV), reset attempt; employer: result summary is included only in `GET /employers/me/jobs/{id}/applications` for applicants of that employer's own jobs. Add an authorization test proving an employer cannot read results of non-applicants.
**Public:** `GET /participating-companies` (all approved companies, hiring or not)
**Admin:** `GET /admin/stats`; `GET /admin/employers?status=`; `POST /admin/employers/{id}/approve|reject`; `GET /admin/students` (+ CSV export); `GET /admin/applications` (+ CSV export); CRUD seminars & industries; `PUT /admin/event-settings`; `GET /admin/audit-log`
**Ops:** `GET /health/live`, `/health/ready`; SignalR `/hubs/notifications`

Server enforces registration deadlines using `EventSetting` (admin can extend). Return a clear "registration closed" response.

---

## 9. Frontend pages & flows

- `/` Landing: Job Fair 2026 title, countdown to deadlines, two big buttons **I'm a Student / I'm an Employer**, QR-friendly, tagline.
- `/register/student` → single clean form (fields from 2.1A, AIUB email only) → email verification → **complete profile (required fields only, with progress bar; experience and references are optional)** → **psychometric assessment (no score shown to the student)** → **"Want to apply for a job?"**
  - **Yes** → company search → company page → job list → **Apply** (CV upload, Q1/Q2 if present, Joining Date, Submit)
  - **No** → **Just drop your CV** (upload + optional joining option)
  - If the profile or CV is incomplete, Apply/Drop buttons show a checklist of what is missing and link to the right step.
- `/companies` "Participating companies": every approved company, including "not hiring" ones.
- `/register/employer` → fields from 2.1B (HR name/email/mobile, logo) → "Registration completed" → **Any ongoing hiring?** Yes → create job post / No → upload desired-candidate criteria. Show "Awaiting admin approval" state.
- `/student/profile` multi-step profile builder (2.4) with progress indicator, autosave, repeatable experience/reference blocks.
- `/student/applications` list & status.
- `/employer/dashboard` company profile, jobs, candidate criteria, applicants per job (CV download).
- `/jobs`, `/jobs/[id]`, `/companies`, `/companies/[id]`: public browse/search (published jobs of approved companies only).
- `/admin/*` dashboard, employer approvals, students, applications, seminars, settings, exports.
- Quality: loading/empty/error states, form-level + field-level errors, accessible labels, 360 px-wide first design, image/CV upload progress, light skeletons. Use the AIUB look (ask owner for brand colors/logo; otherwise a neutral professional theme with easily changed design tokens).

---

## 10. Security & privacy (non-negotiable)

- HTTPS only; HSTS; security headers (CSP, X-Content-Type-Options, Referrer-Policy, frame-ancestors).
- Uploads: CV = PDF only (≤ 5 MB), photos/logos = jpg/png/webp (≤ 2 MB); validate by **magic bytes**, not just extension; random storage keys; **private** storage; downloads through authorized endpoint or short-lived signed URL; consider malware scan hook (document as future work).
- Authorization: students see only their own data; employers only applicants to their own jobs; admin everything. Write tests for these rules (IDOR tests).
- Prevent mass registration abuse: rate limits, email verification, optional CAPTCHA (Cloudflare Turnstile is free) — ask owner before adding.
- Employer approval before public listing (protects students from scam postings).
- PII minimization; no PII in logs; consent checkbox with privacy text; admin can delete a student's data on request; document retention (default: delete or anonymize after the agreed period).
- Dependabot/`npm audit`/`dotnet list package --vulnerable` in CI.
- Backups: nightly `pg_dump` (or SQL Server backup) script + restore tested once before launch.

---

## 11. Non-functional targets

- Handles ~10k registered students; deadline spikes of a few hundred concurrent users; p95 API < 500 ms for normal reads.
- Run a simple load test (k6, free) before launch and record results in `docs/`.
- Structured logs, request IDs, basic error alerting (e.g. free uptime monitor like UptimeRobot hitting `/health/live`).
- Accessible (WCAG AA basics) and works on slow mobile networks (small bundles, image optimization).

---

## 12. Hosting & prerequisite guides (you must produce these)

### 12.1 Reality check you must tell the owner
Free tiers are fine for **development, demos and testing**, but they often **sleep when idle (cold starts of 30–60 s)**, have small databases, and may restrict "commercial" or institutional use. For the real registration window, recommend a small always-on server (a free always-on VM if available, or a low-cost VPS provided by AIUB/the club). Ask the owner which route to take **before** Phase 1 deployment.

### 12.2 Candidate free options (VERIFY current terms before recommending; list pros/cons and the date checked)
| Need | Candidates to evaluate |
|---|---|
| Frontend | Vercel (check Hobby plan's non-commercial terms), Cloudflare Pages, Netlify, or run the Docker image on the same VM |
| API (container) | Render, Google Cloud Run, Azure App Service free tier, Koyeb, Fly.io (check if still free), Oracle Cloud "Always Free" VM (best match for a later Contabo VPS move: identical docker-compose) |
| PostgreSQL | Neon, Supabase, Aiven free tier, or Postgres container on the VM |
| File storage | Cloudflare R2, Supabase Storage, Backblaze B2 (all S3-compatible) |
| Email (SMTP) | Brevo, Resend, Mailgun free tiers |
| Domain/DNS | Cloudflare DNS (free) + a cheap domain, or an AIUB subdomain |
| CI & images | GitHub Actions + GitHub Container Registry |
| Uptime monitor | UptimeRobot / Better Stack free |
| QR code | Generate a static SVG/PNG QR for the final domain once the domain is fixed |

Recommend ONE concrete combination with reasoning, a fallback combination, and the monthly cost if AIUB later upgrades.

### 12.3 Guide template (use for every guide in `/docs/guides/`)
1. **What it is & why we need it** (2–3 lines)
2. **Cost / limits** (and date verified, with official link)
3. **Prerequisites** (accounts, cards, tools to install)
4. **Step-by-step** with exact menu names/commands; mark steps the owner must do manually
5. **Values to copy** → which env var each goes into
6. **How to verify it works** (a command or URL to test)
7. **Common errors & fixes**
8. **How to replace/migrate away later** (portability)

### 12.4 Guides to produce (at minimum)
`01-dev-environment` (install .NET SDK, Node, Docker, Git; run everything locally) · `02-github-repo-and-ci` · `03-domain-and-dns` · `04-database-hosting` · `05-file-storage-s3` · `06-email-smtp` · `07-deploy-api` · `08-deploy-web` · `09-environment-variables` · `10-qr-code` · `11-backups-and-restore` · `12-switch-to-sqlserver` · `13-move-to-vps-contabo` (docker-compose + Caddy + firewall + updates) · `14-move-to-aws` (container service or EC2/Lightsail + RDS; S3 storage; SES email) · `15-handover-checklist`.

Where a provider has an API/CLI (e.g. Cloudflare, Render, AWS CLI), explain it and show how the owner can use it, but keep the app itself free of provider APIs.

---

## 13. Phases & timeline (today = 2 Nov 2026; student deadline 5 Dec; employer deadline 12 Dec)

**Phase 0 — Foundation (2–4 Nov).** Answer open questions; create repo, solution, Docker/compose, CI; "hello world" API + web + DB deployed end-to-end on the chosen host (de-risk deployment first); domain + DNS decided; guides 01–04, 07–09 written.

**Phase 1 — Registration live (5–15 Nov).** Auth, email verification, student & employer registration (2.1), lookups, deadline settings, minimal admin (employer approval, student list/CSV), landing page, deployment with real domain, backups, QR code. **Public launch target: 16 Nov (Q12).**

**Phase 2 — Core matching (16–25 Nov).** Student profile builder (2.4) with completeness rules, CV/photo/logo uploads, company profile, job posts & candidate criteria, participating-companies page, public search/browse, apply flow (Q1/Q2, joining date), CV-drop, applicant view for employers. Get the psychometric question content/scoring answers from the owner during this phase.

**Phase 3 — Assessment, hardening & extras (26 Nov – 4 Dec).** Psychometric module (question bank, student flow, admin results), seminars, SignalR notifications (optional), admin exports/stats, rate limits/CAPTCHA, load test, security review, accessibility/mobile polish.

**Phase 4 — Run & hand over (5–12 Dec and after).** Monitor, fix bugs, support employer deadline, finalize docs (`ARCHITECTURE`, `DEPLOYMENT`, `ADMIN_GUIDE`, `RUNBOOK`), run the **handover rehearsal**: deploy the whole system to a clean VPS from scratch using only the docs.

If the schedule slips, cut in this order: SignalR → application status workflow → CAPTCHA → psychometric extras (keep a simple question-and-summary version rather than dropping it, since the owner confirmed it is in scope). Never cut: security, backups, deadline enforcement, employer approval, profile-completeness enforcement.

---

## 14. Testing & Definition of Done

A feature is done when: it has validation on client + server; unit tests for business rules; at least one integration test against a real DB (both engines in CI for DB-touching code); authorization tests; works at 360 px width; errors are user-friendly; docs/guide updated; CI green.

Critical automated tests: duplicate AIUB ID/email rejected; registration after deadline rejected; a student cannot apply twice to the same job; employer cannot read another company's applicants; unapproved company's jobs are not public; invalid file types rejected; Joining Date and Q1/Q2 rules enforced.

---

## 15. Handover package for AIUB

- Source repo with clean history and a `LICENSE` choice confirmed by the club/AIUB.
- `README.md` (5-minute local start), `ARCHITECTURE.md`, `DEPLOYMENT.md`, `ADMIN_GUIDE.md` (non-technical, with screenshots), `RUNBOOK.md` (restart, backup, restore, rotate secrets, extend deadlines), `DEPENDENCIES.md`, `.env.example`.
- Prebuilt images or a one-command build; `docker compose up -d` works on a fresh Ubuntu VPS.
- Seed/admin-creation instructions; data export & deletion procedures.
- A list of every account the club created (hosting, domain, email, storage) with **ownership transfer steps** to AIUB. Do not store any credentials in the repo.

---

## 16. Your first response must be

1. Your 15-line understanding of this spec.
2. Remaining unanswered questions from Section 3 (only those that block Phase 0).
3. Your recommended hosting combination (Section 12) with verified limits and dates.
4. The exact Phase 0 task list, then wait for the owner's go-ahead.
