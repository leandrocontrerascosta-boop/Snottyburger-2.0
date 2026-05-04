"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "#menu", label: "Menu" },
  { href: "#historia", label: "Nuestra Historia" },
  { href: "#contacto", label: "Contacto" },
];

export function HomeNavbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[var(--line)] bg-white/80 backdrop-blur-lg">
      <div className="site-frame">
        <div className="relative flex h-16 items-center justify-between gap-2 sm:h-18 md:h-20 md:gap-3">
          <Link href="/home" className="inline-flex items-center" aria-label="Ir al inicio">
            <Image src="/images/home/logosnotty.png" alt="Snotty Burgers" width={144} height={52} priority className="h-8 w-auto sm:h-9 md:h-10" />
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Navegacion principal">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-semibold text-[var(--foreground)] transition hover:text-[var(--brand)]"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <Link
              href="/orden"
              className="rounded-full bg-[var(--brand)] px-3.5 py-2 text-[10px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_24px_rgba(191,36,63,0.28)] transition hover:bg-[var(--brand-dark)] sm:px-5 sm:py-3 sm:text-xs"
            >
              Pedir Ahora
            </Link>

            <button
              type="button"
              onClick={() => setMobileOpen((current) => !current)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[var(--line)] text-sm text-[var(--foreground)] md:hidden"
              aria-label={mobileOpen ? "Cerrar menu" : "Abrir menu"}
              aria-expanded={mobileOpen}
            >
              <span aria-hidden>{mobileOpen ? "X" : "="}</span>
            </button>
          </div>

          {mobileOpen ? (
            <div className="absolute left-0 right-0 top-[calc(100%-1px)] rounded-b-[20px] border border-t-0 border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_16px_34px_rgba(31,22,18,0.12)] md:hidden">
              <nav className="flex flex-col gap-1" aria-label="Navegacion mobile">
                {navLinks.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="rounded-xl px-3 py-2 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--accent)] hover:text-[var(--brand)]"
                  >
                    {link.label}
                  </a>
                ))}
              </nav>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
