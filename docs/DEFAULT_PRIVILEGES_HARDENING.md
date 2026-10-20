# Default-privilege hardening (prototype)

This migration changes **default privileges only**. It does not revoke grants from, alter, or otherwise modify any existing table, sequence, or function. It targets objects created by the `postgres` role, which is the creator role confirmed in the prototype's current `pg_default_acl`.

## Intended effect

- Future tables in `public`: no default table privileges for `anon` or `authenticated`.
- Future sequences in `public`: no default sequence privileges for `anon` or `authenticated`.
- Future functions created by `postgres`: remove the implicit `EXECUTE` grant to `PUBLIC`, and remove schema-specific `EXECUTE` defaults for `anon` and `authenticated` in `public`.

**Scope note:** PostgreSQL combines global and schema-specific default privileges. A schema-specific revoke cannot cancel the built-in/global default `EXECUTE TO PUBLIC` for functions. The migration therefore revokes that default globally for future functions created by `postgres`, not just functions in `public`. This does not change existing functions or functions created by another owner, but future functions in other schemas created by `postgres` will also require explicit `EXECUTE` grants. Review that impact before applying this migration to any project beyond the prototype.

The migration intentionally leaves `service_role` defaults and all existing object ACLs untouched. New app tables/functions must declare their required grants and RLS policies explicitly.

## Verification

Run this read-only query after applying the migration in a disposable/local Supabase database first. It should return **zero rows** for `anon` and `authenticated` defaults on public tables, sequences, and functions; there should also be no global `PUBLIC EXECUTE` default for functions created by `postgres`.

```sql
select
  case d.defaclobjtype
    when 'r' then 'tables'
    when 'S' then 'sequences'
    when 'f' then 'functions'
  end as object_type,
  coalesce(n.nspname, '<global>') as schema_name,
  case a.grantee when 0 then 'PUBLIC' else a.grantee::regrole::text end as grantee,
  a.privilege_type
from pg_default_acl d
cross join lateral aclexplode(d.defaclacl) a
left join pg_namespace n on n.oid = d.defaclnamespace
where d.defaclrole = 'postgres'::regrole
  and (
    (n.nspname = 'public' and a.grantee in ('anon'::regrole, 'authenticated'::regrole))
    or (d.defaclnamespace = 0 and d.defaclobjtype = 'f' and a.grantee = 0 and a.privilege_type = 'EXECUTE')
  )
order by object_type, schema_name, grantee, privilege_type;
```

Do not apply this migration to the live prototype as part of Friday's demo prep. First review this PR and validate the migration on a disposable/local database. No credentials or real receipt data are needed.
