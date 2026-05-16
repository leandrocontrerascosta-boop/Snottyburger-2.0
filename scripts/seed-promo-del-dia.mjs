import fs from "node:fs";
import path from "node:path";
import { createClient } from "@supabase/supabase-js";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    if (!line || line.trim().startsWith("#")) {
      continue;
    }

    const separator = line.indexOf("=");
    if (separator === -1) {
      continue;
    }

    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim().replace(/^"|"$/g, "");
    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceRoleKey) {
  console.error("Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY en .env.local");
  process.exit(1);
}

const supabase = createClient(url, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const promoTitle = "PROMO DEL DIA";
const promoData = {
  title: promoTitle,
  description: "Dos Suavecitas Doble con papas y dip de mayo.",
  image: "/images/order/suavecita.webp",
  simple_price: 22000,
  double_price: 22000,
  is_combo: false,
  duration_days: 7,
  customization_policy: "observation-only",
  badge_text: promoTitle,
  linked_product_slug: null,
  status: "active",
};

const { data: existing, error: fetchError } = await supabase
  .from("promo_items")
  .select("id")
  .eq("title", promoTitle)
  .limit(1)
  .maybeSingle();

if (fetchError) {
  console.error("Error al buscar promo existente:", fetchError.message);
  process.exit(1);
}

if (existing) {
  const { data, error } = await supabase
    .from("promo_items")
    .update(promoData)
    .eq("id", existing.id)
    .select("id,title,status");

  if (error) {
    console.error("Error al actualizar promo:", error.message);
    process.exit(1);
  }

  console.log("PROMO_ACTUALIZADA:", data?.[0]?.title ?? promoTitle);
  process.exit(0);
}

const { data, error } = await supabase
  .from("promo_items")
  .insert(promoData)
  .select("id,title,status")
  .single();

if (error) {
  console.error("Error al crear la promo:", error.message);
  process.exit(1);
}

console.log("PROMO_CREADA:", data.title);
