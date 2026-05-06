import "server-only";
import { fetchMenuItemBadgeMap } from "@/lib/data/menu-item-badges";
import { fetchMenuItemOfferMap } from "@/lib/data/menu-item-offers";
import { initialMenuItems } from "@/lib/mocks/panel-data";
import type { MenuDiscountTarget, MenuItemAdmin } from "@/lib/types/panel";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";

type MenuItemRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  created_at?: string | null;
  simple_price: number;
  double_price: number;
  discount_target: MenuDiscountTarget | null;
  discount_percent: number | null;
  status: "active" | "paused";
};

export async function fetchMenuItems(options?: { activeOnly?: boolean }): Promise<MenuItemAdmin[]> {
  const fallbackBase = options?.activeOnly ? initialMenuItems.filter((item) => item.status === "active") : initialMenuItems;
  const [badgeMap, offerMap] = await Promise.all([fetchMenuItemBadgeMap(), fetchMenuItemOfferMap()]);
  const fallback = fallbackBase.map((item) => {
    const offer = offerMap[item.id];
    return {
      ...item,
      badgeText: badgeMap[item.id],
      discountTarget: offer?.discountTarget,
      discountPercent: offer?.discountPercent,
    };
  });
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return fallback;
  }

  let query = supabase
    .from("menu_items")
    .select("*")
    .order("name", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error || !data) {
    return fallback;
  }

  const mapped = data.map((row) => mapMenuItemRow(row, badgeMap, offerMap));
  return mapped.length > 0 ? mapped : fallback;
}

function mapMenuItemRow(
  row: MenuItemRow,
  badgeMap: Record<string, string>,
  offerMap: Record<string, { discountTarget: MenuDiscountTarget; discountPercent: number }>,
): MenuItemAdmin {
  const offer = offerMap[row.id];

  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    createdAt: row.created_at ?? undefined,
    simplePrice: row.simple_price,
    doublePrice: row.double_price,
    badgeText: badgeMap[row.id],
    discountTarget: offer?.discountTarget,
    discountPercent: offer?.discountPercent,
    status: row.status,
  };
}