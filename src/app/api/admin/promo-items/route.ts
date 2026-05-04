import { NextResponse } from "next/server";
import { ensureWebOptimizedImage } from "@/lib/images/ensure-web-image";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { PromoAdmin, PromoCustomizationPolicy } from "@/lib/types/panel";

type CreatePromoItemBody = {
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
};

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

export async function POST(request: Request) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const body = (await request.json()) as CreatePromoItemBody;
  const optimizedImage = await ensureWebOptimizedImage(body.image.trim());
  const { data, error } = await supabase
    .from("promo_items")
    .insert({
      title: body.title.trim(),
      description: body.description.trim(),
      image: optimizedImage,
      simple_price: body.simplePrice,
      double_price: body.doublePrice,
      is_combo: body.isCombo,
      duration_days: body.durationDays,
      customization_policy: body.isCombo ? "observation-only" : body.customizationPolicy,
      badge_text: body.badgeText?.trim() || null,
      linked_product_slug: body.linkedProductSlug?.trim() || null,
      status: "active",
    })
    .select("id,title,description,image,simple_price,double_price,is_combo,duration_days,customization_policy,badge_text,linked_product_slug,status")
    .single<PromoItemRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo crear la promo" }, { status: 500 });
  }

  return NextResponse.json({ item: mapPromoItemRow(data) });
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