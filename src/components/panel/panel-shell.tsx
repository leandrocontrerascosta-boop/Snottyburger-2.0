"use client";

import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";
import {
  initialPromos,
  initialSalesFilters,
  initialStoryContent,
} from "@/lib/mocks/panel-data";
import { DeliveryRatesManagement } from "@/components/panel/delivery-rates-management";
import type { DeliveryRate } from "@/lib/types/delivery";
import { ExtrasManagement, type ExtraDraft } from "@/components/panel/extras-management";
import type { DrinkItemAdmin, EntityStatus, ExtraItemAdmin, MenuItemAdmin, PromoAdmin, SaleRecord } from "@/lib/types/panel";
import { DrinkManagement, type DrinkDraft } from "@/components/panel/drink-management";
import { MetricsCenter } from "@/components/panel/metrics-center";
import { MenuManagement, type MenuItemDraft } from "@/components/panel/menu-management";
import { PromoManagement, type PromoDraft } from "@/components/panel/promo-management";
import { SalesCenter } from "@/components/panel/sales-center";
import { StoreStatusControl } from "@/components/panel/store-status-control";
import { StoryEditor } from "@/components/panel/story-editor";
import { useStoreAvailability } from "@/lib/store/use-store-availability";

type PanelTab = "menu" | "extras" | "drinks" | "story" | "promos" | "sales" | "metrics" | "delivery";

const tabs: Array<{ id: PanelTab; label: string }> = [
  { id: "menu", label: "Menu" },
  { id: "extras", label: "Extras" },
  { id: "drinks", label: "Bebidas" },
  { id: "story", label: "Nuestra Historia" },
  { id: "promos", label: "Promos" },
  { id: "sales", label: "Ventas" },
  { id: "metrics", label: "Metricas" },
  { id: "delivery", label: "Delivery" },
];

type PanelShellProps = {
  initialDeliveryRates: DeliveryRate[];
  initialDrinkItems: DrinkItemAdmin[];
  initialExtraItems: ExtraItemAdmin[];
  initialMenuItems: MenuItemAdmin[];
  initialPromos: PromoAdmin[];
  initialSalesRecords: SaleRecord[];
};

export function PanelShell({
  initialDeliveryRates,
  initialDrinkItems,
  initialExtraItems,
  initialMenuItems,
  initialPromos,
  initialSalesRecords,
}: PanelShellProps) {
  useEffect(() => {
    document.body.style.overflow = "";
    document.documentElement.style.overflow = "";
  }, []);

  const { state: storeAvailability, setOverride: setStoreOverride } = useStoreAvailability();
  const [activeTab, setActiveTab] = useState<PanelTab>("menu");
  const [menuItems, setMenuItems] = useState(initialMenuItems);
  const [extraItems, setExtraItems] = useState(initialExtraItems);
  const [drinkItems, setDrinkItems] = useState(initialDrinkItems);
  const [story, setStory] = useState(initialStoryContent);
  const [promos, setPromos] = useState(initialPromos);
  const [salesRecords] = useState(initialSalesRecords);
  const [salesFilters, setSalesFilters] = useState(initialSalesFilters);
  const [deliveryRates, setDeliveryRates] = useState(initialDeliveryRates);
  const skipNextDeliverySaveRef = useRef(true);

  useEffect(() => {
    if (skipNextDeliverySaveRef.current) {
      skipNextDeliverySaveRef.current = false;
      return;
    }

    const timeoutId = window.setTimeout(async () => {
      try {
        await fetch("/api/admin/delivery-rates", {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ rates: deliveryRates }),
        });
      } catch (error) {
        console.error("No se pudieron guardar las tarifas de delivery", error);
      }
    }, 400);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [deliveryRates]);

  return (
    <main className="page-shell px-3 py-4 sm:px-4 sm:py-6 md:px-8 md:py-8">
      <div className="site-frame space-y-3.5 sm:space-y-4 md:space-y-5">
        <header className="rounded-[26px] border border-[var(--line)] bg-[var(--surface)] p-4 shadow-[var(--shadow)] sm:p-5 md:rounded-[30px] md:p-7">
          <div className="flex items-center justify-between gap-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--brand)]">Panel administrativo</p>
            <span className="rounded-full border border-[var(--line)] bg-white px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-[var(--muted)]">
              Acceso directo
            </span>
          </div>
          <h1 className="mt-2.5 text-[2rem] font-semibold leading-[1.02] tracking-[-0.04em] sm:text-3xl md:mt-3 md:text-4xl">
            Control profesional de menu, contenido y promociones
          </h1>
          <p className="mt-2 max-w-3xl text-[13px] leading-6 text-[var(--muted)] sm:text-sm md:text-base">
            Gestiona productos, precios simples/dobles, descuentos, historia de marca, promos y la vista
            de ventas filtrable para integrar tus datos cuando quieras.
          </p>
        </header>

        <StoreStatusControl state={storeAvailability} onSetOverride={setStoreOverride} />

        <nav className="no-scrollbar overflow-x-auto rounded-[22px] border border-[var(--line)] bg-[var(--surface)] p-1.5 shadow-[0_14px_30px_rgba(31,22,18,0.08)] sm:rounded-2xl sm:p-2">
          <ul className="flex min-w-max gap-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={`rounded-full px-3 py-2 text-[13px] font-semibold whitespace-nowrap transition sm:px-4 sm:text-sm ${
                    tab.id === activeTab
                      ? "bg-[var(--brand)] text-white"
                      : "border border-[var(--line)] bg-white/60 text-[var(--foreground)] hover:bg-[var(--surface-strong)]"
                  }`}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {activeTab === "menu" ? (
          <MenuManagement
            items={menuItems}
            onCreateItem={async (draft) => {
              try {
                const response = await fetch("/api/admin/menu-items", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) {
                  return;
                }

                const payload = (await response.json()) as { item: MenuItemAdmin };
                setMenuItems((prev) => [payload.item, ...prev]);
              } catch (error) {
                console.error("No se pudo crear el producto", error);
              }
            }}
            onUpdateItem={async (itemId, draft) => {
              try {
                const response = await fetch(`/api/admin/menu-items/${itemId}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) {
                  return;
                }

                const payload = (await response.json()) as { item: MenuItemAdmin };
                setMenuItems((prev) => prev.map((item) => (item.id === itemId ? payload.item : item)));
              } catch (error) {
                console.error("No se pudo actualizar el producto", error);
              }
            }}
            onDeleteItem={async (itemId) => {
              try {
                const response = await fetch(`/api/admin/menu-items/${itemId}`, {
                  method: "DELETE",
                });

                if (!response.ok) {
                  return;
                }

                setMenuItems((prev) => prev.filter((item) => item.id !== itemId));
              } catch (error) {
                console.error("No se pudo eliminar el producto", error);
              }
            }}
            onToggleItemStatus={async (itemId) => {
              const targetItem = menuItems.find((item) => item.id === itemId);
              if (!targetItem) {
                return;
              }

              const nextStatus = targetItem.status === "active" ? "paused" : "active";

              try {
                const response = await fetch(`/api/admin/menu-items/${itemId}`, {
                  method: "PATCH",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ status: nextStatus }),
                });

                if (!response.ok) {
                  return;
                }

                const payload = (await response.json()) as { item: MenuItemAdmin };
                setMenuItems((prev) => prev.map((item) => (item.id === itemId ? payload.item : item)));
              } catch (error) {
                console.error("No se pudo actualizar el estado del producto", error);
              }
            }}
          />
        ) : null}

        {activeTab === "extras" ? (
          <ExtrasManagement
            extras={extraItems}
            onCreateExtra={async (draft: ExtraDraft) => {
              try {
                const response = await fetch("/api/admin/menu-modifier-choices", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: ExtraItemAdmin };
                setExtraItems((prev) => [...prev, payload.item].sort((a, b) => a.sortOrder - b.sortOrder));
              } catch (error) {
                console.error("No se pudo crear el extra", error);
              }
            }}
            onUpdateExtra={async (extraId, draft) => {
              try {
                const response = await fetch(`/api/admin/menu-modifier-choices/${extraId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: ExtraItemAdmin };
                setExtraItems((prev) => prev.map((item) => (item.id === extraId ? payload.item : item)));
              } catch (error) {
                console.error("No se pudo actualizar el extra", error);
              }
            }}
            onDeleteExtra={async (extraId) => {
              try {
                const response = await fetch(`/api/admin/menu-modifier-choices/${extraId}`, { method: "DELETE" });
                if (!response.ok) return;
                setExtraItems((prev) => prev.filter((item) => item.id !== extraId));
              } catch (error) {
                console.error("No se pudo eliminar el extra", error);
              }
            }}
            onToggleExtraStatus={async (extraId) => {
              const targetItem = extraItems.find((item) => item.id === extraId);
              if (!targetItem) return;

              try {
                const response = await fetch(`/api/admin/menu-modifier-choices/${extraId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: targetItem.status === "active" ? "paused" : "active" }),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: ExtraItemAdmin };
                setExtraItems((prev) => prev.map((item) => (item.id === extraId ? payload.item : item)));
              } catch (error) {
                console.error("No se pudo cambiar el estado del extra", error);
              }
            }}
          />
        ) : null}

        {activeTab === "drinks" ? (
          <DrinkManagement
            drinks={drinkItems}
            onCreateDrink={async (draft: DrinkDraft) => {
              try {
                const response = await fetch("/api/admin/drink-items", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: DrinkItemAdmin };
                setDrinkItems((prev) => [payload.item, ...prev]);
              } catch (error) {
                console.error("No se pudo crear la bebida", error);
              }
            }}
            onUpdateDrink={async (drinkId, draft) => {
              try {
                const response = await fetch(`/api/admin/drink-items/${drinkId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: DrinkItemAdmin };
                setDrinkItems((prev) => prev.map((item) => (item.id === drinkId ? payload.item : item)));
              } catch (error) {
                console.error("No se pudo actualizar la bebida", error);
              }
            }}
            onDeleteDrink={async (drinkId) => {
              try {
                const response = await fetch(`/api/admin/drink-items/${drinkId}`, { method: "DELETE" });
                if (!response.ok) return;
                setDrinkItems((prev) => prev.filter((item) => item.id !== drinkId));
              } catch (error) {
                console.error("No se pudo eliminar la bebida", error);
              }
            }}
            onToggleDrinkStatus={async (drinkId) => {
              const targetItem = drinkItems.find((item) => item.id === drinkId);
              if (!targetItem) return;

              try {
                const response = await fetch(`/api/admin/drink-items/${drinkId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: targetItem.status === "active" ? "paused" : "active" }),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: DrinkItemAdmin };
                setDrinkItems((prev) => prev.map((item) => (item.id === drinkId ? payload.item : item)));
              } catch (error) {
                console.error("No se pudo cambiar el estado de la bebida", error);
              }
            }}
          />
        ) : null}

        {activeTab === "story" ? <StoryEditor story={story} onSaveStory={setStory} /> : null}

        {activeTab === "promos" ? (
          <PromoManagement
            promos={promos}
            onCreatePromo={async (draft: PromoDraft) => {
              try {
                const response = await fetch("/api/admin/promo-items", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: PromoAdmin };
                setPromos((prev) => [payload.item, ...prev]);
              } catch (error) {
                console.error("No se pudo crear la promo", error);
              }
            }}
            onUpdatePromo={async (promoId, draft) => {
              try {
                const response = await fetch(`/api/admin/promo-items/${promoId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(draft),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: PromoAdmin };
                setPromos((prev) => prev.map((promo) => (promo.id === promoId ? payload.item : promo)));
              } catch (error) {
                console.error("No se pudo actualizar la promo", error);
              }
            }}
            onTogglePromoStatus={async (promoId) => {
              const targetPromo = promos.find((promo) => promo.id === promoId);
              if (!targetPromo) return;

              try {
                const response = await fetch(`/api/admin/promo-items/${promoId}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ status: targetPromo.status === "active" ? "paused" : "active" }),
                });

                if (!response.ok) return;

                const payload = (await response.json()) as { item: PromoAdmin };
                setPromos((prev) => prev.map((promo) => (promo.id === promoId ? payload.item : promo)));
              } catch (error) {
                console.error("No se pudo cambiar el estado de la promo", error);
              }
            }}
            onDeletePromo={async (promoId) => {
              try {
                const response = await fetch(`/api/admin/promo-items/${promoId}`, { method: "DELETE" });
                if (!response.ok) return;
                setPromos((prev) => prev.filter((promo) => promo.id !== promoId));
              } catch (error) {
                console.error("No se pudo eliminar la promo", error);
              }
            }}
          />
        ) : null}

        {activeTab === "sales" ? (
          <SalesCenter records={salesRecords} filters={salesFilters} onFiltersChange={setSalesFilters} />
        ) : null}

        {activeTab === "metrics" ? <MetricsCenter records={salesRecords} /> : null}

        {activeTab === "delivery" ? (
          <DeliveryRatesManagement rates={deliveryRates} onChangeRates={setDeliveryRates} />
        ) : null}
      </div>
    </main>
  );
}

type StatusEntity = { id: string; status: EntityStatus };

function toggleStatus<T extends StatusEntity>(
  setter: Dispatch<SetStateAction<T[]>>,
  entityId: string,
) {
  setter((previous) =>
    previous.map((item) => {
      if (item.id !== entityId) {
        return item;
      }

      return {
        ...item,
        status: item.status === "active" ? "paused" : "active",
      };
    }),
  );
}
