import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

type CreateBody = {
  code: string;
  description?: string;
  discountPercent: number;
  applyTo: "burgers" | "total";
  maxUses?: number | null;
};

export async function GET() {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const { data, error } = await supabase.from("promo_codes").select(
    "id,code,description,discount_percent,apply_to,is_active,max_uses,current_uses,created_at"
  ).order("created_at", { ascending: false });

  if (error) {
    return NextResponse.json({ error: "No se pudieron obtener los codigos" }, { status: 500 });
  }

  const mapped = (data || []).map((row: any) => ({
    id: row.id,
    code: row.code,
    description: row.description ?? "",
    discountPercent: row.discount_percent,
    applyTo: row.apply_to,
    isActive: row.is_active,
    maxUses: row.max_uses,
    currentUses: row.current_uses,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ codes: mapped });
}

export async function POST(request: Request) {
  const supabase = createSupabaseServiceClient();
  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const body = (await request.json()) as CreateBody;
  const code = (body.code || "").toString().toUpperCase().trim();
  if (!code || !Number.isFinite(body.discountPercent) || body.discountPercent <= 0) {
    return NextResponse.json({ error: "Datos invalidos" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("promo_codes")
    .insert({
      code,
      description: body.description?.trim() || null,
      discount_percent: Math.max(1, Math.min(100, Math.round(body.discountPercent))),
      apply_to: body.applyTo || "burgers",
      is_active: true,
      max_uses: body.maxUses ?? null,
    })
    .select("id,code,description,discount_percent,apply_to,is_active,max_uses,current_uses,created_at")
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "No se pudo crear el codigo" }, { status: 500 });
  }

  const mapped = {
    id: data.id,
    code: data.code,
    description: data.description ?? "",
    discountPercent: data.discount_percent,
    applyTo: data.apply_to,
    isActive: data.is_active,
    maxUses: data.max_uses,
    currentUses: data.current_uses,
    createdAt: data.created_at,
  };

  return NextResponse.json({ code: mapped });
}
