import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '[Supabase] VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY missing. Set them in .env and restart the dev server.'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
