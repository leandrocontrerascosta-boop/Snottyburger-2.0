import Link from "next/link";

export const dynamic = "force-dynamic";

import { fetchBurgerModifierGroups } from "@/lib/data/burger-modifier-groups";
import { fetchMenuItems } from "@/lib/data/menu-items";
import { buildBurgerProductsWithModifiers, locations } from "@/lib/order/catalog";
import { HomeFooter } from "@/components/home/home-footer";
import { HomeGallery } from "@/components/home/home-gallery";
import { HomeHero } from "@/components/home/home-hero";
import { HomeNavbar } from "@/components/home/home-navbar";
import { HomeStory } from "@/components/home/home-story";
import { HomeTextMenu } from "@/components/home/home-text-menu";
import { HomeVideoBlock } from "@/components/home/home-video-block";

export default async function HomePage() {
  const [menuItems, modifierGroups] = await Promise.all([
    fetchMenuItems({ activeOnly: true }),
    fetchBurgerModifierGroups(),
  ]);
  const burgers = buildBurgerProductsWithModifiers(menuItems, modifierGroups);

  return (
    <>
      <HomeNavbar />

      <main className="page-shell">
        <div className="site-frame space-y-6 pb-8 pt-20 sm:space-y-7 sm:pb-10 sm:pt-24 md:pt-28">
          <div className="space-y-2 sm:space-y-3">
            <HomeHero />
            <HomeVideoBlock />
          </div>
          <HomeTextMenu burgers={burgers} />
          <HomeStory />
          <HomeGallery />
        </div>

        <HomeFooter locations={locations} />
      </main>

      <Link
        href="/orden"
        className="btn-glow-pulse fixed bottom-3 right-3 z-40 inline-flex items-center rounded-[18px] border-2 border-white/85 bg-[var(--brand)] px-4 py-2.5 text-[11px] font-extrabold uppercase tracking-[0.16em] text-white transition hover:bg-[var(--brand-dark)] sm:bottom-4 sm:right-4 sm:px-5 sm:py-3 sm:text-xs"
      >
        PEDÍ TU SNOTTY AHORA 👇
      </Link>
    </>
  );
}