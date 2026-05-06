export type ManualStoreOverride = "none" | "force-open" | "force-closed";

export type StoreAvailabilitySettings = {
  manualOverride: ManualStoreOverride;
  lastResetDate?: string;
  openTime: string;
  closeTime: string;
};

export type StoreAvailabilityState = {
  isOpen: boolean;
  scheduleOpen: boolean;
  manualOverride: ManualStoreOverride;
  source: "schedule" | "manual-open" | "manual-closed";
};

const STORE_AVAILABILITY_KEY = "snottyburger-store-availability";
export const STORE_AVAILABILITY_EVENT = "snottyburger-store-availability-change";

export const DEFAULT_STORE_OPEN_TIME = "20:30";
export const DEFAULT_STORE_CLOSE_TIME = "00:30";

export function normalizeStoreAvailabilitySettings(
  settings?: Partial<StoreAvailabilitySettings>,
): StoreAvailabilitySettings {
  return {
    manualOverride: parseManualOverride(settings?.manualOverride),
    lastResetDate: typeof settings?.lastResetDate === "string" ? settings.lastResetDate : undefined,
    openTime: normalizeTimeString(settings?.openTime, DEFAULT_STORE_OPEN_TIME),
    closeTime: normalizeTimeString(settings?.closeTime, DEFAULT_STORE_CLOSE_TIME),
  };
}

export function isStoreOpenBySchedule(date: Date, settings: Pick<StoreAvailabilitySettings, "openTime" | "closeTime">) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  const openStart = timeStringToMinutes(settings.openTime, DEFAULT_STORE_OPEN_TIME);
  const closeEnd = timeStringToMinutes(settings.closeTime, DEFAULT_STORE_CLOSE_TIME);

  if (openStart === closeEnd) {
    return false;
  }

  if (openStart < closeEnd) {
    return totalMinutes >= openStart && totalMinutes < closeEnd;
  }

  return totalMinutes >= openStart || totalMinutes < closeEnd;
}

export function getStoreAvailabilityState(
  settings: StoreAvailabilitySettings,
  date: Date = new Date(),
): StoreAvailabilityState {
  const normalizedSettings = normalizeStoreAvailabilitySettings(settings);
  const scheduleOpen = isStoreOpenBySchedule(date, normalizedSettings);

  if (normalizedSettings.manualOverride === "force-open") {
    return {
      isOpen: true,
      scheduleOpen,
      manualOverride: normalizedSettings.manualOverride,
      source: "manual-open",
    };
  }

  if (normalizedSettings.manualOverride === "force-closed") {
    return {
      isOpen: false,
      scheduleOpen,
      manualOverride: normalizedSettings.manualOverride,
      source: "manual-closed",
    };
  }

  return {
    isOpen: scheduleOpen,
    scheduleOpen,
    manualOverride: normalizedSettings.manualOverride,
    source: "schedule",
  };
}

export function loadStoreAvailabilitySettings(): StoreAvailabilitySettings {
  if (typeof window === "undefined") {
    return normalizeStoreAvailabilitySettings();
  }

  const raw = window.localStorage.getItem(STORE_AVAILABILITY_KEY);
  if (!raw) {
    return normalizeStoreAvailabilitySettings();
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoreAvailabilitySettings>;
    return normalizeStoreAvailabilitySettings(parsed);
  } catch {
    return normalizeStoreAvailabilitySettings();
  }
}

export function saveStoreAvailabilitySettings(settings: StoreAvailabilitySettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORE_AVAILABILITY_KEY, JSON.stringify(normalizeStoreAvailabilitySettings(settings)));
  window.dispatchEvent(new Event(STORE_AVAILABILITY_EVENT));
}

export function setManualStoreOverride(manualOverride: ManualStoreOverride) {
  const current = loadStoreAvailabilitySettings();
  const next: StoreAvailabilitySettings = {
    ...current,
    manualOverride: parseManualOverride(manualOverride),
  };

  saveStoreAvailabilitySettings(next);
}

export function applyDailyReset(
  settings: StoreAvailabilitySettings,
  _date: Date = new Date(),
): StoreAvailabilitySettings {
  return settings;
}

export function runStoreAvailabilityRefresh(now: Date = new Date()) {
  const loaded = loadStoreAvailabilitySettings();
  const normalized = applyDailyReset(loaded, now);
  const changed =
    loaded.manualOverride !== normalized.manualOverride ||
    loaded.lastResetDate !== normalized.lastResetDate ||
    loaded.openTime !== normalized.openTime ||
    loaded.closeTime !== normalized.closeTime;

  if (changed) {
    saveStoreAvailabilitySettings(normalized);
  }

  return {
    settings: normalized,
    state: getStoreAvailabilityState(normalized, now),
  };
}

function parseManualOverride(value: unknown): ManualStoreOverride {
  if (value === "force-open" || value === "force-closed") {
    return value;
  }

  return "none";
}

export function formatStoreScheduleLabel(settings: Pick<StoreAvailabilitySettings, "openTime" | "closeTime">) {
  return `Lunes a lunes · ${settings.openTime} a ${settings.closeTime}`;
}

function normalizeTimeString(value: unknown, fallback: string) {
  if (typeof value !== "string") {
    return fallback;
  }

  const match = value.trim().match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    return fallback;
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) {
    return fallback;
  }

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function timeStringToMinutes(value: string, fallback: string) {
  const normalized = normalizeTimeString(value, fallback);
  const [hours, minutes] = normalized.split(":").map(Number);
  return hours * 60 + minutes;
}