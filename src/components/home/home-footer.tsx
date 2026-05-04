import Image from "next/image";
import Link from "next/link";
import type { Location } from "@/lib/types/order";

type HomeFooterProps = {
  locations: Location[];
};

export function HomeFooter({ locations }: HomeFooterProps) {
  return (
    <footer id="contacto" className="scroll-mt-24 mt-8 bg-[var(--foreground)] py-10 text-white sm:scroll-mt-28 sm:mt-10 sm:py-12 md:py-14">
      <div className="site-frame space-y-8 sm:space-y-10">
        <div className="grid gap-7 md:grid-cols-[1.2fr_1fr_1.2fr] md:gap-8">
          <section className="space-y-3">
            <Image src="/images/home/logosnotty.png" alt="Snotty Burgers" width={150} height={56} className="h-10 w-auto sm:h-11" />
            <p className="max-w-xs text-[13px] leading-6 text-white/78 sm:text-sm sm:leading-7">
              Burgers con actitud, producto real y sabor de barrio para gente que sabe elegir.
            </p>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Links Rapidos</p>
            <div className="flex flex-col gap-2 text-sm font-semibold">
              <a href="#menu" className="text-white/90 transition hover:text-white">Menu</a>
              <a href="#historia" className="text-white/90 transition hover:text-white">Nuestra Historia</a>
              <Link href="/orden" className="text-white/90 transition hover:text-white">Pedir Ahora</Link>
            </div>
          </section>

          <section className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/70">Redes y Ubicaciones</p>
            <a
              href="https://instagram.com/snottyburger"
              target="_blank"
              rel="noreferrer"
              className="inline-flex text-sm font-semibold text-white/90 transition hover:text-white"
            >
              Instagram: @snottyburger
            </a>
            <ul className="space-y-1.5 text-sm text-white/80">
              {locations.map((location) => (
                <li key={location.id}>
                  <span className="font-semibold text-white/92">{location.name}:</span> {location.address}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <div className="border-t border-white/10 pt-5 text-center text-[11px] uppercase tracking-[0.12em] text-white/60 sm:text-xs">
          <p>© 2025 Snottyburger. Hecho con amor y mucha carne.</p>
        </div>
      </div>
    </footer>
  );
}
