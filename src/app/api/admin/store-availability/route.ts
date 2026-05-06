import { NextResponse } from "next/server";
import {
  normalizeStoreAvailabilitySettings,
  type StoreAvailabilitySettings,
} from "@/lib/store/store-availability";
import {
  fetchStoreAvailabilitySettings,
  saveStoreAvailabilitySettingsToServer,
} from "@/lib/data/store-availability-settings";

export async function GET() {
  const settings = await fetchStoreAvailabilitySettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<StoreAvailabilitySettings>;
  const next = await saveStoreAvailabilitySettingsToServer(normalizeStoreAvailabilitySettings(body));

  if (!next) {
    return NextResponse.json({ error: "No se pudo guardar la configuracion del local" }, { status: 500 });
  }

  return NextResponse.json({ settings: next });
}