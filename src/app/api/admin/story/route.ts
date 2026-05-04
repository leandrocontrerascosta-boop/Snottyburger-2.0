import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export async function GET() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(
      {
        title: "Nuestra Historia",
        body: "Snottyburger arranco como una cocina chica obsesionada por hacer la burger perfecta.",
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "story")
    .single();

  if (error || !data?.value) {
    return NextResponse.json(
      {
        title: "Nuestra Historia",
        body: "Snottyburger arranco como una cocina chica obsesionada por hacer la burger perfecta.",
        updatedAt: new Date().toISOString(),
      },
      { status: 200 },
    );
  }

  return NextResponse.json(data.value);
}

export async function PUT(request: Request) {
  const body = (await request.json()) as { title?: string; body?: string };

  if (!body.title?.trim() || !body.body?.trim()) {
    return NextResponse.json({ error: "Titulo y contenido son requeridos" }, { status: 400 });
  }

  const next = {
    title: body.title.trim(),
    body: body.body.trim(),
    updatedAt: new Date().toISOString(),
  };

  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json(next);
  }

  const { error } = await supabase.from("site_settings").upsert(
    { key: "story", value: next, updated_at: new Date().toISOString() },
    { onConflict: "key" },
  );

  if (error) {
    return NextResponse.json({ error: "No se pudo guardar la historia" }, { status: 500 });
  }

  return NextResponse.json(next);
}
