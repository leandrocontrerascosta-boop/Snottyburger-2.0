import "server-only";
import {
  DEFAULT_STORE_CLOSE_TIME,
  DEFAULT_STORE_OPEN_TIME,
  normalizeStoreAvailabilitySettings,
  type StoreAvailabilitySettings,
} from "@/lib/store/store-availability";
import { createSupabaseServiceClient } from "@/lib/supabase/service-client";

const STORE_AVAILABILITY_SETTINGS_KEY = "store-availability";

export async function fetchStoreAvailabilitySettings(): Promise<StoreAvailabilitySettings> {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return normalizeStoreAvailabilitySettings();
  }

  const { data, error } = await supabase
    .from("site_settings")
    .select("value")
    .eq("key", STORE_AVAILABILITY_SETTINGS_KEY)
    .single();

  if (error || !data?.value || typeof data.value !== "object") {
    return normalizeStoreAvailabilitySettings();
  }

  return normalizeStoreAvailabilitySettings(data.value as Partial<StoreAvailabilitySettings>);
}

export async function saveStoreAvailabilitySettingsToServer(
  settings: Partial<StoreAvailabilitySettings>,
): Promise<StoreAvailabilitySettings | null> {
  const supabase = createSupabaseServiceClient();

  if (!supabase) {
    return normalizeStoreAvailabilitySettings(settings);
  }

  const next = normalizeStoreAvailabilitySettings(settings);
  const { error } = await supabase.from("site_settings").upsert(
    {
      key: STORE_AVAILABILITY_SETTINGS_KEY,
      value: {
        manualOverride: next.manualOverride,
        lastResetDate: next.lastResetDate ?? null,
        openTime: next.openTime ?? DEFAULT_STORE_OPEN_TIME,
        closeTime: next.closeTime ?? DEFAULT_STORE_CLOSE_TIME,
      },
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  if (error) {
    return null;
  }

  return next;
}