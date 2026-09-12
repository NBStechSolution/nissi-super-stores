import { createBrowserClient } from "@supabase/ssr";

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  "https://ymmpbrktvjoghwirmiqm.supabase.co";

const supabaseKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  "sb_publishable_R-U94uYux-IL3OPjRNToJQ_JzOL57Nf";

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseKey);
