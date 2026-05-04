import Link from "next/link";
import type { Product } from "@/lib/types/order";

type HomeTextMenuProps = {
  burgers: Product[];
};

export function HomeTextMenu({ burgers }: HomeTextMenuProps) {
  return (
    <section id="menu" className="scroll-mt-24 space-y-5 sm:scroll-mt-28 sm:space-y-6">
      <header className="space-y-2 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Carta</p>
        <h2 className="display-font text-[2.4rem] leading-none text-[var(--foreground)] sm:text-5xl md:text-6xl">Nuestro Menu</h2>
        <p className="mx-auto max-w-xl text-[13px] leading-6 text-[var(--muted)] sm:text-sm">Solo burgers. Sin vueltas. Todo bien hecho y en su punto.</p>
      </header>

      <div className="relative rounded-[24px] border border-[color:rgba(143,26,48,0.7)] bg-[var(--surface)] px-3 pb-4 pt-7 shadow-[0_20px_48px_rgba(31,22,18,0.06)] sm:rounded-[28px] sm:px-7 sm:pb-7 sm:pt-10">
        <span className="absolute -top-3.5 left-4 rounded-full border border-[color:rgba(143,26,48,0.75)] bg-[var(--surface)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.14em] text-[var(--brand)] sm:-top-4 sm:left-6 sm:px-4 sm:py-2 sm:text-[11px] sm:tracking-[0.16em]">
          Smashed Burger · 100% Caseras
        </span>

        <div className="space-y-3 sm:space-y-4">
          {burgers.map((burger) => (
            <article
              key={burger.id}
              className="group rounded-[14px] border border-[color:rgba(143,26,48,0.65)] bg-white/45 px-3 py-3 transition duration-300 hover:-translate-y-0.5 hover:bg-[var(--surface-strong)] hover:shadow-[0_10px_22px_rgba(143,26,48,0.12)] sm:px-5 sm:py-4"
              aria-label={burger.name}
            >
              <h3 className="display-font text-[2rem] uppercase leading-none tracking-[0.01em] text-[var(--brand-dark)] transition group-hover:text-[var(--brand)] sm:text-5xl">
                {burger.name}
              </h3>
              <p className="mt-1.5 text-[12px] leading-5 uppercase tracking-[0.06em] text-[var(--brand-dark)]/95 sm:mt-2 sm:text-[18px] sm:leading-8 sm:tracking-[0.08em]">
                {burger.description}
              </p>
            </article>
          ))}
        </div>
      </div>

      <div className="flex justify-center pt-1">
        <Link
          href="/orden"
          className="rounded-full bg-[var(--brand)] px-5 py-2.5 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_12px_24px_rgba(191,36,63,0.28)] transition hover:bg-[var(--brand-dark)] sm:px-6 sm:py-3 sm:text-xs"
        >
          Pedir Ahora
        </Link>
      </div>
    </section>
  );
}
