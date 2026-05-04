import "server-only";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";
import type { ModifierChoice, ModifierGroup } from "@/lib/types/order";

type ModifierGroupRow = {
  slug: string;
  title: string;
  description: string | null;
  selection_type: "single" | "multi";
  sort_order: number;
  status: "active" | "paused";
};

type ModifierChoiceRow = {
  slug: string;
  group_slug: string;
  label: string;
  price_delta: number;
  kind: "extra" | "remove" | "addon";
  sort_order: number;
  status: "active" | "paused";
};

const fallbackModifierGroups: ModifierGroup[] = [
  {
    id: "fries-type",
    title: "Tipo de papas",
    description: "Elegi como queres las papas incluidas.",
    type: "single",
    choices: [
      { id: "fries-seasoned", label: "Sazonadas", priceDelta: 0, kind: "addon" },
      { id: "fries-plain", label: "Sin sazon", priceDelta: 0, kind: "addon" },
    ],
  },
  {
    id: "extras",
    title: "Extras",
    type: "multi",
    choices: [
      { id: "extra-cheddar", label: "Queso cheddar", priceDelta: 1000, kind: "extra" },
      { id: "extra-mayo-pot", label: "Pote de mayo", priceDelta: 600, kind: "extra" },
      { id: "extra-egg", label: "Huevo", priceDelta: 500, kind: "extra" },
      { id: "extra-bacon", label: "Bacon", priceDelta: 800, kind: "extra" },
      {
        id: "extra-patty-double-cheese",
        label: "Medallon extra (con doble queso)",
        priceDelta: 3500,
        kind: "addon",
      },
    ],
  },
];

export async function fetchBurgerModifierGroups(): Promise<ModifierGroup[]> {
  const supabase = createSupabasePublicClient();

  if (!supabase) {
    return fallbackModifierGroups;
  }

  const [groupsResult, choicesResult] = await Promise.all([
    supabase
      .from("menu_modifier_groups")
      .select("slug,title,description,selection_type,sort_order,status")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
    supabase
      .from("menu_modifier_choices")
      .select("slug,group_slug,label,price_delta,kind,sort_order,status")
      .eq("status", "active")
      .order("sort_order", { ascending: true }),
  ]);

  if (groupsResult.error || choicesResult.error || !groupsResult.data || !choicesResult.data) {
    return fallbackModifierGroups;
  }

  const groups = mapModifierRows(groupsResult.data, choicesResult.data);
  return groups.length > 0 ? groups : fallbackModifierGroups;
}

function mapModifierRows(groupRows: ModifierGroupRow[], choiceRows: ModifierChoiceRow[]): ModifierGroup[] {
  const choicesByGroup = new Map<string, ModifierChoice[]>();

  for (const choiceRow of choiceRows) {
    const bucket = choicesByGroup.get(choiceRow.group_slug) ?? [];
    bucket.push({
      id: choiceRow.slug,
      label: choiceRow.label,
      priceDelta: choiceRow.price_delta,
      kind: choiceRow.kind,
    });
    choicesByGroup.set(choiceRow.group_slug, bucket);
  }

  return groupRows
    .map((groupRow) => {
      const choices = choicesByGroup.get(groupRow.slug) ?? [];

      return {
        id: groupRow.slug,
        title: groupRow.title,
        description: groupRow.description ?? undefined,
        type: groupRow.selection_type,
        choices,
      } as ModifierGroup;
    })
    .filter((group) => group.choices.length > 0);
}
