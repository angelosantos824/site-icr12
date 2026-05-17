const SUPABASE_URL =
  "https://qczmyahiitbtrmsoimxf.supabase.co";

const SUPABASE_ANON_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFjem15YWhpaXRidHJtc29pbXhmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzg3NjkyMTIsImV4cCI6MjA5NDM0NTIxMn0.tN8coprZC5mXV50t0IXPEIPl2ZGU8-t3Qygcp_mUAp8";

window.supabaseClient = supabase.createClient(
  SUPABASE_URL,
  SUPABASE_ANON_KEY
);

console.log("Supabase configurado:", window.supabaseClient);