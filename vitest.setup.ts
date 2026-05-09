// Garante que as env vars existam ANTES de qualquer módulo ser importado
// Sem isso, supabaseUrl e supabaseAnonKey são "" e supabase = null
process.env.NEXT_PUBLIC_SUPABASE_URL      = "https://test.supabase.co";
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = "test-anon-key-for-unit-tests";
