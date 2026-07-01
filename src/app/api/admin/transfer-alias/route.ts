import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export async function GET() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ alias: "Emicarrizo73", updatedAt: new Date().toISOString() }, { status: 200 });
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "transfer-alias")
    .single();

  if (error || !data?.value) {
    return NextResponse.json({ alias: "Emicarrizo73", updatedAt: new Date().toISOString() }, { status: 200 });
  }

  return NextResponse.json(data.value);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { alias?: string };

  if (!body.alias?.trim()) {
    return NextResponse.json({ error: "El alias es requerido" }, { status: 400 });
  }

  const next = {
    alias: body.alias.trim(),
    updatedAt: new Date().toISOString(),
  };

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(next);
  }

  const { error } = await supabase.from("site_settings").upsert(
    { key: "transfer-alias", value: next, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar el alias" }, { status: 500 });
  }

  return NextResponse.json(next);
}
