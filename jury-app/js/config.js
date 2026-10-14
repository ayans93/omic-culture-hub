// This app's backend moved from a Google Apps Script Web App to a real
// Supabase (Postgres) project -- see jury-app/supabase/01_schema_and_functions.sql
// for the schema + RPC functions these values talk to.
export const SUPABASE_URL = "https://ckbbzxormgfgaqbgojxb.supabase.co";
// This is the "anon" / "publishable" key -- it's meant to be used from the
// browser. It has no access to any table directly (RLS blocks that); it
// can only call the specific jury_* functions granted to it in the SQL
// file above, same trust boundary the old Apps Script setup had.
export const SUPABASE_ANON_KEY = "sb_publishable_AI_EcLfJehEoL3ZmGDBjjQ_ruQpVwGk";
