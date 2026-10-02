# ERROR_HANDLING Security Report

## Status: MEDIUM

## Findings

### ⚠️ MEDIUM — Error messages expose internal details to clients

**`src/lib/server/auth-controller.ts`:**
```ts
return { status: 500, body: { success: false, error: err?.message || "Internal server error." } };
```
The raw `err.message` is returned to the client. If an exception contains internal details (file paths, SQL errors, library names), they are exposed.

**`vite.config.ts` (authApiPlugin):**
```ts
return res.end(JSON.stringify({ success: false, error: err?.message || "Internal server error." }));
```
Same issue — raw error messages forwarded to the client.

### ✅ No FastAPI `/docs` or similar debug endpoints
No FastAPI, Spring Boot Actuator, or GraphQL Playground dependencies found.

### ✅ TanStack Start / Vite production mode
The app uses Vite with `mode` detection. Debug tooling (`devClientErrorLogger`, `devServerFnErrorLogger`, `authApiPlugin`) only runs during dev (`apply: "serve"`).

### ✅ No Django `DEBUG=True` equivalent
This is a React/Node app — no Django-style debug mode.

### ⚠️ LOW — No global error boundary at SSR level
The TanStack Router `__root.tsx` doesn't define an `errorComponent` to catch and handle SSR rendering errors gracefully.

## What's at risk

- Stack traces or internal error messages leaked to API responses
- Error messages revealing implementation details (library names, paths)

## What's already secure

- Dev-only plugins are correctly scoped to `apply: "serve"`
- No debug documentation endpoints (no `/docs`, `/openapi.json`, etc.)
- Production build does not include dev error logging

## Recommendations

1. **MEDIUM**: Replace `err?.message` returns with generic messages in all auth controller catch blocks
2. **MEDIUM**: Log full errors server-side, return only `"Internal server error."` to clients
3. **LOW**: Add `errorComponent` to `__root.tsx` for SSR error handling
