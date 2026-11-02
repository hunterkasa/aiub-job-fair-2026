# Guide 04: Free PostgreSQL Database Hosting on Neon

---

## 1. What it is & why we need it
A managed PostgreSQL cloud database stores user accounts, student profiles, job postings, and applications. Neon provides a cloud PostgreSQL service with a permanent free tier that requires zero credit cards.

## 2. Cost / limits
* **Cost:** $0.00 / month (No credit card required).
* **Limits:**
  * **Storage:** 1 GB per project.
  * **Compute:** 100 Compute Unit (CU) hours per month.
  * **Scale-to-zero:** Computes suspend after 5 minutes of inactivity; automatically wakes on incoming query within ~500ms.
  * **Egress:** 5 GB network transfer per month.
* **Date verified:** November 2026.
* **Official link:** [Neon Pricing & Free Plan](https://neon.tech/pricing)

## 3. Prerequisites
* Free Neon account created at [neon.tech](https://neon.tech) using your GitHub or Google account.

## 4. Step-by-step setup
### Step 1: Create a Neon Project *(Manual)*
1. Log into [console.neon.tech](https://console.neon.tech).
2. Click **Create Project**.
3. Name: `aiub-jobfair-2026`.
4. Region: Choose `Singapore (ap-southeast-1)` or `Frankfurt` (Singapore has the lowest latency to Bangladesh).
5. Click **Create Project**.

### Step 2: Retrieve the Connection String *(Manual)*
1. On the Neon dashboard, navigate to **Dashboard** -> **Connection Details**.
2. Select **Connection string** dropdown and choose **.NET** or standard **Postgres**.
3. It will look like:
   `Host=ep-quick-smoke-12345.ap-southeast-1.aws.neon.tech;Database=neondb;Username=user;Password=secret;SslMode=Require`
4. Copy this connection string.

## 5. Values to copy → Environment variables
In your hosting environment (or local `.env`):
* `Database__Provider`: `PostgreSql`
* `ConnectionStrings__Default`: `Host=ep-xxx.neon.tech;Port=5432;Database=neondb;Username=xxx;Password=xxx;SslMode=Require`

## 6. How to verify it works
Run the API locally with the Neon connection string or test with psql:
```powershell
# Set environment variable temporarily in PowerShell
$env:ConnectionStrings__Default="<PASTE_NEON_STRING>"
$env:Database__Provider="PostgreSql"
cd apps/api/src/Api
dotnet run
```
Browse to `http://localhost:5000/health/ready`. The response will show `"status": "Healthy"` and `"database": "Healthy"`.

## 7. Common errors & fixes
* **Error:** `The server certificate was rejected by the trust provider`
  * *Fix:* Ensure `;SslMode=Require` is present at the end of your connection string.
* **Error:** `Connection timeout during cold start`
  * *Fix:* When Neon compute wakes up from sleep, the first query may take 1-2 seconds. EF Core retries automatically.

## 8. How to replace/migrate away later (portability)
Because EF Core uses standard SQL and standard PostgreSQL drivers (`Npgsql`), you can migrate to an on-premise PostgreSQL container or cloud database by simply changing the `ConnectionStrings__Default` environment variable. If AIUB prefers Microsoft SQL Server, set `Database__Provider=SqlServer` and provide the SQL Server connection string (see Guide 12).
