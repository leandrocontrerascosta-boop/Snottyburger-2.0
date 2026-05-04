import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";
import type { DeliveryRate } from "@/lib/types/delivery";

type SaveDeliveryRatesBody = {
  rates: DeliveryRate[];
};

type DeliveryRateRow = {
  id: string;
  max_distance_km: number;
  price: number;
};

export async function PUT(request: Request) {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return NextResponse.json({ error: "Faltan las credenciales de Supabase en el entorno" }, { status: 503 });
  }

  const body = (await request.json()) as SaveDeliveryRatesBody;
  const rates = body.rates
    .slice()
    .sort((left, right) => left.maxDistanceKm - right.maxDistanceKm)
    .map((rate) => ({
      max_distance_km: rate.maxDistanceKm,
      price: rate.price,
    }));

  const deleteResult = await supabase.from("delivery_rates").delete().not("id", "is", null);

  if (deleteResult.error) {
    return NextResponse.json({ error: "No se pudieron reemplazar las tarifas de delivery" }, { status: 500 });
  }

  const { data, error } = await supabase
    .from("delivery_rates")
    .insert(rates)
    .select("id,max_distance_km,price");

  if (error || !data) {
    return NextResponse.json({ error: "No se pudieron guardar las tarifas de delivery" }, { status: 500 });
  }

  const normalizedRates = (data as DeliveryRateRow[]).map((rate) => ({
    id: rate.id,
    maxDistanceKm: Number(rate.max_distance_km),
    price: rate.price,
  }));

  return NextResponse.json({ rates: normalizedRates });
}