"use client";

import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { createCartItemId, getCartLineTotal } from "@/lib/pricing/order-pricing";
import type { CartItem, Product } from "@/lib/types/order";

type CartState = {
  items: CartItem[];
};

type AddPayload = {
  productId: string;
  quantity: number;
  selectedChoiceIds: string[];
  note?: string;
};

type CartAction =
  | { type: "hydrate"; items: CartItem[] }
  | { type: "add"; payload: AddPayload }
  | { type: "remove"; itemId: string }
  | { type: "increase"; itemId: string }
  | { type: "decrease"; itemId: string }
  | { type: "clear" };

type CartContextValue = CartState & {
  itemCount: number;
  subtotal: number;
  addItem: (payload: AddPayload) => void;
  removeItem: (itemId: string) => void;
  increaseItem: (itemId: string) => void;
  decreaseItem: (itemId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "snottyburger-cart";

function reducer(state: CartState, action: CartAction): CartState {
  switch (action.type) {
    case "hydrate":
      return { items: action.items };
    case "add": {
      const itemId = createCartItemId(
        action.payload.productId,
        action.payload.selectedChoiceIds,
        action.payload.note,
      );
      const existing = state.items.find((item) => item.id === itemId);

      if (existing) {
        return {
          items: state.items.map((item) =>
            item.id === itemId ? { ...item, quantity: item.quantity + action.payload.quantity } : item,
          ),
        };
      }

      return {
        items: [
          ...state.items,
          {
            id: itemId,
            productId: action.payload.productId,
            quantity: action.payload.quantity,
            selectedChoiceIds: action.payload.selectedChoiceIds,
            note: action.payload.note?.trim() || undefined,
          },
        ],
      };
    }
    case "remove":
      return { items: state.items.filter((item) => item.id !== action.itemId) };
    case "increase":
      return {
        items: state.items.map((item) =>
          item.id === action.itemId ? { ...item, quantity: item.quantity + 1 } : item,
        ),
      };
    case "decrease":
      return {
        items: state.items
          .map((item) => (item.id === action.itemId ? { ...item, quantity: item.quantity - 1 } : item))
          .filter((item) => item.quantity > 0),
      };
    case "clear":
      return { items: [] };
    default:
      return state;
  }
}

export function CartProvider({ children, products }: Readonly<{ children: React.ReactNode; products: Product[] }>) {
  const [state, dispatch] = useReducer(reducer, { items: [] });

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return;
    }

    try {
      const items = JSON.parse(saved) as CartItem[];
      dispatch({ type: "hydrate", items });
    } catch {
      window.localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state.items));
  }, [state.items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = state.items.reduce((total, item) => total + getCartLineTotal(item, products), 0);

    return {
      ...state,
      itemCount,
      subtotal,
      addItem: (payload) => dispatch({ type: "add", payload }),
      removeItem: (itemId) => dispatch({ type: "remove", itemId }),
      increaseItem: (itemId) => dispatch({ type: "increase", itemId }),
      decreaseItem: (itemId) => dispatch({ type: "decrease", itemId }),
      clearCart: () => dispatch({ type: "clear" }),
    };
  }, [products, state]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}