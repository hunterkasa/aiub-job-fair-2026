# External Dependencies & Replacement Directory

---

## 1. Runtime & Infrastructure Dependencies

| Dependency | Purpose | Verified Free Tier Limits (Nov 2026) | Replacement Procedure |
|---|---|---|---|
| **Vercel** | Next.js Frontend Hosting | 100 GB bandwidth/mo, 6,000 build minutes/mo, non-commercial Hobby tier. | Run `apps/web/Dockerfile` on VPS or switch to Netlify/Cloudflare Pages. |
| **Render** | ASP.NET Core API Container Hosting | 512 MB RAM, 0.1 CPU, 750 free instance hrs/mo. Spins down after 15 min idle. | Deploy container on VPS via `docker compose up -d` or to Google Cloud Run / Koyeb. |
| **Neon** | Managed PostgreSQL Cloud Database | 1 GB storage, 100 CU-hours/mo, 5 GB egress, auto-sleep after 5 min. | Change `ConnectionStrings__Default` to self-hosted PostgreSQL or Supabase / Aiven. |
| **Cloudflare R2** | Object Storage for CVs & Photos | 10 GB standard storage/mo, 1M Class A ops, 10M Class B ops, $0 egress. | Point S3 configuration to AWS S3, MinIO, or Backblaze B2 (all implement `IFileStorage`). |
| **Brevo** | SMTP Email Service | 300 emails/day free, permanent. | Update `Email__SmtpHost` to Resend, AWS SES, or university postfix SMTP server. |
| **Cloudflare DNS** | Domain Nameserver & SSL | Unlimited DNS queries, free managed SSL. | Transfer DNS nameservers to Route 53, Namecheap, or internal AIUB DNS. |

---

## 2. Software Packages & Licensing Audit

All packages used adhere strictly to MIT, Apache-2.0, or BSD licenses. No commercial or paid subscription libraries (MediatR, AutoMapper, FluentAssertions 8+) are included.

| Package | Project | License | Purpose |
|---|---|---|---|
| `Npgsql.EntityFrameworkCore.PostgreSQL` | Infrastructure | PostgreSQL License (Open Source) | EF Core PostgreSQL provider |
| `Microsoft.EntityFrameworkCore.SqlServer` | Infrastructure | MIT | EF Core SQL Server provider |
| `Microsoft.AspNetCore.Identity.EntityFrameworkCore` | Infrastructure | MIT | Authentication & user management |
| `FluentValidation` | Application | Apache-2.0 | Request validation engine |
| `Serilog.AspNetCore` | Api | Apache-2.0 | Structured 12-factor logging |
| `Serilog.Sinks.Console` | Api | Apache-2.0 | Console sink for containers |
| `Next.js` | Web | MIT | React full-stack framework |
| `Tailwind CSS` | Web | MIT | Utility-first CSS |
| `@tanstack/react-query` | Web | MIT | Server state caching & fetching |
| `lucide-react` | Web | ISC | Accessible UI icons |
| `zod` | Web | MIT | Client-side schema validation |
