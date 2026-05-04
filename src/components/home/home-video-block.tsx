export function HomeVideoBlock() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[var(--foreground)] shadow-[var(--shadow)]" aria-label="Video de marca">
      <div className="relative h-[220px] w-full sm:h-[320px] md:h-[430px] lg:h-[560px]">
        <video
          className="h-full w-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          preload="metadata"
          poster="/images/order/banner-home.webp"
          aria-label="Video promocional de Snotty Burgers"
        >
          <source src="/images/home/home-reel.mp4" type="video/mp4" />
          Tu navegador no soporta la reproduccion de video.
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-black/20" />
      </div>
    </section>
  );
}
