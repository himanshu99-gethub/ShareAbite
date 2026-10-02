# SECRETS_EXPOSURE Fix Plan

## Changes

- `src/lib/server/auth-jwt.ts` — Remove hardcoded fallback JWT secret; throw if missing
- `src/lib/server/email-service.ts` — Remove hardcoded email, password, and Resend key fallbacks; throw if missing
- `src/integrations/supabase/client.server.ts` — Remove VITE_SUPABASE_PUBLISHABLE_KEY fallback for service role key
- `vite.config.ts` — Add explicit `build: { sourcemap: false }`

## New files

- `.env.example` — Add `RESEND_API_KEY=your_resend_api_key` (missing from current example)

## Verification goals

- [ ] `grep -rn "super_secret_jwt" src/` returns nothing
- [ ] `grep -rn "himanshu.projectai" src/` returns nothing
- [ ] `grep -rn "cmVf" src/` returns nothing (base64 Resend key)
- [ ] App throws a clear startup error when JWT_SECRET is missing from env
- [ ] App throws a clear startup error when EMAIL/EMAIL_PASSWORD are missing
- [ ] `build.sourcemap` is explicitly set to `false` in vite.config.ts
- [ ] Service role key fallback no longer references VITE_SUPABASE_PUBLISHABLE_KEY

## Manual verification (for the human)

- Rotate `JWT_SECRET` to a new, long random string (e.g., `openssl rand -base64 64`)
- Rotate Gmail App Password (revoke old one at myaccount.google.com → Security → App passwords)
- Rotate Resend API key at resend.com/api-keys
- Update all above in Vercel environment variables dashboard
