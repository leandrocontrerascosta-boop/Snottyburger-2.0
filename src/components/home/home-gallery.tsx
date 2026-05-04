const placeholders = Array.from({ length: 6 }, (_, index) => index + 1);

export function HomeGallery() {
  return (
    <section className="space-y-4 sm:space-y-5" aria-label="Galeria de clientes">
      <header className="text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Comunidad</p>
        <h2 className="display-font text-[2.4rem] leading-none text-[var(--foreground)] sm:text-5xl md:text-6xl">Nuestros Clientes</h2>
      </header>

      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 sm:gap-3 md:gap-4">
        {placeholders.map((item) => (
          <article
            key={item}
            className="aspect-square rounded-[18px] border border-[var(--line)] bg-[var(--accent)] p-2.5 shadow-[0_10px_24px_rgba(31,22,18,0.06)] transition hover:-translate-y-1 hover:shadow-[0_16px_36px_rgba(31,22,18,0.12)] sm:rounded-[20px] sm:p-3"
          >
            <div className="flex h-full items-center justify-center rounded-[12px] border border-dashed border-[var(--line)] bg-white/45 px-2 text-center sm:rounded-[14px]">
              {/* TODO: Reemplazar por imagen real de cliente */}
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">Foto cliente {item}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
