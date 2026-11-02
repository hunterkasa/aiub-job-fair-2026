# Guide 07: Free API Container Deployment on Render

---

## 1. What it is & why we need it
Render runs our containerized ASP.NET Core backend in the cloud, exposing REST API endpoints and health checks publicly over HTTPS for free during initial testing and prototype demonstration.

## 2. Cost / limits
* **Cost:** $0.00 / month on Render's Free tier.
* **Limits:**
  * **RAM / CPU:** 512 MB RAM, 0.1 vCPU.
  * **Instance hours:** 750 free hours per month across free web services.
  * **Sleep policy:** Automatically spins down after 15 minutes of inactivity. Takes 30–60 seconds to wake up upon receiving a request.
  * **Outbound bandwidth:** 5 GB per month included.
* **Date verified:** November 2026.
* **Official link:** [Render Free Tier Documentation](https://render.com/docs/free)

## 3. Prerequisites
* Free Render account at [render.com](https://render.com).
* Your GitHub repository (`aiub-jobfair-2026`) connected to Render.

## 4. Step-by-step setup
### Step 1: Create a New Web Service on Render *(Manual)*
1. Log into your Render dashboard.
2. Click **New +** -> **Web Service**.
3. Choose **Build and deploy from a Git repository**.
4. Select your `aiub-jobfair-2026` repository.

### Step 2: Configure Service Parameters *(Manual)*
* **Name:** `aiub-jobfair-api`
* **Region:** `Singapore` (or Frankfurt)
* **Branch:** `main`
* **Root Directory:** leave blank (repository root)
* **Runtime:** **Docker**
* **Dockerfile Path:** `./apps/api/Dockerfile`
* **Instance Type:** **Free**

### Step 3: Add Environment Variables in Render UI *(Manual)*
Under the **Environment Variables** section, add:
* `ASPNETCORE_ENVIRONMENT`: `Production`
* `ASPNETCORE_URLS`: `http://+:5000`
* `PORT`: `5000`
* `Database__Provider`: `PostgreSql`
* `ConnectionStrings__Default`: `<YOUR_NEON_POSTGRES_CONNECTION_STRING>`
* `Cors__AllowedOrigins__0`: `https://aiub-jobfair-web.vercel.app` (or your frontend URL)

### Step 4: Configure Health Check Path *(Manual)*
In the **Advanced** section of Render service settings:
* **Health Check Path:** `/health/live`

Click **Deploy Web Service**.

## 5. Values to copy → Environment variables
Once Render finishes deploying:
* Copy your service URL (e.g., `https://aiub-jobfair-api.onrender.com`).
* This URL becomes `API_INTERNAL_URL` in your Next.js frontend deployment.

## 6. How to verify it works
Open a browser or run in PowerShell:
```powershell
curl https://aiub-jobfair-api.onrender.com/health/live
```
Expected response:
```json
{"status":"Live","timestampUtc":"..."}
```
And check `/api/v1/info`:
```powershell
curl https://aiub-jobfair-api.onrender.com/api/v1/info
```

## 7. Common errors & fixes
* **Issue:** Initial request takes 30-50 seconds.
  * *Reason:* Expected behavior on Render free tier due to idle spin-down. For the real fair, we will run on the always-on VPS.
* **Error:** `Out of Memory (OOMKilled)`
  * *Fix:* Ensure .NET garbage collection is configured for low memory in containers (`DOTNET_GCHeapHardLimit=400000000`).

## 8. How to replace/migrate away later (portability)
Because the deployment uses a pure standard `Dockerfile` with zero Render-specific code or SDKs, moving to AWS ECS, Azure App Service, Google Cloud Run, or a Contabo VPS simply involves running `docker run` or `docker compose up -d`.
