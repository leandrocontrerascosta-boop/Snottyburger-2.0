export function HomeStory() {
  return (
    <section id="historia" className="scroll-mt-24 sm:scroll-mt-28">
      <div className="grid gap-5 rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:gap-6 sm:p-5 md:grid-cols-[minmax(0,1fr)_46%] md:rounded-[32px] md:p-7">
        <div className="space-y-3 sm:space-y-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--brand)]">Nuestra Historia</p>
          <h2 className="display-font text-[2.4rem] leading-none text-[var(--foreground)] sm:text-5xl md:text-6xl">Quienes Somos</h2>
          <p className="text-[14px] leading-6 text-[var(--muted)] sm:text-[15px] sm:leading-7">
            Snotty nacio de una idea simple: si vas a comerte una burger, que sea memorable. Buscamos una formula
            sin atajos, con producto real, tecnica y obsesion por cada detalle del sabor.
          </p>
          <p className="text-[14px] leading-6 text-[var(--muted)] sm:text-[15px] sm:leading-7">
            Nuestra cocina trabaja en ritmo rapido, pero con mentalidad artesanal. Pan, carne, salsas y texturas se
            piensan para que cada mordisco tenga impacto y coherencia.
          </p>
          <p className="text-[14px] leading-6 text-[var(--muted)] sm:text-[15px] sm:leading-7">
            No vendemos solo comida. Construimos una experiencia de barrio con energia urbana, identidad propia y una
            sola promesa: calidad alta, siempre.
          </p>
        </div>

        <div className="relative h-[220px] self-start overflow-hidden rounded-[20px] border border-[var(--line)] bg-[#f0e7db] sm:h-[240px] sm:rounded-[24px] md:h-[320px]">
          <video
            className="h-full w-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            preload="metadata"
            poster="/images/order/snotty.webp"
            aria-label="Video de cocina Snotty"
          >
            <source src="/images/home/homereel.mp4" type="video/mp4" />
            Tu navegador no soporta la reproduccion de video.
          </video>
        </div>
      </div>
    </section>
  );
}
