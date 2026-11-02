# Guide 08: Free Web Deployment on Vercel / Netlify

---

## 1. What it is & why we need it
Vercel hosts the Next.js frontend application with a global Content Delivery Network (CDN), automatic HTTPS, instant preview branches, and zero hosting costs during development and review phases.

## 2. Cost / limits
* **Cost:** $0.00 / month on Vercel Hobby plan.
* **Limits:**
  * **Bandwidth:** 100 GB per month.
  * **Build minutes:** 6,000 build minutes per month.
  * **Commercial usage:** Hobby plan is for personal/non-commercial/educational projects (AIUB student club qualifies).
* **Date verified:** November 2026.
* **Official link:** [Vercel Pricing & Limits](https://vercel.com/pricing)

## 3. Prerequisites
* Free Vercel account at [vercel.com](https://vercel.com) (sign up with your GitHub account).
* GitHub repository `aiub-jobfair-2026` pushed to GitHub.

## 4. Step-by-step setup
### Step 1: Import Project into Vercel *(Manual)*
1. Log into Vercel dashboard and click **Add New...** -> **Project**.
2. Select your `aiub-jobfair-2026` repository and click **Import**.

### Step 2: Configure Project Settings *(Manual)*
* **Framework Preset:** `Next.js`
* **Root Directory:** Click **Edit** and choose `apps/web`.
* **Build Command:** `npm run build` (default)
* **Output Directory:** `.next` (default)

### Step 3: Configure Environment Variables in Vercel UI *(Manual)*
Expand **Environment Variables** and enter:
* `API_INTERNAL_URL`: `https://aiub-jobfair-api.onrender.com` (your deployed Render API URL, with no trailing slash).

Click **Deploy**.

### Step 4: Add Custom Domain (Optional during prototype) *(Manual)*
1. In Vercel, navigate to **Settings** -> **Domains**.
2. Add your domain (e.g., `jobfair.aiub.edu` or custom domain).
3. Update DNS CNAME as detailed in `Guide 03`.

## 5. Values to copy → Environment variables
* Copy your production Vercel URL (e.g., `https://aiub-jobfair-web.vercel.app`).
* Add this URL to your backend API's `Cors__AllowedOrigins__0` on Render so browser fetch requests are permitted.

## 6. How to verify it works
1. Browse to your Vercel URL on mobile and desktop.
2. Confirm the landing page displays:
   - "AIUB Job Fair 2026"
   - Active countdown timer
   - "API Connected" badge at the top right.

## 7. Common errors & fixes
* **Error:** `CORS error in browser console when fetching /api/v1/info`
  * *Fix:* Ensure the exact Vercel frontend URL is present in the API's `Cors__AllowedOrigins` environment variable on Render.
* **Error:** `Build failure: Cannot find module`
  * *Fix:* Ensure the Root Directory is set to `apps/web` in Vercel project settings.

## 8. How to replace/migrate away later (portability)
Our `next.config.ts` uses `output: "standalone"`. When moving to an on-premise VPS or dedicated server, the identical Next.js application runs directly as a Docker container using `apps/web/Dockerfile` with no code changes.
