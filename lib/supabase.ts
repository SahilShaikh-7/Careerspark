// FIX: Cast import.meta to any to bypass TypeScript errors with vite/client types.
import { createClient } from '@supabase/supabase-js';

// Read credentials using Vite's required syntax for client-side env vars.
const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and/or Anon Key is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in the environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);