"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getStoreAvailabilityState,
  normalizeStoreAvailabilitySettings,
  STORE_AVAILABILITY_EVENT,
  type ManualStoreOverride,
  runStoreAvailabilityRefresh,
  saveStoreAvailabilitySettings,
  setManualStoreOverride,
  type StoreAvailabilitySettings,
  type StoreAvailabilityState,
} from "@/lib/store/store-availability";

type UseStoreAvailabilityValue = {
  settings: StoreAvailabilitySettings;
  state: StoreAvailabilityState;
  setOverride: (override: ManualStoreOverride) => void;
  saveSettings: (patch: Partial<StoreAvailabilitySettings>) => Promise<void>;
};

export function useStoreAvailability(): UseStoreAvailabilityValue {
  const [snapshot, setSnapshot] = useState(() => runStoreAvailabilityRefresh());

  useEffect(() => {
    const refreshFromLocal = () => {
      setSnapshot(runStoreAvailabilityRefresh());
    };

    const syncWithServer = async () => {
      const now = new Date();

      try {
        const response = await fetch("/api/admin/store-availability", { method: "GET" });
        if (!response.ok) {
          throw new Error("No se pudo leer estado compartido");
        }

        const payload = (await response.json()) as {
          settings?: Partial<StoreAvailabilitySettings>;
        };

        const incoming = normalizeStoreAvailabilitySettings(payload.settings);

        saveStoreAvailabilitySettings(incoming);
        setSnapshot({
          settings: incoming,
          state: getStoreAvailabilityState(incoming, now),
        });
      } catch {
        refreshFromLocal();
      }
    };

    void syncWithServer();

    const timerId = window.setInterval(() => {
      void syncWithServer();
    }, 60_000);
    window.addEventListener("storage", refreshFromLocal);
    window.addEventListener(STORE_AVAILABILITY_EVENT, refreshFromLocal);

    return () => {
      window.clearInterval(timerId);
      window.removeEventListener("storage", refreshFromLocal);
      window.removeEventListener(STORE_AVAILABILITY_EVENT, refreshFromLocal);
    };
  }, []);

  const value = useMemo<UseStoreAvailabilityValue>(() => {
    return {
      settings: snapshot.settings,
      state: snapshot.state,
      setOverride: (override) => {
        const next = normalizeStoreAvailabilitySettings({
          ...snapshot.settings,
          manualOverride: override,
        });

        setManualStoreOverride(override);
        saveStoreAvailabilitySettings(next);
        setSnapshot({
          settings: next,
          state: getStoreAvailabilityState(next),
        });

        void fetch("/api/admin/store-availability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });
      },
      saveSettings: async (patch) => {
        const next = normalizeStoreAvailabilitySettings({
          ...snapshot.settings,
          ...patch,
        });

        saveStoreAvailabilitySettings(next);
        setSnapshot({
          settings: next,
          state: getStoreAvailabilityState(next),
        });

        const response = await fetch("/api/admin/store-availability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(next),
        });

        if (!response.ok) {
          throw new Error("No se pudo guardar la configuracion del local");
        }
      },
    };
  }, [snapshot]);

  return value;
}