# Guide 01: Local Development Environment Setup

---

## 1. What it is & why we need it
This guide walks through configuring your personal development workstation with the exact runtimes and compilers required to build, test, and run the AIUB Job Fair 2026 platform locally without relying on cloud services.

## 2. Cost / limits
* **Cost:** $0.00 (100% Free and Open Source).
* **Date verified:** November 2026.
* **Official links:**
  * [.NET SDK 10 LTS](https://dotnet.microsoft.com/download)
  * [Node.js Official Download](https://nodejs.org/)
  * [Git SCM](https://git-scm.com/)

## 3. Prerequisites
* A Windows, macOS, or Linux computer.
* Administrator permissions to install software.
* Code editor (VS Code, Visual Studio 2026/2022, or JetBrains Rider).

## 4. Step-by-step setup
### Step 1: Install Git *(Manual)*
1. Download Git from [git-scm.com](https://git-scm.com/).
2. Run the installer with default options selected.

### Step 2: Install .NET 10 SDK *(Manual)*
1. Download the latest .NET 10 LTS SDK installer for your OS.
2. Complete installation and open a new terminal window.

### Step 3: Install Node.js LTS *(Manual)*
1. Download Node.js (version 22 or 24 LTS).
2. Complete the standard installer.

### Step 4: Clone and run the project locally
Open PowerShell or your shell in the project folder:
```powershell
# Restore & build .NET API
dotnet restore apps/api/AIUB.JobFair.sln
dotnet build apps/api/AIUB.JobFair.sln

# Restore & build Next.js Web
cd apps/web
npm install
npm run build
```

## 5. Values to copy → Environment variables
For running locally without Docker:
* Copy `.env.example` to `.env.local` in `apps/web/`
* Set `API_INTERNAL_URL=http://localhost:5000`

## 6. How to verify it works
Run both applications in two separate terminal windows:

**Terminal 1 (Backend API):**
```powershell
cd "apps/api/src/Api"
dotnet run
```
Verify by browsing to: `http://localhost:5000/api/v1/info` or `http://localhost:5000/health/live`. You should receive HTTP 200 with `{ "status": "Live" }`.

**Terminal 2 (Frontend Web):**
```powershell
cd "apps/web"
npm run dev
```
Open `http://localhost:3000` in your browser. The landing page will load and show "API Connected".

## 7. Common errors & fixes
* **Error:** `'dotnet' is not recognized as an internal or external command`
  * *Fix:* Close and reopen your terminal after installing the .NET SDK so your `PATH` updates.
* **Error:** `Port 5000 is already in use`
  * *Fix:* Change the port in `apps/api/src/Api/Properties/launchSettings.json` or stop the conflicting application.

## 8. How to replace/migrate away later (portability)
All runtime dependencies are standard LTS versions. When handing over to AIUB IT, they can run the identical code using either the installed .NET SDK or containerized Docker images on any OS.
