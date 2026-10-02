# PASSWORD_HASHING Security Report

## Status: MEDIUM

## Findings

### Custom password storage in memory
`otp-service.ts` stores user passwords in a server-side in-memory Map:
```ts
const userPasswordStore = new Map<string, string>();
// ...
userPasswordStore.set(email, passwordInput); // PLAINTEXT
```

### 🔴 CRITICAL — Passwords stored in PLAINTEXT in memory
When a user sets a password during OTP verification, it is stored as a **plaintext string** in `userPasswordStore`. No hashing is applied.

### ✅ Supabase Auth handles its own password hashing
When `admin.auth.admin.createUser({ password: passwordInput })` or `admin.auth.admin.updateUserById(..., { password })` is called, Supabase Auth uses bcrypt internally.

However, the plaintext password is:
1. Stored in memory (`userPasswordStore.set(email, passwordInput)`)
2. Compared plaintext in `requestVerifyPassword`:
```ts
const activePassword = userPasswordStore.get(email);
if (!activePassword || activePassword !== password) { ... }
```

This is a parallel auth system that **bypasses** Supabase's secure password handling. Passwords are never hashed before comparison.

### Risk severity
Since this is in-memory (lost on restart), an attacker needs code execution to access it. But the architecture itself is flawed — passwords should never be stored or compared in plaintext.

## What's at risk

- Any server-side memory dump exposes all active user passwords in plaintext
- The custom password verification path is insecure by design
- Serverless restarts clear the store — meaning password login breaks on cold starts

## What's already secure

- Supabase Auth receives and hashes passwords via admin API
- The Supabase side of password verification is secure

## Recommendations

1. **CRITICAL**: Remove `userPasswordStore` and the plaintext in-memory password system entirely
2. **HIGH**: Use Supabase's built-in `signInWithPassword` for password verification instead of the custom path
3. **HIGH**: Replace the custom `requestVerifyPassword` with Supabase Auth's native sign-in
