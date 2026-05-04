"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/browser-client";

export function PanelSignOutButton() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSignOut() {
    const supabase = createSupabaseBrowserClient();
    if (!supabase) {
      router.replace("/panel/login");
      return;
    }

    setIsSubmitting(true);
    await supabase.auth.signOut();
    router.replace("/panel/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleSignOut}
      disabled={isSubmitting}
      className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)] transition hover:text-[var(--foreground)] disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isSubmitting ? "Saliendo..." : "Cerrar sesion"}
    </button>
  );
}
