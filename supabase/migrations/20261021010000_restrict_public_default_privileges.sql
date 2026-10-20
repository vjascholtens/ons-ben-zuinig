-- Restrict default grants for FUTURE objects only; existing tables, sequences and functions are untouched.
-- Confirmed on the prototype: broad defaults belong to the postgres creator role.
-- Application migrations must explicitly grant the minimum required access for each new object.

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON TABLES FROM anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE ALL PRIVILEGES ON SEQUENCES FROM anon, authenticated, service_role;

-- PostgreSQL adds schema-specific defaults to global function defaults. A schema-only
-- REVOKE cannot cancel the built-in/global EXECUTE grant to PUBLIC, so remove that
-- implicit grant globally for future functions created by postgres. Existing functions
-- and functions created by other owners are not changed. Future functions must receive
-- explicit EXECUTE grants where needed.
ALTER DEFAULT PRIVILEGES FOR ROLE postgres
  REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

ALTER DEFAULT PRIVILEGES FOR ROLE postgres IN SCHEMA public
  REVOKE EXECUTE ON FUNCTIONS FROM anon, authenticated, service_role;
