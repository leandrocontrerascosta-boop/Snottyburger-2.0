import { NextResponse } from "next/server";
import { ensureWebOptimizedImage } from "@/lib/images/ensure-web-image";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { MenuItemAdmin } from "@/lib/types/panel";

type CreateMenuItemBody = {
  name: string;
  description: string;
  image: string;
  simplePrice: number;
  doublePrice: number;
  discountTarget?: "simple" | "double";
  discountPercent?: number;
};

type MenuItemRow = {
  id: string;
  name: string;
  description: string;
  image: string;
  simple_price: number;
  double_price: number;
  discount_target: "simple" | "double" | null;
  discount_percent: number | null;
  status: "active" | "paused";
};

export async function POST(request: Request) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const body = (await request.json()) as CreateMenuItemBody;
  const optimizedImage = await ensureWebOptimizedImage(body.image.trim());

  const { data, error } = await supabase
    .from("menu_items")
    .insert({
      name: body.name.trim(),
      description: body.description.trim(),
      image: optimizedImage,
      simple_price: body.simplePrice,
      double_price: body.doublePrice,
      discount_target: body.discountPercent ? body.discountTarget ?? null : null,
      discount_percent: body.discountPercent && body.discountPercent > 0 ? body.discountPercent : null,
      status: "active",
    })
    .select("id,name,description,image,simple_price,double_price,discount_target,discount_percent,status")
    .single<MenuItemRow>();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo crear el producto" }, { status: 500 });
  }

  return NextResponse.json({ item: mapMenuItemRow(data) });
}

function mapMenuItemRow(row: MenuItemRow): MenuItemAdmin {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    image: row.image,
    simplePrice: row.simple_price,
    doublePrice: row.double_price,
    discountTarget: row.discount_target ?? undefined,
    discountPercent: row.discount_percent ?? undefined,
    status: row.status,
  };
}