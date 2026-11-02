# Guide 02: GitHub Repository & Automated CI Workflow

---

## 1. What it is & why we need it
GitHub hosts our team's version-controlled source code. GitHub Actions automatically executes our test suite and builds both backend and frontend applications on every commit, preventing bugs from reaching production.

## 2. Cost / limits
* **Cost:** $0.00 (Free for public and standard private repositories).
* **Limits:** 2,000 GitHub Actions build minutes per month included.
* **Date verified:** November 2026.
* **Official link:** [GitHub Actions Pricing](https://docs.github.com/en/billing/managing-billing-for-your-products/managing-billing-for-github-actions/about-billing-for-github-actions)

## 3. Prerequisites
* A free GitHub account at [github.com](https://github.com).
* Git configured on your local computer.

## 4. Step-by-step setup
### Step 1: Create a GitHub Repository *(Manual)*
1. Log into GitHub and click **New repository**.
2. Name the repository: `aiub-jobfair-2026`.
3. Choose **Private** (or Public as decided by club officers).
4. Do NOT initialize with a README or .gitignore (we already created them locally). Click **Create repository**.

### Step 2: Push your local code to GitHub *(Manual)*
In your local project folder:
```powershell
git add .
git commit -m "feat: phase 0 foundation setup with API, web, docker, and CI"
git branch -M main
git remote add origin https://github.com/<YOUR-USERNAME>/aiub-jobfair-2026.git
git push -u origin main
```

### Step 3: Inspect the Automated CI Run *(Manual)*
1. Navigate to the **Actions** tab on your GitHub repository.
2. Confirm the `CI` workflow is running.
3. Both jobs (`Backend Build & Tests` and `Frontend Build & Typecheck`) must turn green.

## 5. Values to copy → Environment variables
None required for standard CI build & test steps. Later when building container images, GitHub provides `GITHUB_TOKEN` automatically.

## 6. How to verify it works
View the green checkmark next to your latest commit on GitHub. Click **Details** to see the full xUnit test execution log.

## 7. Common errors & fixes
* **Error:** `Authentication failed when running git push`
  * *Fix:* Use a GitHub Personal Access Token (PAT) with `repo` scope or sign in via GitHub Desktop or VS Code.
* **Error:** `dotnet restore fails in CI`
  * *Fix:* Ensure no local-only file paths or local package feeds are referenced in project files.

## 8. How to replace/migrate away later (portability)
The CI steps in `.github/workflows/ci.yml` execute plain bash commands (`dotnet build`, `dotnet test`, `npm run build`). They can be transferred to GitLab CI, Bitbucket Pipelines, or Jenkins without changing application logic.
