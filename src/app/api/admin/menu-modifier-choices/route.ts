import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { ExtraItemAdmin, MenuModifierKind } from "@/lib/types/panel";

type CreateModifierChoiceBody = {
  label: string;
  priceDelta: number;
  kind: MenuModifierKind;
};

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

export async function POST(request: Request) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const body = (await request.json()) as CreateModifierChoiceBody;
  const label = body.label.trim();

  if (!label) {
    return NextResponse.json({ error: "El nombre del extra es obligatorio" }, { status: 400 });
  }

  const safeBaseSlug = slugifyLabel(label);
  const uniqueSuffix = Math.random().toString(36).slice(2, 8);
  const slug = `${safeBaseSlug}-${uniqueSuffix}`;

  const { data: maxRow } = await supabase
    .from("menu_modifier_choices")
    .select("sort_order")
    .eq("group_slug", "extras")
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle<{ sort_order: number }>();

  const nextSortOrder = (maxRow?.sort_order ?? 0) + 10;

  const { data, error } = await supabase
    .from("menu_modifier_choices")
    .insert({
      slug,
      group_slug: "extras",
      label,
      price_delta: Math.max(0, Math.round(body.priceDelta)),
      kind: body.kind,
      sort_order: nextSortOrder,
      status: "active",
    })
    .select("id,slug,group_slug,label,price_delta,kind,sort_order,status")
    .single<ModifierChoiceRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo crear el extra" }, { status: 500 });
  }

  return NextResponse.json({ item: mapModifierChoiceRow(data) });
}

function mapModifierChoiceRow(row: ModifierChoiceRow): ExtraItemAdmin {
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

function slugifyLabel(input: string): string {
  const normalized = input
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

  return normalized || "extra";
}
