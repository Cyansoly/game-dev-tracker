import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

if (!supabaseUrl) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in .env.local");
}

if (!supabaseKey) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local");
}

if (!supabaseUrl.startsWith("http://") && !supabaseUrl.startsWith("https://")) {
  throw new Error(
    `Invalid NEXT_PUBLIC_SUPABASE_URL: ${supabaseUrl}. It must start with https://`
  );
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});