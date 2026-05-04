"use server";

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSupabasePublicEnv } from "@/lib/supabase/env";

export async function loginAction(formData: FormData): Promise<{ error: string } | never> {
  const email = (formData.get("email") as string | null)?.trim() ?? "";
  const password = (formData.get("password") as string | null) ?? "";
  const next = (formData.get("next") as string | null) ?? "/panel";

  const env = getSupabasePublicEnv();
  if (!env) {
    return { error: "Faltan las variables de entorno de Supabase." };
  }

  const cookieStore = await cookies();

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          cookieStore.set(name, value, options);
        });
      },
    },
  });

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    return { error: "Mail o password incorrectos. Intenta de nuevo." };
  }

  redirect(next);
}
