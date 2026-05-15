"use client";

import { useMemo, useState } from "react";
import type { CartItem } from "@/lib/types/order";
import { useSharedCart } from "@/lib/store/shared-cart-store";

type SharedCartFabProps = {
  seedItems: CartItem[];
};

export function SharedCartFab({ seedItems }: SharedCartFabProps) {
  const {
    isActive,
    isOwner,
    sessionPin,
    expiresAt,
    isBusy,
    errorMessage,
    floatingCtaDismissed,
    closedSession,
    dismissFloatingCta,
    createSession,
    joinSession,
    leaveSession,
    recoverClosedSession,
  } = useSharedCart();
  const [panelOpen, setPanelOpen] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [createdPin, setCreatedPin] = useState<string | null>(null);
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const expirationLabel = useMemo(() => {
    if (!expiresAt) {
      return null;
    }

    return new Intl.DateTimeFormat("es-AR", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(expiresAt));
  }, [expiresAt]);

  return (
    <>
      {isActive ? (
        <div className="fixed top-20 left-3 z-20 flex max-w-[min(320px,calc(100vw-24px))] items-center gap-2 rounded-[16px] border border-[var(--line)] bg-white px-3 py-2 text-xs text-[var(--foreground)] shadow-[0_14px_32px_rgba(24,18,15,0.12)] sm:top-24 sm:left-4 md:bottom-24 md:top-auto lg:bottom-6">
          <div>
            <p className="font-semibold">Pedido con amigos activo</p>
            <p className="text-[11px] text-[var(--muted)]">
              PIN {sessionPin} {expirationLabel ? `• vence ${expirationLabel}` : ""}
            </p>
            <p className="text-[11px] text-[var(--muted)]">{isOwner ? "Eres el creador" : "Te uniste como invitado"}</p>
          </div>
          <button
            type="button"
            onClick={() => {
              leaveSession();
              setPanelOpen(false);
            }}
            className="ml-auto rounded-full border border-[var(--line)] px-2 py-1 text-[11px] font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
          >
            Salir
          </button>
        </div>
      ) : null}

      {!isActive ? (
        <div className="fixed bottom-24 left-3 z-20 flex flex-col items-start gap-2 sm:bottom-24 sm:left-4 lg:bottom-6">
          {closedSession ? (
            <button
              type="button"
              onClick={() => {
                recoverClosedSession();
              }}
              className="rounded-full bg-[var(--brand)] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_14px_30px_rgba(191,36,63,0.3)] transition hover:bg-[var(--brand-dark)] sm:px-4 sm:text-xs"
            >
              Recuperar carrito cerrado
            </button>
          ) : null}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPanelOpen((value) => !value)}
              className="rounded-full bg-[var(--brand)] px-3 py-2 text-[11px] font-semibold text-white shadow-[0_14px_30px_rgba(191,36,63,0.3)] transition hover:bg-[var(--brand-dark)] sm:px-4 sm:text-xs"
            >
              Arma tu pedido con amigos
            </button>
            <button
              type="button"
              aria-label="Ocultar acceso a compra con amigos"
              onClick={dismissFloatingCta}
              className="hidden h-8 w-8 rounded-full border border-[var(--line)] bg-white text-[var(--muted)] transition hover:text-[var(--foreground)] lg:block"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      {panelOpen && !isActive ? (
        <div className="fixed inset-0 z-30 bg-[rgba(18,21,26,0.45)]" onClick={() => setPanelOpen(false)}>
          <div
            className="absolute bottom-4 left-3 right-3 rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[0_22px_50px_rgba(24,18,15,0.2)] sm:left-4 sm:right-auto sm:w-[360px]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-[var(--foreground)]">Compra conjunta</p>
                <p className="text-xs text-[var(--muted)]">Crea un PIN de 4 digitos o unete con uno existente.</p>
              </div>
              <button type="button" onClick={() => setPanelOpen(false)} className="text-xl text-[var(--muted)]">
                ×
              </button>
            </div>

            <div className="mt-4 grid gap-3">
              <button
                type="button"
                onClick={async () => {
                  const result = await createSession(seedItems);
                  if (result.ok) {
                    setCreatedPin(result.pin);
                    setCopied(false);
                    setPanelOpen(false);
                    setPinModalOpen(true);
                  }
                }}
                disabled={isBusy}
                className="rounded-[12px] bg-[var(--brand)] px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isBusy ? "Creando..." : "Crear PIN y compartir"}
              </button>

              <div className="rounded-[12px] border border-[var(--line)] bg-white p-3">
                <p className="text-xs font-semibold text-[var(--foreground)]">Unirse con PIN</p>
                <div className="mt-2 flex items-center gap-2">
                  <input
                    value={pinInput}
                    inputMode="numeric"
                    maxLength={4}
                    onChange={(event) => {
                      setPinInput(event.target.value.replace(/\D/g, "").slice(0, 4));
                    }}
                    placeholder="0000"
                    className="w-full rounded-[10px] border border-[var(--line)] px-3 py-2 text-center text-sm tracking-[0.2em] outline-none focus:border-[var(--brand)]"
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      if (pinInput.length !== 4) {
                        return;
                      }

                      const ok = await joinSession(pinInput);
                      if (ok) {
                        setPanelOpen(false);
                        setPinInput("");
                      }
                    }}
                    disabled={isBusy || pinInput.length !== 4}
                    className="rounded-[10px] border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Unirme
                  </button>
                </div>
              </div>
            </div>

            {errorMessage ? <p className="mt-3 text-xs font-medium text-[var(--brand)]">{errorMessage}</p> : null}
            <p className="mt-2 text-[11px] text-[var(--muted)]">Maximo 3 intentos fallidos por IP cada 1 hora.</p>
          </div>
        </div>
      ) : null}

      {pinModalOpen && createdPin ? (
        <div className="fixed inset-0 z-40 bg-[rgba(18,21,26,0.5)]" onClick={() => setPinModalOpen(false)}>
          <div
            className="absolute left-1/2 top-1/2 w-[min(92vw,360px)] -translate-x-1/2 -translate-y-1/2 rounded-[22px] border border-[var(--line)] bg-white p-5 shadow-[0_24px_60px_rgba(24,18,15,0.24)]"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-sm font-semibold text-[var(--foreground)]">Tu compra conjunta esta lista</p>
            <p className="mt-1 text-xs text-[var(--muted)]">Comparte este PIN con tus amigos para que se unan.</p>

            <div className="mt-4 rounded-[16px] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 text-center">
              <p className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">PIN</p>
              <p className="mt-1 text-3xl font-semibold tracking-[0.35em] text-[var(--foreground)]">{createdPin}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={async () => {
                  try {
                    await navigator.clipboard.writeText(createdPin);
                    setCopied(true);
                  } catch {
                    setCopied(false);
                  }
                }}
                className="rounded-[12px] border border-[var(--line)] px-3 py-2 text-xs font-semibold text-[var(--foreground)] transition hover:border-[var(--brand)] hover:text-[var(--brand)]"
              >
                {copied ? "PIN copiado" : "Copiar PIN"}
              </button>
              <button
                type="button"
                onClick={() => setPinModalOpen(false)}
                className="rounded-[12px] bg-[var(--brand)] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[var(--brand-dark)]"
              >
                Listo
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
