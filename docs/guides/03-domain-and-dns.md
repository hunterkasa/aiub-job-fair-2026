# Guide 03: Domain & DNS Configuration

---

## 1. What it is & why we need it
Because the Job Fair QR code is printed on university posters, the public URL must never change. We point our chosen domain via DNS records to whichever free or paid hosting provider is currently running the site.

## 2. Cost / limits
* **Cost:** $0.00 for Cloudflare DNS management. If AIUB provides a subdomain (`jobfair.aiub.edu`), domain registration cost is $0.00. If buying a fallback domain (e.g. `.org` or `.xyz`), cost is ~$5-$12/year.
* **Limits:** Unlimited DNS queries and free SSL on Cloudflare.
* **Date verified:** November 2026.
* **Official link:** [Cloudflare DNS Free Tier](https://www.cloudflare.com/plans/)

## 3. Prerequisites
* A free Cloudflare account at [cloudflare.com](https://dash.cloudflare.com).
* Domain name registered (or AIUB IT contact who manages DNS for `aiub.edu`).

## 4. Step-by-step setup
### Step 1: Add Domain to Cloudflare *(Manual)*
1. Log into Cloudflare dashboard and click **Add a site**.
2. Enter your domain name and select the **Free** plan.
3. Follow the instructions to change your domain registrar nameservers to Cloudflare's assigned nameservers.

### Step 2: Configure DNS Records for Vercel / Netlify *(Manual)*
* **For Vercel:**
  * Type: `CNAME` | Name: `@` or `jobfair` | Target: `cname.vercel-dns.com` | Proxy: DNS only (Grey Cloud) during verification.
* **For VPS (later in Phase 4):**
  * Type: `A` | Name: `@` or `jobfair` | Target: `<YOUR-VPS-PUBLIC-IP>` | Proxy: Proxied (Orange Cloud) for DDoS protection.

### Step 3: Configure SSL/TLS Mode in Cloudflare *(Manual)*
1. In Cloudflare dashboard, go to **SSL/TLS**.
2. Select **Full (Strict)** if your server has Caddy/Let's Encrypt, or **Full** for managed cloud hosts.

## 5. Values to copy → Environment variables
* `DOMAIN`: Enter your exact domain (e.g., `jobfair.aiub.edu` or your custom domain).
* `Cors__AllowedOrigins__1`: `https://<YOUR-DOMAIN>`

## 6. How to verify it works
Run in PowerShell:
```powershell
Resolve-DnsName jobfair.aiub.edu
```
Ensure the resolved address returns the configured CNAME or IP address.

## 7. Common errors & fixes
* **Error:** `Too many redirects (ERR_TOO_MANY_REDIRECTS)`
  * *Fix:* In Cloudflare dashboard under SSL/TLS, ensure encryption mode is set to **Full** or **Full (Strict)**, never "Flexible".
* **Error:** `DNS changes not propagating`
  * *Fix:* DNS records usually update within 5-15 minutes on Cloudflare; clear your local DNS cache with `ipconfig /flushdns`.

## 8. How to replace/migrate away later (portability)
Because all traffic routes through standard DNS records, moving the website from Vercel to AIUB's on-campus server requires only updating the `A` record IP address in DNS. No code changes are required.
