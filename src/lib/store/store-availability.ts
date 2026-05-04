export type ManualStoreOverride = "none" | "force-open" | "force-closed";

export type StoreAvailabilitySettings = {
  manualOverride: ManualStoreOverride;
  lastResetDate?: string;
};

export type StoreAvailabilityState = {
  isOpen: boolean;
  scheduleOpen: boolean;
  manualOverride: ManualStoreOverride;
  source: "schedule" | "manual-open" | "manual-closed";
};

const STORE_AVAILABILITY_KEY = "snottyburger-store-availability";
export const STORE_AVAILABILITY_EVENT = "snottyburger-store-availability-change";

const OPEN_HOUR = 20;
const CLOSE_HOUR = 1;

export function isStoreOpenBySchedule(date: Date) {
  const hour = date.getHours();
  const minute = date.getMinutes();
  const totalMinutes = hour * 60 + minute;

  const openStart = OPEN_HOUR * 60;
  const closeEnd = CLOSE_HOUR * 60;

  return totalMinutes >= openStart || totalMinutes < closeEnd;
}

export function getStoreAvailabilityState(
  settings: StoreAvailabilitySettings,
  date: Date = new Date(),
): StoreAvailabilityState {
  const scheduleOpen = isStoreOpenBySchedule(date);

  if (settings.manualOverride === "force-open") {
    return {
      isOpen: true,
      scheduleOpen,
      manualOverride: settings.manualOverride,
      source: "manual-open",
    };
  }

  if (settings.manualOverride === "force-closed") {
    return {
      isOpen: false,
      scheduleOpen,
      manualOverride: settings.manualOverride,
      source: "manual-closed",
    };
  }

  return {
    isOpen: scheduleOpen,
    scheduleOpen,
    manualOverride: settings.manualOverride,
    source: "schedule",
  };
}

export function loadStoreAvailabilitySettings(): StoreAvailabilitySettings {
  if (typeof window === "undefined") {
    return { manualOverride: "none" };
  }

  const raw = window.localStorage.getItem(STORE_AVAILABILITY_KEY);
  if (!raw) {
    return { manualOverride: "none" };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<StoreAvailabilitySettings>;
    const manualOverride = parseManualOverride(parsed.manualOverride);

    return {
      manualOverride,
      lastResetDate: typeof parsed.lastResetDate === "string" ? parsed.lastResetDate : undefined,
    };
  } catch {
    return { manualOverride: "none" };
  }
}

export function saveStoreAvailabilitySettings(settings: StoreAvailabilitySettings) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORE_AVAILABILITY_KEY, JSON.stringify(settings));
  window.dispatchEvent(new Event(STORE_AVAILABILITY_EVENT));
}

export function setManualStoreOverride(manualOverride: ManualStoreOverride) {
  const current = loadStoreAvailabilitySettings();
  const next: StoreAvailabilitySettings = {
    ...current,
    manualOverride,
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
    loaded.manualOverride !== normalized.manualOverride || loaded.lastResetDate !== normalized.lastResetDate;

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