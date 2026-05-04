"use client";

import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

let browserClient: SupabaseClient | null = null;

export function createSupabaseBrowserClient() {
  if (browserClient) {
    return browserClient;
  }

  const env = getSupabasePublicEnv();
  if (!env) {
    return null;
  }

  browserClient = createBrowserClient(env.url, env.anonKey);
  return browserClient;
}
