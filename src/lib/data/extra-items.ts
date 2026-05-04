import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";
import type { ExtraItemAdmin, MenuModifierKind } from "@/lib/types/panel";

type ModifierChoiceRow = {
  id: string;
  slug: string;
  group_slug: string;
  label: string;
  price_delta: number;
  kind: MenuModifierKind;
  sort_order: number;
  status: "active" | "paused";
};

const fallbackExtraItems: ExtraItemAdmin[] = [
  {
    id: "extra-cheddar",
    slug: "extra-cheddar",
    label: "Queso cheddar",
    priceDelta: 1000,
    kind: "extra",
    sortOrder: 10,
    status: "active",
  },
  {
    id: "extra-mayo-pot",
    slug: "extra-mayo-pot",
    label: "Pote de mayo",
    priceDelta: 600,
    kind: "extra",
    sortOrder: 20,
    status: "active",
  },
  {
    id: "extra-egg",
    slug: "extra-egg",
    label: "Huevo",
    priceDelta: 500,
    kind: "extra",
    sortOrder: 30,
    status: "active",
  },
  {
    id: "extra-bacon",
    slug: "extra-bacon",
    label: "Bacon",
    priceDelta: 800,
    kind: "extra",
    sortOrder: 40,
    status: "active",
  },
  {
    id: "extra-patty-double-cheese",
    slug: "extra-patty-double-cheese",
    label: "Medallon extra (con doble queso)",
    priceDelta: 3500,
    kind: "addon",
    sortOrder: 50,
    status: "active",
  },
];

export async function fetchExtraItems(options?: { activeOnly?: boolean }): Promise<ExtraItemAdmin[]> {
  const fallback = options?.activeOnly ? fallbackExtraItems.filter((item) => item.status === "active") : fallbackExtraItems;
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return fallback;
  }

  let query = supabase
    .from("menu_modifier_choices")
    .select("id,slug,group_slug,label,price_delta,kind,sort_order,status")
    .eq("group_slug", "extras")
    .order("sort_order", { ascending: true });

  if (options?.activeOnly) {
    query = query.eq("status", "active");
  }

  const { data, error } = await query;

  if (error || !data) {
    return fallback;
  }

  const mapped = data.map(mapExtraRow);
  return mapped.length > 0 ? mapped : fallback;
}

function mapExtraRow(row: ModifierChoiceRow): ExtraItemAdmin {
  return {
    id: row.id,
    slug: row.slug,
    label: row.label,
    priceDelta: row.price_delta,
    kind: row.kind,
    sortOrder: row.sort_order,
    status: row.status,
  };
}