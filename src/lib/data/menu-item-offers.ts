import "server-only";
import type { MenuDiscountTarget } from "@/lib/types/panel";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export type MenuItemOffer = {
  discountPercent: number;
  discountTarget: MenuDiscountTarget;
};

const MENU_ITEM_OFFERS_KEY = "menu-item-offers";

export async function fetchMenuItemOfferMap(): Promise<Record<string, MenuItemOffer>> {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", MENU_ITEM_OFFERS_KEY)
    .single();

  if (error || !data?.value || typeof data.value !== "object") {
    return {};
  }

  return sanitizeOfferMap(data.value as Record<string, unknown>);
}

export async function saveMenuItemOffer(itemId: string, offer?: MenuItemOffer) {
  const supabase = createSupabaseServiceClient();

  if (!supabase || !itemId) {
    return;
  }

  const current = await fetchMenuItemOfferMap();

  if (!offer || !offer.discountPercent || offer.discountPercent <= 0) {
    delete current[itemId];
  } else {
    current[itemId] = {
      discountPercent: normalizeDiscountPercent(offer.discountPercent),
      discountTarget: normalizeDiscountTarget(offer.discountTarget),
    };
  }

  await supabase.from("site_settings").upsert(
    {
      key: MENU_ITEM_OFFERS_KEY,
      value: current,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
}

function sanitizeOfferMap(value: Record<string, unknown>): Record<string, MenuItemOffer> {
  const result: Record<string, MenuItemOffer> = {};

  for (const [itemId, rawOffer] of Object.entries(value)) {
    if (!rawOffer || typeof rawOffer !== "object") {
      continue;
    }

    const maybePercent = (rawOffer as { discountPercent?: unknown }).discountPercent;
    const maybeTarget = (rawOffer as { discountTarget?: unknown }).discountTarget;
    const discountPercent = normalizeDiscountPercent(Number(maybePercent));
    const discountTarget = normalizeDiscountTarget(maybeTarget);

    if (discountPercent <= 0) {
      continue;
    }

    result[itemId] = {
      discountPercent,
      discountTarget,
    };
  }

  return result;
}

function normalizeDiscountTarget(value: unknown): MenuDiscountTarget {
  if (value === "simple" || value === "double" || value === "both") {
    return value;
  }

  return "simple";
}

function normalizeDiscountPercent(value: number) {
  if (!Number.isFinite(value)) {
    return 0;
  }

  return Math.max(0, Math.min(90, Math.round(value)));
}