# Guide 09: Environment Variables Master Reference

---

## 1. What it is & why we need it
Following 12-factor application design, all configuration settings, connection strings, and security keys are injected via environment variables rather than hardcoded in the codebase.

## 2. Cost / limits
* **Cost:** $0.00.
* **Date verified:** November 2026.

## 3. Prerequisites
* Access to `.env.example` in the repository root.

## 4. Master Variables Directory

| Category | Variable Name | Type / Format | Purpose | Required By | Default / Example |
|---|---|---|---|---|---|
| **Routing** | `DOMAIN` | string | Public domain name | Caddy / Web | `jobfair.aiub.edu` |
| **Routing** | `ACME_EMAIL` | email | Let's Encrypt SSL contact | Caddy | `admin@aiub.edu` |
| **Routing** | `API_INTERNAL_URL` | URL string | Next.js server-side rewrite target for `/api/*` | Web | `http://localhost:5000` |
| **Database** | `Database__Provider` | `PostgreSql` \| `SqlServer` | Database engine selector | API | `PostgreSql` |
| **Database** | `ConnectionStrings__Default` | Connection String | Primary DB connection string | API | `Host=localhost;Database=aiub_jobfair;Username=postgres;Password=...` |
| **Database** | `POSTGRES_DB` | string | PostgreSQL database name | Postgres container | `aiub_jobfair` |
| **Database** | `POSTGRES_USER` | string | PostgreSQL database username | Postgres container | `postgres` |
| **Database** | `POSTGRES_PASSWORD` | string | PostgreSQL database password | Postgres container | strong random password |
| **Auth** | `Jwt__Secret` | string (min 64 chars) | HMAC signing key for JWT tokens | API | random 64-char hex key |
| **Auth** | `Jwt__Issuer` | string | JWT issuer identifier | API | `AIUB.JobFair` |
| **Auth** | `Jwt__Audience` | string | JWT audience identifier | API | `AIUB.JobFair.Web` |
| **Auth** | `Jwt__AccessTokenExpirationMinutes` | integer | Access token lifetime | API | `15` |
| **Auth** | `ADMIN_INITIAL_EMAIL` | email | First-run seeded admin email | API | `jobfair.admin@aiub.edu` |
| **Auth** | `ADMIN_INITIAL_PASSWORD` | string | First-run seeded admin password | API | strong password |
| **Storage** | `Storage__Provider` | `LocalDisk` \| `S3` | File storage provider switch | API | `LocalDisk` (or `S3`) |
| **Storage** | `Storage__ServiceUrl` | URL string | S3 / Cloudflare R2 endpoint | API | `https://<id>.r2.cloudflarestorage.com` |
| **Storage** | `Storage__AccessKey` | string | S3 Access Key ID | API | secret |
| **Storage** | `Storage__SecretKey` | string | S3 Secret Access Key | API | secret |
| **Storage** | `Storage__BucketName` | string | S3 bucket name | API | `aiub-jobfair-assets` |
| **Email** | `Email__SmtpHost` | string | SMTP server hostname | API | `smtp-relay.brevo.com` |
| **Email** | `Email__SmtpPort` | integer | SMTP server port | API | `587` |
| **Email** | `Email__SmtpUsername` | string | SMTP authentication username | API | username |
| **Email** | `Email__SmtpPassword` | string | SMTP authentication password | API | password |
| **Email** | `Email__SenderEmail` | email | From address for outgoing emails | API | `jobfair@aiub.edu` |
| **Email** | `Email__EnableSsl` | boolean | Enable TLS encryption | API | `true` |
| **Rules** | `Student__AllowedEmailDomains` | comma-separated strings | Student domain restriction | API | `student.aiub.edu` |
| **CORS** | `Cors__AllowedOrigins__0` | URL string | Frontend origin for CORS policy | API | `http://localhost:3000` |

## 5. Security Rules for Secrets
1. **Never commit `.env` or any file containing real passwords/keys to Git.** Only `.env.example` belongs in version control.
2. For cloud deployments (Render, Vercel, Neon), enter variables directly into the provider's web dashboard under **Settings** -> **Environment Variables**.
3. For VPS deployments, store them in a secure `.env` file on the VPS with permissions `chmod 600 .env`.

## 6. How to verify it works
Run in PowerShell:
```powershell
# Verify that no tracked files contain secrets
git status
git diff
```

## 7. Common errors & fixes
* **Error:** Double underscore format in .NET (`Database__Provider`) not reading properly on Linux.
  * *Explanation:* ASP.NET Core automatically maps `__` (double underscore) to `:` (colon hierarchy) on Linux environments. Ensure you use two underscores.
