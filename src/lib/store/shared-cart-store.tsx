"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { createCartItemId } from "@/lib/pricing/order-pricing";
import type { CartItem } from "@/lib/types/order";

type SharedCartRole = "owner" | "guest";

type SharedSessionSnapshot = {
  sessionId: string;
  pin: string;
  expiresAt: string;
  ownerToken?: string;
  role: SharedCartRole;
};

type SharedCartContextValue = {
  isSupported: boolean;
  isActive: boolean;
  isOwner: boolean;
  sessionPin: string | null;
  expiresAt: string | null;
  items: CartItem[];
  isBusy: boolean;
  errorMessage: string | null;
  floatingCtaDismissed: boolean;
  dismissFloatingCta: () => void;
  resetFloatingCta: () => void;
  createSession: (seedItems: CartItem[]) => Promise<{ ok: true; pin: string; expiresAt: string } | { ok: false }>;
  joinSession: (pin: string) => Promise<boolean>;
  leaveSession: () => void;
  addItem: (payload: { productId: string; quantity: number; selectedChoiceIds: string[]; note?: string }) => void;
  increaseItem: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  removeItem: (itemId: string) => void;
  clearItems: () => void;
  finalizeSession: () => Promise<boolean>;
};

const SESSION_STORAGE_KEY = "snottyburger-shared-session";
const CTA_STORAGE_KEY = "snottyburger-shared-cta-dismissed";
const POLL_INTERVAL_MS = 3000;

const SharedCartContext = createContext<SharedCartContextValue | null>(null);

function getStoredSharedSession(): SharedSessionSnapshot | null {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SESSION_STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    const parsed = JSON.parse(raw) as SharedSessionSnapshot;
    if (!parsed.sessionId || !parsed.pin || !parsed.expiresAt || !parsed.role) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    if (new Date(parsed.expiresAt).getTime() <= Date.now()) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return null;
    }

    return parsed;
  } catch {
    window.localStorage.removeItem(SESSION_STORAGE_KEY);
    return null;
  }
}

function getStoredCtaDismissed(): boolean {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(CTA_STORAGE_KEY) === "1";
}

export function SharedCartProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [session, setSession] = useState<SharedSessionSnapshot | null>(() => getStoredSharedSession());
  const [items, setItems] = useState<CartItem[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [floatingCtaDismissed, setFloatingCtaDismissed] = useState(() => getStoredCtaDismissed());

  const isSupported = true;

  useEffect(() => {
    if (!session) {
      window.localStorage.removeItem(SESSION_STORAGE_KEY);
      return;
    }

    window.localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(session));
  }, [session]);

  useEffect(() => {
    if (!session) {
      return;
    }

    let cancelled = false;

    const syncNow = async () => {
      const response = await fetch(`/api/shared-cart/${session.sessionId}`, {
        headers: session.ownerToken ? { "x-owner-token": session.ownerToken } : {},
      });

      if (!response.ok) {
        if (response.status === 404) {
          if (!cancelled) {
            setSession(null);
            setItems([]);
            setErrorMessage("La sesion compartida expiro o fue cerrada.");
          }
          return;
        }

        if (!cancelled) {
          setErrorMessage("No se pudo sincronizar el carrito compartido.");
        }

        return;
      }

      const payload = (await response.json()) as {
        items: CartItem[];
        pin: string;
        expiresAt: string;
        isOwner: boolean;
      };

      if (cancelled) {
        return;
      }

      setItems(payload.items);
      setErrorMessage(null);
      setSession((current) => {
        if (!current) {
          return current;
        }

        const role = payload.isOwner ? "owner" : "guest";
        return {
          ...current,
          pin: payload.pin,
          expiresAt: payload.expiresAt,
          role,
        };
      });
    };

    void syncNow();
    const timer = window.setInterval(() => {
      void syncNow();
    }, POLL_INTERVAL_MS);

    return () => {
      cancelled = true;
      window.clearInterval(timer);
    };
  }, [session?.sessionId, session?.ownerToken]);

  const mutateRemoteItems = async (
    mutation:
      | { action: "add"; payload: { productId: string; quantity: number; selectedChoiceIds: string[]; note?: string } }
      | { action: "increase"; payload: { itemId: string } }
      | { action: "decrease"; payload: { itemId: string } }
      | { action: "remove"; payload: { itemId: string } }
      | { action: "clear" },
  ) => {
    if (!session) {
      return;
    }

    const response = await fetch(`/api/shared-cart/${session.sessionId}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        kind: "mutate-items",
        mutation,
      }),
    });

    if (!response.ok) {
      setErrorMessage("No se pudo actualizar el carrito compartido.");
      return;
    }

    const payload = (await response.json()) as { items: CartItem[] };
    setItems(payload.items);
    setErrorMessage(null);
  };

  const value = useMemo<SharedCartContextValue>(() => {
    const dismissFloatingCta = () => {
      setFloatingCtaDismissed(true);
      window.localStorage.setItem(CTA_STORAGE_KEY, "1");
    };

    const resetFloatingCta = () => {
      setFloatingCtaDismissed(false);
      window.localStorage.removeItem(CTA_STORAGE_KEY);
    };

    const leaveSession = () => {
      setSession(null);
      setItems([]);
      setErrorMessage(null);
    };

    return {
      isSupported,
      isActive: Boolean(session),
      isOwner: session?.role === "owner",
      sessionPin: session?.pin ?? null,
      expiresAt: session?.expiresAt ?? null,
      items,
      isBusy,
      errorMessage,
      floatingCtaDismissed,
      dismissFloatingCta,
      resetFloatingCta,
      createSession: async (seedItems) => {
        setIsBusy(true);
        setErrorMessage(null);

        try {
          const response = await fetch("/api/shared-cart/session", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ seedItems }),
          });

          const payload = (await response.json()) as {
            error?: string;
            sessionId: string;
            pin: string;
            expiresAt: string;
            ownerToken: string;
            items: CartItem[];
          };

          if (!response.ok || !payload.sessionId || !payload.ownerToken || !payload.pin || !payload.expiresAt) {
            setErrorMessage(payload.error ?? "No se pudo crear la compra compartida.");
            return { ok: false };
          }

          setSession({
            sessionId: payload.sessionId,
            pin: payload.pin,
            expiresAt: payload.expiresAt,
            ownerToken: payload.ownerToken,
            role: "owner",
          });
          setItems(payload.items ?? []);
          setErrorMessage(null);
          return {
            ok: true,
            pin: payload.pin,
            expiresAt: payload.expiresAt,
          };
        } catch {
          setErrorMessage("No se pudo crear la compra compartida.");
          return { ok: false };
        } finally {
          setIsBusy(false);
        }
      },
      joinSession: async (pin) => {
        setIsBusy(true);
        setErrorMessage(null);

        try {
          const response = await fetch("/api/shared-cart/join", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ pin }),
          });

          const payload = (await response.json()) as {
            error?: string;
            sessionId: string;
            pin: string;
            expiresAt: string;
            items: CartItem[];
          };

          if (!response.ok || !payload.sessionId) {
            setErrorMessage(payload.error ?? "No se pudo unir al carrito compartido.");
            return false;
          }

          setSession({
            sessionId: payload.sessionId,
            pin: payload.pin,
            expiresAt: payload.expiresAt,
            role: "guest",
          });
          setItems(payload.items ?? []);
          setErrorMessage(null);
          return true;
        } catch {
          setErrorMessage("No se pudo unir al carrito compartido.");
          return false;
        } finally {
          setIsBusy(false);
        }
      },
      leaveSession,
      addItem: (payload) => {
        if (!session) {
          return;
        }

        const itemId = createCartItemId(payload.productId, payload.selectedChoiceIds, payload.note);
        setItems((current) => {
          const existing = current.find((item) => item.id === itemId);
          if (existing) {
            return current.map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: item.quantity + Math.max(1, payload.quantity),
                  }
                : item,
            );
          }

          return [
            ...current,
            {
              id: itemId,
              productId: payload.productId,
              quantity: Math.max(1, payload.quantity),
              selectedChoiceIds: payload.selectedChoiceIds,
              note: payload.note?.trim() || undefined,
            },
          ];
        });

        void mutateRemoteItems({ action: "add", payload });
      },
      increaseItem: (itemId) => {
        if (!session) {
          return;
        }

        setItems((current) =>
          current.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  quantity: item.quantity + 1,
                }
              : item,
          ),
        );

        void mutateRemoteItems({ action: "increase", payload: { itemId } });
      },
      decreaseItem: (itemId) => {
        if (!session) {
          return;
        }

        setItems((current) =>
          current
            .map((item) =>
              item.id === itemId
                ? {
                    ...item,
                    quantity: item.quantity - 1,
                  }
                : item,
            )
            .filter((item) => item.quantity > 0),
        );

        void mutateRemoteItems({ action: "decrease", payload: { itemId } });
      },
      removeItem: (itemId) => {
        if (!session) {
          return;
        }

        setItems((current) => current.filter((item) => item.id !== itemId));
        void mutateRemoteItems({ action: "remove", payload: { itemId } });
      },
      clearItems: () => {
        if (!session) {
          return;
        }

        setItems([]);
        void mutateRemoteItems({ action: "clear" });
      },
      finalizeSession: async () => {
        if (!session || session.role !== "owner" || !session.ownerToken) {
          setErrorMessage("Solo el creador puede confirmar el pedido.");
          return false;
        }

        const response = await fetch(`/api/shared-cart/${session.sessionId}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ kind: "finalize", ownerToken: session.ownerToken }),
        });

        const payload = (await response.json()) as { error?: string };
        if (!response.ok) {
          setErrorMessage(payload.error ?? "No se pudo cerrar la sesion compartida.");
          return false;
        }

        return true;
      },
    };
  }, [errorMessage, floatingCtaDismissed, isBusy, isSupported, items, session]);

  return <SharedCartContext.Provider value={value}>{children}</SharedCartContext.Provider>;
}

export function useSharedCart() {
  const context = useContext(SharedCartContext);
  if (!context) {
    throw new Error("useSharedCart must be used inside SharedCartProvider");
  }

  return context;
}
