import { createClient } from "@supabase/supabase-js";

// Hard-coded URL for this project
export const SUPABASE_URL = "https://syuzdfnfosvpnghkosbd.supabase.co";

// Anon key from Vite env
export const SUPABASE_ANON_KEY = import.meta.env
  .VITE_SUPABASE_ANON_KEY as string;

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
