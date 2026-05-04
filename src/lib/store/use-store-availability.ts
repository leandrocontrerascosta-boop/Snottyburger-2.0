"use client";

import { useEffect, useMemo, useState } from "react";
import {
  getStoreAvailabilityState,
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

        const incoming: StoreAvailabilitySettings = {
          manualOverride:
            payload.settings?.manualOverride === "force-open" || payload.settings?.manualOverride === "force-closed"
              ? payload.settings.manualOverride
              : "none",
          lastResetDate: typeof payload.settings?.lastResetDate === "string" ? payload.settings.lastResetDate : undefined,
        };

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
        setManualStoreOverride(override);
        setSnapshot(runStoreAvailabilityRefresh());

        void fetch("/api/admin/store-availability", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            ...runStoreAvailabilityRefresh().settings,
            manualOverride: override,
          }),
        });
      },
    };
  }, [snapshot]);

  return value;
}