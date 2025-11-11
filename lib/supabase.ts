import { createClient } from '@supabase/supabase-js';

// Read credentials from secure environment variables for deployment.
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and/or Anon Key is missing. Ensure SUPABASE_URL and SUPABASE_ANON_KEY are configured in the environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);