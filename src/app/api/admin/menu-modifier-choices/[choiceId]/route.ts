import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { ExtraItemAdmin, MenuModifierKind } from "@/lib/types/panel";

type UpdateModifierChoiceBody = Partial<{
  label: string;
  priceDelta: number;
  kind: MenuModifierKind;
  status: "active" | "paused";
}>;

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

type RouteContext = {
  params: Promise<{ choiceId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { choiceId } = await context.params;
  const body = (await request.json()) as UpdateModifierChoiceBody;
  const payload: Record<string, string | number> = {};

  if (typeof body.label === "string") payload.label = body.label.trim();
  if (typeof body.priceDelta === "number") payload.price_delta = Math.max(0, Math.round(body.priceDelta));
  if (body.kind) payload.kind = body.kind;
  if (body.status) payload.status = body.status;

  const { data, error } = await supabase
    .from("menu_modifier_choices")
    .update(payload)
    .eq("id", choiceId)
    .eq("group_slug", "extras")
    .select("id,slug,group_slug,label,price_delta,kind,sort_order,status")
    .single<ModifierChoiceRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar el extra" }, { status: 500 });
  }

  return NextResponse.json({ item: mapModifierChoiceRow(data) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { choiceId } = await context.params;
  const { error } = await supabase
    .from("menu_modifier_choices")
    .delete()
    .eq("id", choiceId)
    .eq("group_slug", "extras");

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar el extra" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
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
