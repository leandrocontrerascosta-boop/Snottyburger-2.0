import Image from "next/image";

export function HomeHero() {
  return (
    <section className="overflow-hidden rounded-[28px] border border-[var(--line)] bg-[#251919] shadow-[var(--shadow)]" aria-label="Banner principal">
      <div className="relative h-[180px] w-full sm:h-[260px] md:h-[320px] lg:h-[420px]">
        <Image
          src="/images/order/banner-home.webp"
          alt="Banner principal Snotty Burgers"
          fill
          priority
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 95vw, 1500px"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />
      </div>
    </section>
  );
}
