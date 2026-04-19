/**
 * @description Supabase client initialization.
 * @author Abyssal Forge
 * @version 1.0.0
 */
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Prevent crash if env variables are missing (fallback to guest mode)
export const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey)
  : (null as any); 

if (!supabase) {
  console.warn("Supabase credentials missing. Persistence disabled.");
}
