import { NextResponse } from "next/server";
import { createSupabasePublicClient } from "@/lib/supabase/public-client";

export async function GET() {
  const supabase = createSupabasePublicClient();

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
