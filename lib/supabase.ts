// FIX: Add reference to vite client types to fix import.meta.env errors.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// Read credentials using Vite's required syntax for client-side env vars.
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;


if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Supabase URL and/or Anon Key is missing. Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are configured in the environment.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);