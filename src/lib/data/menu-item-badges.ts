import "server-only";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export type MenuItemBadge = string;

const MENU_ITEM_BADGES_KEY = "menu-item-badges";

export async function fetchMenuItemBadgeMap(): Promise<Record<string, MenuItemBadge>> {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return {};
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", MENU_ITEM_BADGES_KEY)
    .single();

  if (error || !data?.value || typeof data.value !== "object") {
    return {};
  }

  return sanitizeBadgeMap(data.value as Record<string, unknown>);
}

export async function saveMenuItemBadge(itemId: string, badgeText?: MenuItemBadge) {
  const supabase = createSupabaseServiceClient();

  if (!supabase || !itemId) {
    return;
  }

  const current = await fetchMenuItemBadgeMap();

  const normalizedBadge = badgeText?.trim();

  if (!normalizedBadge) {
    delete current[itemId];
  } else {
    current[itemId] = normalizedBadge;
  }

  await supabase.from("site_settings").upsert(
    {
      key: MENU_ITEM_BADGES_KEY,
      value: current,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );
}

function sanitizeBadgeMap(value: Record<string, unknown>): Record<string, MenuItemBadge> {
  const result: Record<string, MenuItemBadge> = {};

  for (const [itemId, badge] of Object.entries(value)) {
    if (typeof badge === "string" && badge.trim()) {
      result[itemId] = badge.trim();
    }
  }

  return result;
}
