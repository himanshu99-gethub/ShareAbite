# Security Audit Summary — ShareABite (NGO Project)

Date: 2026-10-02  
Audited by: vibe-check AI Security Audit  
Framework: React 19 + TanStack Start + Supabase + Vercel

---

## Results

| # | Category | Status | Remediation Status | Report | Plan |
|---|----------|--------|-------------------|--------|------|
| 1 | SECRETS_EXPOSURE | 🔴 HIGH | 🟢 **FIXED IN CODE** | [report](reports/SECRETS_EXPOSURE_REPORT.md) | [plan](plans/SECRETS_EXPOSURE_PLAN.md) |
| 2 | DATABASE_ACCESS | 🔴 HIGH* | 🟢 **FIXED IN CODE** | [report](reports/DATABASE_ACCESS_REPORT.md) | — |
| 3 | AUTH_MIDDLEWARE | 🟡 MEDIUM | ℹ️ REVIEWED | [report](reports/AUTH_MIDDLEWARE_REPORT.md) | — |
| 4 | ACCESS_CONTROL | 🟡 MEDIUM | ℹ️ REVIEWED | [report](reports/ACCESS_CONTROL_REPORT.md) | — |
| 5 | FRONTEND_SECRETS | ✅ PASS | ✅ SECURE | [report](reports/FRONTEND_SECRETS_REPORT.md) | — |
| 6 | SSRF | 🟢 LOW | ℹ️ REVIEWED | [report](reports/SSRF_REPORT.md) | — |
| 7 | CSRF | 🟡 MEDIUM | ℹ️ REVIEWED | [report](reports/CSRF_REPORT.md) | — |
| 8 | SECURITY_HEADERS | 🟠 HIGH | 🟢 **FIXED IN CODE** | [report](reports/SECURITY_HEADERS_REPORT.md) | — |
| 9 | CORS | 🟡 MEDIUM | ℹ️ REVIEWED | [report](reports/CORS_REPORT.md) | — |
| 10 | RATE_LIMITING | 🟡 MEDIUM | ℹ️ REVIEWED | [report](reports/RATE_LIMITING_REPORT.md) | — |
| 11 | SQL_INJECTION | ✅ PASS | ✅ SECURE | [report](reports/SQL_INJECTION_REPORT.md) | — |
| 12 | XSS | 🟢 LOW | ✅ SECURE | [report](reports/XSS_REPORT.md) | — |
| 13 | PAYMENT_WEBHOOKS | ⬜ N/A | ⬜ N/A | [report](reports/PAYMENT_WEBHOOKS_REPORT.md) | — |
| 14 | FILE_UPLOADS | 🟡 MEDIUM | ℹ️ REVIEWED | [report](reports/FILE_UPLOADS_REPORT.md) | — |
| 15 | ERROR_HANDLING | 🟡 MEDIUM | 🟢 **FIXED IN CODE** | [report](reports/ERROR_HANDLING_REPORT.md) | — |
| 16 | PASSWORD_HASHING | 🔴 CRITICAL | 🟢 **FIXED IN CODE** | [report](reports/PASSWORD_HASHING_REPORT.md) | — |
| 17 | DEPENDENCIES | 🟡 MEDIUM | ℹ️ REVIEWED | [report](reports/DEPENDENCIES_REPORT.md) | — |

---

## Applied Remediations (Fixed in Code)

### 1. ✅ Passwords stored in PLAINTEXT (PASSWORD_HASHING — CRITICAL)
- **Remediated in [`src/lib/server/otp-service.ts`](file:///d:/Project/NGO%20project/src/lib/server/otp-service.ts)**
- Removed `userPasswordStore` plaintext storage completely.
- Primary authentication now verifies via Supabase Auth `signInWithPassword` (bcrypt).
- Fallback in-memory store uses salted PBKDF2 hashing (`crypto.pbkdf2Sync` with 100,000 iterations of SHA-512) and constant-time buffer comparison (`crypto.timingSafeEqual`).

### 2. ✅ OTP table wildcard RLS policy (DATABASE_ACCESS — CRITICAL)
- **Remediated in [`supabase/migrations/20260730000000_otps_table.sql`](file:///d:/Project/NGO%20project/supabase/migrations/20260730000000_otps_table.sql) & [`supabase/migrations/20261002000000_secure_otps_rls.sql`](file:///d:/Project/NGO%20project/supabase/migrations/20261002000000_secure_otps_rls.sql)**
- Policy restricted strictly `to service_role`. Anonymous and authenticated client users now have zero access to read or tamper with OTP codes.

### 3. ✅ Hardcoded secrets as fallbacks (SECRETS_EXPOSURE — HIGH)
- **Remediated in [`src/lib/server/auth-jwt.ts`](file:///d:/Project/NGO%20project/src/lib/server/auth-jwt.ts), [`src/lib/server/email-service.ts`](file:///d:/Project/NGO%20project/src/lib/server/email-service.ts), [`src/integrations/supabase/client.server.ts`](file:///d:/Project/NGO%20project/src/integrations/supabase/client.server.ts)**
- Removed hardcoded fallback JWT secret; throws error if `JWT_SECRET` is missing.
- Removed hardcoded Gmail email, Gmail App Password, and base64 Resend API key from source.
- Removed `VITE_SUPABASE_PUBLISHABLE_KEY` fallback for service role key.
- Added `RESEND_API_KEY` to [`.env.example`](file:///d:/Project/NGO%20project/.env.example).
- Set `build: { sourcemap: false }` in [`vite.config.ts`](file:///d:/Project/NGO%20project/vite.config.ts).

### 4. ✅ Security Headers (SECURITY_HEADERS — HIGH)
- **Remediated in [`vercel.json`](file:///d:/Project/NGO%20project/vercel.json)**
- Configured production security headers: `X-Frame-Options: DENY`, `X-Content-Type-Options: nosniff`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy`, and `Strict-Transport-Security`.

### 5. ✅ Error Handling (ERROR_HANDLING — MEDIUM)
- **Remediated in [`src/lib/server/auth-controller.ts`](file:///d:/Project/NGO%20project/src/lib/server/auth-controller.ts) & [`vite.config.ts`](file:///d:/Project/NGO%20project/vite.config.ts)**
- Replaced exposed internal `err?.message` responses with sanitized generic error messages while preserving server-side console logging for debugging.

---

## Good News

- .env is NOT in git — properly gitignored
- All main DB tables (profiles, donations, pickup_requests) have proper RLS
- SQL injection: PASS — Supabase SDK used throughout
- XSS: LOW — React autoescaping + no innerHTML with user data
- Frontend secrets: PASS — only public Supabase anon key in client bundle
- Payments: N/A (no Stripe)

---

## Manual Verification Checklist

- [ ] Rotate JWT_SECRET — generate new secret
- [ ] Rotate Gmail App Password — revoke at myaccount.google.com
- [ ] Rotate Resend API key — at resend.com/api-keys
- [ ] Update all secrets in Vercel dashboard → Settings → Environment Variables
- [ ] Fix OTP RLS in Supabase dashboard → Table Editor → otps → RLS policies
- [ ] Restrict Supabase CORS → Project Settings → API → CORS Allowed Origins
- [ ] Verify CORS headers on deployed app
- [ ] Run npm audit --audit-level=high
- [ ] Test password login after removing in-memory store
- [ ] Verify uploads require image/* only by trying to upload a .exe file
