# Supabase-prototype tests

This guide covers the dedicated prototype only. Never point the script at production and never use real receipts, invoices, customer data, or other personal/financial information.

## Preconditions

1. The prototype project is healthy and its region is verified in the Supabase Dashboard as Frankfurt (`eu-central-1`).
2. The receipt migration in this repository has been applied to that project.
3. Create three separate, confirmed test users in Supabase Dashboard → Authentication → Users:
   - **A:** owner whose receipt is uploaded and inspected.
   - **B:** isolation test; must not see or upload into A's administration.
   - **C:** a fresh user with **no** `accounting_entities` row. C is used to exercise two parallel first uploads and the first-administration race.
4. Set local configuration in `.env.local`. That file is ignored by Git. The service-role key is used only by this local Node script for test cleanup and reading bucket configuration; it must never be put in browser code, a `NEXT_PUBLIC_*` variable, source control, logs, or Issues.

Example local-only entries (replace every placeholder; do not commit this file):

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<PUBLISHABLE_KEY>
SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
OBZ_TEST_USER_A_EMAIL=<A_EMAIL>
OBZ_TEST_USER_A_PASSWORD=<A_PASSWORD>
OBZ_TEST_USER_B_EMAIL=<B_EMAIL>
OBZ_TEST_USER_B_PASSWORD=<B_PASSWORD>
OBZ_TEST_USER_C_EMAIL=<C_EMAIL>
OBZ_TEST_USER_C_PASSWORD=<C_PASSWORD>
OBZ_TEST_BASE_URL=http://localhost:3000
```

The script also accepts `NEXT_PUBLIC_SUPABASE_ANON_KEY` for the publishable key for compatibility with an older local setup. Do not use a service-role key as that value.

## Run the verification

In terminal 1:

```bash
pnpm install --frozen-lockfile
pnpm dev
```

In terminal 2, from the repository root:

```bash
pnpm test:supabase-rls
```

The script exits with code 1 if any assertion fails, 2 if required local configuration is missing, and 0 when all included checks pass. It does not print keys, passwords, access tokens, or full server error objects.

## What the script checks

- unauthenticated requests to the app's receipt list and upload API are rejected;
- A can upload a synthetic PDF and JPEG using the app API and retrieve the metadata through its own list;
- the storage path is scoped to A/user/entity/document UUIDs and does not contain the original filename;
- the API does not return a public/download URL;
- B cannot read A's row, download A's object, upload into A's storage path, or insert metadata against A's administration;
- anonymous table access is denied or yields no rows;
- invalid magic bytes, empty payloads, and files larger than 15 MiB are rejected by the app API without creating a Storage object;
- simultaneous first uploads by fresh user C both succeed, produce two unique records/paths, and share one newly created administration;
- the Storage bucket is private and has the expected size limit and MIME allowlist.

Successfully created test receipt records and their corresponding objects are removed at the end using the local service-role client. The script never removes accounting entities or any rows whose IDs it did not receive from its own successful test uploads.

## Limits and manual verification still required

- The script does **not** simulate an actual database insert failure after the Storage write. Verify that cleanup path separately in the prototype using a controlled, temporary failure injection, then remove the injection and record the exact result.
- RLS isolation is exercised through authenticated Supabase clients. The two parallel first uploads go through `/api/receipts`, so they test the app's race recovery end to end.
- Review the Supabase Data API exposure setting for `public.accounting_entities` and `public.receipts`; table grants and RLS are separate from whether the tables are exposed through the Data API.
- A successful prototype test does not approve the privacy gate for real documents. Review current terms/DPA, subprocessors, data flows, logging/support access, Storage/CDN behavior, retention/deletion and backup/restore first.
