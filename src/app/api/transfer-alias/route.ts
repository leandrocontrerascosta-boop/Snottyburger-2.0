import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

export async function GET() {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ alias: "Emicarrizo73" });
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", "transfer-alias")
    .single();

  if (error || !data?.value) {
    return NextResponse.json({ alias: "Emicarrizo73" });
  }

  const value = data.value as { alias?: string };

  return NextResponse.json({ alias: value.alias ?? "Emicarrizo73" });
}
