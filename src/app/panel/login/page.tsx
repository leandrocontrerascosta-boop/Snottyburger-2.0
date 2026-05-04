"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useActionState } from "react";
import { loginAction } from "./actions";

function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/panel";

  const [state, formAction, isPending] = useActionState(
    async (_prev: { error: string } | null, formData: FormData) => {
      formData.set("next", next);
      return loginAction(formData);
    },
    null,
  );

  return (
    <main className="page-shell flex min-h-screen items-center justify-center px-4 py-10 sm:px-6">
      <section className="site-frame w-full max-w-md rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-6 shadow-[var(--shadow)] sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-[var(--brand)]">Panel privado</p>
        <h1 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[var(--foreground)]">Ingresar al panel</h1>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          El navegador puede recordar tu cuenta con autocompletado de email/password para no pedirlo siempre.
        </p>

        <form action={formAction} className="mt-6 space-y-4">
          <label className="block space-y-1 text-sm font-medium">
            Email
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
              placeholder="admin@snottyburgers.com"
            />
          </label>

          <label className="block space-y-1 text-sm font-medium">
            Password
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="w-full rounded-xl border border-[var(--line)] bg-white px-3 py-2.5 text-sm outline-none ring-[var(--brand)]/40 transition focus:ring-2"
              placeholder="********"
            />
          </label>

          {state?.error ? <p className="text-sm font-medium text-[var(--brand)]">{state.error}</p> : null}

          <button
            type="submit"
            disabled={isPending}
            className="w-full rounded-xl bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isPending ? "Ingresando..." : "Entrar al panel"}
          </button>
        </form>

        <div className="mt-5 flex items-center justify-between text-sm">
          <Link href="/home" className="font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]">
            Volver al sitio
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PanelLoginPage() {
  return (
    <Suspense>
      <LoginForm />
    </Suspense>
  );
}

