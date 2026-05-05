import "server-only";
import { initialPromos } from "@/lib/mocks/panel-data";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";
import type { PromoAdmin, PromoCustomizationPolicy } from "@/lib/types/panel";

type PromoItemRow = {
  id: string;
  title: string;
  description: string;
  image: string;
  simple_price: number;
  double_price: number;
  is_combo: boolean;
  duration_days: number;
  customization_policy: PromoCustomizationPolicy;
  badge_text: string | null;
  linked_product_slug: string | null;
  status: "active" | "paused";
};

const EXCLUDED_PROMO_TITLES = new Set(["Lunch Week", "Noche Snotty"]);

export async function fetchPromoItems(options?: { activeOnly?: boolean }): Promise<PromoAdmin[]> {
  const filteredFallback = initialPromos.filter((item) => !EXCLUDED_PROMO_TITLES.has(item.title));
  const fallback = options?.activeOnly ? filteredFallback.filter((item) => item.status === "active") : filteredFallback;
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return fallback;
  }

  let query = supabase
    .from("promo_items")
    .select("id,title,description,image,simple_price,double_price,is_combo,duration_days,customization_policy,badge_text,linked_product_slug,status")
    .order("title", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error || !data) {
    return fallback;
  }

  const mapped = data
    .map(mapPromoItemRow)
    .filter((item) => !EXCLUDED_PROMO_TITLES.has(item.title));
  return mapped;
}

export function mapPromoItemRow(row: PromoItemRow): PromoAdmin {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    image: row.image,
    simplePrice: row.simple_price,
    doublePrice: row.double_price,
    isCombo: row.is_combo,
    durationDays: row.duration_days,
    customizationPolicy: row.customization_policy,
    badgeText: row.badge_text ?? undefined,
    linkedProductSlug: row.linked_product_slug ?? undefined,
    status: row.status,
  };
}