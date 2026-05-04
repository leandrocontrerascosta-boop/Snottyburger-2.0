import { NextResponse } from "next/server";
import { ensureWebOptimizedImage } from "@/lib/images/ensure-web-image";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { PromoAdmin, PromoCustomizationPolicy } from "@/lib/types/panel";

type UpdatePromoItemBody = Partial<{
  title: string;
  description: string;
  image: string;
  simplePrice: number;
  doublePrice: number;
  isCombo: boolean;
  durationDays: number;
  customizationPolicy: PromoCustomizationPolicy;
  badgeText?: string;
  linkedProductSlug?: string;
  status: "active" | "paused";
}>;

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

type RouteContext = {
  params: Promise<{ itemId: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { itemId } = await context.params;
  const body = (await request.json()) as UpdatePromoItemBody;
  const payload: Record<string, string | number | boolean | null> = {};

  if (typeof body.title === "string") payload.title = body.title.trim();
  if (typeof body.description === "string") payload.description = body.description.trim();
  if (typeof body.image === "string") payload.image = await ensureWebOptimizedImage(body.image.trim());
  if (typeof body.simplePrice === "number") payload.simple_price = body.simplePrice;
  if (typeof body.doublePrice === "number") payload.double_price = body.doublePrice;
  if (typeof body.isCombo === "boolean") payload.is_combo = body.isCombo;
  if (typeof body.durationDays === "number") payload.duration_days = body.durationDays;
  if (typeof body.customizationPolicy === "string") payload.customization_policy = body.customizationPolicy;
  if (body.status) payload.status = body.status;
  if (body.badgeText !== undefined) payload.badge_text = body.badgeText?.trim() || null;
  if (body.linkedProductSlug !== undefined) payload.linked_product_slug = body.linkedProductSlug?.trim() || null;

  const { data, error } = await supabase
    .from("promo_items")
    .update(payload)
    .eq("id", itemId)
    .select("id,title,description,image,simple_price,double_price,is_combo,duration_days,customization_policy,badge_text,linked_product_slug,status")
    .single<PromoItemRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo actualizar la promo" }, { status: 500 });
  }

  return NextResponse.json({ item: mapPromoItemRow(data) });
}

export async function DELETE(_request: Request, context: RouteContext) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { itemId } = await context.params;
  const { error } = await supabase.from("promo_items").delete().eq("id", itemId);

  if (error) {
    return NextResponse.json({ error: "No se pudo eliminar la promo" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function mapPromoItemRow(row: PromoItemRow): PromoAdmin {
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