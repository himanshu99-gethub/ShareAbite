# FILE_UPLOADS Security Report

## Status: MEDIUM

## Findings

### Upload mechanism: Supabase Storage (direct browser upload)
Donation photos are uploaded directly to Supabase Storage from the browser using the `@supabase/supabase-js` client.

### ✅ Authentication required for uploads
```sql
create policy "Authenticated users can upload donation photos"
  on storage.objects for insert
  with check (bucket_id = 'donation-photos' and auth.uid() is not null);
```

### ⚠️ MEDIUM — No file type validation
No MIME type or magic bytes check is enforced at:
- The RLS policy level (Supabase doesn't support this natively)
- The application code level (no validation before upload)

An authenticated user could upload any file type (executable, SVG with XSS payload, etc.)

### ⚠️ MEDIUM — No file size limit enforced in code
No `maxSize` limit is set in the upload call. Supabase free tier has a 50MB default per file, but this is not explicitly enforced in application code.

### ⚠️ LOW — Files not renamed (may expose original filename)
If Supabase Storage preserves original filenames, metadata could leak. Need to verify if files are stored with UUID-based names.

### ✅ Files served from separate Supabase domain
Storage is served from `txjgfbacbysljqaeseqw.supabase.co` — separate from the app domain. XSS from uploaded files cannot affect the app's origin.

## What's at risk

- Malicious file upload (executables, zip bombs, SVG XSS)
- Storage quota exhaustion

## What's already secure

- Auth required to upload
- Files served on a separate domain (no same-origin XSS risk)
- Delete policy requires folder ownership check

## Recommendations

1. **MEDIUM**: Add client-side file type validation (accept only `image/*`)
2. **MEDIUM**: Add file size limit in the upload call (e.g., 5MB max)
3. **LOW**: Store files with UUID-based names, not original filenames
