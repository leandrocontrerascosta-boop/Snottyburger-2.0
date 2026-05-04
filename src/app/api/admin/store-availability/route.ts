import { NextResponse } from "next/server";
import type { ManualStoreOverride } from "@/lib/store/store-availability";

type StoreAvailabilityApiPayload = {
  manualOverride: ManualStoreOverride;
  lastResetDate?: string;
};

let sharedState: StoreAvailabilityApiPayload = {
  manualOverride: "none",
};

export async function GET() {
  return NextResponse.json({ settings: sharedState });
}

export async function PUT(request: Request) {
  const body = (await request.json()) as Partial<StoreAvailabilityApiPayload>;

  const manualOverride = parseManualOverride(body.manualOverride);
  const lastResetDate = typeof body.lastResetDate === "string" ? body.lastResetDate : undefined;

  sharedState = {
    manualOverride,
    lastResetDate,
  };

  return NextResponse.json({ settings: sharedState });
}

function parseManualOverride(value: unknown): ManualStoreOverride {
  if (value === "force-open" || value === "force-closed") {
    return value;
  }

  return "none";
}